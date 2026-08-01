"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type {
  EvaluationInput,
} from "../../data/scoring";

import type {
  ApartmentPriceInfo,
  ListingStage,
  UnitPrice,
} from "../../types/apartment";

type Score = {
  total: number;
  price: number;
  contract: number;
  location: number;
  living: number;
  future: number;
  risk: number;
};

export type BasicInfo = {
  name: string;
  brand: string;
  builder: string;

  cityName: string;
  region: string;

  latitude: number | null;
  longitude: number | null;

  totalHouseholds: string;
  saleHouseholds: string;

  moveInDate: string;

  /*
   * 검색카드나 가격 데이터가 없는 단지에서
   * 대표 문구로 사용하는 가격입니다.
   */
  salePrice: string;

  /*
   * 숫자형 평균 평당가는 priceInfo에 저장하고,
   * 이 값은 기존 문자열 데이터 호환용입니다.
   */
  pricePerPyeong: string;

  parking: string;
  scale: string;
  usage: string;
  developer: string;
};

export type LocationInfo = {
  transport: string;
  education: string;
  living: string;
  jobAccess: string;
  nature: string;
  futureValue: string;
  cautions: string;
};

export type ApartmentImages = {
  hero: string[];
  location: string[];

  floorPlans: {
    name: string;
    url: string;
  }[];

  community: string[];
  gallery: string[];
};

type InitialApartment = {
  slug?: string;

  name?: string;
  brand?: string;
  builder?: string;

  cityName?: string;
  region?: string;

  latitude?: number | null;
  longitude?: number | null;

  status?: string;
  condition?: string;
  contractDetails?: string;
  jibnunSummary?: string;
  listingStage?: ListingStage;

  source?:
    | "manual"
    | "applyhome";

  isAutoCreated?: boolean;

  price?: string;

  /*
   * 청약홈 또는 관리자가 입력한
   * 구조화된 평형별 분양가입니다.
   */
  priceInfo?: ApartmentPriceInfo;

  priceDetail?: {
    salePrice?: string;
    pricePerPyeong?: string;
    contractPrice?: string;
    middlePayment?: string;
    balance?: string;
    options?: string[];
  };

  projectInfo?: {
    totalHouseholds?: string;
    saleHouseholds?: string;
    parking?: string;
    scale?: string;
    usage?: string;
    moveInDate?: string;
    developer?: string;
  };

  locationInfo?: Partial<LocationInfo>;

  score?: Score;

  aiReview?: {
    summary?: string;
  };

  /*
   * 앞으로 평가 선택값 자체를 DB에 저장하게 되면
   * 이 값을 가장 우선해서 복원합니다.
   * 기존 데이터는 priceDetail과 condition에서 추론합니다.
   */
  evaluation?: Partial<EvaluationInput>;

  images?: {
    hero?: string | string[];
    location?: string | string[];

    floorPlans?: {
      name: string;
      url: string;
    }[];

    community?: string | string[];
    gallery?: string | string[];
  };
};

type AdminContextType = {
  editingSlug?: string;

  listingStage: ListingStage;
  setListingStage: (
    listingStage: ListingStage
  ) => void;

  basicInfo: BasicInfo;
  setBasicInfo: (
    basicInfo: BasicInfo
  ) => void;

  /*
   * 평형별 가격 상태
   */
  priceInfo: ApartmentPriceInfo;
  setPriceInfo: (
    priceInfo: ApartmentPriceInfo
  ) => void;

  locationInfo: LocationInfo;
  setLocationInfo: (
    locationInfo: LocationInfo
  ) => void;

  images: ApartmentImages;
  setImages: (
    images: ApartmentImages
  ) => void;

  /*
   * 현재는 계약조건 입력값이 EvaluationInput에
   * 포함되어 있으므로 그대로 유지합니다.
   * 점수 구조는 이후 계약조건 타입 분리 때 제거합니다.
   */
  evaluation: EvaluationInput;

  updateEvaluation: (
    evaluation: EvaluationInput
  ) => void;

  setEvaluation: (
    evaluation: EvaluationInput
  ) => void;

  savedScore?: Score;

  contractDetails: string;
  setContractDetails: (value: string) => void;

  jibnunSummary: string;
  setJibnunSummary: (value: string) => void;

  isDirty: boolean;
  setIsDirty: (
    value: boolean
  ) => void;
};

const defaultListingStage: ListingStage =
  "subscription";

