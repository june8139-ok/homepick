import { conditionHistories } from "../data/history";
import type { Apartment, ApartmentConditionHistoryItem } from "../types/apartment";

export const conditionHistoryId = "condition-history";

export function getApartmentConditionHistory(apartment: Apartment): ApartmentConditionHistoryItem[] {
  return apartment.conditionHistory?.length
    ? apartment.conditionHistory
    : conditionHistories.find((entry) => entry.apartmentSlug === apartment.slug)?.history ?? [];
}
