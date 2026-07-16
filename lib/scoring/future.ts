import type { EvaluationInput } from "./types";

function clamp(score: number, max: number) {
  return Math.min(Math.max(score, 0), max);
}

export function calculateFutureScore(evaluation: EvaluationInput) {
  return clamp(
    evaluation.futureTransportGrade +
      evaluation.futureJobGrade +
      evaluation.developmentGrade +
      evaluation.scarcityGrade,
    10
  );
}