const defaultBasicInfo: BasicInfo = {
  name: "",
  brand: "",
  builder: "",

  cityName: "",
  region: "",

  latitude: null,
  longitude: null,

  totalHouseholds: "",
  saleHouseholds: "",

  moveInDate: "",

  salePrice: "",
  pricePerPyeong: "",

  parking: "",
  scale: "",
  usage: "아파트",
  developer: "",
};

const defaultPriceInfo: ApartmentPriceInfo = {
  minimumPrice: null,
  maximumPrice: null,
  averagePricePerPyeong: null,

  units: [],

  updatedAt: null,
  note: null,
};

const defaultLocationInfo: LocationInfo = {
  transport: "",
  education: "",
  living: "",
  jobAccess: "",
  nature: "",
  futureValue: "",
  cautions: "",
};

const defaultImages: ApartmentImages = {
  hero: [],
  location: [],
  floorPlans: [],
  community: [],
  gallery: [],
};

const defaultEvaluation: EvaluationInput = {
  priceLevel: "normal",

  contractType: "ratio-10",

  middlePaymentType:
    "interest-deferred",

  optionBenefitType:
    "paid",

  cashBenefitType:
    "none",

  balanceSupport:
    "no",

  schoolLevel:
    "unknown",

  transportLevel:
    "unknown",

  infraLevel:
    "unknown",

  jobLevel:
    "unknown",

  natureLevel:
    "unknown",

  roadLevel:
    "unknown",

  brandGrade: 2,
  communityGrade: 2,
  parkingGrade: 2,
  floorPlanGrade: 2,
  scaleGrade: 2,

  futureTransportGrade: 1,
  futureJobGrade: 1,
  developmentGrade: 1,
  scarcityGrade: 1,

  riskLevel:
    "normal",
};

function normalizeContractText(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, "");
}

function createInitialEvaluation(
  apartment?: InitialApartment
): EvaluationInput {
  /*
   * 신규 등록은 기존 기본값을 사용합니다.
   */
  if (!apartment) {
    return {
      ...defaultEvaluation,
    };
  }

  /*
   * 평가 선택값이 DB에 직접 저장돼 있다면
   * 그 값을 최우선으로 복원합니다.
   */
  if (apartment.evaluation) {
    return {
      ...defaultEvaluation,
      ...apartment.evaluation,
    };
  }

  const contractText =
    normalizeContractText(
      apartment.priceDetail
        ?.contractPrice
    );

  const middlePaymentText =
    normalizeContractText(
      apartment.priceDetail
        ?.middlePayment
    );

  const balanceText =
    normalizeContractText(
      apartment.priceDetail
        ?.balance
    );

  const optionText =
    normalizeContractText(
      [
        ...(apartment.priceDetail
          ?.options ?? []),
        apartment.condition,
      ]
        .filter(Boolean)
        .join(" ")
    );

  let contractType: EvaluationInput["contractType"] =
    defaultEvaluation.contractType;

  if (
    contractText.includes("500만원") ||
    contractText.includes("500만")
  ) {
    contractType = "fixed-500";
  } else if (
    contractText.includes("1000만원") ||
    contractText.includes("1000만") ||
    contractText.includes("천만원")
  ) {
    contractType = "fixed-1000";
  } else if (
    contractText.includes("5%")
  ) {
    contractType = "ratio-5";
  } else if (
    contractText.includes("10%")
  ) {
    contractType = "ratio-10";
  }

  let middlePaymentType: EvaluationInput["middlePaymentType"] =
    defaultEvaluation.middlePaymentType;

  if (
    middlePaymentText.includes("일부무이자")
  ) {
    middlePaymentType = "partial-free";
  } else if (
    middlePaymentText.includes("무이자")
  ) {
    middlePaymentType = "free";
  } else if (
    middlePaymentText.includes("자납")
  ) {
    middlePaymentType = "self";
  } else if (
    middlePaymentText.includes("이자후불")
  ) {
    middlePaymentType = "interest-deferred";
  }

  let optionBenefitType: EvaluationInput["optionBenefitType"] =
    defaultEvaluation.optionBenefitType;

  if (
    optionText.includes("풀옵션무상") ||
    optionText.includes("풀옵션무료")
  ) {
    optionBenefitType =
      "balcony-and-options-free";
  } else if (
    optionText.includes("발코니확장무상") ||
    optionText.includes("발코니무상") ||
    optionText.includes("발코니무료")
  ) {
    optionBenefitType =
      "balcony-free";
  } else if (
    optionText.includes("발코니확장유상") ||
    optionText.includes("발코니유상")
  ) {
    optionBenefitType = "paid";
  }

  let cashBenefitType: EvaluationInput["cashBenefitType"] =
    defaultEvaluation.cashBenefitType;

  if (
    optionText.includes("2000만원이상")
  ) {
    cashBenefitType = "over-2000";
  } else if (
    optionText.includes("1000만원이상")
  ) {
    cashBenefitType = "over-1000";
  } else if (
    optionText.includes("1000만원미만")
  ) {
    cashBenefitType = "small";
  } else if (
    optionText.includes("현금성혜택없음")
  ) {
    cashBenefitType = "none";
  }

  const balanceSupport: EvaluationInput["balanceSupport"] =
    balanceText.includes("유예") ||
    balanceText.includes("입주지원")
      ? "yes"
      : "no";

  return {
    ...defaultEvaluation,
    contractType,
    middlePaymentType,
    optionBenefitType,
    cashBenefitType,
    balanceSupport,
  };
}

