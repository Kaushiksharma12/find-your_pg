import { queryUnderstandingService } from "./ai-search-parser";

export async function runParserTests() {
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
    "What is the weather today in Tokyo?",
  ];

  const results = [];
  for (const q of testCases) {
    const intent = await queryUnderstandingService.parseQuery(q);
    results.push({ query: q, intent });
  }

  return results;
}
