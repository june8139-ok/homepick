import type { EvaluationInput } from "../data/scoring";

export type SubscriptionSchedule = {
  announcementDate?: string | null;
  specialSupplyStartDate?: string | null;
  specialSupplyEndDate?: string | null;
  firstPriorityStartDate?: string | null;
  firstPriorityEndDate?: string | null;
  secondPriorityStartDate?: string | null;
  secondPriorityEndDate?: string | null;
  winnerDate?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  noticeUrl?: string | null;
  applyUrl?: string | null;
  applyHomeUrl?: string | null;
};

export type ProjectInfo = {
  totalHouseholds?: string;
  saleHouseholds?: string;
  parking?: string;
  scale?: string;
  usage?: string;
  moveInDate?: string;
  floors?: string;
  buildings?: string;
  siteArea?: string;
  buildingArea?: string;
  floorAreaRatio?: string;
  buildingCoverageRatio?: string;
  developer?: string;
  phone?: string;
};

export type LocationInfo = {
  transport?: string;
  education?: string;
  living?: string;
  jobAccess?: string;
  nature?: string;
  futureValue?: string;
  cautions?: string;
};

export type UnitPriceSource = "applyhome" | "manual" | "mixed";

export type UnitTypePrice = {
  typeName: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  households?: number | null;
};

export type UnitPrice = {
  area: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  households?: number | null;
  source?: UnitPriceSource;
  types?: UnitTypePrice[];
};

export type ApartmentPriceInfo = {
  minimumPrice?: number | null;
  maximumPrice?: number | null;
  averagePricePerPyeong?: number | null;
  units: UnitPrice[];
  updatedAt?: string | null;
  note?: string | null;
};

export type ApartmentConditionHistoryDateType =
  | "changed"
  | "checked"
  | "month-only"
  | "unknown";

export type ApartmentConditionHistoryItem = {
  dateType?: ApartmentConditionHistoryDateType;
  date: string;
  title: string;
  description: string;
  contractType?: EvaluationInput["contractType"];
  middlePaymentType?: EvaluationInput["middlePaymentType"];
  optionBenefitType?: EvaluationInput["optionBenefitType"];
  cashBenefitType?: EvaluationInput["cashBenefitType"];
  balanceSupport?: EvaluationInput["balanceSupport"];
};

export type ListingStage =
  | "subscription"
  | "firstCome"
  | "completed"
  | "existing";

export type Apartment = {
  slug: string;
  city: string;
  cityName: string;
  district: string;
  districtName: string;
  region: string;
  type: string;
  brand: string;
  builder: string;
  name: string;
  leadType?: "consult" | "schedule" | "closed";
  latitude?: number | null;
  longitude?: number | null;
  images: {
    hero: string | null;
    location: string[];
    floorPlans: { name: string; url: string }[];
    community: string[];
    gallery: string[];
  };
  keywords: string[];
  status: string;
  listingStage?: ListingStage;
  price: string;
  condition: string;

  contractDetails?: string;
  jibnunSummary?: string;

  /*
   * 관리자 계약조건 선택값 원본입니다.
   */
  evaluation?: Partial<EvaluationInput>;

  source?: "manual" | "applyhome";
  applyHomeId?: string | null;
  applyHomeUrl?: string | null;
  isAutoCreated?: boolean;
  manualOverride?: boolean;
  syncStatus?: string;
  lastSyncedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  /*
   * 사용자에게 보여줄 "최근 업데이트" 전용 메타데이터입니다.
   * 단순 자동 동기화가 아니라 실제 의미 있는 정보가 바뀐 경우에만 갱신합니다.
   */
  lastMeaningfulUpdateAt?: string | null;
  lastUpdateType?: string | null;

  totalSupply?: number | null;
  subscription?: SubscriptionSchedule;
  projectInfo?: ProjectInfo;
  locationInfo?: LocationInfo;
  applyHome?: Record<string, unknown>;
  conditionHistory: ApartmentConditionHistoryItem[];
  priceInfo?: ApartmentPriceInfo;
  priceDetail: {
    salePrice: string;
    pricePerPyeong: string;
    contractPrice: string;
    middlePayment: string;
    balance: string;
    options: string[];
  };
  score: {
    total: number;
    price: number;
    contract: number;
    location: number;
    living: number;
    future: number;
    risk: number;
  };
  aiReview: {
    summary: string;
    liveScore: number;
    investScore: number;
    safetyScore: number;
    strengths: string[];
  };
  pros: string[];
  cons: string[];
};
