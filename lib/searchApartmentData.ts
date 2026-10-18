import type { Apartment } from "../types/apartment";

/** Search-only transfer model. Never change the shared DB/cache/detail object. */
export function toSearchApartment(apartment: Apartment): Apartment {
  const result: Apartment = {
    ...apartment,
    images: {
      ...apartment.images,
      location: [],
      floorPlans: [],
      community: [],
      // Every search card/map consumer picks the first usable gallery image.
      gallery: apartment.images.gallery.filter(image =>
        image && !image.includes("/images/apartments/default/main.jpg")
      ).slice(0, 1),
    },
    conditionHistory: [],
    aiReview: {
      summary: "",
      liveScore: 0,
      investScore: 0,
      safetyScore: 0,
      strengths: [],
    },
  };
  // These optional detail-only fields are not read by search, map, card,
  // stage/visibility, recent-update, price or benefit helpers.
  delete result.applyHome;
  delete result.locationInfo;
  delete result.contractDetails;
  delete result.jibnunSummary;
  delete result.evaluation;
  return result;
}
