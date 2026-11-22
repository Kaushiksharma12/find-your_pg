import { dbConnect } from "@/lib/db/mongoose";
import { Property, IProperty } from "@/lib/models/Property";
import { Room, IRoom } from "@/lib/models/Room";
import "@/lib/models/User";
import { SearchIntent } from "@/lib/validators/ai";
import { PROPERTIES_DATA } from "@/lib/mock-data";

export interface CandidateResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  matchingRooms: Record<string, any>[];
  qualifyingPrice: number;
}

export interface CandidateRetrievalResponse {
  candidates: CandidateResult[];
  meta: {
    candidateCount: number;
    totalMatchingRooms: number;
    appliedConstraints: string[];
    unsupportedConstraints: string[];
  };
}

/**
 * Normalizes user amenity queries to match variant amenity text stored in database.
 */
function getAmenityRegexes(amenity: string): RegExp[] {
  const norm = amenity.toLowerCase().trim();

  if (norm.includes("wifi") || norm.includes("wi-fi") || norm.includes("internet")) {
    return [/wi-?fi/i, /internet/i];
  }
  if (norm === "ac" || norm.includes("air condition")) {
    return [/\bac\b/i, /air condition/i];
  }
  if (norm.includes("backup") || norm.includes("generator")) {
    return [/backup/i, /generator/i];
  }
  if (norm.includes("gym") || norm.includes("fitness")) {
    return [/gym/i, /fitness/i];
  }
  if (norm.includes("cctv") || norm.includes("security")) {
    return [/cctv/i, /security/i];
  }
  if (norm.includes("washing") || norm.includes("laundry")) {
    return [/washing/i, /laundry/i];
  }
  if (norm.includes("housekeeping") || norm.includes("cleaning")) {
    return [/housekeeping/i, /cleaning/i];
  }

  return [new RegExp(norm, "i")];
}

/**
 * Ensures MongoDB instance has seeded property and room records if empty.
 */
export async function seedMockDataIfNeeded() {
  await dbConnect();
  const count = await Property.countDocuments();
  if (count > 0) return;

  console.log("Seeding mock properties & rooms into MongoDB...");
  for (const mockProp of PROPERTIES_DATA) {
    const createdProp = await Property.create({
      title: mockProp.title,
      slug: mockProp.slug,
      type: mockProp.type,
      verified: mockProp.verified,
      featured: mockProp.featured,
      city: mockProp.city,
      locality: mockProp.locality,
      address: mockProp.address,
      distanceFromCollege: mockProp.distanceFromCollege,
      startingPrice: mockProp.startingPrice,
      rating: mockProp.rating,
      reviewCount: mockProp.reviewCount,
      images: mockProp.images,
      description: mockProp.description,
      preferredFor: mockProp.preferredFor,
      amenities: mockProp.amenities,
      foodProvided: mockProp.foodProvided,
      foodType: mockProp.foodType,
      securityFeatures: mockProp.securityFeatures,
      houseRules: mockProp.houseRules,
      nearbyLandmarks: mockProp.nearbyLandmarks,
      status: "PUBLISHED",
      // Dummy ObjectId for owner
      owner: "650000000000000000000001",
    });

    const validOccupancies = ["Single", "2 Sharing", "3 Sharing", "4 Sharing"] as const;
    for (const mockRoom of mockProp.rooms) {
      const normalizedOccupancy = (validOccupancies as readonly string[]).includes(mockRoom.occupancy)
        ? (mockRoom.occupancy as (typeof validOccupancies)[number])
        : "Single";
      await Room.create({
        property: createdProp._id,
        name: mockRoom.name,
        price: mockRoom.price,
        deposit: mockRoom.deposit,
        occupancy: normalizedOccupancy,
        totalInventory: Math.max(1, mockRoom.availableCount),
        amenities: mockRoom.amenities,
        image: mockRoom.image,
        isAvailable: mockRoom.availableCount > 0,
      });
    }
  }
}

export class CandidateRetrievalService {
  async retrieveCandidates(intent: SearchIntent): Promise<CandidateRetrievalResponse> {
    await dbConnect();
    await seedMockDataIfNeeded();

    const appliedConstraints: string[] = [];
    const unsupportedConstraints: string[] = [];

    // 1. Build Room Filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomFilter: any = { isAvailable: true };
    let hasRoomPriceOrOccupancyConstraint = false;

    if (intent.maxPrice !== undefined && intent.maxPrice !== null) {
      roomFilter.price = { ...(roomFilter.price || {}), $lte: intent.maxPrice };
      hasRoomPriceOrOccupancyConstraint = true;
      appliedConstraints.push(`Room Price <= ₹${intent.maxPrice}`);
    }

    if (intent.minPrice !== undefined && intent.minPrice !== null) {
      roomFilter.price = { ...(roomFilter.price || {}), $gte: intent.minPrice };
      hasRoomPriceOrOccupancyConstraint = true;
      appliedConstraints.push(`Room Price >= ₹${intent.minPrice}`);
    }

    if (intent.roomOccupancy) {
      roomFilter.occupancy = intent.roomOccupancy;
      hasRoomPriceOrOccupancyConstraint = true;
      appliedConstraints.push(`Room Occupancy = ${intent.roomOccupancy}`);
    }

    // Retrieve matching rooms across all properties first
    const matchingRoomsAll = await Room.find(roomFilter).lean();
    const propertyIdsWithMatchingRooms = Array.from(
      new Set(matchingRoomsAll.map((r) => r.property.toString()))
    );

    // 2. Build Property Filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propertyFilter: any = {
      status: { $in: ["PUBLISHED", "SUBMITTED", "APPROVED"] },
    };

