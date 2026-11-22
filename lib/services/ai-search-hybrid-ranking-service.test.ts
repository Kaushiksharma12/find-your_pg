import {
  cosineSimilarity,
  aiSearchHybridRankingService,
  HYBRID_WEIGHT_CONFIGS,
} from "./ai-search-hybrid-ranking-service";
import { SearchIntent } from "@/lib/validators/ai";
import { CandidateResult } from "./ai-search-service";

export async function runHybridRankingTests() {
  // 1. Cosine Similarity Tests
  const vec1 = [1, 0, 0, 0];
  const vec2 = [1, 0, 0, 0];
  const simIdentical = cosineSimilarity(vec1, vec2);
  const isIdenticalValid = simIdentical !== null && Math.abs(simIdentical - 1.0) < 0.0001;

  const vecOrth1 = [1, 0];
  const vecOrth2 = [0, 1];
  const simOrth = cosineSimilarity(vecOrth1, vecOrth2);
  const isOrthogonalValid = simOrth !== null && Math.abs(simOrth - 0.0) < 0.0001;

  const vecDimMismatch1 = [1, 2, 3];
  const vecDimMismatch2 = [1, 2];
  const isMismatchedNull = cosineSimilarity(vecDimMismatch1, vecDimMismatch2) === null;

  const vecNan = [NaN, 1];
  const vecNormal = [1, 1];
  const isNanNull = cosineSimilarity(vecNan, vecNormal) === null;

  const vecZero = [0, 0];
  const isZeroHandled = cosineSimilarity(vecZero, vecNormal) === 0;

  // 2. Hybrid Ranking Engine Tests with Mock Candidates
  const baseProp = {
    _id: "650000000000000000000001",
    title: "Koramangala Student PG",
    city: "Bangalore",
    locality: "Koramangala",
    address: "Koramangala 4th Block",
    startingPrice: 12000,
    rating: 4.5,
    reviewCount: 50,
    verified: true,
    featured: false,
    amenities: ["Wi-Fi", "AC"],
    preferredFor: "Female" as const,
    type: "Girls PG" as const,
    // 384-dim dummy vector (normalized vector of ones)
    descriptionVector: new Array(384).fill(1 / Math.sqrt(384)),
  };

  const intent: SearchIntent = {
    queryText: "Girls PG in Koramangala with AC under 15000",
    locality: "Koramangala",
    maxPrice: 15000,
    preferredFor: "Female",
    propertyType: "Girls PG",
    amenities: ["AC"],
  };

  const candidates: CandidateResult[] = [
    {
      property: { ...baseProp, _id: "650000000000000000000001", title: "Prop With Vector" },
      matchingRooms: [{ occupancy: "Single", price: 14000, isAvailable: true }],
      qualifyingPrice: 14000,
    },
    {
      property: {
        ...baseProp,
        _id: "650000000000000000000002",
        title: "Prop Missing Vector",
        descriptionVector: undefined, // Missing vector test
      },
      matchingRooms: [{ occupancy: "Single", price: 12000, isAvailable: true }],
      qualifyingPrice: 12000,
    },
  ];

  // Test 80/20, 70/30, 60/40 configs
  const ranked7030 = await aiSearchHybridRankingService.rankCandidatesHybrid(
    candidates,
    intent,
    HYBRID_WEIGHT_CONFIGS.CONFIG_70_30
  );

  const is7030Valid =
    ranked7030.length === 2 &&
    ranked7030[0].ranking.hybridScore >= 0 &&
    ranked7030[0].ranking.hybridScore <= 100 &&
    ranked7030[0].ranking.weightConfigUsed.deterministicWeight === 0.7;

  // Verify candidate missing vector uses deterministic score without crash
  const missingVecCand = ranked7030.find((c) => c.property._id === "650000000000000000000002");
  const isMissingVecFallbackValid =
    missingVecCand?.ranking.semanticScore === null &&
    missingVecCand?.ranking.hybridScore === missingVecCand?.ranking.deterministicScore;

  const ranked8020 = await aiSearchHybridRankingService.rankCandidatesHybrid(
    candidates,
    intent,
    HYBRID_WEIGHT_CONFIGS.CONFIG_80_20
  );

  const ranked6040 = await aiSearchHybridRankingService.rankCandidatesHybrid(
    candidates,
    intent,
    HYBRID_WEIGHT_CONFIGS.CONFIG_60_40
  );

  const isWeightConfigsWorking =
    ranked8020[0].ranking.weightConfigUsed.deterministicWeight === 0.8 &&
    ranked6040[0].ranking.weightConfigUsed.deterministicWeight === 0.6;

  return {
    isIdenticalValid,
    isOrthogonalValid,
    isMismatchedNull,
    isNanNull,
    isZeroHandled,
    is7030Valid,
    isMissingVecFallbackValid,
    isWeightConfigsWorking,
  };
}
