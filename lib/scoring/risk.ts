import type { EvaluationInput, RiskLevel } from "./types";

export function calculateRiskScore(evaluation: EvaluationInput) {
  const scoreMap: Record<RiskLevel, number> = {
    low: 10,
    normal: 8,
    some: 6,
    high: 4,
    unknown: 5,
  };

  return scoreMap[evaluation.riskLevel];
}