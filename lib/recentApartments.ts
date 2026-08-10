import type { Apartment } from "../types/apartment";
import {
  isFirstComeApartment,
} from "./subscriptionVisibility";

export const RECENT_UPDATE_DAYS = 14;
export const HOME_RECENT_LIMIT = 3;

function toTimestamp(
  value?: string | null
) {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function isManualApartment(
  apartment: Apartment
) {
  return (
    apartment.source !== "applyhome" &&
    apartment.isAutoCreated !== true
  );
}

function isManuallyConvertedFirstCome(
  apartment: Apartment
) {
  return (
    isFirstComeApartment(apartment) &&
    apartment.manualOverride === true &&
    (
      apartment.source === "applyhome" ||
      apartment.isAutoCreated === true
    )
  );
}

/*
 * 신규 필드가 생기기 전 데이터도 갑자기 목록에서 사라지지 않도록
 * 제한적인 fallback을 둡니다.
 *
 * - 수동 등록 단지: updatedAt → createdAt
 * - 청약홈 출신이지만 관리자가 선착순으로 전환한 단지:
 *   updatedAt을 임시 의미 있는 변경일로 사용
 *
 * 자동수집 단지 전체에 updatedAt을 쓰지는 않습니다.
 * 단순 동기화만으로 최근 업데이트에 올라오는 것을 막기 위해서입니다.
 */
export function getMeaningfulUpdateAt(
  apartment: Apartment
) {
  if (
    apartment.lastMeaningfulUpdateAt
  ) {
    return apartment.lastMeaningfulUpdateAt;
  }

  if (isManualApartment(apartment)) {
    return (
      apartment.updatedAt ||
      apartment.createdAt ||
      null
    );
  }

  if (
    isManuallyConvertedFirstCome(
      apartment
    )
  ) {
    return apartment.updatedAt || null;
  }

  return null;
}

export function getMeaningfulUpdateLabel(
  apartment: Apartment
) {
  if (apartment.lastUpdateType) {
    return apartment.lastUpdateType;
  }

  if (
    isManuallyConvertedFirstCome(
      apartment
    )
  ) {
    return "청약 → 선착순";
  }

  if (isManualApartment(apartment)) {
    return "최근 업데이트";
  }

  return "최근 업데이트";
}

export function getRecentUpdatedApartments(
  apartments: Apartment[],
  days = RECENT_UPDATE_DAYS
) {
  const now = Date.now();
  const maximumAge =
    days * 24 * 60 * 60 * 1000;

  return apartments
    .filter((apartment) => {
      const timestamp = toTimestamp(
        getMeaningfulUpdateAt(
          apartment
        )
      );

      return (
        timestamp > 0 &&
        now - timestamp >= 0 &&
        now - timestamp <=
          maximumAge
      );
    })
    .sort((first, second) => {
      return (
        toTimestamp(
          getMeaningfulUpdateAt(second)
        ) -
        toTimestamp(
          getMeaningfulUpdateAt(first)
        )
      );
    });
}
