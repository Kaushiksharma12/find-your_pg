import { SearchIntent } from "@/lib/validators/ai";
import { CandidateResult } from "@/lib/services/ai-search-service";

export interface RankingBreakdown {
  localityScore: number;
  priceScore: number;
  roomScore: number;
  amenityScore: number;
  verifiedScore: number;
  ratingScore: number;
  reviewConfidenceScore: number;
  featuredScore: number;
}

export interface RankingDetails {
  score: number; // Integer between 0 and 100
  matchReasons: string[];
  breakdown: RankingBreakdown;
}

export interface RankedCandidateResult extends CandidateResult {
  ranking: RankingDetails;
}

/**
 * Amenity regex matching helper reused from Phase 1B logic conventions.
 */
function matchesAmenity(propertyAmenities: string[], reqAmenity: string): boolean {
  const norm = reqAmenity.toLowerCase().trim();
  const allText = propertyAmenities.join(" ").toLowerCase();

  if (norm.includes("wifi") || norm.includes("wi-fi") || norm.includes("internet")) {
    return /wi-?fi|internet/i.test(allText);
  }
  if (norm === "ac" || norm.includes("air condition")) {
    return /\bac\b|air condition/i.test(allText);
  }
  if (norm.includes("backup") || norm.includes("generator")) {
    return /backup|generator/i.test(allText);
  }
  if (norm.includes("gym") || norm.includes("fitness")) {
    return /gym|fitness/i.test(allText);
  }
  if (norm.includes("cctv") || norm.includes("security")) {
    return /cctv|security/i.test(allText);
  }
  if (norm.includes("washing") || norm.includes("laundry")) {
    return /washing|laundry/i.test(allText);
  }
  if (norm.includes("housekeeping") || norm.includes("cleaning")) {
    return /housekeeping|cleaning/i.test(allText);
  }

  return propertyAmenities.some((a) => a.toLowerCase().includes(norm));
}

