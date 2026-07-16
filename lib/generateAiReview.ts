import type { Apartment } from "../types/apartment";

export function generateAiReview(apartment: Apartment) {
  const strengths: string[] = [];
  const warnings: string[] = [];

  // 계약조건
  if (apartment.score.contract >= 18) {
    strengths.push("계약조건이 우수합니다.");
  } else {
    warnings.push("계약조건은 평균 수준입니다.");
  }

  // 가격
  if (apartment.score.price >= 22) {
    strengths.push("가격 경쟁력이 높습니다.");
  }

  // 입지
  if (apartment.score.location >= 17) {
    strengths.push("교통 및 입지가 우수합니다.");
  }

  // 실거주
  if (apartment.score.living >= 13) {
    strengths.push("실거주 만족도가 높습니다.");
  }

  // 미래가치
  if (apartment.score.future >= 8) {
    strengths.push("향후 개발 호재가 기대됩니다.");
  }

  // 리스크
  if (apartment.score.risk <= 5) {
    warnings.push("분양가 및 시장 상황을 확인하세요.");
  }

  const summary =
    apartment.score.total >= 90
      ? "전국 최상위 수준의 추천 단지입니다."
      : apartment.score.total >= 85
      ? "실거주와 투자 모두 추천되는 우수 단지입니다."
      : apartment.score.total >= 80
      ? "실거주 중심으로 추천할 만한 단지입니다."
      : "조건을 충분히 비교한 후 선택을 추천합니다.";

  return {
    summary,
    strengths,
    warnings,
  };
}