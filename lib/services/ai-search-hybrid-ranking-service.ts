import { SearchIntent } from "@/lib/validators/ai";
import { CandidateResult } from "@/lib/services/ai-search-service";
import {
  candidateRankingService,
  RankedCandidateResult,
} from "@/lib/services/ai-search-ranking-service";
import { aiSearchEmbeddingService, validateVector } from "@/lib/services/ai-search-embedding-service";

export interface HybridWeightConfig {
  name?: string;
  deterministicWeight: number; // e.g. 0.70
  semanticWeight: number;      // e.g. 0.30
}

export const HYBRID_WEIGHT_CONFIGS = {
  BASELINE: { name: "100/0 Baseline", deterministicWeight: 1.0, semanticWeight: 0.0 },
  CONFIG_80_20: { name: "80/20 Hybrid", deterministicWeight: 0.8, semanticWeight: 0.2 },
  CONFIG_70_30: { name: "70/30 Hybrid", deterministicWeight: 0.7, semanticWeight: 0.3 },
  CONFIG_60_40: { name: "60/40 Hybrid", deterministicWeight: 0.6, semanticWeight: 0.4 },
};

export interface HybridRankingDetails {
  score: number; // Final hybrid score (0-100)
  deterministicScore: number;
  semanticSimilarity: number | null;
  semanticScore: number | null;
  hybridScore: number;
  weightConfigUsed: HybridWeightConfig;
  matchReasons: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  breakdown: any;
}

export interface HybridRankedCandidateResult extends CandidateResult {
  ranking: HybridRankingDetails;
}

/**
 * Robust, deterministic cosine similarity utility for numeric vectors.
 * Returns similarity in range [-1, 1], or null if vectors are invalid/mismatched.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number | null {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return null;
  if (vecA.length === 0 || vecA.length !== vecB.length) return null;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];

    if (
      typeof a !== "number" ||
      typeof b !== "number" ||
      isNaN(a) ||
      isNaN(b) ||
      !isFinite(a) ||
      !isFinite(b)
    ) {
      return null;
    }

    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA <= 0 || normB <= 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  if (isNaN(similarity) || !isFinite(similarity)) {
    return 0;
  }

  return Math.min(1.0, Math.max(-1.0, similarity));
}

export class AISearchHybridRankingService {
  /**
   * Ranks pre-filtered Phase 1B candidates using Phase 1C deterministic scoring
   * combined with Phase 2B vector embedding semantic similarity.
   */
  async rankCandidatesHybrid(
    candidates: CandidateResult[],
    intent: SearchIntent,
    weights: HybridWeightConfig = HYBRID_WEIGHT_CONFIGS.CONFIG_70_30
  ): Promise<HybridRankedCandidateResult[]> {
    // 1. Compute Phase 1C deterministic ranking for all candidates
    const deterministicRanked = candidateRankingService.rankCandidates(candidates, intent);

    // 2. Try to generate query embedding (best-effort, non-blocking fallback)
    let queryVector: number[] | null = null;
    try {
      if (intent.queryText && intent.queryText.trim().length > 0) {
        queryVector = await aiSearchEmbeddingService.embedQuery(intent.queryText);
      }
    } catch (err) {
      console.warn("[HybridRanking] Query embedding unavailable, falling back to Phase 1C deterministic scores:", err);
      queryVector = null;
    }

    // 3. Score each candidate with Phase 2C Hybrid formula
    const hybridResults: HybridRankedCandidateResult[] = deterministicRanked.map((cand) => {
      const deterministicScore = cand.ranking.score;
      const propVector = cand.property.descriptionVector;

      let similarity: number | null = null;
      let semanticScore: number | null = null;

      // Calculate semantic similarity if both query and property vectors exist and are valid
      if (
        queryVector &&
        validateVector(queryVector) &&
        Array.isArray(propVector) &&
        validateVector(propVector)
      ) {
        similarity = cosineSimilarity(queryVector, propVector);
        if (similarity !== null) {
          // Scale cosine similarity [-1, 1] or [0, 1] to 0-100 score
          const clampedSim = Math.max(0, similarity);
          semanticScore = Math.min(100, Math.max(0, Math.round(clampedSim * 100)));
        }
      }

      // Compute hybrid score
      let hybridScore: number;
      const matchReasons = [...cand.ranking.matchReasons];

      if (semanticScore !== null && weights.semanticWeight > 0) {
        const rawHybrid =
          deterministicScore * weights.deterministicWeight +
          semanticScore * weights.semanticWeight;
        hybridScore = Math.min(100, Math.max(0, Math.round(rawHybrid)));

        if (semanticScore >= 75) {
          matchReasons.push("Strong semantic search match");
        }
      } else {
        // Fallback to deterministic score if semantic score is unavailable or weight is 0
        hybridScore = deterministicScore;
      }

      return {
        ...cand,
        ranking: {
          score: hybridScore,
          deterministicScore,
          semanticSimilarity: similarity,
          semanticScore,
          hybridScore,
          weightConfigUsed: weights,
          matchReasons: Array.from(new Set(matchReasons)),
          breakdown: cand.ranking.breakdown,
        },
      };
    });

    // 4. Deterministic Tie-Breaking Sort
    // Sort Order:
    // 1. hybridScore DESC
    // 2. deterministicScore DESC
    // 3. rating DESC
    // 4. reviewCount DESC
    // 5. _id ASC (string comparison)
    hybridResults.sort((a, b) => {
      if (b.ranking.hybridScore !== a.ranking.hybridScore) {
        return b.ranking.hybridScore - a.ranking.hybridScore;
      }
      if (b.ranking.deterministicScore !== a.ranking.deterministicScore) {
        return b.ranking.deterministicScore - a.ranking.deterministicScore;
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

    return hybridResults;
  }
}

export const aiSearchHybridRankingService = new AISearchHybridRankingService();
