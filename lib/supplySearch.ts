import type { Apartment } from "../types/apartment";
import { isPublicSale } from "./apartmentInquiryPolicy";

const supplyPattern = /민간임대|공공분양/u;

function compact(value: string) {
  return value.toLowerCase().replace(/\s+/gu, "");
}

export function getSupplySearch(keyword: string) {
  const text = compact(keyword);
  const supply = text.match(supplyPattern)?.[0];
  return supply ? { supply, location: text.replace(supply, "") } : null;
}

export function matchesSupplySearch(apartment: Apartment, keyword: string): boolean | undefined {
  const query = getSupplySearch(keyword);
  if (!query) return undefined;

  const matchesType = query.supply === "민간임대"
    ? apartment.housingSupplyType === "privateRental"
    : isPublicSale(apartment);
  if (!matchesType || !query.location) return matchesType;

  const location = query.location.replace(/특별자치시|특별자치도|광역시|특별시/gu, "");
  if (!location) return false;

  return [
    apartment.city,
    apartment.cityName,
    apartment.district,
    apartment.districtName,
    apartment.region,
    `${apartment.cityName}${apartment.districtName}`,
    `${apartment.city}${apartment.district}`,
  ].some((value) => Boolean(value && compact(value).replace(/특별자치시|특별자치도|광역시|특별시/gu, "").includes(location))) || compact(apartment.name).includes(compact(keyword));
}