const AdminContext =
  createContext<
    AdminContextType | null
  >(null);

function toArray(
  value?: string | string[]
) {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? [...value]
    : [value];
}

function cloneUnits(
  units?: UnitPrice[]
): UnitPrice[] {
  return (
    units?.map((unit) => ({
      ...unit,

      types:
        unit.types?.map(
          (type) => ({
            ...type,
          })
        ) ?? [],
    })) ?? []
  );
}

/*
 * 기존 데이터에는 listingStage가 없을 수 있으므로
 * 상태와 계약조건을 이용해 초기값을 추론합니다.
 */
function createInitialListingStage(
  apartment?: InitialApartment
): ListingStage {
  if (!apartment) {
    return defaultListingStage;
  }

  if (apartment.listingStage) {
    return apartment.listingStage;
  }

  const status =
    apartment.status
      ?.trim()
      .toLowerCase() ?? "";

  const condition =
    apartment.condition
      ?.trim()
      .toLowerCase() ?? "";

  const isFirstCome =
    status.includes("선착순") ||
    condition.includes("동호지정") ||
    condition.includes("잔여세대") ||
    condition.includes("회사보유분");

  if (isFirstCome) {
    return "firstCome";
  }

  const isCompleted =
    status.includes("분양완료") ||
    status.includes("공급완료") ||
    status.includes("노출종료") ||
    status.includes("노출 종료");

  if (isCompleted) {
    return "completed";
  }

  const isExisting =
    status.includes("기존 아파트") ||
    status.includes("입주완료");

  if (isExisting) {
    return "existing";
  }

  return "subscription";
}

function createInitialBasicInfo(
  apartment?: InitialApartment
): BasicInfo {
  if (!apartment) {
    return {
      ...defaultBasicInfo,
    };
  }

  return {
    name:
      apartment.name ?? "",

    brand:
      apartment.brand ?? "",

    builder:
      apartment.builder ?? "",

    cityName:
      apartment.cityName ?? "",

    region:
      apartment.region ?? "",

    latitude:
      apartment.latitude ?? null,

    longitude:
      apartment.longitude ?? null,

    totalHouseholds:
      apartment.projectInfo
        ?.totalHouseholds ?? "",

    saleHouseholds:
      apartment.projectInfo
        ?.saleHouseholds ?? "",

    moveInDate:
      apartment.projectInfo
        ?.moveInDate ?? "",

    salePrice:
      apartment.priceDetail
        ?.salePrice ||
      apartment.price ||
      "",

    pricePerPyeong:
      apartment.priceDetail
        ?.pricePerPyeong ?? "",

    parking:
      apartment.projectInfo
        ?.parking ?? "",

    scale:
      apartment.projectInfo
        ?.scale ?? "",

    usage:
      apartment.projectInfo
        ?.usage ?? "아파트",

    developer:
      apartment.projectInfo
        ?.developer ?? "",
  };
}

function createInitialPriceInfo(
  apartment?: InitialApartment
): ApartmentPriceInfo {
  const existing =
    apartment?.priceInfo;

  if (!existing) {
    return {
      ...defaultPriceInfo,
      units: [],
    };
  }

  return {
    minimumPrice:
      existing.minimumPrice ?? null,

    maximumPrice:
      existing.maximumPrice ?? null,

    averagePricePerPyeong:
      existing.averagePricePerPyeong ??
      null,

    units:
      cloneUnits(
        existing.units
      ),

    updatedAt:
      existing.updatedAt ?? null,

    note:
      existing.note ?? null,
  };
}

