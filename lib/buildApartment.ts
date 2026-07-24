import {
  calculateScore,
  type EvaluationInput,
} from "../data/scoring";

import type {
  ApartmentPriceInfo,
  UnitPrice,
} from "../types/apartment";

import type {
  BasicInfo,
  LocationInfo,
} from "../components/Admin/AdminContext";

function createSlug(
  text: string
) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "");
}

function isValidPrice(
  value?: number | null
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function formatPrice(
  value?: number | null
) {
  if (!isValidPrice(value)) {
    return "";
  }

  const rounded =
    Math.round(value);

  const eok =
    Math.floor(
      rounded / 10000
    );

  const manwon =
    rounded % 10000;

  if (eok === 0) {
    return `${rounded.toLocaleString()}만원`;
  }

  if (manwon === 0) {
    return `${eok}억원`;
  }

  return `${eok}억 ${manwon.toLocaleString()}만원`;
}

function collectPriceValues(
  units: UnitPrice[]
) {
  const minimumValues: number[] =
    [];

  const maximumValues: number[] =
    [];

  units.forEach((unit) => {
    if (
      isValidPrice(
        unit.minPrice
      )
    ) {
      minimumValues.push(
        unit.minPrice
      );
    }

    if (
      isValidPrice(
        unit.maxPrice
      )
    ) {
      maximumValues.push(
        unit.maxPrice
      );
    }

    unit.types?.forEach(
      (type) => {
        if (
          isValidPrice(
            type.minPrice
          )
        ) {
          minimumValues.push(
            type.minPrice
          );
        }

        if (
          isValidPrice(
            type.maxPrice
          )
        ) {
          maximumValues.push(
            type.maxPrice
          );
        }
      }
    );
  });

  return {
    minimum:
      minimumValues.length > 0
        ? Math.min(
            ...minimumValues
          )
        : null,

    maximum:
      maximumValues.length > 0
        ? Math.max(
            ...maximumValues
          )
        : null,
  };
}

function normalizePriceInfo(
  priceInfo: ApartmentPriceInfo
): ApartmentPriceInfo {
  const units =
    (priceInfo.units ?? [])
      .map((unit) => ({
        ...unit,

        area:
          unit.area.trim(),

        minPrice:
          isValidPrice(
            unit.minPrice
          )
            ? unit.minPrice
            : null,

        maxPrice:
          isValidPrice(
            unit.maxPrice
          )
            ? unit.maxPrice
            : null,

        households:
          typeof unit.households ===
              "number" &&
            Number.isFinite(
              unit.households
            ) &&
            unit.households >= 0
              ? Math.round(
                  unit.households
                )
              : null,

        source:
          unit.source ??
          "manual",

        types:
          (unit.types ?? [])
            .map((type) => ({
              ...type,

              typeName:
                type.typeName.trim(),

              minPrice:
                isValidPrice(
                  type.minPrice
                )
                  ? type.minPrice
                  : null,

              maxPrice:
                isValidPrice(
                  type.maxPrice
                )
                  ? type.maxPrice
                  : null,

              households:
                typeof type.households ===
                    "number" &&
                  Number.isFinite(
                    type.households
                  ) &&
                  type.households >= 0
                    ? Math.round(
                        type.households
                      )
                    : null,
            }))
            .filter(
              (type) =>
                Boolean(
                  type.typeName
                )
            ),
      }))
      .filter(
        (unit) =>
          Boolean(unit.area)
      );

  const calculated =
    collectPriceValues(
      units
    );

  const minimumPrice =
    calculated.minimum ??
    (isValidPrice(
      priceInfo.minimumPrice
    )
      ? priceInfo.minimumPrice
      : null);

  const maximumPrice =
    calculated.maximum ??
    (isValidPrice(
      priceInfo.maximumPrice
    )
      ? priceInfo.maximumPrice
      : null);

  return {
    minimumPrice,

    maximumPrice,

    averagePricePerPyeong:
      isValidPrice(
        priceInfo.averagePricePerPyeong
      )
        ? priceInfo.averagePricePerPyeong
        : null,

    units,

    updatedAt:
      units.length > 0 ||
      isValidPrice(
        minimumPrice
      ) ||
      isValidPrice(
        maximumPrice
      )
        ? new Date().toISOString()
        : priceInfo.updatedAt ??
          null,

    note:
      priceInfo.note?.trim() ||
      null,
  };
}

function createRepresentativePrice(
  basicInfo: BasicInfo,
  priceInfo: ApartmentPriceInfo
) {
  if (
    basicInfo.salePrice.trim()
  ) {
    return basicInfo.salePrice.trim();
  }

  const minimum =
    priceInfo.minimumPrice;

  const maximum =
    priceInfo.maximumPrice;

  if (
    isValidPrice(minimum) &&
    isValidPrice(maximum)
  ) {
    if (
      minimum === maximum
    ) {
      return formatPrice(
        minimum
      );
    }

    return `${formatPrice(
      minimum
    )} ~ ${formatPrice(
      maximum
    )}`;
  }

  if (
    isValidPrice(minimum)
  ) {
    return `${formatPrice(
      minimum
    )}부터`;
  }

  if (
    isValidPrice(maximum)
  ) {
    return `최고 ${formatPrice(
      maximum
    )}`;
  }

  return "";
}

function createPricePerPyeongText(
  basicInfo: BasicInfo,
  priceInfo: ApartmentPriceInfo
) {
  if (
    basicInfo.pricePerPyeong.trim()
  ) {
    return basicInfo
      .pricePerPyeong
      .trim();
  }

  if (
    !isValidPrice(
      priceInfo.averagePricePerPyeong
    )
  ) {
    return "";
  }

  return `평당 약 ${Math.round(
    priceInfo.averagePricePerPyeong
  ).toLocaleString()}만원`;
}

function createConditionText(
  evaluation: EvaluationInput
) {
  const conditions: string[] =
    [];

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
    conditions.push(
      "계약금 5%"
    );
  }

  if (
    evaluation.contractType ===
    "ratio-10"
  ) {
    conditions.push(
      "계약금 10%"
    );
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
    conditions.push(
      "일부 무이자"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "interest-deferred"
  ) {
    conditions.push(
      "이자후불제"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "self"
  ) {
    conditions.push(
      "중도금 자납"
    );
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
    conditions.push(
      "풀옵션 무상"
    );
  }

  if (
    evaluation.optionBenefitType ===
    "paid"
  ) {
    conditions.push(
      "발코니 확장 유상"
    );
  }

  if (
    evaluation.cashBenefitType ===
    "small"
  ) {
    conditions.push(
      "현금성 혜택"
    );
  }

  if (
    evaluation.cashBenefitType ===
    "over-1000"
  ) {
    conditions.push(
      "1,000만원 이상 혜택"
    );
  }

  if (
    evaluation.cashBenefitType ===
    "over-2000"
  ) {
    conditions.push(
      "2,000만원 이상 혜택"
    );
  }

  if (
    evaluation.balanceSupport ===
    "yes"
  ) {
    conditions.push(
      "잔금유예 / 입주지원"
    );
  }

  return conditions.join(
    " · "
  );
}

function createKeywords(
  basicInfo: BasicInfo
) {
  return [
    basicInfo.name,

    basicInfo.cityName
      ? `${basicInfo.cityName} 아파트`
      : "",

    basicInfo.cityName
      ? `${basicInfo.cityName} 분양`
      : "",

    basicInfo.cityName
      ? `${basicInfo.cityName} 신규분양`
      : "",

    basicInfo.brand
      ? `${basicInfo.brand} 분양`
      : "",

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

  if (
    information.length === 0
  ) {
    return "분양가와 계약조건, 입지와 생활환경을 함께 비교해볼 수 있는 단지입니다.";
  }

  return information
    .slice(0, 2)
    .join(" ");
}

export function buildApartment(
  basicInfo: BasicInfo,
  evaluation: EvaluationInput,
  locationInfo: LocationInfo,
  priceInfo: ApartmentPriceInfo
) {
  /*
   * 기존 타입과 상세페이지 호환을 위해
   * score 데이터는 당분간 유지합니다.
   * 관리자 화면에는 노출하지 않습니다.
   */
  const score =
    calculateScore(
      evaluation
    );

  const normalizedPriceInfo =
    normalizePriceInfo(
      priceInfo
    );

  const representativePrice =
    createRepresentativePrice(
      basicInfo,
      normalizedPriceInfo
    );

  const pricePerPyeongText =
    createPricePerPyeongText(
      basicInfo,
      normalizedPriceInfo
    );

  const slug =
    createSlug(
      basicInfo.name ||
        "new-apartment"
    );

  const condition =
    createConditionText(
      evaluation
    );

  return {
    slug,

    city:
      createSlug(
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

    status: "",

    price:
      representativePrice,

    priceInfo:
      normalizedPriceInfo,

    condition,

    conditionHistory: [],

    priceDetail: {
      salePrice:
        representativePrice,

      pricePerPyeong:
        pricePerPyeongText,

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

    /*
     * 이전 데이터 구조 호환용입니다.
     * 관리자 AI 점수 UI에서는 사용하지 않습니다.
     */
    score,

    aiReview: {
      summary:
        createSummary(
          locationInfo,
          condition
        ),

      liveScore: 0,
      investScore: 0,
      safetyScore: 0,

      strengths: [],
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