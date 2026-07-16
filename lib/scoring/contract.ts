import type {
    CashBenefitType,
    ContractType,
    EvaluationInput,
    MiddlePaymentType,
    OptionBenefitType,
  } from "./types";
  
  function clamp(score: number, max: number) {
    return Math.min(Math.max(score, 0), max);
  }
  
  export function calculateContractScore(evaluation: EvaluationInput) {
    const contractScoreMap: Record<ContractType, number> = {
      "fixed-500": 7,
      "fixed-1000": 5,
      "ratio-5": 3,
      "ratio-10": 1,
      unknown: 0,
    };
  
    const middleScoreMap: Record<MiddlePaymentType, number> = {
      free: 5,
      "partial-free": 3,
      "interest-deferred": 1,
      self: 0,
      unknown: 0,
    };
  
    const optionScoreMap: Record<OptionBenefitType, number> = {
      "balcony-and-options-free": 4,
      "balcony-free": 2,
      "some-options-free": 1,
      paid: 0,
      unknown: 0,
    };
  
    const cashScoreMap: Record<CashBenefitType, number> = {
      "over-2000": 3,
      "over-1000": 2,
      small: 1,
      none: 0,
      unknown: 0,
    };
  
    const balanceScore = evaluation.balanceSupport === "yes" ? 1 : 0;
  
    return clamp(
      contractScoreMap[evaluation.contractType] +
        middleScoreMap[evaluation.middlePaymentType] +
        optionScoreMap[evaluation.optionBenefitType] +
        cashScoreMap[evaluation.cashBenefitType] +
        balanceScore,
      20
    );
  }