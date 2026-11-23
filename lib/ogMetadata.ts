export const OG_SIZE = { width: 1200, height: 630 };
export const OG_DESIGN_VERSION = "3";
export const HOME_OG_IMAGE = `/opengraph-image?v=${OG_DESIGN_VERSION}`;
export const OG_CONTENT_TYPE = "image/png";

export function ogImageUrl(
  site: string,
  kind: "apartment" | "briefing" | `apartment-${string}`,
  slug: string,
  updatedAt?: string | null,
) {
  const url = new URL(`/og/${kind}/${encodeURIComponent(slug)}`, site);
  const version = kind === "briefing" ? OG_DESIGN_VERSION : "2";
  url.searchParams.set("v", updatedAt ? `${version}-${updatedAt}` : version);
  return url.href;
}