export class CandidateRankingService {
  /**
   * Ranks retrieved candidates deterministically based on SearchIntent features.
   */
  rankCandidates(
    candidates: CandidateResult[],
    intent: SearchIntent
  ): RankedCandidateResult[] {
    const rankedResults: RankedCandidateResult[] = candidates.map((candidate) => {
      const prop = candidate.property;
      const rooms = candidate.matchingRooms || [];
      const matchReasons: string[] = [];

      // -------------------------------------------------------------
      // 1. LOCALITY SCORE (Max 25 pts)
      // -------------------------------------------------------------
      let localityScore = 15; // Neutral baseline when no location specified in query

      if (intent.locality || intent.landmarkOrCollege) {
        const targetLoc = (intent.locality || intent.landmarkOrCollege || "").toLowerCase();
        const propLocality = (prop.locality || "").toLowerCase();
        const propAddress = (prop.address || "").toLowerCase();
        const propCollege = (prop.distanceFromCollege || "").toLowerCase();
        const propTitle = (prop.title || "").toLowerCase();

        if (propLocality && (propLocality === targetLoc || propLocality.includes(targetLoc) || targetLoc.includes(propLocality))) {
          localityScore = 25;
          matchReasons.push(`Exact locality match for ${prop.locality}`);
        } else if (propAddress.includes(targetLoc) || propCollege.includes(targetLoc) || propTitle.includes(targetLoc)) {
          localityScore = 18;
          matchReasons.push(`Located near ${intent.locality || intent.landmarkOrCollege}`);
        } else {
          localityScore = 5;
        }
      } else if (intent.city) {
        const targetCity = intent.city.toLowerCase();
        const propCity = (prop.city || "").toLowerCase();
        if (propCity === targetCity) {
          localityScore = 25;
          matchReasons.push(`Located in ${prop.city}`);
        }
      }

      // -------------------------------------------------------------
      // 2. PRICE FIT SCORE (Max 20 pts)
      // -------------------------------------------------------------
      let priceScore = 15; // Neutral baseline when no price constraint
      const qualifyingPrice = candidate.qualifyingPrice || prop.startingPrice || 0;

      if (intent.maxPrice && intent.maxPrice > 0) {
        const max = intent.maxPrice;
        const min = intent.minPrice || 0;

        if (qualifyingPrice >= min && qualifyingPrice <= max) {
          const ratio = qualifyingPrice / max;
          // Prefer prices between 60% and 95% of max budget
          if (ratio >= 0.6 && ratio <= 0.95) {
            priceScore = 20;
            matchReasons.push(`Price (₹${qualifyingPrice.toLocaleString()}) fits comfortably in your budget`);
          } else if (ratio < 0.6) {
            priceScore = 15; // Good value, slightly lower score than ideal targeted budget
            matchReasons.push(`Great value price (₹${qualifyingPrice.toLocaleString()}) below budget`);
          } else {
            priceScore = 18;
            matchReasons.push(`Price (₹${qualifyingPrice.toLocaleString()}) within maximum budget`);
          }
        } else {
          priceScore = 5;
        }
      }

      // -------------------------------------------------------------
      // 3. ROOM MATCH SCORE (Max 15 pts)
      // -------------------------------------------------------------
      let roomScore = 10; // Neutral baseline

      if (intent.roomOccupancy && rooms.length > 0) {
        const exactRoomMatch = rooms.find(
          (r: { occupancy?: string }) => (r.occupancy || "").toLowerCase() === intent.roomOccupancy?.toLowerCase()
        );
        if (exactRoomMatch) {
          roomScore = 15;
          matchReasons.push(`Matching ${exactRoomMatch.occupancy} room available`);
        } else {
          roomScore = 8;
        }
      }

      // -------------------------------------------------------------
      // 4. AMENITY COVERAGE SCORE (Max 15 pts)
      // -------------------------------------------------------------
      let amenityScore = 15; // Neutral baseline

      if (intent.amenities && intent.amenities.length > 0) {
        const propertyAmenities: string[] = prop.amenities || [];
        const roomAmenities: string[] = rooms.flatMap((r: { amenities?: string[] }) => r.amenities || []);
        const combinedAmenities = Array.from(new Set([...propertyAmenities, ...roomAmenities]));

        let matchedCount = 0;
        for (const req of intent.amenities) {
          if (matchesAmenity(combinedAmenities, req)) {
            matchedCount++;
          }
        }

        const coverage = matchedCount / intent.amenities.length;
        amenityScore = Math.round(15 * coverage);

        if (matchedCount === intent.amenities.length) {
          matchReasons.push(`All requested amenities available (${intent.amenities.join(", ")})`);
        } else if (matchedCount > 0) {
          matchReasons.push(`Partial amenity match (${matchedCount}/${intent.amenities.length} requested)`);
        }
      }

      // -------------------------------------------------------------
      // 5. VERIFIED PROPERTY SCORE (Max 10 pts)
      // -------------------------------------------------------------
      let verifiedScore = 0;
      const isVerifiedProp = Boolean(prop.verified);
      const isVerifiedHost = Boolean(prop.owner?.verifiedHost);

      if (isVerifiedProp || isVerifiedHost) {
        verifiedScore = 10;
        matchReasons.push("Verified property & host");
      }

      // -------------------------------------------------------------
      // 6. RATING QUALITY SCORE (Max 7 pts)
      // -------------------------------------------------------------
      const rawRating = typeof prop.rating === "number" ? prop.rating : 0;
      const safeRating = Math.min(5, Math.max(0, rawRating));
      const ratingScore = Math.round(7 * (safeRating / 5));

      if (safeRating >= 4.0) {
        matchReasons.push(`Highly rated property (${safeRating}★)`);
      }

      // -------------------------------------------------------------
      // 7. REVIEW COUNT CONFIDENCE SCORE (Max 5 pts)
      // -------------------------------------------------------------
      const reviewCount = typeof prop.reviewCount === "number" ? prop.reviewCount : 0;
      let reviewConfidenceScore = 0;

      if (reviewCount >= 100) {
        reviewConfidenceScore = 5;
      } else if (reviewCount >= 50) {
        reviewConfidenceScore = 4;
      } else if (reviewCount >= 10) {
        reviewConfidenceScore = 3;
      } else if (reviewCount >= 1) {
        reviewConfidenceScore = 2;
      }

      // -------------------------------------------------------------
      // 8. FEATURED PROPERTY SCORE (Max 3 pts)
      // -------------------------------------------------------------
      let featuredScore = 0;
      if (prop.featured) {
        featuredScore = 3;
        matchReasons.push("Featured stay");
      }

      // -------------------------------------------------------------
      // TOTAL SCORE CALCULATION & CLAMPING (0 - 100)
      // -------------------------------------------------------------
      const rawTotal =
        localityScore +
        priceScore +
        roomScore +
        amenityScore +
        verifiedScore +
        ratingScore +
        reviewConfidenceScore +
        featuredScore;

      const finalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

      const breakdown: RankingBreakdown = {
        localityScore,
        priceScore,
        roomScore,
        amenityScore,
        verifiedScore,
        ratingScore,
        reviewConfidenceScore,
        featuredScore,
      };

      return {
        ...candidate,
        ranking: {
          score: finalScore,
          matchReasons: Array.from(new Set(matchReasons)), // Deduplicate reasons
          breakdown,
        },
      };
    });

    // Sort deterministically:
    // 1. score DESC
    // 2. rating DESC
    // 3. reviewCount DESC
    // 4. _id ASC (string representation)
    rankedResults.sort((a, b) => {
      if (b.ranking.score !== a.ranking.score) {
        return b.ranking.score - a.ranking.score;
      }
      const ratingA = a.property.rating || 0;
      const ratingB = b.property.rating || 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      const revA = a.property.reviewCount || 0;
      const revB = b.property.reviewCount || 0;
      if (revB !== revA) {
        return revB - revA;
      }
      const idA = (a.property._id || "").toString();
      const idB = (b.property._id || "").toString();
      return idA.localeCompare(idB);
    });

    return rankedResults;
  }
}

export const candidateRankingService = new CandidateRankingService();
