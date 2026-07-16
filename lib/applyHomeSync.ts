import { fetchAPTList } from "./apiDataGo";
import { supabaseAdmin } from "./supabaseAdmin";

type ApplyHomeRow = Record<string, unknown>;

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
  applyHomeUrl: string | null;
};

type NormalizedApplyHomeApartment = {
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
  raw: ApplyHomeRow;
};

export type ApplyHomeSyncResult = {
  fetched: number;
  relevant: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
};

const AUTO_SYNC_PAGE_COUNT = 3;
const AUTO_SYNC_PER_PAGE = 100;
const RECENT_ANNOUNCEMENT_DAYS = 45;

const CITY_NAME_MAP: Record<string, string> = {
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

function nullableText(value: unknown) {
  const result = text(value);
  return result || null;
}

function numberOrNull(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
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

function startOfKoreaToday() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${today}T00:00:00+09:00`);
}

function addDays(date: Date, days: number) {
  const copied = new Date(date);
  copied.setDate(copied.getDate() + days);
  return copied;
}

function isBetween(today: Date, start: Date | null, end: Date | null) {
  if (!start && !end) return false;
  const resolvedStart = start ?? end!;
  const resolvedEnd = end ?? start!;
  return today >= resolvedStart && today <= resolvedEnd;
}

function createSlug(name: string, pblancNo: string) {
  const namePart = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const idPart = pblancNo.replace(/[^\dA-Za-z]/g, "").slice(-8);
  return `${namePart || "applyhome-apartment"}-${idPart || Date.now()}`;
}

function extractLocation(region: string) {
  const parts = region.split(/\s+/).filter(Boolean);
  const province = parts[0] ?? "";
  const district = parts[1] ?? "";

  return {
    cityName: CITY_NAME_MAP[province] ?? province,
    districtName: district,
  };
}

function createSchedule(row: ApplyHomeRow): SubscriptionSchedule {
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
    applyHomeUrl: nullableText(row.PBLANC_URL),
  };
}

function calculateApplyHomeStatus(schedule: SubscriptionSchedule) {
  const today = startOfKoreaToday();
  const specialStart = parseDate(schedule.specialSupplyStartDate);
  const specialEnd = parseDate(schedule.specialSupplyEndDate);
  const firstStart = parseDate(schedule.firstPriorityStartDate);
  const firstEnd = parseDate(schedule.firstPriorityEndDate);
  const secondStart = parseDate(schedule.secondPriorityStartDate);
  const secondEnd = parseDate(schedule.secondPriorityEndDate);
  const winner = parseDate(schedule.winnerDate);
  const contractStart = parseDate(schedule.contractStartDate);
  const contractEnd = parseDate(schedule.contractEndDate);

  if (isBetween(today, contractStart, contractEnd)) return "계약중";

  if (
    isBetween(today, specialStart, specialEnd) ||
    isBetween(today, firstStart, firstEnd) ||
    isBetween(today, secondStart, secondEnd)
  ) {
    return "청약중";
  }

  const applicationEnd =
    secondEnd ?? secondStart ?? firstEnd ?? firstStart ?? specialEnd ?? specialStart;

  if (
    winner &&
    applicationEnd &&
    today > applicationEnd &&
    today <= (contractStart ?? addDays(winner, 14))
  ) {
    return "당첨자발표";
  }

  const firstApplicationDate = specialStart ?? firstStart ?? secondStart;
  if (firstApplicationDate && today < firstApplicationDate) return "청약예정";
  if (contractEnd && today > contractEnd) return "청약마감";
  if (winner && today >= winner) return "당첨자발표";
  return "청약예정";
}

function normalizeApplyHomeRow(
  row: ApplyHomeRow
): NormalizedApplyHomeApartment | null {
  const houseManageNo = text(row.HOUSE_MANAGE_NO);
  const pblancNo = text(row.PBLANC_NO);
  const name = text(row.HOUSE_NM);
  const region = text(row.HSSPLY_ADRES);

  if (!houseManageNo || !pblancNo || !name) return null;

  const applyHomeId = `${houseManageNo}-${pblancNo}`;
  const location = extractLocation(region);
  const schedule = createSchedule(row);

  return {
    applyHomeId,
    houseManageNo,
    pblancNo,
    slug: createSlug(name, pblancNo),
    name,
    region,
    city: location.cityName.toLowerCase().replace(/\s+/g, "-"),
    cityName: location.cityName,
    district: location.districtName.toLowerCase().replace(/\s+/g, "-"),
    districtName: location.districtName,
    builder: text(row.CNSTRCT_ENTRPS_NM) || text(row.BSNS_MBY_NM),
    totalSupply: numberOrNull(row.TOT_SUPLY_HSHLDCO),
    status: calculateApplyHomeStatus(schedule),
    schedule,
    raw: row,
  };
}

function isRelevantApartment(apartment: NormalizedApplyHomeApartment) {
  const today = startOfKoreaToday();
  const recentLimit = addDays(today, -RECENT_ANNOUNCEMENT_DAYS);
  const announcement = parseDate(apartment.schedule.announcementDate);

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

async function fetchCandidateRows() {
  const pages = await Promise.all(
    Array.from({ length: AUTO_SYNC_PAGE_COUNT }, (_, index) =>
      fetchAPTList({
        page: index + 1,
        perPage: AUTO_SYNC_PER_PAGE,
      })
    )
  );

  const rows = pages.flatMap((page) =>
    Array.isArray(page?.data) ? page.data : []
  ) as ApplyHomeRow[];

  const unique = new Map<string, ApplyHomeRow>();

  rows.forEach((row) => {
    const key = `${text(row.HOUSE_MANAGE_NO)}-${text(row.PBLANC_NO)}`;
    if (key !== "-") unique.set(key, row);
  });

  return [...unique.values()];
}

function createNewApartmentData(apartment: NormalizedApplyHomeApartment) {
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
    ].filter(Boolean),
    status: apartment.status,
    price: "",
    condition: "청약홈 신규 공고",
    conditionHistory: [],
    priceDetail: {
      salePrice: "",
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
      summary: "청약홈에서 자동 등록된 단지입니다. 관리자 분석을 준비 중입니다.",
      liveScore: 0,
      investScore: 0,
      safetyScore: 0,
      strengths: [],
    },
    pros: [],
    cons: [],
    source: "applyhome",
    applyHomeId: apartment.applyHomeId,
    isAutoCreated: true,
    subscription: apartment.schedule,
    applyHome: apartment.raw,
    totalSupply: apartment.totalSupply,
  };
}

async function insertApartment(apartment: NormalizedApplyHomeApartment) {
  const data = createNewApartmentData(apartment);

  const { error } = await supabaseAdmin.from("apartments").insert({
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
    applyhome_url: apartment.schedule.applyHomeUrl,
  });

  if (error) throw error;
}

async function updateApartment(
  existing: Record<string, any>,
  apartment: NormalizedApplyHomeApartment
) {
  const existingData = existing.data ?? {};
  const manualOverride = Boolean(existing.manual_override);

  const nextData = {
    ...existingData,
    source: "applyhome",
    applyHomeId: apartment.applyHomeId,
    subscription: apartment.schedule,
    applyHome: apartment.raw,
    totalSupply: existingData.totalSupply ?? apartment.totalSupply,
    status: manualOverride
      ? existingData.status ?? existing.status
      : apartment.status,
  };

  const updatePayload: Record<string, unknown> = {
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
    applyhome_url: apartment.schedule.applyHomeUrl,
    data: nextData,
  };

  if (!manualOverride) updatePayload.status = apartment.status;

  const { error } = await supabaseAdmin
    .from("apartments")
    .update(updatePayload)
    .eq("applyhome_id", apartment.applyHomeId);

  if (error) throw error;
}

export async function syncApplyHomeApartments(): Promise<ApplyHomeSyncResult> {
  const rows = await fetchCandidateRows();

  const normalized = rows
    .map(normalizeApplyHomeRow)
    .filter(
      (apartment): apartment is NormalizedApplyHomeApartment =>
        apartment !== null
    );

  const relevant = normalized.filter(isRelevantApartment);

  const result: ApplyHomeSyncResult = {
    fetched: rows.length,
    relevant: relevant.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const apartment of relevant) {
    try {
      const { data: existing, error: selectError } = await supabaseAdmin
        .from("apartments")
        .select("slug, status, data, manual_override, is_auto_created")
        .eq("applyhome_id", apartment.applyHomeId)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        await updateApartment(existing, apartment);
        result.updated += 1;
      } else {
        await insertApartment(apartment);
        result.inserted += 1;
      }
    } catch (error) {
      result.failed += 1;
      result.errors.push(
        `${apartment.name}: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    }
  }

  result.skipped = normalized.length - relevant.length;
  return result;
}
