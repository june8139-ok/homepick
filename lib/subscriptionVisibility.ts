import type { Apartment } from "../types/apartment";

import {
  isCompletedListing,
  isFirstComeListing,
  isPublicListing,
  isSubscriptionListing,
} from "./listingStage";

export const subscriptionStatuses = [
  "청약예정",
  "특별공급",
  "1순위",
  "2순위",
  "청약중",
  "당첨자발표",
  "계약중",
  "청약마감",
] as const;

const ONE_DAY_MS =
  24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

/**
 * 기존 파일을 사용하는 홈·검색 코드와의
 * 호환성을 유지하는 함수입니다.
 *
 * 실제 판정은 listingStage.ts에서 처리합니다.
 */
export function isSubscriptionApartment(
  apartment: Apartment
) {
  return isSubscriptionListing(apartment);
}

/**
 * 기존 홈·검색 코드가 사용하는 함수입니다.
 *
 * 관리자가 listingStage를 firstCome으로 저장하면
 * 선착순 단지로 판정됩니다.
 */
export function isFirstComeApartment(
  apartment: Apartment
) {
  return isFirstComeListing(apartment);
}

export function parseSubscriptionDate(
  value?: string | null
) {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value
    .trim()
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .replace(/\s+/g, "");

  /*
   * 20260715
   */
  const compactMatch =
    normalized.match(
      /^(\d{4})(\d{2})(\d{2})$/
    );

  if (compactMatch) {
    const [, year, month, day] =
      compactMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : startOfDay(date);
  }

  /*
   * 2026-07-15
   */
  const fullDateMatch =
    normalized.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    );

  if (fullDateMatch) {
    const [, year, month, day] =
      fullDateMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : startOfDay(date);
  }

  /*
   * 2026-07
   */
  const monthMatch =
    normalized.match(
      /^(\d{4})-(\d{1,2})$/
    );

  if (monthMatch) {
    const [, year, month] =
      monthMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : startOfDay(date);
  }

  const parsed = new Date(normalized);

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : startOfDay(parsed);
}

/**
 * 청약 단계 단지가 홈의 청약 영역에
 * 노출 가능한지를 확인합니다.
 *
 * listingStage가 firstCome이면 이 함수는
 * false가 되어 청약 영역에서 빠지고,
 * 선착순 영역으로 이동합니다.
 */
export function isVisibleHomeSubscription(
  apartment: Apartment,
  referenceDate = new Date()
) {
  if (
    !isSubscriptionListing(apartment)
  ) {
    return false;
  }

  if (
    isCompletedListing(apartment)
  ) {
    return false;
  }

  const schedule =
    apartment.subscription;

  const today = startOfDay(
    referenceDate
  ).getTime();

  const contractEndDate =
    parseSubscriptionDate(
      schedule?.contractEndDate
    );

  const winnerDate =
    parseSubscriptionDate(
      schedule?.winnerDate
    );

  /*
   * 계약 종료일이 지난 청약 단지는
   * 홈의 청약 영역에서 제외합니다.
   *
   * 관리자가 선착순으로 전환하면
   * listingStage가 우선되어 선착순 영역에 표시됩니다.
   */
  if (
    contractEndDate &&
    today >
      startOfDay(
        contractEndDate
      ).getTime()
  ) {
    return false;
  }

  /*
   * 당첨자 발표일로부터 15일이 지나면
   * 청약 영역에서는 제외합니다.
   */
  if (winnerDate) {
    const visibleUntil =
      startOfDay(
        winnerDate
      ).getTime() +
      15 * ONE_DAY_MS;

    if (today > visibleUntil) {
      return false;
    }
  }

  return true;
}

/**
 * 홈과 검색에 표시할 공개 단지 목록입니다.
 *
 * - 노출 종료: 제외
 * - 청약: 일정 유효 여부 확인
 * - 선착순: 공개 목록에 유지
 * - 기존 아파트: 공개 목록에 유지
 */
export function getHomeVisibleApartments(
  apartments: Apartment[],
  referenceDate = new Date()
) {
  return apartments.filter(
    (apartment) => {
      if (!isPublicListing(apartment)) {
        return false;
      }

      if (
        isSubscriptionListing(apartment)
      ) {
        return isVisibleHomeSubscription(
          apartment,
          referenceDate
        );
      }

      return true;
    }
  );
}

/**
 * 홈의 청약 영역에서 사용할 목록입니다.
 */
export function getVisibleSubscriptions(
  apartments: Apartment[],
  referenceDate = new Date()
) {
  return apartments.filter(
    (apartment) =>
      isVisibleHomeSubscription(
        apartment,
        referenceDate
      )
  );
}

/**
 * 홈의 선착순 영역에서 사용할 목록입니다.
 */
export function getVisibleFirstComeApartments(
  apartments: Apartment[]
) {
  return apartments.filter(
    (apartment) =>
      isPublicListing(apartment) &&
      isFirstComeListing(apartment)
  );
}

export function getSubscriptionSortDate(
  apartment: Apartment
) {
  const schedule =
    apartment.subscription;

  const values = [
    schedule?.specialSupplyStartDate,
    schedule?.firstPriorityStartDate,
    schedule?.secondPriorityStartDate,
    schedule?.winnerDate,
    schedule?.contractStartDate,
    schedule?.announcementDate,
  ];

  for (const value of values) {
    const parsed =
      parseSubscriptionDate(value);

    if (parsed) {
      return parsed.getTime();
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

export function formatSubscriptionDate(
  value?: string | null
) {
  const date =
    parseSubscriptionDate(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}.${month}.${day}`;
}