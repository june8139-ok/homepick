import type { AiScore, EvaluationInput } from "./types";

import { calculatePriceScore } from "./price";
import { calculateContractScore } from "./contract";
import { calculateLocationScore } from "./location";
import { calculateLivingScore } from "./living";
import { calculateFutureScore } from "./future";
import { calculateRiskScore } from "./risk";

export type { AiScore, EvaluationInput } from "./types";

export function calculateScore(evaluation: EvaluationInput): AiScore {
  const price = calculatePriceScore(evaluation);
  const contract = calculateContractScore(evaluation);
  const location = calculateLocationScore(evaluation);
  const living = calculateLivingScore(evaluation);
  const future = calculateFutureScore(evaluation);
  const risk = calculateRiskScore(evaluation);

  return {
    total: price + contract + location + living + future + risk,
    price,
    contract,
    location,
    living,
    future,
    risk,
  };
}