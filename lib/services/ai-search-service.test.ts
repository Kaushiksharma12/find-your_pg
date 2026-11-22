import { queryUnderstandingService } from "./ai-search-parser";
import { candidateRetrievalService } from "./ai-search-service";

export async function runRetrievalTests() {
  const testCases = [
    "furnished PG near Christ University under ₹12,000 with meals and Wi-Fi",
    "Girls PG in Koramangala with single room and AC under ₹15,000",
    "boys PG near college below 10k",
    "single room in Bangalore with food",
    "PG under 12k",
    "WiFi furnished room near Koramangala",
    "₹8,500",
    "12k girls PG",
    "co-living near Christ University",
    "Find a room",
  ];

  const results = [];
  for (const q of testCases) {
    const intent = await queryUnderstandingService.parseQuery(q);
    const retrieval = await candidateRetrievalService.retrieveCandidates(intent);
    results.push({
      query: q,
      intent,
      candidateCount: retrieval.meta.candidateCount,
      appliedConstraints: retrieval.meta.appliedConstraints,
      sampleTitles: retrieval.candidates.slice(0, 3).map((c) => c.property.title),
    });
  }

  return results;
}
