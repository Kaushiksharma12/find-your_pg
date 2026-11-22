import { runEvaluationBenchmark } from "./ai-search-evaluation";

export async function runEvaluationTests() {
  const report = await runEvaluationBenchmark();

  const isAccuracyValid = report.intentEvaluation.accuracy >= 0.8;
  const isInvalidRateZero = report.retrievalEvaluation.invalidResultRate === 0;
  const isDeterministic = report.rankingEvaluation.isDeterministic;
  const isEmptyCorrect = report.emptyResultEvaluation.emptyResultCorrect;

  return {
    isAccuracyValid,
    isInvalidRateZero,
    isDeterministic,
    isEmptyCorrect,
    report,
  };
}
