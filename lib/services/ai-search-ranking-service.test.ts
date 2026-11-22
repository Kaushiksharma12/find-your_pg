import { candidateRankingService } from "./ai-search-ranking-service";
import { SearchIntent } from "@/lib/validators/ai";
import { CandidateResult } from "./ai-search-service";

export async function runRankingTests() {
  const baseProperty = {
    _id: "507f1f77bcf86cd799439011",
    title: "Koramangala Student PG",
    city: "Bangalore",
    locality: "Koramangala",
    address: "Koramangala 4th Block",
    startingPrice: 12000,
    rating: 4.5,
    reviewCount: 120,
    verified: true,
    featured: false,
    amenities: ["Wi-Fi", "AC", "Power Backup", "Gym"],
    preferredFor: "Female",
    type: "Girls PG",
  };

  const intent: SearchIntent = {
    queryText: "Girls PG in Koramangala with single room and AC under ₹15,000",
    locality: "Koramangala",
    maxPrice: 15000,
    preferredFor: "Female",
    propertyType: "Girls PG",
    roomOccupancy: "Single",
    amenities: ["AC", "Wi-Fi"],
  };

  const candidates: CandidateResult[] = [
    // Candidate 1: Full match
    {
      property: { ...baseProperty, _id: "507f1f77bcf86cd799439011" },
      matchingRooms: [{ occupancy: "Single", price: 14000 }],
      qualifyingPrice: 14000,
    },
    // Candidate 2: Same locality, fewer amenities
    {
      property: {
        ...baseProperty,
        _id: "507f1f77bcf86cd799439012",
        title: "Koramangala Budget Stay",
        amenities: ["Power Backup"], // Missing AC & Wi-Fi
      },
      matchingRooms: [{ occupancy: "Single", price: 12000 }],
      qualifyingPrice: 12000,
    },
    // Candidate 3: Unverified, 0 reviews, no exact room
    {
      property: {
        ...baseProperty,
        _id: "507f1f77bcf86cd799439013",
        title: "Unverified Stay",
        verified: false,
        rating: null,
        reviewCount: 0,
        locality: "HSR Layout", // Different locality
      },
      matchingRooms: [{ occupancy: "2 Sharing", price: 10000 }],
      qualifyingPrice: 10000,
    },
  ];

  const ranked = candidateRankingService.rankCandidates(candidates, intent);

  // Assertions
  const isSorted = ranked[0].ranking.score >= ranked[1].ranking.score && ranked[1].ranking.score >= ranked[2].ranking.score;
  const noNaN = ranked.every((r) => !isNaN(r.ranking.score) && isFinite(r.ranking.score));
  const validBounds = ranked.every((r) => r.ranking.score >= 0 && r.ranking.score <= 100);

  return {
    isSorted,
    noNaN,
    validBounds,
    topScore: ranked[0].ranking.score,
    topReasons: ranked[0].ranking.matchReasons,
    rankedList: ranked.map((r) => ({
      id: r.property._id,
      title: r.property.title,
      score: r.ranking.score,
      reasons: r.ranking.matchReasons,
    })),
  };
}
