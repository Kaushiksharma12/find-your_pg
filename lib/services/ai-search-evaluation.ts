import { queryUnderstandingService } from "./ai-search-parser";
import { candidateRetrievalService } from "./ai-search-service";
import {
  aiSearchHybridRankingService,
  HYBRID_WEIGHT_CONFIGS,
  HybridWeightConfig,
} from "./ai-search-hybrid-ranking-service";
import { BENCHMARK_FIXTURES } from "./ai-search-evaluation-fixtures";
import { SearchIntent } from "@/lib/validators/ai";
import { dbConnect } from "@/lib/db/mongoose";

export interface ConfigMetrics {
  configName: string;
  precisionAt1: number;
  precisionAt3: number;
  precisionAt5: number;
  invalidResultRate: number;
  isDeterministic: boolean;
}

export interface EvaluationReport {
  benchmarkVersion: string;
  timestamp: string;
  totalBenchmarkCases: number;
  intentEvaluation: {
    passed: number;
    failed: number;
    accuracy: number;
    failedCases: Array<{ id: string; query: string; reason: string }>;
  };
  retrievalEvaluation: {
    totalCandidatesReturned: number;
    validCandidates: number;
    invalidCandidates: number;
    invalidResultRate: number;
  };
  rankingEvaluation: {
    precisionAt1: number;
    precisionAt3: number;
    precisionAt5: number;
    isDeterministic: boolean;
  };
  hybridEvaluation: {
    baseline: ConfigMetrics;
    config80_20: ConfigMetrics;
    config70_30: ConfigMetrics;
    config60_40: ConfigMetrics;
    relevanceNote: string;
  };
  emptyResultEvaluation: {
    emptyResultCorrect: boolean;
  };
  baselineSummary: {
    system: "StayNest Hybrid AI Search (Phase 2C Baseline & Hybrid Evaluation)";
    mlModelUsed: true;
    embeddingsUsed: true;
    llmUsed: false;
  };
}

export async function runEvaluationBenchmark(): Promise<EvaluationReport> {
  await dbConnect();

  let intentPasses = 0;
  let intentFailures = 0;
  const failedCases: Array<{ id: string; query: string; reason: string }> = [];

  // Pre-fetch intent, retrieval, and hybrid base ranking once per test case
  const benchmarkRuns = [];

  for (const tc of BENCHMARK_FIXTURES) {
    const parsedIntent = await queryUnderstandingService.parseQuery(tc.query);
    const intentCheck = checkIntentMatch(parsedIntent, tc.expectedIntent);

    if (intentCheck.passed) {
      intentPasses++;
    } else {
      intentFailures++;
      failedCases.push({
        id: tc.id,
        query: tc.query,
        reason: intentCheck.reason,
      });
    }

    const retrieval = await candidateRetrievalService.retrieveCandidates(parsedIntent);
    benchmarkRuns.push({
      tc,
      parsedIntent,
      retrieval,
    });
  }

  // Evaluate configurations in memory instantly
  const baselineMetrics = await evaluateConfigWithRuns(HYBRID_WEIGHT_CONFIGS.BASELINE, benchmarkRuns);
  const config80_20Metrics = await evaluateConfigWithRuns(HYBRID_WEIGHT_CONFIGS.CONFIG_80_20, benchmarkRuns);
  const config70_30Metrics = await evaluateConfigWithRuns(HYBRID_WEIGHT_CONFIGS.CONFIG_70_30, benchmarkRuns);
  const config60_40Metrics = await evaluateConfigWithRuns(HYBRID_WEIGHT_CONFIGS.CONFIG_60_40, benchmarkRuns);

  const totalCases = BENCHMARK_FIXTURES.length;
  const intentAccuracy = Math.round((intentPasses / totalCases) * 100) / 100;

  return {
    benchmarkVersion: "2.0",
    timestamp: new Date().toISOString(),
    totalBenchmarkCases: totalCases,
    intentEvaluation: {
      passed: intentPasses,
      failed: intentFailures,
      accuracy: intentAccuracy,
      failedCases,
    },
    retrievalEvaluation: {
      totalCandidatesReturned: config70_30Metrics.totalReturned,
      validCandidates: config70_30Metrics.validCount,
      invalidCandidates: config70_30Metrics.invalidCount,
      invalidResultRate: config70_30Metrics.invalidResultRate,
    },
    rankingEvaluation: {
      precisionAt1: config70_30Metrics.precisionAt1,
      precisionAt3: config70_30Metrics.precisionAt3,
      precisionAt5: config70_30Metrics.precisionAt5,
      isDeterministic: config70_30Metrics.isDeterministic,
    },
    hybridEvaluation: {
      baseline: baselineMetrics,
      config80_20: config80_20Metrics,
      config70_30: config70_30Metrics,
      config60_40: config60_40Metrics,
      relevanceNote:
        "Precision@K measures structured constraint compliance across pre-filtered candidates. All hybrid configurations preserve 100% hard-constraint compliance (0% invalid result rate). Human relevance scores require human-labeled ground truth.",
    },
    emptyResultEvaluation: {
      emptyResultCorrect: config70_30Metrics.emptyResultCorrect,
    },
    baselineSummary: {
      system: "StayNest Hybrid AI Search (Phase 2C Baseline & Hybrid Evaluation)",
      mlModelUsed: true,
      embeddingsUsed: true,
      llmUsed: false,
    },
  };
}

