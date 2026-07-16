import type { EvaluationInput, PriceLevel } from "./types";

export function calculatePriceScore(evaluation: EvaluationInput) {
  const scoreMap: Record<PriceLevel, number> = {
    "very-good": 25,
    good: 21,
    normal: 18,
    high: 14,
    unknown: 12,
  };

  return scoreMap[evaluation.priceLevel];
}