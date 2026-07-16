import { calculateScore, type EvaluationInput } from "./scoring";

export type AiScore = {
  total: number;
  price: number;
  contract: number;
  location: number;
  living: number;
  future: number;
  risk: number;
};

export type PriceDetail = {
  salePrice: string;
  pricePerPyeong: string;
  contractPrice: string;
  middlePayment: string;
  balance: string;
  options: string[];
};

export type AiReview = {
  summary: string;
  liveScore: number;
  investScore: number;
  safetyScore: number;
  strengths: string[];
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
  images: {
    hero: string;
    gallery: string[];
  };
  keywords: string[];
  status: string;
  price: string;
  condition: string;
  priceDetail: PriceDetail;
  evaluation: EvaluationInput;
  score: AiScore;
  aiReview: AiReview;
  pros: string[];
  cons: string[];
};

const defaultImages = {
  hero: "/images/apartments/cheongju-prugio-cielite/main.jpg",
  gallery: ["/images/apartments/cheongju-prugio-cielite/main.jpg"],
};

const cheongjuPrugioEvaluation: EvaluationInput = {
  priceLevel: "good",
  contractType: "fixed-500",
  middlePaymentType: "free",
  optionBenefitType: "paid",
  cashBenefitType: "none",
  balanceSupport: "no",

  schoolLevel: "elementary-walk-middle-high-near",
  transportLevel: "ic-good",
  infraLevel: "good",
  jobLevel: "good",
  natureLevel: "normal",
  roadLevel: "good",

  brandGrade: 3,
  communityGrade: 3,
  parkingGrade: 3,
  floorPlanGrade: 3,
  scaleGrade: 2,

  futureTransportGrade: 2,
  futureJobGrade: 2,
  developmentGrade: 2,
  scarcityGrade: 2,

  riskLevel: "normal",
};

const hanyangLipsEvaluation: EvaluationInput = {
  priceLevel: "normal",
  contractType: "unknown",
  middlePaymentType: "unknown",
  optionBenefitType: "balcony-free",
  cashBenefitType: "none",
  balanceSupport: "no",

  schoolLevel: "elementary-walk",
  transportLevel: "car-only",
  infraLevel: "normal",
  jobLevel: "good",
  natureLevel: "normal",
  roadLevel: "good",

  brandGrade: 2,
  communityGrade: 2,
  parkingGrade: 3,
  floorPlanGrade: 3,
  scaleGrade: 3,

  futureTransportGrade: 2,
  futureJobGrade: 3,
  developmentGrade: 2,
  scarcityGrade: 2,

  riskLevel: "normal",
};

const hillstateEvaluation: EvaluationInput = {
  priceLevel: "unknown",
  contractType: "unknown",
  middlePaymentType: "unknown",
  optionBenefitType: "unknown",
  cashBenefitType: "unknown",
  balanceSupport: "unknown",

  schoolLevel: "unknown",
  transportLevel: "unknown",
  infraLevel: "normal",
  jobLevel: "unknown",
  natureLevel: "normal",
  roadLevel: "unknown",

  brandGrade: 3,
  communityGrade: 2,
  parkingGrade: 2,
  floorPlanGrade: 3,
  scaleGrade: 3,

  futureTransportGrade: 2,
  futureJobGrade: 2,
  developmentGrade: 2,
  scarcityGrade: 2,

  riskLevel: "unknown",
};

