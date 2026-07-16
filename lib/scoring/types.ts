export type AiScore = {
    total: number;
    price: number;
    contract: number;
    location: number;
    living: number;
    future: number;
    risk: number;
  };
  
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
  
  export type InfraLevel = "excellent" | "good" | "normal" | "weak" | "unknown";
  export type JobLevel = "excellent" | "good" | "weak" | "unknown";
  export type NatureLevel = "good" | "normal" | "weak" | "unknown";
  export type RoadLevel = "good" | "weak" | "unknown";
  
  export type Grade3 = 0 | 1 | 2 | 3;
  export type Grade2 = 0 | 1 | 2;
  
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
    developmentGrade: Grade2;
    scarcityGrade: Grade2;
  
    riskLevel: RiskLevel;
  };