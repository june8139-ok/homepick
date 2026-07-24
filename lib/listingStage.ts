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
   * 2. 기존 ApplyHome 및 상태값 자동 판정
   * 3. 계약조건 텍스트 자동 판정
   * 4. 기존 아파트
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
  
    if (
      status.includes("종료") ||
      status.includes("분양완료") ||
      status.includes("마감완료")
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