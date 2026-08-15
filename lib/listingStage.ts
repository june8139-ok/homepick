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

function normalize(value?: string | null) {
  return value
    ?.trim()
    .toLowerCase() ?? "";
}

/**
 * 단지의 최종 노출 단계를 반환합니다.
 *
 * 판정 우선순위
 * 1. 관리자가 저장한 listingStage
 * 2. 명시적인 분양완료/노출종료 상태
 * 3. 기존 ApplyHome 및 상태값 자동 판정
 * 4. 계약조건 텍스트 자동 판정
 * 5. 기존 아파트
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
   * 실제 분양이 끝난 단지는 검색 자산을 유지하기 위해
   * soldOut으로 분리합니다. 상세페이지는 계속 공개됩니다.
   */
  if (
    status.includes("100% 분양완료") ||
    status.includes("분양완료") ||
    status.includes("공급완료") ||
    status.includes("마감완료")
  ) {
    return "soldOut";
  }

  /*
   * completed는 잘못된 등록, 중복, 게시 중단처럼
   * 실제로 검색 노출을 종료해야 하는 경우에만 사용합니다.
   */
  if (
    status.includes("노출종료") ||
    status.includes("노출 종료") ||
    status.includes("게시종료") ||
    status.includes("게시 종료")
  ) {
    return "completed";
  }

  if (
    status.includes("선착순") ||
    status.includes("분양중") ||
    condition.includes("동호지정") ||
    condition.includes("잔여세대") ||
    condition.includes("회사보유분")
  ) {
    return "firstCome";
  }

  if (
    apartment.source === "applyhome" ||
    apartment.isAutoCreated === true ||
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

export function isPublicListing(
  apartment: Apartment
) {
  return !isCompletedListing(apartment);
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
