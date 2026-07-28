import {
  fetchAPTList,
  fetchAPTModelList,
} from "./apiDataGo";
import { supabaseAdmin } from "./supabaseAdmin";

type Row = Record<string, unknown>;

function isRecord(
  value: unknown
): value is Row {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

type SubscriptionSchedule = {
  announcementDate: string | null;
  specialSupplyStartDate: string | null;
  specialSupplyEndDate: string | null;
  firstPriorityStartDate: string | null;
  firstPriorityEndDate: string | null;
  secondPriorityStartDate: string | null;
  secondPriorityEndDate: string | null;
  winnerDate: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  noticeUrl: string | null;
  applyUrl: string | null;
  applyHomeUrl: string | null;
};

type PriceType = {
  typeName: string;
  minPrice: number | null;
  maxPrice: number | null;
  households: number | null;
};

type PriceUnit = {
  area: string;
  minPrice: number | null;
  maxPrice: number | null;
  households: number | null;
  source: "applyhome";
  types: PriceType[];
};

type PriceInfo = {
  minimumPrice: number | null;
  maximumPrice: number | null;
  averagePricePerPyeong: number | null;
  units: PriceUnit[];
  updatedAt: string;
  note: string;
};

type NormalizedApartment = {
  applyHomeId: string;
  houseManageNo: string;
  pblancNo: string;
  slug: string;
  name: string;
  region: string;
  city: string;
  cityName: string;
  district: string;
  districtName: string;
  builder: string;
  totalSupply: number | null;
  status: string;
  schedule: SubscriptionSchedule;
  raw: Row;
};

export type ApplyHomeSyncResult = {
  fetched: number;
  relevant: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  priceSynced: number;
  priceMissing: number;
  errors: string[];
};

const PER_PAGE = 100;
const PAGE_BATCH_SIZE = 5;
const MAX_PAGE_COUNT = 100;
const RECENT_DAYS = 120;
const APPLYHOME_MAIN_URL = "https://www.applyhome.co.kr";

const CITY_MAP: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function numberOrNull(value: unknown) {
  const normalized = text(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  if (!normalized || normalized === "-" || normalized === ".") {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function firstText(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = text(row[key]);
    if (value) return value;
  }
  return "";
}

function firstNumber(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = numberOrNull(row[key]);
    if (value !== null) return value;
  }
  return null;
}

function parseDate(value: unknown) {
  const source = text(value);
  if (!source) return null;

  const normalized = source
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .slice(0, 10);

  const date = new Date(`${normalized}T00:00:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateString(value: unknown) {
  const date = parseDate(value);
  if (!date) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function koreaToday() {
  const value = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${value}T00:00:00+09:00`);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function between(
  today: Date,
  start: Date | null,
  end: Date | null
) {
  if (!start && !end) return false;
  return today >= (start ?? end!) && today <= (end ?? start!);
}

function slug(name: string, pblancNo: string) {
  const namePart = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const idPart = pblancNo
    .replace(/[^\dA-Za-z]/g, "")
    .slice(-8);

  return `${namePart || "applyhome-apartment"}-${idPart}`;
}

function location(region: string) {
  const [province = "", district = ""] =
    region.split(/\s+/).filter(Boolean);

  return {
    cityName: CITY_MAP[province] ?? province,
    districtName: district,
  };
}

function schedule(row: Row): SubscriptionSchedule {
  const noticeUrl = text(row.PBLANC_URL) || null;

  return {
    announcementDate: dateString(row.RCRIT_PBLANC_DE),
    specialSupplyStartDate: dateString(row.SPSPLY_RCEPT_BGNDE),
    specialSupplyEndDate: dateString(row.SPSPLY_RCEPT_ENDDE),
    firstPriorityStartDate:
      dateString(row.GNRL_RNK1_CRSPAREA_RCPTDE) ??
      dateString(row.GNRL_RNK1_ETC_AREA_RCPTDE) ??
      dateString(row.GNRL_RNK1_ETC_GG_RCPTDE),
    firstPriorityEndDate:
      dateString(row.GNRL_RNK1_CRSPAREA_ENDDE) ??
      dateString(row.GNRL_RNK1_ETC_AREA_ENDDE) ??
      dateString(row.GNRL_RNK1_ETC_GG_ENDDE),
    secondPriorityStartDate:
      dateString(row.GNRL_RNK2_CRSPAREA_RCPTDE) ??
      dateString(row.GNRL_RNK2_ETC_AREA_RCPTDE) ??
      dateString(row.GNRL_RNK2_ETC_GG_RCPTDE),
    secondPriorityEndDate:
      dateString(row.GNRL_RNK2_CRSPAREA_ENDDE) ??
      dateString(row.GNRL_RNK2_ETC_AREA_ENDDE) ??
      dateString(row.GNRL_RNK2_ETC_GG_ENDDE),
    winnerDate: dateString(row.PRZWNER_PRESNATN_DE),
    contractStartDate: dateString(row.CNTRCT_CNCLS_BGNDE),
    contractEndDate: dateString(row.CNTRCT_CNCLS_ENDDE),
    noticeUrl,
    applyUrl: null,
    applyHomeUrl: APPLYHOME_MAIN_URL,
  };
}

function status(value: SubscriptionSchedule) {
  const today = koreaToday();

  const specialStart = parseDate(value.specialSupplyStartDate);
  const specialEnd = parseDate(value.specialSupplyEndDate);
  const firstStart = parseDate(value.firstPriorityStartDate);
  const firstEnd = parseDate(value.firstPriorityEndDate);
  const secondStart = parseDate(value.secondPriorityStartDate);
  const secondEnd = parseDate(value.secondPriorityEndDate);
  const winner = parseDate(value.winnerDate);
  const contractStart = parseDate(value.contractStartDate);
  const contractEnd = parseDate(value.contractEndDate);

  if (between(today, contractStart, contractEnd)) return "계약중";

  if (
    between(today, specialStart, specialEnd) ||
    between(today, firstStart, firstEnd) ||
    between(today, secondStart, secondEnd)
  ) {
    return "청약중";
  }

  const firstApplication =
    specialStart ?? firstStart ?? secondStart;

  if (firstApplication && today < firstApplication) {
    return "청약예정";
  }

  if (contractEnd && today > contractEnd) {
    return "청약마감";
  }

  if (winner && today >= winner) {
    return "당첨자발표";
  }

  return "청약예정";
}

function normalize(row: Row): NormalizedApartment | null {
  const houseManageNo = text(row.HOUSE_MANAGE_NO);
  const pblancNo = text(row.PBLANC_NO);
  const name = text(row.HOUSE_NM);
  const region = text(row.HSSPLY_ADRES);

  if (!houseManageNo || !pblancNo || !name) return null;

  const place = location(region);
  const subscription = schedule(row);

  return {
    applyHomeId: `${houseManageNo}-${pblancNo}`,
    houseManageNo,
    pblancNo,
    slug: slug(name, pblancNo),
    name,
    region,
    city: place.cityName.toLowerCase().replace(/\s+/g, "-"),
    cityName: place.cityName,
    district: place.districtName.toLowerCase().replace(/\s+/g, "-"),
    districtName: place.districtName,
    builder:
      text(row.CNSTRCT_ENTRPS_NM) ||
      text(row.BSNS_MBY_NM),
    totalSupply: numberOrNull(row.TOT_SUPLY_HSHLDCO),
    status: status(subscription),
    schedule: subscription,
    raw: row,
  };
}

function relevant(apartment: NormalizedApartment) {
  const today = koreaToday();
  const recentLimit = addDays(today, -RECENT_DAYS);
  const announcement = parseDate(
    apartment.schedule.announcementDate
  );

  const futureDates = [
    apartment.schedule.specialSupplyEndDate,
    apartment.schedule.firstPriorityEndDate,
    apartment.schedule.secondPriorityEndDate,
    apartment.schedule.winnerDate,
    apartment.schedule.contractEndDate,
  ]
    .map(parseDate)
    .filter((date): date is Date => Boolean(date));

  return (
    (announcement !== null && announcement >= recentLimit) ||
    futureDates.some((date) => date >= today)
  );
}

function areaGroup(row: Row) {
  // 초록색 면적 그룹은 전용면적을 최우선으로 사용
  const raw = firstText(row, [
    "EXCLUSE_AR",
    "HOUSE_TY",
    "HOUSE_TY_NM",
    "MODEL_NO",
    "SUPLY_AR",
  ]);

  const match = raw.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const area = Number(match[0]);

  return Number.isFinite(area) && area > 0
    ? Math.floor(area)
    : null;
}

function typeName(row: Row) {
  // 세부 타입은 HOUSE_TY를 우선 사용
  const raw =
    firstText(row, [
      "HOUSE_TY",
      "HOUSE_TY_NM",
      "MODEL_NO",
      "EXCLUSE_AR",
      "SUPLY_AR",
    ]) || "주택형";

  const match = raw.match(
    /0*(\d+(?:\.\d+)?)([A-Za-z가-힣]*)/
  );

  if (!match) return raw;

  const area = Number(match[1]);
  const suffix = (match[2] ?? "").toUpperCase();

  if (!Number.isFinite(area) || area <= 0) {
    return raw;
  }

  return `${Math.floor(area)}${suffix}`;
}

function households(row: Row) {
  const total = firstNumber(row, [
    "SUPLY_HSHLDCO",
    "TOT_SUPLY_HSHLDCO",
    "SUPLY_HSHLD_CNT",
  ]);

  if (total !== null) return Math.max(0, Math.round(total));

  const general =
    firstNumber(row, [
      "GNRL_HSHLDCO",
      "GNRL_SUPLY_HSHLDCO",
    ]) ?? 0;

  const special =
    firstNumber(row, [
      "SPSPLY_HSHLDCO",
      "SPECIAL_SUPLY_HSHLDCO",
    ]) ?? 0;

  return general + special > 0
    ? Math.round(general + special)
    : null;
}

function maximumPrice(row: Row) {
  return firstNumber(row, [
    // 청약홈 주택형별 상세 API의 공식 최고 분양가 필드
    "LTTOT_TOP_AMOUNT",

    // API 개편이나 응답 차이를 대비한 보조 필드
    "LTTOT_AMOUNT",
    "SUPLY_AMOUNT",
    "SUPLY_AMT",
    "MAX_SUPLY_AMOUNT",
    "TOP_AMOUNT",
    "MAX_AMOUNT",
    "PRICE",
  ]);
}

function createPriceInfo(rows: Row[]): PriceInfo | null {
  const groups = new Map<
    number,
    {
      topPrices: number[];
      households: number;
      types: PriceType[];
    }
  >();

  for (const row of rows) {
    const area = areaGroup(row);
    if (area === null) continue;

    const topPrice = maximumPrice(row);
    const count = households(row);

    const group = groups.get(area) ?? {
      topPrices: [],
      households: 0,
      types: [],
    };

    if (topPrice !== null && topPrice > 0) {
      group.topPrices.push(topPrice);
    }

    if (count !== null && count > 0) {
      group.households += count;
    }

    group.types.push({
      typeName: typeName(row),

      /*
       * 청약홈 주택형 API의 LTTOT_TOP_AMOUNT는
       * 타입별 최고 공급금액입니다.
       * 실제 최저가가 아니므로 minPrice에는 저장하지 않습니다.
       */
      minPrice: null,

      maxPrice:
        topPrice !== null && topPrice > 0
          ? topPrice
          : null,

      households: count,
    });

    groups.set(area, group);
  }

  const units: PriceUnit[] = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([area, group]) => ({
      area: `${area}㎡`,

      /*
       * 청약홈 자동 수집만으로는 평형의 실제 최저가를 알 수 없습니다.
       */
      minPrice: null,

      maxPrice:
        group.topPrices.length > 0
          ? Math.max(...group.topPrices)
          : null,

      households:
        group.households > 0
          ? group.households
          : null,

      source: "applyhome",

      types: group.types.sort((a, b) =>
        a.typeName.localeCompare(b.typeName, "ko", {
          numeric: true,
        })
      ),
    }));

  if (units.length === 0) return null;

  const maxPrices = units
    .map((unit) => unit.maxPrice)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    );

  return {
    /*
     * 실제 최저 분양가는 모집공고 공급금액표나 관리자 입력이 있어야
     * 확정할 수 있으므로 자동 동기화에서는 null로 둡니다.
     */
    minimumPrice: null,

    maximumPrice:
      maxPrices.length > 0
        ? Math.max(...maxPrices)
        : null,

    averagePricePerPyeong: null,
    units,
    updatedAt: new Date().toISOString(),
    note:
      "청약홈 주택형별 최고 공급금액을 기준으로 자동 정리한 가격입니다. 실제 최저 분양가와 동·층별 공급금액은 모집공고 공급금액표를 확인해주세요.",
  };
}

function canonicalTypeName(value: unknown) {
  const raw = text(value);
  const match = raw.match(/0*(\d+(?:\.\d+)?)([A-Za-z가-힣]*)/);

  if (!match) return raw;

  const area = Number(match[1]);
  const suffix = (match[2] ?? "").toUpperCase();

  if (!Number.isFinite(area) || area <= 0) {
    return raw;
  }

  return `${Math.floor(area)}${suffix}`;
}

function mergePriceInfo(
  existing: unknown,
  synced: PriceInfo | null,
  preserveManualMinimums: boolean
) {
  if (!synced) {
    return existing ?? null;
  }

  if (!isRecord(existing)) {
    return synced;
  }

  const existingUnits = Array.isArray(
    existing.units
  )
    ? existing.units.filter(isRecord)
    : [];

  /*
   * 자동 생성 단지는 과거 동기화에서 잘못 들어간 minPrice를
   * 모두 제거해야 합니다.
   *
   * manual_override가 true인 단지만 관리자가 직접 입력한
   * 최저가를 보존합니다.
   */
  const oldTypeMap = new Map<
    string,
    Row
  >();

  if (preserveManualMinimums) {
    for (const unit of existingUnits) {
      const types = Array.isArray(
        unit.types
      )
        ? unit.types.filter(isRecord)
        : [];

      for (const type of types) {
        const key =
          canonicalTypeName(
            type.typeName
          );

        if (key) {
          oldTypeMap.set(
            key,
            type
          );
        }
      }
    }
  }

  const oldUnitByArea =
    preserveManualMinimums
      ? new Map<string, Row>(
          existingUnits.map(
            (unit) => [
              text(unit.area),
              unit,
            ]
          )
        )
      : new Map<string, Row>();

  const units = synced.units.map(
    (unit) => {
      const oldUnit =
        oldUnitByArea.get(
          unit.area
        );

      return {
        ...unit,

        minPrice:
          preserveManualMinimums
            ? numberOrNull(
                oldUnit?.minPrice
              )
            : null,

        types: unit.types.map(
          (type) => {
            const oldType =
              oldTypeMap.get(
                canonicalTypeName(
                  type.typeName
                )
              );

            return {
              ...type,

              minPrice:
                preserveManualMinimums
                  ? numberOrNull(
                      oldType?.minPrice
                    )
                  : null,
            };
          }
        ),
      };
    }
  );

  /*
   * 관리자가 직접 추가한 단위는 manual_override 단지에서만 유지합니다.
   * 자동 단지는 청약홈에서 다시 만든 전용면적 데이터로 완전히 교체합니다.
   */
  const manualOnly =
    preserveManualMinimums
      ? existingUnits.filter(
          (unit) => {
            const source = text(
              unit.source
            ).toLowerCase();

            if (
              source ===
              "applyhome"
            ) {
              return false;
            }

            return !units.some(
              (item) =>
                item.area ===
                text(unit.area)
            );
          }
        )
      : [];

  const allUnits: Array<
    PriceUnit | Row
  > = [
    ...units,
    ...manualOnly,
  ].sort((first, second) => {
    const firstArea =
      Number(
        text(first.area).match(
          /\d+/
        )?.[0]
      ) || 0;

    const secondArea =
      Number(
        text(second.area).match(
          /\d+/
        )?.[0]
      ) || 0;

    return (
      firstArea - secondArea
    );
  });

  const explicitMinimums =
    allUnits
      .flatMap((unit) => {
        const types =
          Array.isArray(
            unit.types
          )
            ? unit.types.filter(
                isRecord
              )
            : [];

        return [
          numberOrNull(
            unit.minPrice
          ),

          ...types.map((type) =>
            numberOrNull(
              type.minPrice
            )
          ),
        ];
      })
      .filter(
        (
          value
        ): value is number =>
          value !== null &&
          value > 0
      );

  return {
    ...existing,
    ...synced,

    minimumPrice:
      preserveManualMinimums &&
      explicitMinimums.length > 0
        ? Math.min(
            ...explicitMinimums
          )
        : null,

    averagePricePerPyeong:
      preserveManualMinimums
        ? numberOrNull(
            existing.averagePricePerPyeong
          )
        : null,

    units: allUnits,
    note: synced.note,
  };
}

async function candidateRows() {
  /*
   * 첫 페이지의 totalCount를 기준으로 필요한 페이지 수를 계산합니다.
   * totalCount가 없는 응답에도 대응할 수 있도록 마지막 페이지의
   * 데이터 개수가 PER_PAGE보다 작을 때 수집을 종료합니다.
   *
   * 청약홈 API에 한꺼번에 너무 많은 요청을 보내지 않도록
   * PAGE_BATCH_SIZE 단위로 나누어 호출합니다.
   */
  const firstPage = await fetchAPTList({
    page: 1,
    perPage: PER_PAGE,
  });

  const firstPageData = Array.isArray(firstPage.data)
    ? (firstPage.data as Row[])
    : [];

  const response = firstPage as unknown as Record<string, unknown>;

  const totalCount =
    numberOrNull(response.totalCount) ??
    numberOrNull(response.total_count) ??
    numberOrNull(response.total) ??
    numberOrNull(response.matchCount);

  const calculatedPageCount =
    totalCount !== null && totalCount > 0
      ? Math.ceil(totalCount / PER_PAGE)
      : null;

  const targetPageCount = Math.min(
    calculatedPageCount ?? MAX_PAGE_COUNT,
    MAX_PAGE_COUNT
  );

  const pages: Row[][] = [firstPageData];

  /*
   * 첫 페이지가 마지막 페이지라면 추가 요청이 필요 없습니다.
   */
  if (
    targetPageCount <= 1 ||
    firstPageData.length < PER_PAGE
  ) {
    return deduplicateCandidateRows(pages.flat());
  }

  for (
    let batchStart = 2;
    batchStart <= targetPageCount;
    batchStart += PAGE_BATCH_SIZE
  ) {
    const batchEnd = Math.min(
      batchStart + PAGE_BATCH_SIZE - 1,
      targetPageCount
    );

    const batch = await Promise.all(
      Array.from(
        {
          length: batchEnd - batchStart + 1,
        },
        (_, index) =>
          fetchAPTList({
            page: batchStart + index,
            perPage: PER_PAGE,
          })
      )
    );

    let reachedLastPage = false;

    for (const page of batch) {
      const rows = Array.isArray(page.data)
        ? (page.data as Row[])
        : [];

      pages.push(rows);

      if (rows.length < PER_PAGE) {
        reachedLastPage = true;
        break;
      }
    }

    if (reachedLastPage) {
      break;
    }
  }

  return deduplicateCandidateRows(pages.flat());
}

function deduplicateCandidateRows(rows: Row[]) {
  const unique = new Map<string, Row>();

  for (const row of rows) {
    const key = `${text(row.HOUSE_MANAGE_NO)}-${text(row.PBLANC_NO)}`;

    if (key !== "-") {
      unique.set(key, row);
    }
  }

  return [...unique.values()];
}

async function priceInfoFor(apartment: NormalizedApartment) {
  const response = await fetchAPTModelList<Row>({
    houseManageNo: apartment.houseManageNo,
    pblancNo: apartment.pblancNo,
    page: 1,
    perPage: 100,
  });

  const priceInfo = createPriceInfo(response.data);

  if (process.env.NODE_ENV !== "production") {
    console.log("[청약홈 가격 동기화]", {
      apartment: apartment.name,
      houseManageNo: apartment.houseManageNo,
      pblancNo: apartment.pblancNo,
      modelCount: response.data.length,
      firstModel: response.data[0] ?? null,
      priceInfo,
    });
  }

  return {
    rows: response.data,
    priceInfo,
  };
}

function newApartmentData(
  apartment: NormalizedApartment,
  priceInfo: PriceInfo | null,
  modelRows: Row[]
) {
  const top = priceInfo?.maximumPrice;

  return {
    slug: apartment.slug,
    city: apartment.city,
    cityName: apartment.cityName,
    district: apartment.district,
    districtName: apartment.districtName,
    region: apartment.region,
    latitude: null,
    longitude: null,
    type: "아파트",
    brand: "",
    builder: apartment.builder,
    name: apartment.name,
    images: {
      hero: null,
      location: [],
      floorPlans: [],
      community: [],
      gallery: [],
    },
    keywords: [
      apartment.name,
      `${apartment.cityName} 청약`,
      `${apartment.cityName} 분양`,
      `${apartment.name} 청약`,
      apartment.region,
      ...(priceInfo?.units ?? []).map((unit) => unit.area),
    ].filter(Boolean),
    status: apartment.status,
    price: top ? `최고 ${top.toLocaleString()}만원` : "",
    condition: "청약홈 신규 공고",
    conditionHistory: [],
    priceInfo,
    priceDetail: {
      salePrice: top ? `최고 ${top.toLocaleString()}만원` : "",
      pricePerPyeong: "",
      contractPrice: "",
      middlePayment: "",
      balance: "",
      options: [],
    },
    score: {
      total: 0,
      price: 0,
      contract: 0,
      location: 0,
      living: 0,
      future: 0,
      risk: 0,
    },
    aiReview: {
      summary:
        "청약홈에서 자동 등록된 단지입니다. 관리자 분석을 준비 중입니다.",
      liveScore: 0,
      investScore: 0,
      safetyScore: 0,
      strengths: [],
    },
    pros: [],
    cons: [],
    source: "applyhome",
    applyHomeId: apartment.applyHomeId,
    applyHomeUrl: apartment.schedule.noticeUrl,
    isAutoCreated: true,
    subscription: apartment.schedule,
    applyHome: apartment.raw,
    applyHomeModels: modelRows,
    totalSupply: apartment.totalSupply,
  };
}

async function insertApartment(
  apartment: NormalizedApartment,
  priceInfo: PriceInfo | null,
  modelRows: Row[]
) {
  const data = newApartmentData(
    apartment,
    priceInfo,
    modelRows
  );

  const { error } = await supabaseAdmin
    .from("apartments")
    .insert({
      slug: apartment.slug,
      name: apartment.name,
      brand: "",
      builder: apartment.builder,
      city: apartment.city,
      district: apartment.district,
      region: apartment.region,
      status: apartment.status,
      type: "아파트",
      score_total: 0,
      grade: "분석대기",
      hero_image: null,
      latitude: null,
      longitude: null,
      is_published: true,
      data,
      source: "applyhome",
      applyhome_id: apartment.applyHomeId,
      applyhome_house_manage_no: apartment.houseManageNo,
      applyhome_pblanc_no: apartment.pblancNo,
      is_auto_created: true,
      manual_override: false,
      sync_status: "synced",
      last_synced_at: new Date().toISOString(),
      announcement_date: apartment.schedule.announcementDate,
      special_supply_date: apartment.schedule.specialSupplyStartDate,
      first_priority_date: apartment.schedule.firstPriorityStartDate,
      second_priority_date: apartment.schedule.secondPriorityStartDate,
      winner_date: apartment.schedule.winnerDate,
      contract_start_date: apartment.schedule.contractStartDate,
      contract_end_date: apartment.schedule.contractEndDate,
      applyhome_url: apartment.schedule.noticeUrl,
    });

  if (error) throw error;
}

async function updateApartment(
  existing: Row,
  apartment: NormalizedApartment,
  syncedPriceInfo: PriceInfo | null,
  modelRows: Row[]
) {
  const existingData =
    isRecord(existing.data)
      ? existing.data
      : {};

  const existingPriceDetail =
    isRecord(
      existingData.priceDetail
    )
      ? existingData.priceDetail
      : {};

  const manualOverride =
    Boolean(
      existing.manual_override
    );

  const priceInfo =
    mergePriceInfo(
      existingData.priceInfo,
      syncedPriceInfo,
      manualOverride
    );

  const top =
    numberOrNull(
      isRecord(priceInfo)
        ? priceInfo.maximumPrice
        : null
    );

  const nextData = {
    ...existingData,
    source: "applyhome",
    applyHomeId: apartment.applyHomeId,
    applyHomeUrl: apartment.schedule.noticeUrl,
    subscription: apartment.schedule,
    applyHome: apartment.raw,
    applyHomeModels: modelRows,
    priceInfo,
    totalSupply:
      existingData.totalSupply ?? apartment.totalSupply,
    status: manualOverride
      ? existingData.status ??
        existing.status
      : apartment.status,
    price:
      manualOverride && text(existingData.price)
        ? existingData.price
        : top
          ? `최고 ${top.toLocaleString()}만원`
          : existingData.price ?? "",
    priceDetail: {
      ...existingPriceDetail,

      salePrice:
        manualOverride &&
        text(
          existingPriceDetail.salePrice
        )
          ? existingPriceDetail.salePrice
          : top
            ? `최고 ${top.toLocaleString()}만원`
            : existingPriceDetail.salePrice ??
              "",
    },
  };

  const payload: Record<string, unknown> = {
    source: "applyhome",
    applyhome_house_manage_no: apartment.houseManageNo,
    applyhome_pblanc_no: apartment.pblancNo,
    sync_status: "synced",
    last_synced_at: new Date().toISOString(),
    announcement_date: apartment.schedule.announcementDate,
    special_supply_date: apartment.schedule.specialSupplyStartDate,
    first_priority_date: apartment.schedule.firstPriorityStartDate,
    second_priority_date: apartment.schedule.secondPriorityStartDate,
    winner_date: apartment.schedule.winnerDate,
    contract_start_date: apartment.schedule.contractStartDate,
    contract_end_date: apartment.schedule.contractEndDate,
    applyhome_url: apartment.schedule.noticeUrl,
    data: nextData,
  };

  if (!manualOverride) payload.status = apartment.status;

  const { error } = await supabaseAdmin
    .from("apartments")
    .update(payload)
    .eq("applyhome_id", apartment.applyHomeId);

  if (error) throw error;
}

export async function syncApplyHomeApartments():
  Promise<ApplyHomeSyncResult> {
  const rows = await candidateRows();

  const normalized = rows
    .map(normalize)
    .filter(
      (item): item is NormalizedApartment =>
        item !== null
    );

  const targets = normalized.filter(relevant);

  const result: ApplyHomeSyncResult = {
    fetched: rows.length,
    relevant: targets.length,
    inserted: 0,
    updated: 0,
    skipped: normalized.length - targets.length,
    failed: 0,
    priceSynced: 0,
    priceMissing: 0,
    errors: [],
  };

  for (const apartment of targets) {
    try {
      let priceInfo: PriceInfo | null = null;
      let modelRows: Row[] = [];

      try {
        const priceResult = await priceInfoFor(apartment);
        priceInfo = priceResult.priceInfo;
        modelRows = priceResult.rows;

        if (priceInfo) {
          result.priceSynced += 1;
        } else {
          result.priceMissing += 1;
        }
      } catch (error) {
        result.priceMissing += 1;
        result.errors.push(
          `${apartment.name} 가격조회: ${
            error instanceof Error
              ? error.message
              : "알 수 없는 오류"
          }`
        );
      }

      const { data: existing, error } = await supabaseAdmin
        .from("apartments")
        .select(
          "slug, status, data, manual_override, is_auto_created, sync_status"
        )
        .eq("applyhome_id", apartment.applyHomeId)
        .maybeSingle();

      if (error) throw error;

      if (
        existing &&
        existing.sync_status ===
          "excluded"
      ) {
        result.skipped += 1;
        continue;
      }

      if (existing) {
        await updateApartment(
          existing,
          apartment,
          priceInfo,
          modelRows
        );
        result.updated += 1;
      } else {
        await insertApartment(
          apartment,
          priceInfo,
          modelRows
        );
        result.inserted += 1;
      }
    } catch (error) {
      result.failed += 1;
      result.errors.push(
        `${apartment.name}: ${
          error instanceof Error
            ? error.message
            : "알 수 없는 오류"
        }`
      );
    }
  }

  return result;
}
