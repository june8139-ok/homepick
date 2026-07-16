import type { EvaluationInput } from "./types";

function clamp(score: number, max: number) {
  return Math.min(Math.max(score, 0), max);
}

export function calculateLivingScore(evaluation: EvaluationInput) {
  return clamp(
    evaluation.brandGrade +
      evaluation.communityGrade +
      evaluation.parkingGrade +
      evaluation.floorPlanGrade +
      evaluation.scaleGrade,
    15
  );
}