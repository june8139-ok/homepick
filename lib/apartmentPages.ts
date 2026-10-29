import type { Apartment } from "../types/apartment";
import { isCompletedListing } from "./listingStage";
export const detailSections = [
  "overview",
  "pricing",
  "plans",
  "location",
] as const;
export type DetailSection = (typeof detailSections)[number];
export type UnitEditorial = {
  exclusiveArea?: string;
  supplyArea?: string;
  rooms?: string;
  bathrooms?: string;
  layout?: string;
  notes?: string;
};
export type DetailPageContent = {
  mode?: "auto" | "hidden";
  published?: boolean;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  source?: string;
  checkedAt?: string;
  images?: string[];
  fields?: Record<string, string>;
  faqs?: { question: string; answer: string }[];
  unitDetails?: Record<string, UnitEditorial>;
};
export type DetailPages = Partial<Record<DetailSection, DetailPageContent>>;
export const sectionLabels: Record<DetailSection, string> = {
  overview: "사업개요",
  pricing: "분양가·계약조건",
  plans: "평형안내",
  location: "입지환경",
};
export const paymentFields = [
  ["depositTotal", "계약금 총액·비율"],
  ["depositFirst", "1차 계약금"],
  ["depositRemainder", "나머지 계약금·납부 시점"],
  ["middlePayment", "중도금 비율·납부·이자"],
  ["balance", "잔금·납부 시점"],
  ["options", "발코니·옵션 비용"],
  ["benefitConditions", "지원 혜택·적용 대상·지급 시점"],
  ["cautions", "계약 전 확인사항"],
] as const;
export const overviewExtraFields = [
  ["buildings", "동수"],
  ["floors", "층수"],
  ["siteArea", "대지면적"],
  ["buildingArea", "건축면적"],
  ["floorAreaRatio", "용적률"],
  ["buildingCoverageRatio", "건폐율"],
] as const;
export function isDetailSection(v: string): v is DetailSection {
  return detailSections.some((k) => k === v);
}
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const text = (v: unknown, max = 1000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export function validImage(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^(?:\/(?!\/)|https?:\/\/)/.test(v) &&
    !v.includes("/default/")
  );
}
export function normalizeDetailPages(value: unknown): DetailPages {
  const root = record(value);
  const result: DetailPages = {};
  for (const key of detailSections) {
    if (!root[key] || typeof root[key] !== "object") continue;
    const raw = record(root[key]);
    const c: DetailPageContent = {};
    // 과거 published:false는 빈 편집폼의 기본값이었으므로 숨김 의도로 해석하지 않습니다.
    if (raw.mode === "hidden" || raw.mode === "auto") c.mode = raw.mode;
    if (typeof raw.published === "boolean") c.published = raw.published;
    for (const field of [
      "body",
      "seoTitle",
      "seoDescription",
      "source",
      "checkedAt",
    ] as const) {
      if (typeof raw[field] === "string")
        c[field] = text(
          raw[field],
          field === "body"
            ? 20000
            : field === "seoTitle"
              ? 100
              : field === "seoDescription"
                ? 250
                : 1000,
        );
    }
    if (Array.isArray(raw.images))
      c.images = [...new Set(raw.images.filter(validImage))].slice(0, 30);
    if (raw.fields) {
      c.fields = {};
      for (const [name] of [...paymentFields, ...overviewExtraFields]) {
        const s = text(record(raw.fields)[name], 4000);
        if (s) c.fields[name] = s;
      }
    }
    if (Array.isArray(raw.faqs))
      c.faqs = raw.faqs
        .slice(0, 10)
        .map((v) => ({
          question: text(record(v).question, 300),
          answer: text(record(v).answer, 4000),
        }));
    if (raw.unitDetails) {
      c.unitDetails = {};
      for (const [name, v] of Object.entries(record(raw.unitDetails)).slice(
        0,
        100,
      )) {
        const row: UnitEditorial = {};
        for (const k of [
          "exclusiveArea",
          "supplyArea",
          "rooms",
          "bathrooms",
          "layout",
          "notes",
        ] as const) {
          const t = text(record(v)[k], k === "notes" ? 3000 : 200);
          if (t) row[k] = t;
        }
        if (Object.keys(row).length) c.unitDetails[text(name, 150)] = row;
      }
    }
    result[key] = c;
  }
  return result;
}
export function detailHref(slug: string, section?: DetailSection) {
  return `/apartments/${encodeURIComponent(slug)}${section ? `/${section}` : ""}`;
}
export function overviewRows(a: Apartment) {
  const p = a.projectInfo || {},
    extra = a.detailPages?.overview?.fields || {};
  return [
    ["사업지 위치", a.region],
    ["건축 용도", p.usage || a.type],
    ["시행사", p.developer],
    ["시공사", a.builder],
    ["건축 규모", p.scale],
    ["총 세대수", p.totalHouseholds || String(a.totalSupply || "")],
    ["일반분양 세대수", p.saleHouseholds],
    ["주차", p.parking],
    ["입주예정", p.moveInDate],
    ...overviewExtraFields.map(([k, label]) => [label, extra[k] || p[k]]),
  ].filter(([, v]) => !!v) as [string, string][];
}
export function locationRows(a: Apartment) {
  const p = a.locationInfo || {};
  return [
    ["교통", p.transport],
    ["교육·통학", p.education],
    ["생활 편의", p.living],
    ["직주근접", p.jobAccess],
    ["자연환경", p.nature],
    ["개발계획", p.futureValue],
    ["확인사항", p.cautions],
  ].filter(([, v]) => !!v?.trim()) as [string, string][];
}
export function paymentRows(a: Apartment) {
  const p = a.detailPages?.pricing?.fields || {};
  return paymentFields
    .map(([key, label]) => [
      label,
      p[key] ||
        (key === "depositTotal"
          ? a.priceDetail?.contractPrice
          : key === "middlePayment"
            ? a.priceDetail?.middlePayment
            : key === "balance"
              ? a.priceDetail?.balance
              : key === "options"
                ? a.priceDetail?.options?.join(" · ")
                : ""),
    ])
    .filter(([, v]) => !!v?.trim()) as [string, string][];
}
export function sectionImages(a: Apartment, key: DetailSection) {
  if (key === "plans")
    return a.images.floorPlans
      .filter((p) => validImage(p.url))
      .map((p) => p.url);
  if (key === "location") return a.images.location.filter(validImage);
  return (a.detailPages?.[key]?.images || []).filter(validImage);
}
export function hasSectionContent(a: Apartment, key: DetailSection) {
  const body = a.detailPages?.[key]?.body?.trim();
  if (key === "overview")
    return (
      overviewRows(a).length >= 2 || !!body || sectionImages(a, key).length > 0
    );
  if (key === "pricing")
    return !!(
      a.price?.trim() ||
      a.contractDetails?.trim() ||
      a.condition?.trim() ||
      a.priceInfo?.units?.length ||
      paymentRows(a).length ||
      body ||
      sectionImages(a, key).length
    );
  if (key === "plans") return sectionImages(a, key).length > 0 || !!body;
  return (
    locationRows(a).length > 0 || sectionImages(a, key).length > 0 || !!body
  );
}
export function getDetailSections(a: Apartment): DetailSection[] {
  if (isCompletedListing(a)) return [];
  return detailSections.filter(
    (k) => a.detailPages?.[k]?.mode !== "hidden" && hasSectionContent(a, k),
  );
}
export function overviewIntroduction(a: Apartment) {
  const p = a.projectInfo;
  return [
    `${a.name}의 사업개요입니다.`,
    a.region ? `사업지는 ${a.region}입니다.` : "",
    p?.scale ? `건축 규모는 ${p.scale}입니다.` : "",
    p?.totalHouseholds ? `총 ${p.totalHouseholds} 규모입니다.` : "",
    p?.moveInDate
      ? `입주 일정은 ${p.moveInDate} 기준으로 안내되어 있습니다.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}
export function detailDescription(a: Apartment, key: DetailSection) {
  const c = a.detailPages?.[key];
  const facts =
    key === "overview"
      ? overviewRows(a)
      : key === "pricing"
        ? paymentRows(a)
        : key === "location"
          ? locationRows(a)
          : a.images.floorPlans.map((p) => [p.name, "평면도"]);
  const base =
    c?.seoDescription?.trim() ||
    c?.body?.trim() ||
    facts.map(([k, v]) => `${k}: ${v}`).join(" · ") ||
    (key === "pricing"
      ? `${a.price} ${a.condition}`
      : `${a.name}의 타입별 면적과 평면 정보를 확인하세요.`);
  return `${a.name} ${sectionLabels[key]}. ${base.replace(/\s+/g, " ").slice(0, 160)}`;
}
