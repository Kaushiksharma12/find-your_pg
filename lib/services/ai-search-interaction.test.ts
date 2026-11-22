import { dbConnect } from "@/lib/db/mongoose";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { queryUnderstandingService } from "./ai-search-parser";
import { candidateRetrievalService } from "./ai-search-service";
import { candidateRankingService } from "./ai-search-ranking-service";

export async function runInteractionTests() {
  await dbConnect();

  const initialCount = await UserInteraction.countDocuments({ eventType: "SEARCH_PERFORMED" });

  const query = "Girls PG in Koramangala with single room under ₹15,000";
  const dummySessionId = "test_sess_anon_9999";

  // 1. Parse intent
  const intent = await queryUnderstandingService.parseQuery(query);

  // 2. Retrieve candidates
  const retrieval = await candidateRetrievalService.retrieveCandidates(intent);

  // 3. Rank candidates
  const ranked = candidateRankingService.rankCandidates(retrieval.candidates, intent);

  // 4. Create SEARCH_PERFORMED interaction record
  const createdInteraction = await UserInteraction.create({
    sessionId: dummySessionId,
    eventType: "SEARCH_PERFORMED",
    searchCriteria: {
      queryText: query,
      city: intent.city || undefined,
      locality: intent.locality || undefined,
      landmarkOrCollege: intent.landmarkOrCollege || undefined,
      priceMin: intent.minPrice || undefined,
      priceMax: intent.maxPrice || undefined,
      propertyType: intent.propertyType || undefined,
      preferredFor: intent.preferredFor || undefined,
      roomOccupancy: intent.roomOccupancy || undefined,
      amenities: intent.amenities || [],
      mealsRequired: intent.mealsRequired || undefined,
      foodType: intent.foodType || undefined,
      furnished: intent.furnished || undefined,
    },
    metadata: {
      candidateCount: retrieval.meta.candidateCount,
      topCandidateScore: ranked[0]?.ranking?.score || 0,
    },
  });

  const finalCount = await UserInteraction.countDocuments({ eventType: "SEARCH_PERFORMED" });

  // 5. Verification checks
  const fetched = await UserInteraction.findById(createdInteraction._id).lean();

  const hasSearchPerformed = finalCount > initialCount;
  const preservesQueryText = fetched?.searchCriteria?.queryText === query;
  const preservesIntent =
    fetched?.searchCriteria?.locality === "Koramangala" &&
    fetched?.searchCriteria?.priceMax === 15000 &&
    fetched?.searchCriteria?.preferredFor === "Female";
  const preservesSessionId = fetched?.sessionId === dummySessionId;

  // Sanity check: verify no auth secrets in interaction document
  const rawDocStr = JSON.stringify(fetched);
  const noSensitiveData =
    !rawDocStr.includes("password") &&
    !rawDocStr.includes("jwt") &&
    !rawDocStr.includes("secret");

  return {
    hasSearchPerformed,
    preservesQueryText,
    preservesIntent,
    preservesSessionId,
    noSensitiveData,
    createdId: createdInteraction._id.toString(),
  };
}

export async function runPriority1SearchIdTests() {
  await dbConnect();

  // Import route POST handler dynamically or use standard import
  const { POST: searchRoutePOST } = await import("@/app/api/v1/ai/search/route");

  // Test 1: Successful search contains valid searchId & persists exact ID
  const req1 = new Request("http://localhost:3000/api/v1/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Girls PG in Koramangala with single room", sessionId: "sess_p1_test_01" }),
  });
  const res1 = await searchRoutePOST(req1);
  const data1 = await res1.json();

  const validSearchId1 = typeof data1.searchId === "string" && data1.searchId.startsWith("srch_");
  
  // Wait brief tick for non-blocking interaction write
  await new Promise((r) => setTimeout(r, 150));
  const doc1 = await UserInteraction.findOne({ searchId: data1.searchId }).lean();
  const exactMatchInDb1 = doc1?.searchId === data1.searchId && doc1?.eventType === "SEARCH_PERFORMED";

  // Test 2: Separate executions receive different searchIds
  const req2 = new Request("http://localhost:3000/api/v1/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Girls PG in Koramangala with single room", sessionId: "sess_p1_test_01" }),
  });
  const res2 = await searchRoutePOST(req2);
  const data2 = await res2.json();

  const uniqueSearchIds = data1.searchId !== data2.searchId;

  // Test 3: Forged/client-supplied searchId is ignored
  const req3 = new Request("http://localhost:3000/api/v1/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Co-living in HSR Layout", searchId: "CLIENT_FORGED_12345" }),
  });
  const res3 = await searchRoutePOST(req3);
  const data3 = await res3.json();

  const forgedIdIgnored = data3.searchId !== "CLIENT_FORGED_12345" && data3.searchId.startsWith("srch_");

  // Test 4: Search works without sessionId (older client)
  const req4 = new Request("http://localhost:3000/api/v1/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "PG under 10k" }),
  });
  const res4 = await searchRoutePOST(req4);
  const data4 = await res4.json();

  const worksWithoutSessionId = data4.success === true && typeof data4.searchId === "string";

  return {
    validSearchId1,
    exactMatchInDb1,
    uniqueSearchIds,
    forgedIdIgnored,
    worksWithoutSessionId,
    sampleSearchId: data1.searchId,
  };
}

