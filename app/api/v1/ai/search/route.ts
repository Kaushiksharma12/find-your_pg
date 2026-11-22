import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseQueryRequestSchema } from "@/lib/validators/ai";
import { queryUnderstandingService } from "@/lib/services/ai-search-parser";
import { candidateRetrievalService } from "@/lib/services/ai-search-service";
import { aiSearchHybridRankingService } from "@/lib/services/ai-search-hybrid-ranking-service";
import { getSessionUser } from "@/lib/auth/session";
import { UserInteraction } from "@/lib/models/UserInteraction";
import { dbConnect } from "@/lib/db/mongoose";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const validation = parseQueryRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid search query payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { query, sessionId } = validation.data;

    // Server-controlled search execution ID (client-supplied searchId is ignored)
    const searchId = `srch_${randomUUID()}`;

    // 1. Phase 1A — Query Understanding
    const intent = await queryUnderstandingService.parseQuery(query);

    // 2. Phase 1B — Candidate Retrieval
    const retrieval = await candidateRetrievalService.retrieveCandidates(intent);

    // 3. Phase 2C — Hybrid Candidate Ranking (Deterministic 70% + Vector Semantic 30%)
    const rankedResults = await aiSearchHybridRankingService.rankCandidatesHybrid(retrieval.candidates, intent);

    // 4. Phase 1D — Best-Effort Non-Blocking Interaction Signal Logging
    (async () => {
      try {
        await dbConnect();
        await UserInteraction.create({
          searchId,
          user: user?.id || undefined,
          sessionId: sessionId || undefined,
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
            topCandidateScore: rankedResults[0]?.ranking?.score || 0,
            topCandidateIds: rankedResults.slice(0, 5).map((r) => r.property._id || r.property.id),
            candidatePropertyIds: Array.from(
              new Set(
                rankedResults
                  .flatMap((r) => [
                    r.property._id?.toString(),
                    r.property.id?.toString(),
                    r.property.slug?.toString(),
                  ])
                  .filter((v): v is string => Boolean(v))
              )
            ),
          },
        });
      } catch (logErr) {
        console.error("Non-blocking SEARCH_PERFORMED log error:", logErr);
      }
    })();

    return NextResponse.json({
      success: true,
      searchId,
      intent,
      results: rankedResults,
      meta: {
        ...retrieval.meta,
        topCandidateScore: rankedResults[0]?.ranking?.score || 0,
      },
    });
  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during AI candidate search & ranking" },
      { status: 500 }
    );
  }
}
