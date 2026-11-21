import type { Apartment } from "../types/apartment";
import { getListingStage } from "./listingStage";

export function isPublicSale(apartment: Apartment): boolean {
  const raw = apartment.applyHome;
  return [apartment.name, apartment.type, raw?.HOUSE_SECD_NM, raw?.HOUSE_DTL_SECD_NM]
    .some((value) => typeof value === "string" && /공공\s*분양/u.test(value));
}

export function canAcceptApartmentInquiry(apartment: Apartment): boolean {
  const stage = getListingStage(apartment);
  return (stage === "firstCome" || stage === "subscription") &&
    apartment.leadType !== "closed" &&
    !isPublicSale(apartment);
}