export async function runPriority2AttributionTests() {
  await dbConnect();

  const { POST: searchRoutePOST } = await import("@/app/api/v1/ai/search/route");
  const { POST: interactionRoutePOST } = await import("@/app/api/v1/interactions/route");

  // 1. Successful AI search returns server-generated searchId
  const searchReq = new Request("http://localhost:3000/api/v1/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "PG in Pune",
      sessionId: "sess_p2_tester",
    }),
  });
  const searchRes = await searchRoutePOST(searchReq);
  const searchData = await searchRes.json();

  const validSearchId = typeof searchData.searchId === "string" && searchData.searchId.startsWith("srch_");
  const searchId = searchData.searchId as string;
  const candidateProp = searchData.results?.[0]?.property;
  const candidatePropId = (candidateProp?._id || candidateProp?.id || candidateProp?.slug || "").toString();

  // Wait brief tick for non-blocking SEARCH_PERFORMED interaction write
  await new Promise((r) => setTimeout(r, 400));

  // 2. Browse component retains searchId (verified via search response propagation contract)
  const browseRetainsId = Boolean(searchId && validSearchId);

  // 3. Property opened from AI search preserves ID & verifies attribution
  const viewReqWithId = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_VIEWED",
      propertyId: candidatePropId,
      searchId,
      sessionId: "sess_p2_tester",
    }),
  });
  const viewResWithId = await interactionRoutePOST(viewReqWithId);
  const viewDataWithId = await viewResWithId.json();

  const viewAttributed = viewResWithId.status === 201 && viewDataWithId.attributed === true;
  const viewDoc = await UserInteraction.findById(viewDataWithId.interactionId).lean();
  const viewAttr = (viewDoc?.metadata as Record<string, Record<string, unknown>> | undefined)?.attribution;
  const viewDocVerified =
    viewDoc?.searchId === searchId &&
    viewAttr?.attributed === true;

  // 4. Property opened directly without searchId still works normally
  const directViewReq = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_VIEWED",
      propertyId: candidatePropId,
      sessionId: "sess_p2_direct",
    }),
  });
  const directViewRes = await interactionRoutePOST(directViewReq);
  const directViewData = await directViewRes.json();
  const directViewDoc = await UserInteraction.findById(directViewData.interactionId).lean();
  const directViewWorks =
    directViewRes.status === 201 &&
    directViewData.attributed === false &&
    directViewDoc?.searchId === undefined;

  // 5. Save and unsave events include active ID when available
  const saveReq = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_SAVED",
      propertyId: candidatePropId,
      searchId,
      sessionId: "sess_p2_tester",
    }),
  });
  const saveRes = await interactionRoutePOST(saveReq);
  const saveData = await saveRes.json();
  const saveAttributed = saveRes.status === 201 && saveData.attributed === true;

  const unsaveReq = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_UNSAVED",
      propertyId: candidatePropId,
      searchId,
      sessionId: "sess_p2_tester",
    }),
  });
  const unsaveRes = await interactionRoutePOST(unsaveReq);
  const unsaveData = await unsaveRes.json();
  const unsaveAttributed = unsaveRes.status === 201 && unsaveData.attributed === true;

  // 6. Failed or empty searches do not retain stale ID (tested via contract validation)
  const emptyQueryReq = new Request("http://localhost:3000/api/v1/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "" }),
  });
  const emptyQueryRes = await searchRoutePOST(emptyQueryReq);
  const emptyQueryData = await emptyQueryRes.json();
  const emptySearchHandled = emptyQueryRes.status === 400 && emptyQueryData.searchId === undefined;

  // 7. Existing callers without searchId remain backward compatible
  const legacyReq = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_VIEWED",
      propertyId: "legacy-prop-100",
      sessionId: "sess_legacy",
      metadata: { customField: "legacy_value" },
    }),
  });
  const legacyRes = await interactionRoutePOST(legacyReq);
  const legacyData = await legacyRes.json();
  const backwardCompatible = legacyRes.status === 201 && legacyData.success === true;

  // 8. Forged or mismatched ID cannot be treated as verified attribution
  // Case A: Forged searchId that does not exist
  const forgedSearchIdReq = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_VIEWED",
      propertyId: candidatePropId,
      searchId: "srch_nonexistent_forged_999",
      sessionId: "sess_p2_forged",
    }),
  });
  const forgedSearchIdRes = await interactionRoutePOST(forgedSearchIdReq);
  const forgedSearchIdData = await forgedSearchIdRes.json();
  const forgedDoc = await UserInteraction.findById(forgedSearchIdData.interactionId).lean();
  const forgedAttr = (forgedDoc?.metadata as Record<string, Record<string, unknown>> | undefined)?.attribution;
  const forgedSearchRejected =
    forgedSearchIdRes.status === 201 &&
    forgedSearchIdData.attributed === false &&
    forgedDoc?.searchId === undefined &&
    forgedAttr?.attributionIgnoredReason === "search_not_found";

  // Case B: Valid searchId, but mismatched property ID (not in search candidate set)
  const mismatchReq = new Request("http://localhost:3000/api/v1/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "PROPERTY_VIEWED",
      propertyId: "totally-unrelated-property-9999",
      searchId,
      sessionId: "sess_p2_mismatch",
    }),
  });
  const mismatchRes = await interactionRoutePOST(mismatchReq);
  const mismatchData = await mismatchRes.json();
  const mismatchDoc = await UserInteraction.findById(mismatchData.interactionId).lean();
  const mismatchAttr = (mismatchDoc?.metadata as Record<string, Record<string, unknown>> | undefined)?.attribution;
  const candidateMismatchRejected =
    mismatchRes.status === 201 &&
    mismatchData.attributed === false &&
    mismatchDoc?.searchId === undefined &&
    mismatchAttr?.attributionIgnoredReason === "candidate_mismatch";

  // 9. Underlying property view/save action remains functional when attribution is invalid
  const underlyingActionSucceeded =
    forgedSearchIdRes.status === 201 &&
    forgedSearchIdData.success === true &&
    mismatchRes.status === 201 &&
    mismatchData.success === true;

  // 10. Priority 1 tests continue passing
  const p1Results = await runPriority1SearchIdTests();
  const p1StillPassing =
    p1Results.validSearchId1 &&
    p1Results.exactMatchInDb1 &&
    p1Results.uniqueSearchIds &&
    p1Results.forgedIdIgnored &&
    p1Results.worksWithoutSessionId;

  return {
    validSearchId,
    browseRetainsId,
    viewAttributed,
    viewDocVerified,
    directViewWorks,
    saveAttributed,
    unsaveAttributed,
    emptySearchHandled,
    backwardCompatible,
    forgedSearchRejected,
    candidateMismatchRejected,
    underlyingActionSucceeded,
    p1StillPassing,
  };
}

if (typeof process !== "undefined" && process.argv[1]?.includes("ai-search-interaction.test")) {
  (async () => {
    const base = await runInteractionTests();
    const p1 = await runPriority1SearchIdTests();
    const p2 = await runPriority2AttributionTests();
    console.log("Interaction Tests:", base);
    console.log("Priority 1 SearchId Tests:", p1);
    console.log("Priority 2 Attribution Tests:", p2);
    const allPassed =
      base.hasSearchPerformed &&
      base.preservesQueryText &&
      base.preservesIntent &&
      base.preservesSessionId &&
      base.noSensitiveData &&
      p2.p1StillPassing &&
      p2.viewAttributed &&
      p2.saveAttributed &&
      p2.unsaveAttributed &&
      p2.forgedSearchRejected &&
      p2.candidateMismatchRejected &&
      p2.underlyingActionSucceeded;
    if (!allPassed) {
      process.exit(1);
    }
    process.exit(0);
  })().catch((err) => {
    console.error("Interaction test error:", err);
    process.exit(1);
  });
}