function createInitialLocationInfo(
  apartment?: InitialApartment
): LocationInfo {
  if (!apartment?.locationInfo) {
    return {
      ...defaultLocationInfo,
    };
  }

  return {
    transport:
      apartment.locationInfo
        .transport ?? "",

    education:
      apartment.locationInfo
        .education ?? "",

    living:
      apartment.locationInfo
        .living ?? "",

    jobAccess:
      apartment.locationInfo
        .jobAccess ?? "",

    nature:
      apartment.locationInfo
        .nature ?? "",

    futureValue:
      apartment.locationInfo
        .futureValue ?? "",

    cautions:
      apartment.locationInfo
        .cautions ?? "",
  };
}

function createInitialImages(
  apartment?: InitialApartment
): ApartmentImages {
  if (!apartment?.images) {
    return {
      ...defaultImages,

      floorPlans: [],
    };
  }

  return {
    hero:
      toArray(
        apartment.images.hero
      ),

    location:
      toArray(
        apartment.images.location
      ),

    floorPlans:
      apartment.images.floorPlans?.map(
        (item) => ({
          ...item,
        })
      ) ?? [],

    community:
      toArray(
        apartment.images.community
      ),

    gallery:
      toArray(
        apartment.images.gallery
      ),
  };
}

export function AdminProvider({
  children,
  initialApartment,
}: {
  children: ReactNode;
  initialApartment?: InitialApartment;
}) {
  const [
    listingStage,
    setListingStageState,
  ] = useState<ListingStage>(
    createInitialListingStage(
      initialApartment
    )
  );

  const [
    basicInfo,
    setBasicInfoState,
  ] = useState<BasicInfo>(
    createInitialBasicInfo(
      initialApartment
    )
  );

  const [
    priceInfo,
    setPriceInfoState,
  ] = useState<ApartmentPriceInfo>(
    createInitialPriceInfo(
      initialApartment
    )
  );

  const [
    locationInfo,
    setLocationInfoState,
  ] = useState<LocationInfo>(
    createInitialLocationInfo(
      initialApartment
    )
  );

  const [
    images,
    setImagesState,
  ] = useState<ApartmentImages>(
    createInitialImages(
      initialApartment
    )
  );

  const [
    evaluation,
    setEvaluationState,
  ] = useState<EvaluationInput>(
    createInitialEvaluation(
      initialApartment
    )
  );

  const [
    contractDetails,
    setContractDetailsState,
  ] = useState(
    initialApartment?.contractDetails ?? ""
  );

  const [
    jibnunSummary,
    setJibnunSummaryState,
  ] = useState(
    initialApartment?.jibnunSummary ??
      initialApartment?.aiReview?.summary ??
      ""
  );

  const [
    isDirty,
    setIsDirty,
  ] = useState(false);

  const setListingStage = (
    nextListingStage: ListingStage
  ) => {
    setListingStageState(
      nextListingStage
    );

    setIsDirty(true);
  };

  const setBasicInfo = (
    nextBasicInfo: BasicInfo
  ) => {
    setBasicInfoState(
      nextBasicInfo
    );

    setIsDirty(true);
  };

  const setPriceInfo = (
    nextPriceInfo: ApartmentPriceInfo
  ) => {
    setPriceInfoState({
      ...nextPriceInfo,

      units:
        cloneUnits(
          nextPriceInfo.units
        ),
    });

    setIsDirty(true);
  };

  const setLocationInfo = (
    nextLocationInfo: LocationInfo
  ) => {
    setLocationInfoState(
      nextLocationInfo
    );

    setIsDirty(true);
  };

  const setImages = (
    nextImages: ApartmentImages
  ) => {
    setImagesState(
      nextImages
    );

    setIsDirty(true);
  };

  const updateEvaluation = (
    nextEvaluation: EvaluationInput
  ) => {
    setEvaluationState(
      nextEvaluation
    );

    setIsDirty(true);
  };

  const setContractDetails = (
    value: string
  ) => {
    setContractDetailsState(value);
    setIsDirty(true);
  };

  const setJibnunSummary = (
    value: string
  ) => {
    setJibnunSummaryState(value);
    setIsDirty(true);
  };

  return (
    <AdminContext.Provider
      value={{
        editingSlug:
          initialApartment?.slug,

        listingStage,
        setListingStage,

        basicInfo,
        setBasicInfo,

        priceInfo,
        setPriceInfo,

        locationInfo,
        setLocationInfo,

        images,
        setImages,

        evaluation,

        updateEvaluation,

        setEvaluation:
          updateEvaluation,

        savedScore:
          initialApartment?.score,

        contractDetails,
        setContractDetails,

        jibnunSummary,
        setJibnunSummary,

        isDirty,
        setIsDirty,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context =
    useContext(
      AdminContext
    );

  if (!context) {
    throw new Error(
      "useAdmin은 AdminProvider 안에서만 사용할 수 있습니다."
    );
  }

  return context;
}
