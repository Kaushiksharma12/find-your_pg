import { runSemanticEvaluationBenchmark } from "./ai-search-semantic-evaluation";

export async function runSemanticEvaluationTests() {
  const report = await runSemanticEvaluationBenchmark();

  const isNdcgValid =
    typeof report.configs.config70_30.ndcgAt3 === "number" &&
    report.configs.config70_30.ndcgAt3 >= 0 &&
    report.configs.config70_30.ndcgAt3 <= 1;

  const isMrrValid =
    typeof report.configs.config70_30.mrr === "number" &&
    report.configs.config70_30.mrr >= 0 &&
    report.configs.config70_30.mrr <= 1;

  const isPairwiseValid =
    typeof report.configs.config70_30.pairwiseAccuracy === "number" &&
    report.configs.config70_30.pairwiseAccuracy >= 0 &&
    report.configs.config70_30.pairwiseAccuracy <= 1;

  const isConstraintPrecision100 = report.configs.config70_30.precisionAt1 === 1.0;
  const isInvalidRateZero = report.configs.config70_30.invalidResultRate === 0.0;

  return {
    isNdcgValid,
    isMrrValid,
    isPairwiseValid,
    isConstraintPrecision100,
    isInvalidRateZero,
    report,
  };
}
