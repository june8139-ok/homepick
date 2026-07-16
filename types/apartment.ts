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

  latitude?: number | null;
  longitude?: number | null;

  images: {
    hero: string | null;
    location: string[];
    floorPlans: {
      name: string;
      url: string;
    }[];
    community: string[];
    gallery: string[];
  };

  keywords: string[];

  status: string;
  price: string;
  condition: string;

  source?: "manual" | "applyhome";

  applyHomeId?: string | null;
  applyHomeUrl?: string | null;

  isAutoCreated?: boolean;
  manualOverride?: boolean;
  syncStatus?: string;
  lastSyncedAt?: string | null;

  totalSupply?: number | null;

  subscription?: SubscriptionSchedule;
  projectInfo?: ProjectInfo;
  locationInfo?: LocationInfo;

  applyHome?: Record<string, unknown>;

  conditionHistory: {
    date: string;
    title: string;
    description: string;
  }[];

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