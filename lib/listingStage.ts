import type {
  Apartment,
  ListingStage,
} from "../types/apartment";

const subscriptionStatuses = [
  "청약예정",
  "특별공급",
  "1순위",
  "2순위",
  "청약중",
  "당첨자발표",
  "계약중",
  "청약마감",
] as const;

function hasSavedListingStage(
  value: unknown
): value is ListingStage {
  return (
    value === "subscription" ||
    value === "firstCome" ||
    value === "soldOut" ||
    value === "completed" ||
    value === "existing"
  );
}

function normalize(
  value?: string | null
) {
  return (
    value
      ?.trim()
      .toLowerCase() ?? ""
  );
}

/**
 * 단지의 최종 노출 단계를 반환합니다.
 *
 * 판정 우선순위
 * 1. 관리자가 저장한 listingStage
 * 2. 기존 상태값 자동 판정
 * 3. 계약조건 텍스트 자동 판정
 * 4. 청약홈 자동 생성 여부
 * 5. 기존 아파트
 *
 * soldOut과 completed는 의미가 다릅니다.
 * - soldOut: 100% 분양완료, 상세정보/검색/SEO 유지
 * - completed: 노출 종료, 공개 목록 제외
 */
export function getListingStage(
  apartment: Apartment
): ListingStage {
  if (
    hasSavedListingStage(
      apartment.listingStage
    )
  ) {
    return apartment.listingStage;
  }

  const status = normalize(
    apartment.status
  );

  const condition = normalize(
    apartment.condition
  );

  /*
   * 분양완료는 공개 아카이브로 유지합니다.
   * 기존에 listingStage가 completed로 저장된 단지는
   * 위의 저장값 우선 규칙에 따라 그대로 completed가 유지됩니다.
   */
  if (
    status.includes(
      "100% 분양완료"
    ) ||
    status.includes(
      "100%분양완료"
    ) ||
    status.includes(
      "분양완료"
    ) ||
    status.includes(
      "마감완료"
    )
  ) {
    return "soldOut";
  }

  /*
   * 노출 종료는 실제 게시 중단 용도입니다.
   */
  if (
    status.includes(
      "노출 종료"
    ) ||
    status.includes(
      "노출종료"
    ) ||
    status.includes(
      "게시 종료"
    ) ||
    status.includes(
      "게시종료"
    )
  ) {
    return "completed";
  }

  if (
    status.includes("선착순") ||
    status.includes("분양중") ||
    condition.includes(
      "동호지정"
    ) ||
    condition.includes(
      "잔여세대"
    ) ||
    condition.includes(
      "회사보유분"
    )
  ) {
    return "firstCome";
  }

  if (
    apartment.source ===
      "applyhome" ||
    apartment.isAutoCreated ===
      true ||
    subscriptionStatuses.includes(
      apartment.status as
        (typeof subscriptionStatuses)[number]
    )
  ) {
    return "subscription";
  }

  return "existing";
}

export function isSubscriptionListing(
  apartment: Apartment
) {
  return (
    getListingStage(apartment) ===
    "subscription"
  );
}

export function isFirstComeListing(
  apartment: Apartment
) {
  return (
    getListingStage(apartment) ===
    "firstCome"
  );
}

export function isSoldOutListing(
  apartment: Apartment
) {
  return (
    getListingStage(apartment) ===
    "soldOut"
  );
}

export function isCompletedListing(
  apartment: Apartment
) {
  return (
    getListingStage(apartment) ===
    "completed"
  );
}

export function isExistingListing(
  apartment: Apartment
) {
  return (
    getListingStage(apartment) ===
    "existing"
  );
}

/**
 * 공개 가능한 단지인지 확인합니다.
 *
 * soldOut은 공개 상태입니다.
 * completed만 공개 목록에서 제외합니다.
 */
export function isPublicListing(
  apartment: Apartment
) {
  return !isCompletedListing(
    apartment
  );
}

export function getListingStageLabel(
  stage: ListingStage
) {
  switch (stage) {
    case "subscription":
      return "청약";

    case "firstCome":
      return "선착순";

    case "soldOut":
      return "100% 분양완료";

    case "completed":
      return "노출 종료";

    case "existing":
      return "기존 아파트";
  }
}

export function getApartmentStageLabel(
  apartment: Apartment
) {
  return getListingStageLabel(
    getListingStage(apartment)
  );
}
