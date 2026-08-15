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

const KST_OFFSET_MS =
  9 * 60 * 60 * 1000;

/*
 * 서버(Vercel/UTC)와 한국 사용자 브라우저(KST)가
 * 같은 순간에도 서로 다른 "오늘"을 계산하지 않도록
 * 모든 날짜 비교를 한국 표준시(KST) 기준 day number로 통일합니다.
 *
 * 예: 한국 2026-08-16 03:00은 Vercel UTC에서 아직 2026-08-15입니다.
 * 기존 getFullYear/getMonth/getDate 기반 코드는 이 시간대에
 * 서버/클라이언트 결과가 달라질 수 있었습니다.
 */
function getKstDayNumber(
  value: Date
) {
  return Math.floor(
    (value.getTime() +
      KST_OFFSET_MS) /
      ONE_DAY_MS
  );
}

function createCalendarDate(
  year: number,
  month: number,
  day: number
) {
  /*
   * 입력된 청약 날짜는 "한국 달력 날짜" 자체가 중요합니다.
   * UTC 정오로 보관하면 서버/브라우저 시간대에 관계없이
   * 같은 YYYY-MM-DD를 안정적으로 유지할 수 있습니다.
   */
  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0,
      0
    )
  );
}

function getCalendarParts(
  date: Date
) {
  return {
    year:
      date.getUTCFullYear(),
    month:
      date.getUTCMonth() + 1,
    day:
      date.getUTCDate(),
  };
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

    const date =
      createCalendarDate(
        Number(year),
        Number(month),
        Number(day)
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
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

    const date =
      createCalendarDate(
        Number(year),
        Number(month),
        Number(day)
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
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

    const date =
      createCalendarDate(
        Number(year),
        Number(month),
        1
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  const parsed =
    new Date(normalized);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  /*
   * 자유형 날짜 문자열도 한 번 파싱한 뒤
   * 해당 KST 달력 날짜를 안정적인 UTC 정오 Date로 변환합니다.
   */
  const shifted =
    new Date(
      parsed.getTime() +
        KST_OFFSET_MS
    );

  return createCalendarDate(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate()
  );
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

  const today =
    getKstDayNumber(
      referenceDate
    );

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
   */
  if (
    contractEndDate &&
    today >
      getKstDayNumber(
        contractEndDate
      )
  ) {
    return false;
  }

  /*
   * 당첨자 발표일로부터 15일이 지나면
   * 청약 영역에서는 제외합니다.
   */
  if (winnerDate) {
    const visibleUntil =
      getKstDayNumber(
        winnerDate
      ) + 15;

    if (
      today >
      visibleUntil
    ) {
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

  const {
    year,
    month,
    day,
  } = getCalendarParts(date);

  return `${year}.${String(
    month
  ).padStart(2, "0")}.${String(
    day
  ).padStart(2, "0")}`;
}
