import { SearchIntent } from "@/lib/validators/ai";

export interface SemanticTestCase {
  id: string;
  category:
    | "QUIET_STUDY"
    | "PREMIUM_LUXURY"
    | "COMMUNITY_SOCIAL"
    | "SAFETY_SECURITY"
    | "FOOD_MEALS"
    | "PROXIMITY_METRO"
    | "STUDENT_BUDGET"
    | "FURNISHED_COMFORT";
  query: string;
  intent: Partial<SearchIntent>;
  // Maps Property ID or slug to controlled relevance score: 2 = Highly Relevant, 1 = Somewhat Relevant, 0 = Irrelevant
  relevanceLabels: Record<string, number>;
  labelJustifications: Record<string, string>;
}

export const SEMANTIC_BENCHMARK_FIXTURES: SemanticTestCase[] = [
  // Category 1: Quiet / Study-Friendly
  {
    id: "SEM-01",
    category: "QUIET_STUDY",
    query: "peaceful quiet student PG in Koramangala for exam prep with ergonomic study desk",
    intent: {
      queryText: "peaceful quiet student PG in Koramangala for exam prep with ergonomic study desk",
      locality: "Koramangala",
      propertyType: "PG",
      maxPrice: 15000,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Has quiet hours policy & ergonomic workstations
      "starlight-coliving": 1, // Standard co-living space
      "urban-nest": 0, // Party rooftop lounge, noisy main road
    },
    labelJustifications: {
      "sunrise-pg": "Mentions quiet hours after 11 PM, study lounge, and ergonomic workstations.",
      "starlight-coliving": "Standard student accommodation but lacks explicit quiet study focus.",
      "urban-nest": "Features loud nightlife common room and street-facing location.",
    },
  },
  {
    id: "SEM-02",
    category: "QUIET_STUDY",
    query: "silent environment study friendly PG near Christ University with private desk",
    intent: {
      queryText: "silent environment study friendly PG near Christ University with private desk",
      landmarkOrCollege: "Christ University",
      maxPrice: 15000,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // 1.2km from Christ Uni with private study desks
      "green-living": 1, // Eco-residence with quiet atmosphere but further away
    },
    labelJustifications: {
      "sunrise-pg": "Directly near Christ Uni with dedicated study desk amenities.",
      "green-living": "Quiet environment but located in Indiranagar (further from campus).",
    },
  },

  // Category 2: Premium / Luxury
  {
    id: "SEM-03",
    category: "PREMIUM_LUXURY",
    query: "luxurious high end co-living studio with gym access and modern minimalist interior",
    intent: {
      queryText: "luxurious high end co-living studio with gym access and modern minimalist interior",
      maxPrice: 20000,
    },
    relevanceLabels: {
      "green-living": 2, // Solar-powered premium residence with modern amenities
      "sunrise-pg": 1, // High quality student living
    },
    labelJustifications: {
      "green-living": "Includes premium finishes, eco-luxury design, and gym access.",
      "sunrise-pg": "Good quality co-living but caters more to student budget tier.",
    },
  },
  {
    id: "SEM-04",
    category: "PREMIUM_LUXURY",
    query: "upscale female PG in Indiranagar with solar power organic food and high end fixtures",
    intent: {
      queryText: "upscale female PG in Indiranagar with solar power organic food and high end fixtures",
      locality: "Indiranagar",
      preferredFor: "Female",
      propertyType: "Girls PG",
    },
    relevanceLabels: {
      "green-living": 2, // Direct match for solar power, organic food, Indiranagar
      "sunrise-pg": 0, // Located in Koramangala
    },
    labelJustifications: {
      "green-living": "Exact semantic alignment with organic food and solar-powered luxury features.",
      "sunrise-pg": "Wrong locality and co-living rather than specialized female eco-residence.",
    },
  },

  // Category 3: Community & Social Vibe
  {
    id: "SEM-05",
    category: "COMMUNITY_SOCIAL",
    query: "vibrant co-living space with rooftop community events social lounge and young professionals",
    intent: {
      queryText: "vibrant co-living space with rooftop community events social lounge and young professionals",
      propertyType: "Co-living",
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Rooftop community space and social vibe
      "green-living": 1, // Eco-focused quiet female residence
    },
    labelJustifications: {
      "sunrise-pg": "Explicitly highlights vibrant rooftop community lounge and events.",
      "green-living": "Focuses on quiet eco-friendly living rather than energetic social events.",
    },
  },
  {
    id: "SEM-06",
    category: "COMMUNITY_SOCIAL",
    query: "student living with community room rooftop hangout spot and friendly co-tenants",
    intent: {
      queryText: "student living with community room rooftop hangout spot and friendly co-tenants",
      maxPrice: 15000,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Vibrant rooftop lounge
      "green-living": 1, // Quiet aesthetic lounge
    },
    labelJustifications: {
      "sunrise-pg": "Has vibrant rooftop lounge specifically mentioned in description.",
      "green-living": "Offers common area but emphasizes peaceful eco-living.",
    },
  },

  // Category 4: Safety & Security Emphasis
  {
    id: "SEM-07",
    category: "SAFETY_SECURITY",
    query: "ultra safe girls PG with 24/7 biometric gate access female warden and security guard",
    intent: {
      queryText: "ultra safe girls PG with 24/7 biometric gate access female warden and security guard",
      preferredFor: "Female",
      propertyType: "Girls PG",
    },
    relevanceLabels: {
      "green-living": 2, // Female warden, 24/7 security guard, CCTV
      "sunrise-pg": 1, // Biometric door entry and CCTV but general co-living
    },
    labelJustifications: {
      "green-living": "Dedicated female warden, 24/7 guard duty, and strict security rules.",
      "sunrise-pg": "Biometric entry available, but co-living for anyone rather than exclusive female PG.",
    },
  },
  {
    id: "SEM-08",
    category: "SAFETY_SECURITY",
    query: "secure female residence with CCTV surveillance biometric lock and night security",
    intent: {
      queryText: "secure female residence with CCTV surveillance biometric lock and night security",
      preferredFor: "Female",
    },
    relevanceLabels: {
      "green-living": 2, // High security focus
      "sunrise-pg": 1, // High security co-living
    },
    labelJustifications: {
      "green-living": "Specialized female security warden and CCTV surveillance.",
      "sunrise-pg": "Biometric access and CCTV present.",
    },
  },

  // Category 5: Food & Meals Emphasis
  {
    id: "SEM-09",
    category: "FOOD_MEALS",
    query: "PG with delicious wholesome 3-time North and South Indian home cooked meals",
    intent: {
      queryText: "PG with delicious wholesome 3-time North and South Indian home cooked meals",
      mealsRequired: true,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // 3-time North & South Indian meals included
      "green-living": 2, // Hygienic home-cooked organic meals
    },
    labelJustifications: {
      "sunrise-pg": "Explicitly offers wholesome 3-time North & South Indian meals.",
      "green-living": "Highlights hygienic home-cooked meals.",
    },
  },
  {
    id: "SEM-10",
    category: "FOOD_MEALS",
    query: "girls accommodation with clean organic vegetarian meal plan included",
    intent: {
      queryText: "girls accommodation with clean organic vegetarian meal plan included",
      preferredFor: "Female",
      mealsRequired: true,
    },
    relevanceLabels: {
      "green-living": 2, // Organic home-cooked veg meals
      "sunrise-pg": 1, // North & South Indian veg/non-veg meals
    },
    labelJustifications: {
      "green-living": "Specializes in organic vegetarian home-cooked meals.",
      "sunrise-pg": "Offers meals, but non-veg included.",
    },
  },

  // Category 6: Proximity & Transit Focus
  {
    id: "SEM-11",
    category: "PROXIMITY_METRO",
    query: "PG walking distance to metro station and quick commute to technology park",
    intent: {
      queryText: "PG walking distance to metro station and quick commute to technology park",
      maxPrice: 15000,
    },
    relevanceLabels: {
      "green-living": 2, // 500m from Indiranagar Metro Station
      "sunrise-pg": 1, // 1.5 km from Koramangala Metro
    },
    labelJustifications: {
      "green-living": "Within 500m of Indiranagar Metro Station (walking distance).",
      "sunrise-pg": "1.5 km to Metro (slightly further).",
    },
  },
  {
    id: "SEM-12",
    category: "PROXIMITY_METRO",
    query: "student stay right next to Christ University campus and Forum Mall",
    intent: {
      queryText: "student stay right next to Christ University campus and Forum Mall",
      landmarkOrCollege: "Christ University",
    },
    relevanceLabels: {
      "sunrise-pg": 2, // 1.2km from Christ Uni & 800m from Forum Mall
      "green-living": 0, // Indiranagar (different campus area)
    },
    labelJustifications: {
      "sunrise-pg": "Direct landmark match for Christ University and Forum Mall.",
      "green-living": "Located in Indiranagar.",
    },
  },

  // Category 7: Student Budget Value
  {
    id: "SEM-13",
    category: "STUDENT_BUDGET",
    query: "affordable economy triple sharing room for college students under 8000",
    intent: {
      queryText: "affordable economy triple sharing room for college students under 8000",
      maxPrice: 8000,
      roomOccupancy: "3 Sharing",
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Has ₹7000 Triple Sharing room
      "green-living": 0, // Starting price is ₹9500
    },
    labelJustifications: {
      "sunrise-pg": "Has ₹7,000 Triple Sharing Economy room available.",
      "green-living": "Does not fit < ₹8,000 budget.",
    },
  },
  {
    id: "SEM-14",
    category: "STUDENT_BUDGET",
    query: "budget friendly student living space with free high speed WiFi and power backup",
    intent: {
      queryText: "budget friendly student living space with free high speed WiFi and power backup",
      maxPrice: 10000,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Starting ₹8,500 with Wi-Fi 6 & 24/7 power backup
      "green-living": 1, // Starting ₹9,500
    },
    labelJustifications: {
      "sunrise-pg": "Great value student stay with 24/7 power backup and Wi-Fi 6.",
      "green-living": "Higher price point.",
    },
  },

  // Category 8: Furnished Comfort
  {
    id: "SEM-15",
    category: "FURNISHED_COMFORT",
    query: "spacious single occupancy room with split AC attached bathroom and private balcony",
    intent: {
      queryText: "spacious single occupancy room with split AC attached bathroom and private balcony",
      roomOccupancy: "Single",
      maxPrice: 15000,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Single Deluxe Room has split AC, attached bath & balcony
      "green-living": 1, // Single private room with AC but no balcony
    },
    labelJustifications: {
      "sunrise-pg": "Room features explicit split AC, attached bathroom, and balcony.",
      "green-living": "Has attached bath and AC, but no balcony.",
    },
  },
  {
    id: "SEM-16",
    category: "FURNISHED_COMFORT",
    query: "fully furnished room with individual wardrobe work desk and daily room cleaning",
    intent: {
      queryText: "fully furnished room with individual wardrobe work desk and daily room cleaning",
      furnished: true,
    },
    relevanceLabels: {
      "sunrise-pg": 2, // Work desk, wardrobe, daily room cleaning
      "green-living": 2, // Private desk and housekeeping
    },
    labelJustifications: {
      "sunrise-pg": "Includes individual wardrobe, work desk, and daily housekeeping.",
      "green-living": "Includes private desk and regular housekeeping.",
    },
  },

  // Additional Test Cases (SEM-17 to SEM-25 for full 25-case coverage)
  {
    id: "SEM-17",
    category: "QUIET_STUDY",
    query: "exam focus hostel with strict quiet hours after 11 PM and fast fiber internet",
    intent: { queryText: "exam focus hostel with strict quiet hours after 11 PM and fast fiber internet", maxPrice: 15000 },
    relevanceLabels: { "sunrise-pg": 2, "green-living": 1 },
    labelJustifications: { "sunrise-pg": "Quiet hours after 11 PM rule present.", "green-living": "Peaceful atmosphere." },
  },
  {
    id: "SEM-18",
    category: "PREMIUM_LUXURY",
    query: "solar powered eco friendly modern female residence with curated meals",
    intent: { queryText: "solar powered eco friendly modern female residence with curated meals", preferredFor: "Female" },
    relevanceLabels: { "green-living": 2, "sunrise-pg": 0 },
    labelJustifications: { "green-living": "Exact match for eco-friendly solar-powered female residence.", "sunrise-pg": "General co-living." },
  },
  {
    id: "SEM-19",
    category: "COMMUNITY_SOCIAL",
    query: "co-living accommodation with rooftop lounge for socializing with friends",
    intent: { queryText: "co-living accommodation with rooftop lounge for socializing with friends", propertyType: "Co-living" },
    relevanceLabels: { "sunrise-pg": 2, "green-living": 1 },
    labelJustifications: { "sunrise-pg": "Rooftop lounge featured.", "green-living": "Quiet common areas." },
  },
  {
    id: "SEM-20",
    category: "SAFETY_SECURITY",
    query: "safe women PG with female warden and 24/7 security guard at main gate",
    intent: { queryText: "safe women PG with female warden and 24/7 security guard at main gate", preferredFor: "Female", propertyType: "Girls PG" },
    relevanceLabels: { "green-living": 2, "sunrise-pg": 1 },
    labelJustifications: { "green-living": "Has female warden and 24/7 guard.", "sunrise-pg": "Co-living." },
  },
  {
    id: "SEM-21",
    category: "FOOD_MEALS",
    query: "stay with North and South Indian meals 3 times a day for students",
    intent: { queryText: "stay with North and South Indian meals 3 times a day for students", mealsRequired: true },
    relevanceLabels: { "sunrise-pg": 2, "green-living": 1 },
    labelJustifications: { "sunrise-pg": "3-time North & South Indian meals explicitly stated.", "green-living": "Home cooked veg meals." },
  },
  {
    id: "SEM-22",
    category: "PROXIMITY_METRO",
    query: "accommodation 500 meters from metro station in Indiranagar",
    intent: { queryText: "accommodation 500 meters from metro station in Indiranagar", locality: "Indiranagar" },
    relevanceLabels: { "green-living": 2, "sunrise-pg": 0 },
    labelJustifications: { "green-living": "500m from Indiranagar Metro Station.", "sunrise-pg": "Located in Koramangala." },
  },
  {
    id: "SEM-23",
    category: "STUDENT_BUDGET",
    query: "cheap student sharing room with power backup and washing machine",
    intent: { queryText: "cheap student sharing room with power backup and washing machine", maxPrice: 10000 },
    relevanceLabels: { "sunrise-pg": 2, "green-living": 1 },
    labelJustifications: { "sunrise-pg": "Has budget 2/3 sharing rooms with power backup and washing machines.", "green-living": "Higher price tier." },
  },
  {
    id: "SEM-24",
    category: "FURNISHED_COMFORT",
    query: "single room with attached bathroom split AC and work desk for student",
    intent: { queryText: "single room with attached bathroom split AC and work desk for student", roomOccupancy: "Single" },
    relevanceLabels: { "sunrise-pg": 2, "green-living": 2 },
    labelJustifications: { "sunrise-pg": "Single room has split AC, attached bath, work desk.", "green-living": "Single room has AC, attached bath, private desk." },
  },
  {
    id: "SEM-25",
    category: "QUIET_STUDY",
    query: "peaceful study residence with high speed WiFi 6 and ergonomics",
    intent: { queryText: "peaceful study residence with high speed WiFi 6 and ergonomics" },
    relevanceLabels: { "sunrise-pg": 2, "green-living": 1 },
    labelJustifications: { "sunrise-pg": "Wi-Fi 6, quiet hours, and ergonomic workstations.", "green-living": "Wi-Fi 6, quiet environment." },
  },
];