export const apartments: Apartment[] = [
  {
    slug: "cheongju-prugio-cielite",
    city: "cheongju",
    cityName: "청주",
    district: "bunpyeong",
    districtName: "분평동",
    region: "충청북도 청주시 분평동",
    type: "아파트",
    brand: "푸르지오",
    builder: "대우건설",
    name: "청주 푸르지오 씨엘리체",

    images: {
      hero: "/images/apartments/cheongju-prugio-cielite/main.jpg",
      gallery: [
        "/images/apartments/cheongju-prugio-cielite/main.jpg",
        "/images/apartments/cheongju-prugio-cielite/main.jpg",
        "/images/apartments/cheongju-prugio-cielite/main.jpg",
        "/images/apartments/cheongju-prugio-cielite/main.jpg",
      ],
    },

    keywords: [
      "청주 푸르지오",
      "청주 푸르지오 씨엘리체",
      "청주 분평동 푸르지오",
      "분평동 푸르지오",
      "푸르지오 씨엘리체",
      "씨엘리체",
      "청주 아파트",
      "청주 신규분양",
      "청주 선착순",
      "청주 계약금 500만원",
      "청주 중도금 무이자",
      "대우건설 아파트",
      "푸르지오 분양",
    ],

    status: "선착순",
    price: "84㎡ 7억대",
    condition: "계약금 500만원 · 중도금 무이자",

    priceDetail: {
      salePrice: "84㎡ 7억대",
      pricePerPyeong: "평당 약 2,050만원",
      contractPrice: "계약금 500만원",
      middlePayment: "중도금 무이자",
      balance: "잔금 일반 납부",
      options: ["일부 세대 특별조건", "실제 잔여호실 확인 필요"],
    },

    evaluation: cheongjuPrugioEvaluation,
    score: calculateScore(cheongjuPrugioEvaluation),

    aiReview: {
      summary:
        "청주 지역에서 초기 자금 부담이 낮고 실거주 만족도가 높은 추천 단지입니다.",
      liveScore: 5,
      investScore: 4,
      safetyScore: 4,
      strengths: [
        "계약조건 우수",
        "초기 자금 부담 낮음",
        "실거주 추천",
        "브랜드 선호도 높음",
      ],
    },

    pros: ["계약조건 우수", "청주 인기 단지", "브랜드 선호도 높음"],
    cons: ["일부 세대 한정 조건", "실제 잔여 호실 확인 필요"],
  },

  {
    slug: "cheongju-hanyang-lips-belluce",
    city: "cheongju",
    cityName: "청주",
    district: "jibuk",
    districtName: "지북동",
    region: "충청북도 청주시 지북동",
    type: "아파트",
    brand: "한양립스",
    builder: "한양산업개발",
    name: "청주 한양립스 더 벨루체",
    images: defaultImages,

    keywords: [
      "청주 한양립스",
      "청주 한양립스 더 벨루체",
      "청주 지북동 한양립스",
      "지북동 한양립스",
      "청주 아파트",
      "청주 신규분양",
      "청주 선착순",
      "발코니 확장 무상",
    ],

    status: "분양중",
    price: "84㎡",
    condition: "발코니 확장 무상 · 계약조건 혜택",

    priceDetail: {
      salePrice: "84㎡",
      pricePerPyeong: "분양가 확인 필요",
      contractPrice: "계약조건 혜택",
      middlePayment: "조건 확인",
      balance: "잔금 일반 납부",
      options: ["발코니 확장 무상", "일부 세대 혜택"],
    },

    evaluation: hanyangLipsEvaluation,
    score: calculateScore(hanyangLipsEvaluation),

    aiReview: {
      summary:
        "발코니 확장 무상 등 계약 혜택이 장점인 실거주 중심 단지입니다.",
      liveScore: 4,
      investScore: 4,
      safetyScore: 4,
      strengths: ["발코니 확장 무상", "실거주 추천", "미래 개발 수혜"],
    },

    pros: ["발코니 확장 무상", "청주 개발 흐름 수혜", "실거주 접근성"],
    cons: ["세부 분양가 확인 필요", "잔여 호실 확인 필요"],
  },

  {
    slug: "cheongju-hillstate",
    city: "cheongju",
    cityName: "청주",
    district: "cheongju",
    districtName: "청주",
    region: "충청북도 청주시",
    type: "아파트",
    brand: "힐스테이트",
    builder: "현대건설",
    name: "청주 힐스테이트",
    images: defaultImages,

    keywords: [
      "청주 힐스테이트",
      "청주 아파트",
      "청주 신규분양",
      "청주 브랜드 아파트",
      "힐스테이트 분양",
    ],

    status: "관심단지",
    price: "분양가 확인 필요",
    condition: "청주 인기 검색 단지",

    priceDetail: {
      salePrice: "분양가 확인 필요",
      pricePerPyeong: "확인 필요",
      contractPrice: "확인 필요",
      middlePayment: "확인 필요",
      balance: "확인 필요",
      options: ["브랜드 프리미엄"],
    },

    evaluation: hillstateEvaluation,
    score: calculateScore(hillstateEvaluation),

    aiReview: {
      summary:
        "브랜드 가치가 높아 관심이 많은 단지이며 세부 분양조건 확인이 필요합니다.",
      liveScore: 4,
      investScore: 4,
      safetyScore: 3,
      strengths: ["브랜드 프리미엄", "관심도 높음", "실거주 수요 기대"],
    },

    pros: ["브랜드 인지도", "청주 관심 단지", "실거주 수요 기대"],
    cons: ["정확한 계약조건 확인 필요", "분양가 확인 필요"],
  },
];