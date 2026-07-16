import type { Apartment } from "../types/apartment";

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

type SubscriptionStatus =
  (typeof subscriptionStatuses)[number];

const ONE_DAY_MS =
  24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function isSubscriptionStatus(
  status?: string | null
): status is SubscriptionStatus {
  if (!status?.trim()) {
    return false;
  }

  return subscriptionStatuses.includes(
    status.trim() as SubscriptionStatus
  );
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

  const parsed =
    new Date(normalized);

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : startOfDay(parsed);
}

export function isSubscriptionApartment(
  apartment: Apartment
) {
  return (
    apartment.source === "applyhome" ||
    apartment.isAutoCreated === true ||
    isSubscriptionStatus(
      apartment.status
    )
  );
}

export function isFirstComeApartment(
  apartment: Apartment
) {
  const status =
    apartment.status
      ?.trim()
      .toLowerCase() ?? "";

  const condition =
    apartment.condition
      ?.trim()
      .toLowerCase() ?? "";

  return (
    status.includes("선착순") ||
    condition.includes("동호지정") ||
    condition.includes("잔여세대") ||
    condition.includes("회사보유분")
  );
}

export function isVisibleHomeSubscription(
  apartment: Apartment,
  referenceDate = new Date()
) {
  if (
    !isSubscriptionApartment(apartment)
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
   * 계약 종료일이 지났으면
   * 즉시 홈에서 제외한다.
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
   * 당첨자 발표일로부터 15일이
   * 지났으면 계약 종료일이 남아 있어도
   * 홈에서는 제외한다.
   */
  if (winnerDate) {
    const visibleUntil =
      startOfDay(winnerDate).getTime() +
      15 * ONE_DAY_MS;

    if (today > visibleUntil) {
      return false;
    }
  }

  /*
   * 계약 종료일이나 당첨자 발표일 중
   * 하나라도 아직 유효하면 노출한다.
   *
   * 신규 자동등록 자료처럼 일정이
   * 아직 비어 있는 경우에도 유지한다.
   */
  return true;
}

export function getHomeVisibleApartments(
  apartments: Apartment[],
  referenceDate = new Date()
) {
  return apartments.filter(
    (apartment) =>
      !isSubscriptionApartment(
        apartment
      ) ||
      isVisibleHomeSubscription(
        apartment,
        referenceDate
      )
  );
}

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