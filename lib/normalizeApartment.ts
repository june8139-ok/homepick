import type {
  Apartment,
  ListingStage,
} from "../types/apartment";

function normalizeLeadType(
  row: any,
  data: any
): Apartment["leadType"] {
  const value =
    row.lead_type ?? data.leadType;

  if (
    value === "consult" ||
    value === "schedule" ||
    value === "closed"
  ) {
    return value;
  }

  return "schedule";
}

function normalizeListingStage(
  row: any,
  data: any
): ListingStage {
  const value =
    row.listing_stage ??
    data.listingStage;

  if (
    value === "subscription" ||
    value === "firstCome" ||
    value === "completed" ||
    value === "existing"
  ) {
    return value;
  }

  const status = String(
    row.status ?? data.status ?? ""
  ).trim();

  const condition = String(
    row.condition ?? data.condition ?? ""
  ).trim();

  if (
    status.includes("선착순") ||
    condition.includes("동호지정") ||
    condition.includes("잔여세대") ||
    condition.includes("회사보유분")
  ) {
    return "firstCome";
  }

  if (
    status.includes("분양완료") ||
    status.includes("공급완료") ||
    status.includes("노출종료") ||
    status.includes("노출 종료")
  ) {
    return "completed";
  }

  return "subscription";
}

function normalizeSource(
  row: any,
  data: any
): Apartment["source"] {
  const value =
    row.source ?? data.source;

  return value === "applyhome"
    ? "applyhome"
    : "manual";
}

function normalizeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string"
  );
}

function normalizeHeroImage(
  value: unknown
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (
    Array.isArray(value) &&
    typeof value[0] === "string"
  ) {
    return value[0];
  }

  return null;
}

