import type { Apartment } from "../types/apartment";

/** Explicit payload for the public search and home widgets. */
export function toSearchApartment(a: Apartment, home = false): Apartment {
  return {
    slug: a.slug,
    name: a.name,
    city: a.city,
    cityName: a.cityName,
    district: a.district,
    districtName: a.districtName,
    region: a.region,
    type: a.type,
    brand: a.brand,
    builder: a.builder,
    latitude: a.latitude,
    longitude: a.longitude,
    keywords: a.keywords,
    searchAliases: a.searchAliases,
    status: a.status,
    listingStage: a.listingStage,
    housingSupplyType: a.housingSupplyType,
    price: a.price,
    condition: a.condition,
    source: a.source,
    isAutoCreated: a.isAutoCreated,
    manualOverride: a.manualOverride,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    lastMeaningfulUpdateAt: a.lastMeaningfulUpdateAt,
    lastUpdateType: a.lastUpdateType,
    subscription: a.subscription,
    projectInfo: a.projectInfo ? { moveInDate: a.projectInfo.moveInDate } : undefined,
    applyHome: a.applyHome ? {
      HOUSE_SECD_NM: a.applyHome.HOUSE_SECD_NM,
      HOUSE_DTL_SECD_NM: a.applyHome.HOUSE_DTL_SECD_NM,
    } : undefined,
    images: {
      hero: a.images.hero,
      gallery: a.images.gallery.filter((image) =>
        image && !image.includes("/images/apartments/default/main.jpg")
      ).slice(0, 1),
      location: [],
      floorPlans: home ? a.images.floorPlans.map(({ name }) => ({ name, url: "" })) : [],
      community: [],
    },
    priceInfo: home ? undefined : a.priceInfo,
    priceDetail: {
      salePrice: a.priceDetail.salePrice,
      pricePerPyeong: "",
      contractPrice: "",
      middlePayment: "",
      balance: "",
      options: [],
    },
    score: { total: 0, price: 0, contract: 0, location: 0, living: 0, future: 0, risk: 0 },
    aiReview: { summary: "", liveScore: 0, investScore: 0, safetyScore: 0, strengths: [] },
    conditionHistory: [],
    pros: home ? [] : a.pros,
    cons: home ? [] : a.cons,
  };
}
