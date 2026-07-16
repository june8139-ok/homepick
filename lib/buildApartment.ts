import {
  calculateScore,
  type EvaluationInput,
} from "../data/scoring";

import type {
  BasicInfo,
  LocationInfo,
} from "../components/Admin/AdminContext";

function createSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "");
}

function createConditionText(
  evaluation: EvaluationInput
) {
  const conditions: string[] = [];

  if (
    evaluation.contractType ===
    "fixed-500"
  ) {
    conditions.push(
      "계약금 500만원"
    );
  }

  if (
    evaluation.contractType ===
    "fixed-1000"
  ) {
    conditions.push(
      "계약금 1,000만원"
    );
  }

  if (
    evaluation.contractType ===
    "ratio-5"
  ) {
    conditions.push("계약금 5%");
  }

  if (
    evaluation.contractType ===
    "ratio-10"
  ) {
    conditions.push("계약금 10%");
  }

  if (
    evaluation.middlePaymentType ===
    "free"
  ) {
    conditions.push(
      "중도금 무이자"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "partial-free"
  ) {
    conditions.push("일부 무이자");
  }

  if (
    evaluation.middlePaymentType ===
    "interest-deferred"
  ) {
    conditions.push("이자후불제");
  }

  if (
    evaluation.optionBenefitType ===
    "balcony-free"
  ) {
    conditions.push(
      "발코니 확장 무상"
    );
  }

  if (
    evaluation.optionBenefitType ===
    "balcony-and-options-free"
  ) {
    conditions.push("풀옵션 무상");
  }

  if (
    evaluation.cashBenefitType !==
    "none"
  ) {
    conditions.push("현금성 혜택");
  }

  if (
    evaluation.balanceSupport ===
    "yes"
  ) {
    conditions.push(
      "잔금/입주지원"
    );
  }

  return conditions.join(" · ");
}

function createKeywords(
  basicInfo: BasicInfo
) {
  return [
    basicInfo.name,
    `${basicInfo.cityName} 아파트`,
    `${basicInfo.cityName} 분양`,
    `${basicInfo.cityName} 신규분양`,
    `${basicInfo.brand} 분양`,
    basicInfo.region,
  ].filter(Boolean);
}

function createSummary(
  locationInfo: LocationInfo,
  condition: string
) {
  const information = [
    condition,
    locationInfo.transport,
    locationInfo.education,
    locationInfo.living,
    locationInfo.futureValue,
  ].filter(Boolean);

  if (information.length === 0) {
    return "분양가와 계약조건, 입지와 생활환경을 함께 비교해볼 수 있는 단지입니다.";
  }

  return information
    .slice(0, 2)
    .join(" ");
}

export function buildApartment(
  basicInfo: BasicInfo,
  evaluation: EvaluationInput,
  locationInfo: LocationInfo
) {
  const score =
    calculateScore(evaluation);

  const slug = createSlug(
    basicInfo.name ||
      "new-apartment"
  );

  const condition =
    createConditionText(
      evaluation
    );

  return {
    slug,

    city: createSlug(
      basicInfo.cityName ||
        "unknown"
    ),

    cityName:
      basicInfo.cityName,

    district: "",
    districtName: "",

    region:
      basicInfo.region,

    latitude:
      basicInfo.latitude,

    longitude:
      basicInfo.longitude,

    type:
      basicInfo.usage ||
      "아파트",

    brand:
      basicInfo.brand,

    builder:
      basicInfo.builder,

    name:
      basicInfo.name,

    images: {
      hero:
        "/images/apartments/default/main.jpg",

      location: [],
      floorPlans: [],
      community: [],

      gallery: [
        "/images/apartments/default/main.jpg",
      ],
    },

    keywords:
      createKeywords(
        basicInfo
      ),

    status: "등록예정",

    price:
      basicInfo.salePrice,

    condition,

    conditionHistory: [],

    priceDetail: {
      salePrice:
        basicInfo.salePrice,

      pricePerPyeong:
        basicInfo.pricePerPyeong,

      contractPrice: "",
      middlePayment: "",
      balance: "",
      options: [],
    },

    projectInfo: {
      totalHouseholds:
        basicInfo.totalHouseholds,

      saleHouseholds:
        basicInfo.saleHouseholds,

      parking:
        basicInfo.parking,

      scale:
        basicInfo.scale,

      usage:
        basicInfo.usage ||
        "아파트",

      moveInDate:
        basicInfo.moveInDate,

      developer:
        basicInfo.developer,
    },

    locationInfo,

    score,

    aiReview: {
      summary:
        createSummary(
          locationInfo,
          condition
        ),

      liveScore:
        Math.min(
          5,
          Math.max(
            1,
            Math.round(
              score.living / 3
            )
          )
        ),

      investScore:
        Math.min(
          5,
          Math.max(
            1,
            Math.round(
              score.future / 2
            )
          )
        ),

      safetyScore:
        Math.min(
          5,
          Math.max(
            1,
            Math.round(
              score.risk / 2
            )
          )
        ),

      strengths:
        [
          locationInfo.transport,
          locationInfo.education,
          locationInfo.living,
          locationInfo.futureValue,
        ]
          .filter(Boolean)
          .slice(0, 4),
    },

    pros: [
      locationInfo.transport,
      locationInfo.education,
      locationInfo.living,
      locationInfo.jobAccess,
      locationInfo.nature,
      locationInfo.futureValue,
    ].filter(Boolean),

    cons: [
      locationInfo.cautions,
    ].filter(Boolean),
  };
}