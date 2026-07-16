import type { AiScore } from "./apartments";

export type PriceLevel =
  | "very-good"
  | "good"
  | "normal"
  | "high"
  | "unknown";

export type ContractType =
  | "fixed-500"
  | "fixed-1000"
  | "ratio-5"
  | "ratio-10"
  | "unknown";

export type MiddlePaymentType =
  | "free"
  | "partial-free"
  | "interest-deferred"
  | "self"
  | "unknown";

export type OptionBenefitType =
  | "balcony-and-options-free"
  | "balcony-free"
  | "some-options-free"
  | "paid"
  | "unknown";

export type CashBenefitType =
  | "over-2000"
  | "over-1000"
  | "small"
  | "none"
  | "unknown";

export type SupportType = "yes" | "no" | "unknown";

export type SchoolLevel =
  | "elementary-middle-high-1to3min"
  | "elementary-middle-high-walk"
  | "elementary-walk-middle-high-near"
  | "elementary-walk"
  | "weak"
  | "unknown";

export type TransportLevel =
  | "station-ic-future"
  | "station-or-rail-good-road"
  | "ic-good"
  | "car-only"
  | "weak"
  | "unknown";

export type InfraLevel =
  | "excellent"
  | "good"
  | "normal"
  | "weak"
  | "unknown";

export type JobLevel = "excellent" | "good" | "weak" | "unknown";

export type NatureLevel = "good" | "normal" | "weak" | "unknown";

export type RoadLevel = "good" | "weak" | "unknown";

export type Grade3 = 0 | 1 | 2 | 3;

export type RiskLevel = "low" | "normal" | "some" | "high" | "unknown";

export type EvaluationInput = {
  priceLevel: PriceLevel;

  contractType: ContractType;
  middlePaymentType: MiddlePaymentType;
  optionBenefitType: OptionBenefitType;
  cashBenefitType: CashBenefitType;
  balanceSupport: SupportType;

  schoolLevel: SchoolLevel;
  transportLevel: TransportLevel;
  infraLevel: InfraLevel;
  jobLevel: JobLevel;
  natureLevel: NatureLevel;
  roadLevel: RoadLevel;

  brandGrade: Grade3;
  communityGrade: Grade3;
  parkingGrade: Grade3;
  floorPlanGrade: Grade3;
  scaleGrade: Grade3;

  futureTransportGrade: Grade3;
  futureJobGrade: Grade3;
  developmentGrade: 0 | 1 | 2;
  scarcityGrade: 0 | 1 | 2;

  riskLevel: RiskLevel;
};

function clamp(score: number, max: number) {
  return Math.min(Math.max(score, 0), max);
}

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

function calculatePriceScore(evaluation: EvaluationInput) {
  const scoreMap: Record<PriceLevel, number> = {
    "very-good": 25,
    good: 21,
    normal: 18,
    high: 14,
    unknown: 12,
  };

  return scoreMap[evaluation.priceLevel];
}

function calculateContractScore(evaluation: EvaluationInput) {
  const contractScoreMap: Record<ContractType, number> = {
    "fixed-500": 7,
    "fixed-1000": 5,
    "ratio-5": 3,
    "ratio-10": 1,
    unknown: 0,
  };

  const middlePaymentScoreMap: Record<MiddlePaymentType, number> = {
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

  const balanceSupportScore =
    evaluation.balanceSupport === "yes" ? 1 : 0;

  return clamp(
    contractScoreMap[evaluation.contractType] +
      middlePaymentScoreMap[evaluation.middlePaymentType] +
      optionScoreMap[evaluation.optionBenefitType] +
      cashScoreMap[evaluation.cashBenefitType] +
      balanceSupportScore,
    20
  );
}

function calculateLocationScore(evaluation: EvaluationInput) {
  const schoolScoreMap: Record<SchoolLevel, number> = {
    "elementary-middle-high-1to3min": 5,
    "elementary-middle-high-walk": 4,
    "elementary-walk-middle-high-near": 3,
    "elementary-walk": 2,
    weak: 1,
    unknown: 1,
  };

  const transportScoreMap: Record<TransportLevel, number> = {
    "station-ic-future": 5,
    "station-or-rail-good-road": 4,
    "ic-good": 3,
    "car-only": 2,
    weak: 1,
    unknown: 1,
  };

  const infraScoreMap: Record<InfraLevel, number> = {
    excellent: 4,
    good: 3,
    normal: 2,
    weak: 1,
    unknown: 1,
  };

  const jobScoreMap: Record<JobLevel, number> = {
    excellent: 3,
    good: 2,
    weak: 1,
    unknown: 1,
  };

  const natureScoreMap: Record<NatureLevel, number> = {
    good: 2,
    normal: 1,
    weak: 0,
    unknown: 1,
  };

  const roadScoreMap: Record<RoadLevel, number> = {
    good: 1,
    weak: 0,
    unknown: 0,
  };

  return clamp(
    schoolScoreMap[evaluation.schoolLevel] +
      transportScoreMap[evaluation.transportLevel] +
      infraScoreMap[evaluation.infraLevel] +
      jobScoreMap[evaluation.jobLevel] +
      natureScoreMap[evaluation.natureLevel] +
      roadScoreMap[evaluation.roadLevel],
    20
  );
}

function calculateLivingScore(evaluation: EvaluationInput) {
  return clamp(
    evaluation.brandGrade +
      evaluation.communityGrade +
      evaluation.parkingGrade +
      evaluation.floorPlanGrade +
      evaluation.scaleGrade,
    15
  );
}

function calculateFutureScore(evaluation: EvaluationInput) {
  return clamp(
    evaluation.futureTransportGrade +
      evaluation.futureJobGrade +
      evaluation.developmentGrade +
      evaluation.scarcityGrade,
    10
  );
}

function calculateRiskScore(evaluation: EvaluationInput) {
  const scoreMap: Record<RiskLevel, number> = {
    low: 10,
    normal: 8,
    some: 6,
    high: 4,
    unknown: 5,
  };

  return scoreMap[evaluation.riskLevel];
}