    if (hasRoomPriceOrOccupancyConstraint) {
      propertyFilter._id = { $in: propertyIdsWithMatchingRooms };
    }

    if (intent.city) {
      propertyFilter.city = new RegExp(`^${intent.city.trim()}$`, "i");
      appliedConstraints.push(`City = ${intent.city}`);
    }

    if (intent.locality) {
      propertyFilter.$or = [
        { locality: new RegExp(intent.locality, "i") },
        { address: new RegExp(intent.locality, "i") },
      ];
      appliedConstraints.push(`Locality = ${intent.locality}`);
    }

    if (intent.landmarkOrCollege) {
      const landmarkRegex = new RegExp(intent.landmarkOrCollege, "i");
      const landmarkOrConds = [
        { locality: landmarkRegex },
        { address: landmarkRegex },
        { distanceFromCollege: landmarkRegex },
        { nearbyLandmarks: landmarkRegex },
        { title: landmarkRegex },
        { description: landmarkRegex },
      ];
      if (propertyFilter.$or) {
        propertyFilter.$and = [
          { $or: propertyFilter.$or },
          { $or: landmarkOrConds },
        ];
        delete propertyFilter.$or;
      } else {
        propertyFilter.$or = landmarkOrConds;
      }
      appliedConstraints.push(`Landmark/POI = ${intent.landmarkOrCollege}`);
    }

    if (intent.propertyType || intent.preferredFor) {
      const typeConds: Record<string, unknown>[] = [];
      if (intent.propertyType) {
        if (intent.propertyType === "PG") {
          typeConds.push({ type: { $in: ["Boys PG", "Girls PG", "Co-living"] } });
        } else {
          typeConds.push({ type: intent.propertyType });
        }
        appliedConstraints.push(`Property Type = ${intent.propertyType}`);
      }

      if (intent.preferredFor) {
        if (intent.preferredFor === "Female") {
          typeConds.push({ preferredFor: { $in: ["Female", "Anyone"] } });
          typeConds.push({ type: "Girls PG" });
        } else if (intent.preferredFor === "Male") {
          typeConds.push({ preferredFor: { $in: ["Male", "Anyone"] } });
          typeConds.push({ type: "Boys PG" });
        }
        appliedConstraints.push(`Preferred For = ${intent.preferredFor}`);
      }

      if (typeConds.length > 0) {
        if (propertyFilter.$or) {
          propertyFilter.$and = propertyFilter.$and || [];
          propertyFilter.$and.push({ $or: propertyFilter.$or });
          propertyFilter.$and.push({ $or: typeConds });
          delete propertyFilter.$or;
        } else if (propertyFilter.$and) {
          propertyFilter.$and.push({ $or: typeConds });
        } else {
          propertyFilter.$or = typeConds;
        }
      }
    }

    if (intent.mealsRequired === true) {
      propertyFilter.foodProvided = true;
      appliedConstraints.push("Meals Required = Yes");
    }

    if (intent.foodType) {
      propertyFilter.foodType = new RegExp(intent.foodType, "i");
      appliedConstraints.push(`Food Type = ${intent.foodType}`);
    }

    // Amenity Normalization & Matching
    if (intent.amenities && intent.amenities.length > 0) {
      const amenityAndConds: Record<string, unknown>[] = [];
      for (const reqAmenity of intent.amenities) {
        const regexes = getAmenityRegexes(reqAmenity);
        amenityAndConds.push({
          $or: regexes.map((r) => ({ amenities: r })),
        });
        appliedConstraints.push(`Amenity = ${reqAmenity}`);
      }
      propertyFilter.$and = propertyFilter.$and || [];
      propertyFilter.$and.push(...amenityAndConds);
    }

    // Furnishing constraint handling
    if (intent.furnished === true) {
      // Documented limitation: Furnishing is implicit in description / amenities text
      const furnishedRegex = /furnished/i;
      propertyFilter.$and = propertyFilter.$and || [];
      propertyFilter.$and.push({
        $or: [
          { description: furnishedRegex },
          { amenities: furnishedRegex },
        ],
      });
      appliedConstraints.push("Furnished = Implicit Text Match");
    }

    // 3. Execute Property Query
    const matchedProperties = await Property.find(propertyFilter)
      .populate("owner", "name phone avatar verifiedHost")
      .lean();

    // 4. Attach Compatible Available Rooms to Each Candidate Property
    const candidateResults: CandidateResult[] = [];
    let totalMatchingRoomsCount = 0;

    for (const prop of matchedProperties) {
      // Find all matching available rooms for this specific property
      const propRoomFilter = { ...roomFilter, property: prop._id };
      const propMatchingRooms = await Room.find(propRoomFilter).lean();

      // If room criteria were applied, ensure the property has at least 1 matching available room
      if (hasRoomPriceOrOccupancyConstraint && propMatchingRooms.length === 0) {
        continue;
      }

      // If no room constraint was requested, fall back to fetching all available rooms for display
      const displayRooms = propMatchingRooms.length > 0
        ? propMatchingRooms
        : await Room.find({ property: prop._id, isAvailable: true }).lean();

      // Determine lowest qualifying price
      const roomPrices = displayRooms.map((r) => r.price);
      const qualifyingPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : prop.startingPrice;

      totalMatchingRoomsCount += displayRooms.length;

      candidateResults.push({
        property: prop,
        matchingRooms: displayRooms,
        qualifyingPrice,
      });
    }

    return {
      candidates: candidateResults,
      meta: {
        candidateCount: candidateResults.length,
        totalMatchingRooms: totalMatchingRoomsCount,
        appliedConstraints,
        unsupportedConstraints,
      },
    };
  }
}

export const candidateRetrievalService = new CandidateRetrievalService();