export function normalizeApartment(
  row: any
): Apartment {
  const data = row.data ?? {};
  const applyHome = data.applyHome ?? {};

  const latitudeValue =
    row.latitude ??
    data.latitude ??
    null;

  const longitudeValue =
    row.longitude ??
    data.longitude ??
    null;

  const latitude =
    latitudeValue === null ||
    latitudeValue === undefined ||
    latitudeValue === ""
      ? null
      : Number(latitudeValue);

  const longitude =
    longitudeValue === null ||
    longitudeValue === undefined ||
    longitudeValue === ""
      ? null
      : Number(longitudeValue);

  const source = normalizeSource(
    row,
    data
  );

  const subscription =
    data.subscription ?? {
      announcementDate:
        row.announcement_date ??
        null,

      specialSupplyStartDate:
        row.special_supply_date ??
        null,

      specialSupplyEndDate:
        null,

      firstPriorityStartDate:
        row.first_priority_date ??
        null,

      firstPriorityEndDate:
        null,

      secondPriorityStartDate:
        row.second_priority_date ??
        null,

      secondPriorityEndDate:
        null,

      winnerDate:
        row.winner_date ??
        null,

      contractStartDate:
        row.contract_start_date ??
        null,

      contractEndDate:
        row.contract_end_date ??
        null,

      noticeUrl:
        row.notice_url ??
        null,

      applyUrl:
        row.apply_url ??
        null,

      applyHomeUrl:
        row.applyhome_url ??
        null,
    };

  const totalSupplyValue =
    data.totalSupply ??
    applyHome.TOT_SUPLY_HSHLDCO ??
    null;

  const totalSupplyNumber =
    totalSupplyValue === null ||
    totalSupplyValue === undefined ||
    totalSupplyValue === ""
      ? null
      : Number(
          String(
            totalSupplyValue
          ).replace(/,/g, "")
        );

  const normalizedTotalSupply =
    Number.isFinite(totalSupplyNumber)
      ? totalSupplyNumber
      : null;

  const projectInfo =
    data.projectInfo ?? {
      totalHouseholds:
        normalizedTotalSupply !== null
          ? `${normalizedTotalSupply.toLocaleString()}세대`
          : "",

      saleHouseholds:
        normalizedTotalSupply !== null
          ? `${normalizedTotalSupply.toLocaleString()}세대`
          : "",

      parking: "",

      scale: "",

      usage:
        row.type ??
        data.type ??
        applyHome.HOUSE_DTL_SECD_NM ??
        "아파트",

      moveInDate:
        applyHome.MVN_PREARNGE_YM ??
        "",

      developer:
        applyHome.BSNS_MBY_NM ??
        "",

      phone:
        applyHome.MDHS_TELNO ??
        "",

      floors: "",
      buildings: "",
      siteArea: "",
      buildingArea: "",
      floorAreaRatio: "",
      buildingCoverageRatio: "",
    };

  const locationInfo =
    data.locationInfo ?? {
      transport: "",
      education: "",
      living: "",
      jobAccess: "",
      nature: "",
      futureValue: "",
      cautions: "",
    };

  const status =
    row.status ??
    data.status ??
    "등록예정";

  const condition =
    data.condition ??
    row.condition ??
    (source === "applyhome"
      ? "청약홈 신규 공고"
      : "");

  const heroImage =
    row.hero_image ||
    normalizeHeroImage(
      data.images?.hero
    );

  return {
    slug:
      row.slug ?? "",

    city:
      data.city ??
      row.city ??
      "",

    cityName:
      data.cityName ??
      row.city ??
      "",

    district:
      data.district ??
      row.district ??
      "",

    districtName:
      data.districtName ??
      row.district ??
      "",

    region:
      row.region ??
      data.region ??
      "",

    latitude:
      Number.isFinite(latitude)
        ? latitude
        : null,

    longitude:
      Number.isFinite(longitude)
        ? longitude
        : null,

    type:
      row.type ??
      data.type ??
      "아파트",

    brand:
      row.brand ??
      data.brand ??
      "",

    builder:
      data.builder ??
      row.builder ??
      applyHome.CNSTRCT_ENTRPS_NM ??
      "",

    name:
      row.name ??
      data.name ??
      "",

    leadType:
      normalizeLeadType(
        row,
        data
      ),

    images: {
      hero: heroImage,

      location:
        normalizeStringArray(
          data.images?.location
        ),

      floorPlans:
        Array.isArray(
          data.images?.floorPlans
        )
          ? data.images.floorPlans
          : [],

      community:
        normalizeStringArray(
          data.images?.community
        ),

      gallery:
        normalizeStringArray(
          data.images?.gallery
        ),
    },

    keywords:
      normalizeStringArray(
        data.keywords
      ),

    status,

    listingStage:
      normalizeListingStage(
        row,
        data
      ),

    price:
      data.price ??
      row.price ??
      "",

    condition,

    source,

    applyHomeId:
      row.applyhome_id ??
      data.applyHomeId ??
      null,

    applyHomeUrl:
      row.applyhome_url ??
      subscription.applyHomeUrl ??
      null,

    isAutoCreated:
      row.is_auto_created ??
      data.isAutoCreated ??
      false,

    manualOverride:
      row.manual_override ??
      data.manualOverride ??
      false,

    syncStatus:
      row.sync_status ??
      data.syncStatus ??
      "manual",

    lastSyncedAt:
      row.last_synced_at ??
      data.lastSyncedAt ??
      null,

    totalSupply:
      normalizedTotalSupply,

    subscription,

    projectInfo,

    locationInfo,

    applyHome,

    conditionHistory:
      Array.isArray(
        data.conditionHistory
      )
        ? data.conditionHistory
        : [],

    priceInfo:
      data.priceInfo ?? undefined,

    priceDetail:
      data.priceDetail ?? {
        salePrice:
          data.price ??
          row.price ??
          "",

        pricePerPyeong:
          "",

        contractPrice:
          "",

        middlePayment:
          "",

        balance:
          "",

        options: [],
      },

    score:
      data.score ?? {
        total:
          row.score_total ??
          0,

        price: 0,
        contract: 0,
        location: 0,
        living: 0,
        future: 0,
        risk: 0,
      },

    aiReview:
      data.aiReview ?? {
        summary: "",
        liveScore: 0,
        investScore: 0,
        safetyScore: 0,
        strengths: [],
      },

    pros:
      normalizeStringArray(
        data.pros
      ),

    cons:
      normalizeStringArray(
        data.cons
      ),
  };
}