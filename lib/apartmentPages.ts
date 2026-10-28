import type { Apartment } from "../types/apartment";
export const detailSections = [
  "overview",
  "pricing",
  "plans",
  "location",
] as const;
export type DetailSection = (typeof detailSections)[number];
export type DetailPageContent = {
  published?: boolean;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  source?: string;
  checkedAt?: string;
};
export type DetailPages = Partial<Record<DetailSection, DetailPageContent>>;
export const sectionLabels: Record<DetailSection, string> = {
  overview: "사업개요",
  pricing: "분양가·계약조건",
  plans: "평형·평면도",
  location: "입지환경",
};
export function isDetailSection(value: string): value is DetailSection {
  return detailSections.some((key) => key === value);
}
export function normalizeDetailPages(value: unknown): DetailPages {
  if (!value || typeof value !== "object") return {};
  const result: DetailPages = {};
  for (const key of detailSections) {
    const raw = (value as Record<string, unknown>)[key];
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;
    result[key] = { published: record.published === true };
    for (const field of [
      "body",
      "seoTitle",
      "seoDescription",
      "source",
      "checkedAt",
    ] as const) {
      if (typeof record[field] === "string")
        result[key]![field] = record[field]
          .trim()
          .slice(0, field === "body" ? 20000 : 1000);
    }
  }
  return result;
}
export function getDetailSections(a: Apartment): DetailSection[] {
  return detailSections.filter((key) => {
    const content = a.detailPages?.[key];
    // 공개를 선택하고 독립적인 설명을 작성한 페이지만 노출합니다.
    if (!content?.published || (content.body?.trim().length ?? 0) < 80)
      return false;
    if (key === "plans") return a.images.floorPlans.length > 0;
    if (key === "pricing")
      return Boolean(a.priceInfo?.units.length || a.price || a.contractDetails);
    return true;
  });
}
export function detailHref(slug: string, section?: DetailSection) {
  return `/apartments/${encodeURIComponent(slug)}${section ? `/${section}` : ""}`;
}
export function detailDescription(a: Apartment, key: DetailSection) {
  const c = a.detailPages?.[key];
  return `${a.name} ${sectionLabels[key]}. ${(c?.seoDescription || c?.body || "").replace(/\s+/g, " ").slice(0, 145)}`;
}
