import type { Apartment } from "./apartments";

export function getBadges(apartment: Apartment, allApartments: Apartment[] = []) {
  const badges: string[] = [];
  const score = apartment.score;

  const sameCityApartments = allApartments
    .filter((apt) => apt.city === apartment.city)
    .sort((a, b) => b.score.total - a.score.total);

  const cityRank =
    sameCityApartments.findIndex((apt) => apt.slug === apartment.slug) + 1;

  if (score.total >= 90) {
    badges.push("🏆 최상위 추천");
  } else if (score.total >= 85) {
    badges.push("🏆 AI 추천");
  } else if (score.total >= 80) {
    badges.push("👍 관심 추천");
  }

  if (cityRank > 0 && cityRank <= 3) {
    badges.push(`🥇 ${apartment.cityName} TOP ${cityRank}`);
  }

  if (score.contract >= 18) {
    badges.push("💰 계약조건 우수");
  } else if (score.contract >= 14) {
    badges.push("💵 조건 양호");
  }

  if (score.price >= 22) {
    badges.push("💎 가격 메리트");
  } else if (score.price >= 18) {
    badges.push("📊 가격 보통 이상");
  }

  if (score.location >= 17) {
    badges.push("🚉 입지 우수");
  }

  if (score.living >= 13) {
    badges.push("🏡 실거주 추천");
  }

  if (score.future >= 8) {
    badges.push("📈 미래가치 기대");
  }

  if (score.risk >= 8) {
    badges.push("🛡 안정성 양호");
  }
/*
  if (apartment.evaluation.contractType === "fixed-500") {
    badges.push("🔥 계약금 500만원");
  } else if (apartment.evaluation.contractType === "fixed-1000") {
    badges.push("🔥 계약금 1,000만원");
  }

  if (apartment.evaluation.middlePaymentType === "free") {
    badges.push("💸 중도금 무이자");
  }

  if (
    apartment.evaluation.optionBenefitType === "balcony-free" ||
    apartment.evaluation.optionBenefitType === "balcony-and-options-free"
  ) {
    badges.push("🎁 발코니 무상");
  }

  if (
    apartment.evaluation.cashBenefitType === "over-1000" ||
    apartment.evaluation.cashBenefitType === "over-2000"
  ) {
    badges.push("🎉 지원금 혜택");
  }
*/
  if (apartment.status.includes("선착순")) {
    badges.push("🔥 선착순");
  }

  return Array.from(new Set(badges)).slice(0, 6);
}