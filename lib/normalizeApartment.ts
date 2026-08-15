import type {
  Apartment,
  ListingStage,
} from "../types/apartment";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function firstDefined(
  ...values: unknown[]
): unknown {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null
  );
}

function toStringValue(
  value: unknown,
  fallback = ""
): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return fallback;
}

function toNullableString(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}

function toBooleanValue(
  value: unknown,
  fallback = false
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function normalizeLeadType(
  row: UnknownRecord,
  data: UnknownRecord
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
  row: UnknownRecord,
  data: UnknownRecord
): ListingStage {
  /*
   * 관리자 저장값(data.listingStage)을 최우선으로 사용합니다.
   *
   * 과거 DB의 listing_stage 컬럼에 이전 상태가 남아 있더라도
   * 관리자가 수정 화면에서 선택한 최신 상태가 공개 화면에
   * 즉시 반영되도록 data 값을 먼저 확인합니다.
   */
  const value =
    data.listingStage ??
    row.listing_stage;

  if (
    value === "subscription" ||
    value === "firstCome" ||
    value === "soldOut" ||
    value === "completed" ||
    value === "existing"
  ) {
    return value;
  }

  const status = toStringValue(
    firstDefined(
      row.status,
      data.status
    )
  ).trim();

  const condition = toStringValue(
    firstDefined(
      row.condition,
      data.condition
    )
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
    status.includes("마감완료")
  ) {
    return "soldOut";
  }

  if (
    status.includes("노출종료") ||
    status.includes("노출 종료") ||
    status.includes("게시종료") ||
    status.includes("게시 종료")
  ) {
    return "completed";
  }

  return "subscription";
}

function normalizeSource(
  row: UnknownRecord,
  data: UnknownRecord
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

function toNullableNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

export function normalizeApartment(
  rawRow: unknown
): Apartment {
  const row = asRecord(rawRow);
  const data = asRecord(row.data);
  const applyHome = asRecord(data.applyHome);
  const images = asRecord(data.images);

  const latitude = toNullableNumber(
    firstDefined(
      row.latitude,
      data.latitude
    )
  );

  const longitude = toNullableNumber(
    firstDefined(
      row.longitude,
      data.longitude
    )
  );

  const source = normalizeSource(
    row,
    data
  );

  const subscription =
    data.subscription ??
    {
      announcementDate:
        toNullableString(
          row.announcement_date
        ),
      specialSupplyStartDate:
        toNullableString(
          row.special_supply_date
        ),
      specialSupplyEndDate: null,
      firstPriorityStartDate:
        toNullableString(
          row.first_priority_date
        ),
      firstPriorityEndDate: null,
      secondPriorityStartDate:
        toNullableString(
          row.second_priority_date
        ),
      secondPriorityEndDate: null,
      winnerDate:
        toNullableString(
          row.winner_date
        ),
      contractStartDate:
        toNullableString(
          row.contract_start_date
        ),
      contractEndDate:
        toNullableString(
          row.contract_end_date
        ),
      noticeUrl:
        toNullableString(
          row.notice_url
        ),
      applyUrl:
        toNullableString(
          row.apply_url
        ),
      applyHomeUrl:
        toNullableString(
          row.applyhome_url
        ),
    };

  const subscriptionData =
    subscription as Apartment["subscription"];

  const totalSupplyValue =
    firstDefined(
      data.totalSupply,
      applyHome.TOT_SUPLY_HSHLDCO
    );

  const totalSupplyNumber =
    totalSupplyValue === undefined
      ? null
      : Number(
          String(totalSupplyValue).replace(
            /,/g,
            ""
          )
        );

  const normalizedTotalSupply =
    totalSupplyNumber !== null &&
    Number.isFinite(totalSupplyNumber)
      ? totalSupplyNumber
      : null;

  const projectInfo =
    data.projectInfo ??
    {
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
        toStringValue(
          firstDefined(
            row.type,
            data.type,
            applyHome.HOUSE_DTL_SECD_NM
          ),
          "아파트"
        ),
      moveInDate:
        toStringValue(
          applyHome.MVN_PREARNGE_YM
        ),
      developer:
        toStringValue(
          applyHome.BSNS_MBY_NM
        ),
      phone:
        toStringValue(
          applyHome.MDHS_TELNO
        ),
      floors: "",
      buildings: "",
      siteArea: "",
      buildingArea: "",
      floorAreaRatio: "",
      buildingCoverageRatio: "",
    };

  const locationInfo =
    data.locationInfo ??
    {
      transport: "",
      education: "",
      living: "",
      jobAccess: "",
      nature: "",
      futureValue: "",
      cautions: "",
    };

  const status = toStringValue(
    firstDefined(
      row.status,
      data.status
    ),
    "등록예정"
  );

  const condition = toStringValue(
    firstDefined(
      data.condition,
      row.condition
    ),
    source === "applyhome"
      ? "청약홈 신규 공고"
      : ""
  );

  const contractDetails =
    toStringValue(
      firstDefined(
        data.contractDetails,
        row.contract_details
      )
    );

  const jibnunSummary =
    toStringValue(
      firstDefined(
        data.jibnunSummary,
        row.jibnun_summary
      )
    );

  const heroImage =
    toNullableString(row.hero_image) ??
    normalizeHeroImage(images.hero);

  const floorPlans = Array.isArray(
    images.floorPlans
  )
    ? images.floorPlans
    : [];

  const applyHomeUrl =
    toNullableString(row.applyhome_url) ??
    toNullableString(
      subscriptionData?.applyHomeUrl
    );

  return {
    slug: toStringValue(row.slug),

    city: toStringValue(
      firstDefined(data.city, row.city)
    ),

    cityName: toStringValue(
      firstDefined(data.cityName, row.city)
    ),

    district: toStringValue(
      firstDefined(
        data.district,
        row.district
      )
    ),

    districtName: toStringValue(
      firstDefined(
        data.districtName,
        row.district
      )
    ),

    region: toStringValue(
      firstDefined(
        row.region,
        data.region
      )
    ),

    latitude,
    longitude,

    type: toStringValue(
      firstDefined(
        row.type,
        data.type
      ),
      "아파트"
    ),

    brand: toStringValue(
      firstDefined(
        row.brand,
        data.brand
      )
    ),

    builder: toStringValue(
      firstDefined(
        data.builder,
        row.builder,
        applyHome.CNSTRCT_ENTRPS_NM
      )
    ),

    name: toStringValue(
      firstDefined(
        row.name,
        data.name
      )
    ),

    leadType:
      normalizeLeadType(
        row,
        data
      ),

    images: {
      hero: heroImage,
      location:
        normalizeStringArray(
          images.location
        ),
      floorPlans:
        floorPlans as Apartment["images"]["floorPlans"],
      community:
        normalizeStringArray(
          images.community
        ),
      gallery:
        normalizeStringArray(
          images.gallery
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

    price: toStringValue(
      firstDefined(
        data.price,
        row.price
      )
    ),

    condition,

    contractDetails,

    jibnunSummary,

    evaluation:
      data.evaluation !== null &&
      typeof data.evaluation === "object" &&
      !Array.isArray(data.evaluation)
        ? (
            data.evaluation as Apartment["evaluation"]
          )
        : undefined,

    source,

    applyHomeId:
      toNullableString(
        firstDefined(
          row.applyhome_id,
          data.applyHomeId
        )
      ),

    applyHomeUrl,

    isAutoCreated:
      toBooleanValue(
        firstDefined(
          row.is_auto_created,
          data.isAutoCreated
        )
      ),

    manualOverride:
      toBooleanValue(
        firstDefined(
          row.manual_override,
          data.manualOverride
        )
      ),

    syncStatus:
      toStringValue(
        firstDefined(
          row.sync_status,
          data.syncStatus
        ),
        "manual"
      ) as Apartment["syncStatus"],

    lastSyncedAt:
      toNullableString(
        firstDefined(
          row.last_synced_at,
          data.lastSyncedAt
        )
      ),

    createdAt:
      toNullableString(
        firstDefined(
          row.created_at,
          data.createdAt
        )
      ),

    updatedAt:
      toNullableString(
        firstDefined(
          row.updated_at,
          data.updatedAt
        )
      ),

    totalSupply:
      normalizedTotalSupply,

    subscription:
      subscriptionData,

    projectInfo:
      projectInfo as Apartment["projectInfo"],

    locationInfo:
      locationInfo as Apartment["locationInfo"],

    applyHome:
      applyHome as Apartment["applyHome"],

    conditionHistory:
      Array.isArray(
        data.conditionHistory
      )
        ? (
            data.conditionHistory as Apartment["conditionHistory"]
          )
        : [],

    priceInfo:
      data.priceInfo === undefined
        ? undefined
        : (
            data.priceInfo as Apartment["priceInfo"]
          ),

    priceDetail:
      (
        data.priceDetail ??
        {
          salePrice:
            toStringValue(
              firstDefined(
                data.price,
                row.price
              )
            ),
          pricePerPyeong: "",
          contractPrice: "",
          middlePayment: "",
          balance: "",
          options: [],
        }
      ) as Apartment["priceDetail"],

    score:
      (
        data.score ??
        {
          total:
            toNullableNumber(
              row.score_total
            ) ?? 0,
          price: 0,
          contract: 0,
          location: 0,
          living: 0,
          future: 0,
          risk: 0,
        }
      ) as Apartment["score"],

    aiReview:
      (
        data.aiReview ??
        {
          summary: "",
          liveScore: 0,
          investScore: 0,
          safetyScore: 0,
          strengths: [],
        }
      ) as Apartment["aiReview"],

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