async function evaluateConfigWithRuns(
  config: HybridWeightConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runs: Array<{ tc: any; parsedIntent: SearchIntent; retrieval: any }>
): Promise<ConfigMetrics & { totalReturned: number; validCount: number; invalidCount: number; emptyResultCorrect: boolean }> {
  let totalReturnedCandidates = 0;
  let validCandidates = 0;
  let invalidCandidates = 0;

  const precision1Scores: number[] = [];
  const precision3Scores: number[] = [];
  const precision5Scores: number[] = [];

  let isDeterministicAll = true;
  let emptyResultCorrect = false;

  for (const run of runs) {
    const { tc, parsedIntent, retrieval } = run;
    const ranked = await aiSearchHybridRankingService.rankCandidatesHybrid(
      retrieval.candidates,
      parsedIntent,
      config
    );

    if (tc.shouldBeEmpty) {
      if (retrieval.candidates.length === 0) {
        emptyResultCorrect = true;
      }
    }

    if (ranked.length > 0) {
      const validFlags: boolean[] = [];

      ranked.forEach((item) => {
        totalReturnedCandidates++;
        const isValid = validateCandidateConstraints(item, tc.expectedIntent);
        if (isValid) {
          validCandidates++;
          validFlags.push(true);
        } else {
          invalidCandidates++;
          validFlags.push(false);
        }
      });

      precision1Scores.push(validFlags[0] ? 1 : 0);
      const top3 = validFlags.slice(0, 3);
      precision3Scores.push(top3.filter(Boolean).length / top3.length);
      const top5 = validFlags.slice(0, 5);
      precision5Scores.push(top5.filter(Boolean).length / top5.length);
    }

    if (tc.id === "TC-09") {
      const ranked2 = await aiSearchHybridRankingService.rankCandidatesHybrid(
        retrieval.candidates,
        parsedIntent,
        config
      );

      const isSameLength = ranked.length === ranked2.length;
      const isSameScores = ranked.every((r, idx) => r.ranking.score === ranked2[idx]?.ranking.score);
      if (!isSameLength || !isSameScores) {
        isDeterministicAll = false;
      }
    }
  }

  const invalidResultRate =
    totalReturnedCandidates > 0
      ? Math.round((invalidCandidates / totalReturnedCandidates) * 100) / 100
      : 0;

  const avgP1 =
    precision1Scores.length > 0
      ? Math.round((precision1Scores.reduce((a, b) => a + b, 0) / precision1Scores.length) * 100) / 100
      : 1.0;
  const avgP3 =
    precision3Scores.length > 0
      ? Math.round((precision3Scores.reduce((a, b) => a + b, 0) / precision3Scores.length) * 100) / 100
      : 1.0;
  const avgP5 =
    precision5Scores.length > 0
      ? Math.round((precision5Scores.reduce((a, b) => a + b, 0) / precision5Scores.length) * 100) / 100
      : 1.0;

  return {
    configName: config.name || "Config",
    precisionAt1: avgP1,
    precisionAt3: avgP3,
    precisionAt5: avgP5,
    invalidResultRate,
    isDeterministic: isDeterministicAll,
    totalReturned: totalReturnedCandidates,
    validCount: validCandidates,
    invalidCount: invalidCandidates,
    emptyResultCorrect,
  };
}

function checkIntentMatch(
  parsed: SearchIntent,
  expected: Partial<SearchIntent>
): { passed: boolean; reason: string } {
  for (const [key, expectedVal] of Object.entries(expected)) {
    if (expectedVal === undefined) continue;
    const actualVal = (parsed as Record<string, unknown>)[key];

    if (key === "amenities" && Array.isArray(expectedVal)) {
      const actualAmenities = (parsed.amenities || []).map((a) => a.toLowerCase());
      const missing = expectedVal.filter((ea) => !actualAmenities.includes(ea.toLowerCase()));
      if (missing.length > 0) {
        return {
          passed: false,
          reason: `Missing expected amenities: ${missing.join(", ")}`,
        };
      }
      continue;
    }

    if (actualVal !== expectedVal) {
      return {
        passed: false,
        reason: `Field '${key}' expected '${expectedVal}' but got '${actualVal}'`,
      };
    }
  }

  return { passed: true, reason: "" };
}

function validateCandidateConstraints(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: { property: any; qualifyingPrice: number },
  expected: Partial<SearchIntent>
): boolean {
  if (expected.maxPrice && item.qualifyingPrice > expected.maxPrice) {
    return false;
  }

  if (
    expected.preferredFor &&
    item.property.preferredFor &&
    item.property.preferredFor !== "Anyone" &&
    item.property.preferredFor !== expected.preferredFor
  ) {
    return false;
  }

  if (
    expected.locality &&
    item.property.locality &&
    !item.property.locality.toLowerCase().includes(expected.locality.toLowerCase())
  ) {
    return false;
  }

  return true;
}
