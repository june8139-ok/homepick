export function normalizeApartment(row: any) {
  const data = row.data ?? {};
  const applyHome = data.applyHome ?? {};

  const latitudeValue =
    row.latitude ?? data.latitude ?? null;

  const longitudeValue =
    row.longitude ?? data.longitude ?? null;

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

  const subscription =
    data.subscription ?? {
      announcementDate:
        row.announcement_date ?? null,

      specialSupplyStartDate:
        row.special_supply_date ?? null,

      specialSupplyEndDate: null,

      firstPriorityStartDate:
        row.first_priority_date ?? null,

      firstPriorityEndDate: null,

      secondPriorityStartDate:
        row.second_priority_date ?? null,

      secondPriorityEndDate: null,

      winnerDate:
        row.winner_date ?? null,

      contractStartDate:
        row.contract_start_date ?? null,

      contractEndDate:
        row.contract_end_date ?? null,

      applyHomeUrl:
        row.applyhome_url ?? null,
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
          String(totalSupplyValue).replace(
            /,/g,
            ""
          )
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
        applyHome.MVN_PREARNGE_YM ?? "",

      developer:
        applyHome.BSNS_MBY_NM ?? "",

      phone:
        applyHome.MDHS_TELNO ?? "",

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

  return {
    slug: row.slug,

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

    images: {
      hero:
        row.hero_image ||
        data.images?.hero ||
        null,

      location:
        data.images?.location ?? [],

      floorPlans:
        data.images?.floorPlans ?? [],

      community:
        data.images?.community ?? [],

      gallery:
        data.images?.gallery ?? [],
    },

    keywords:
      data.keywords ?? [],

    status:
      row.status ??
      data.status ??
      "등록예정",

    price:
      data.price ?? "",

    condition:
      data.condition ??
      row.condition ??
      (row.source === "applyhome"
        ? "청약홈 신규 공고"
        : ""),

    conditionHistory:
      data.conditionHistory ?? [],

    priceDetail:
      data.priceDetail ?? {
        salePrice:
          data.price ?? "",

        pricePerPyeong: "",
        contractPrice: "",
        middlePayment: "",
        balance: "",
        options: [],
      },

    projectInfo,
    locationInfo,

    score:
      data.score ?? {
        total:
          row.score_total ?? 0,

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
      data.pros ?? [],

    cons:
      data.cons ?? [],

    source:
      row.source ??
      data.source ??
      "manual",

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
      false,

    syncStatus:
      row.sync_status ??
      "manual",

    lastSyncedAt:
      row.last_synced_at ??
      null,

    subscription,
    applyHome,

    totalSupply:
      normalizedTotalSupply,
  };
}