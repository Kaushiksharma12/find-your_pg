import { SearchIntent, searchIntentSchema } from "@/lib/validators/ai";

export interface IQueryUnderstandingProvider {
  parse(query: string): Promise<SearchIntent>;
}

const KNOWN_CITIES = [
  "bangalore",
  "pune",
  "hyderabad",
  "delhi",
  "chennai",
  "mumbai",
];

const KNOWN_LOCALITIES = [
  "koramangala",
  "indiranagar",
  "hsr layout",
  "electronic city",
  "jp nagar",
  "viman nagar",
  "baner",
  "hinjewadi",
  "gachibowli",
  "madhapur",
  "whitefield",
  "kothrud",
  "aundh",
  "kukatpally",
  "banjara hills",
];

export class LocalDeterministicProvider implements IQueryUnderstandingProvider {
  async parse(query: string): Promise<SearchIntent> {
    const rawQuery = query.trim();
    const text = rawQuery.toLowerCase();

    let city: string | null = null;
    let locality: string | null = null;
    let landmarkOrCollege: string | null = null;
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    let propertyType: SearchIntent["propertyType"] = null;
    let preferredFor: SearchIntent["preferredFor"] = null;
    let roomOccupancy: SearchIntent["roomOccupancy"] = null;
    let mealsRequired: boolean | null = null;
    let furnished: boolean | null = null;
    const amenitiesSet = new Set<string>();

    // 1. Gender Preference & Property Type Extraction
    if (text.includes("girls pg") || text.includes("girls")) {
      preferredFor = "Female";
      propertyType = "Girls PG";
    } else if (text.includes("boys pg") || text.includes("boys")) {
      preferredFor = "Male";
      propertyType = "Boys PG";
    } else if (text.includes("co-living") || text.includes("coliving")) {
      propertyType = "Co-living";
    } else if (text.includes("studio")) {
      propertyType = "Luxury Studio";
    } else if (text.includes("apartment") || text.includes("flat")) {
      propertyType = "Apartment";
    } else if (/\bpg\b/i.test(text)) {
      propertyType = "PG";
    }

    // 2. Room Occupancy
    if (text.includes("single room") || text.includes("single occupancy") || text.includes("single bed") || /\bsingle\b/i.test(text)) {
      roomOccupancy = "Single";
    } else if (text.includes("2 sharing") || text.includes("double sharing") || text.includes("two sharing") || text.includes("twin sharing")) {
      roomOccupancy = "2 Sharing";
    } else if (text.includes("3 sharing") || text.includes("triple sharing") || text.includes("three sharing")) {
      roomOccupancy = "3 Sharing";
    } else if (text.includes("4 sharing") || text.includes("four sharing")) {
      roomOccupancy = "4 Sharing";
    }

    // 3. Price Extraction & Normalization
    // Handles ₹12,000, 12,000, 12k, 12 K, 8.5k, below 10k, under 15000, ₹8,500, etc.
    const priceRegex = /(?:under|below|less than|upto|up to|max|maximum|budget)?\s*(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(k|thousand)?/gi;
    let match: RegExpExecArray | null;

    while ((match = priceRegex.exec(text)) !== null) {
      const numStr = match[1].replace(/,/g, "");
      let num = parseFloat(numStr);

      if (isNaN(num)) continue;

      if (match[2] && match[2].toLowerCase().startsWith("k")) {
        num = num * 1000;
      } else if (match[2] && match[2].toLowerCase().startsWith("thousand")) {
        num = num * 1000;
      }

      const hasExplicitPriceKeyword = /(?:under|below|less than|upto|up to|max|maximum|budget|₹|rs\.?|inr)/i.test(match[0]);

      // Filter out invalid numbers or year numbers
      if ((num >= 1000 || (hasExplicitPriceKeyword && num > 0)) && num <= 200000) {
        // If query specifies 'above' or 'min', set minPrice, else maxPrice
        const matchIdx = match.index;
        const precedingText = text.substring(Math.max(0, matchIdx - 15), matchIdx);
        if (precedingText.includes("above") || precedingText.includes("min") || precedingText.includes("more than")) {
          minPrice = num;
        } else {
          maxPrice = num;
        }
        break;
      }
    }

    // Fallback price match for bare numbers with 'k' e.g. "12k" or "8.5k"
    if (!maxPrice) {
      const bareKMatch = /\b(\d+(?:\.\d+)?)\s*k\b/i.exec(text);
      if (bareKMatch) {
        maxPrice = parseFloat(bareKMatch[1]) * 1000;
      }
    }

    // 4. Meals & Furnishing
    if (text.includes("with meals") || text.includes("food") || text.includes("mess") || text.includes("meals")) {
      mealsRequired = true;
    }

    if (text.includes("furnished") || text.includes("full furnished") || text.includes("fully furnished")) {
      furnished = true;
    }

    // 5. Amenities Extraction
    if (/\b(?:wifi|wi-fi|wi fi|internet)\b/i.test(text)) {
      amenitiesSet.add("Wi-Fi");
    }
    if (/\b(?:ac|air conditioner|air conditioning)\b/i.test(text)) {
      amenitiesSet.add("AC");
    }
    if (text.includes("power backup") || text.includes("generator") || text.includes("backup")) {
      amenitiesSet.add("Power Backup");
    }
    if (text.includes("gym") || text.includes("fitness")) {
      amenitiesSet.add("Gym");
    }
    if (text.includes("cctv") || text.includes("security camera")) {
      amenitiesSet.add("CCTV");
    }
    if (text.includes("washing machine") || text.includes("laundry")) {
      amenitiesSet.add("Washing Machine");
    }
    if (text.includes("housekeeping") || text.includes("cleaning")) {
      amenitiesSet.add("Housekeeping");
    }

    // 6. Location & Landmark Extraction
    // Check known cities
    for (const c of KNOWN_CITIES) {
      if (new RegExp(`\\b${c}\\b`, "i").test(text)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // Check known localities
    for (const loc of KNOWN_LOCALITIES) {
      if (new RegExp(`\\b${loc}\\b`, "i").test(text)) {
        locality = loc.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        break;
      }
    }

    // Landmark / College Extraction ("near <Landmark>")
    const nearMatch = /\bnear\s+([a-z0-9\s]+?)(?=\s+(?:under|below|below|with|in|for|less|₹|\d|girls|boys|single|co-living|wifi|ac|food)|$)/i.exec(rawQuery);
    if (nearMatch && nearMatch[1]) {
      const extractedLandmark = nearMatch[1].trim();
      if (extractedLandmark && !KNOWN_CITIES.includes(extractedLandmark.toLowerCase())) {
        landmarkOrCollege = extractedLandmark;
      }
    }

    const intent: SearchIntent = {
      queryText: rawQuery,
      city,
      locality,
      landmarkOrCollege,
      minPrice,
      maxPrice,
      propertyType,
      preferredFor,
      roomOccupancy,
      amenities: Array.from(amenitiesSet),
      mealsRequired,
      furnished,
    };

    return searchIntentSchema.parse(intent);
  }
}

export class QueryUnderstandingService {
  private provider: IQueryUnderstandingProvider;

  constructor(provider?: IQueryUnderstandingProvider) {
    this.provider = provider || new LocalDeterministicProvider();
  }

  async parseQuery(query: string): Promise<SearchIntent> {
    return this.provider.parse(query);
  }
}

export const queryUnderstandingService = new QueryUnderstandingService();
