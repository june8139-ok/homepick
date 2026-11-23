export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function ogImageUrl(
  site: string,
  kind: "apartment" | "briefing" | `apartment-${string}`,
  slug: string,
  updatedAt?: string | null,
) {
  const url = new URL(`/og/${kind}/${encodeURIComponent(slug)}`, site);
  url.searchParams.set("v", updatedAt ? `1-${updatedAt}` : "1");
  return url.href;
}
