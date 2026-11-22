import { SearchIntent } from "@/lib/validators/ai";

export interface BenchmarkTestCase {
  id: string;
  category:
    | "BUDGET"
    | "GENDER"
    | "LOCATION"
    | "AMENITIES"
    | "COMBINED"
    | "PRICE_FORMATS"
    | "ROOM_TYPES"
    | "NEGATIVE";
  query: string;
  expectedIntent: Partial<SearchIntent>;
  shouldBeEmpty?: boolean;
}

export const BENCHMARK_FIXTURES: BenchmarkTestCase[] = [
  // A. Budget
  {
    id: "TC-01",
    category: "BUDGET",
    query: "PG under 12000",
    expectedIntent: {
      maxPrice: 12000,
      propertyType: "PG",
    },
  },
  {
    id: "TC-02",
    category: "BUDGET",
    query: "single room below 15000",
    expectedIntent: {
      maxPrice: 15000,
      roomOccupancy: "Single",
    },
  },

  // B. Gender
  {
    id: "TC-03",
    category: "GENDER",
    query: "girls PG under 15k",
    expectedIntent: {
      preferredFor: "Female",
      propertyType: "Girls PG",
      maxPrice: 15000,
    },
  },
  {
    id: "TC-04",
    category: "GENDER",
    query: "boys PG near college",
    expectedIntent: {
      preferredFor: "Male",
      propertyType: "Boys PG",
      landmarkOrCollege: "college",
    },
  },

  // C. Location
  {
    id: "TC-05",
    category: "LOCATION",
    query: "PG in Koramangala",
    expectedIntent: {
      locality: "Koramangala",
      propertyType: "PG",
    },
  },
  {
    id: "TC-06",
    category: "LOCATION",
    query: "student accommodation near Christ University",
    expectedIntent: {
      landmarkOrCollege: "Christ University",
    },
  },

  // D. Amenities
  {
    id: "TC-07",
    category: "AMENITIES",
    query: "furnished PG with WiFi",
    expectedIntent: {
      furnished: true,
      propertyType: "PG",
      amenities: ["Wi-Fi"],
    },
  },
  {
    id: "TC-08",
    category: "AMENITIES",
    query: "single AC room with meals",
    expectedIntent: {
      roomOccupancy: "Single",
      amenities: ["AC"],
      mealsRequired: true,
    },
  },

  // E. Combined Constraints
  {
    id: "TC-09",
    category: "COMBINED",
    query: "girls PG in Koramangala with single AC room under 15000",
    expectedIntent: {
      preferredFor: "Female",
      propertyType: "Girls PG",
      locality: "Koramangala",
      roomOccupancy: "Single",
      amenities: ["AC"],
      maxPrice: 15000,
    },
  },
  {
    id: "TC-10",
    category: "COMBINED",
    query: "furnished PG near Christ University under 12000 with meals and WiFi",
    expectedIntent: {
      furnished: true,
      propertyType: "PG",
      landmarkOrCollege: "Christ University",
      maxPrice: 12000,
      mealsRequired: true,
      amenities: ["Wi-Fi"],
    },
  },

  // F. Price Formats
  {
    id: "TC-11",
    category: "PRICE_FORMATS",
    query: "8.5k",
    expectedIntent: {
      maxPrice: 8500,
    },
  },
  {
    id: "TC-12",
    category: "PRICE_FORMATS",
    query: "₹12,000",
    expectedIntent: {
      maxPrice: 12000,
    },
  },
  {
    id: "TC-13",
    category: "PRICE_FORMATS",
    query: "12 K",
    expectedIntent: {
      maxPrice: 12000,
    },
  },

  // G. Room Types
  {
    id: "TC-14",
    category: "ROOM_TYPES",
    query: "single room",
    expectedIntent: {
      roomOccupancy: "Single",
    },
  },
  {
    id: "TC-15",
    category: "ROOM_TYPES",
    query: "2 sharing room",
    expectedIntent: {
      roomOccupancy: "2 Sharing",
    },
  },

  // H. Negative / Unrelated Queries & Empty Results
  {
    id: "TC-16",
    category: "NEGATIVE",
    query: "What is the weather today?",
    expectedIntent: {
      maxPrice: null,
      locality: null,
      propertyType: null,
      preferredFor: null,
      roomOccupancy: null,
    },
  },
  {
    id: "TC-17",
    category: "NEGATIVE",
    query: "Nonexistent locality under 100",
    expectedIntent: {
      maxPrice: 100,
    },
    shouldBeEmpty: true,
  },
];
