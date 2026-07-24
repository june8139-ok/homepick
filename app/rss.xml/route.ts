import { getApartments } from "../../lib/getApartments";
import { isCompletedListing } from "../../lib/listingStage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://homepick.co.kr";

function escapeXml(
  value: unknown
) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getDescription(
  apartment: {
    name: string;
    region?: string;
    status?: string;
    price?: string;
    condition?: string;
  }
) {
  return [
    apartment.name,
    apartment.status,
    apartment.region,
    apartment.price,
    apartment.condition,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function GET() {
  const apartments =
    await getApartments({
      publishedOnly: true,
    });

  const items = apartments
    .filter(
      (apartment) =>
        apartment.slug &&
        !isCompletedListing(
          apartment
        )
    )
    .slice(0, 30)
    .map((apartment) => {
      const url =
        `${SITE_URL}/apartments/${encodeURIComponent(
          apartment.slug
        )}`;

      return `
        <item>
          <title>${escapeXml(
            apartment.name
          )}</title>

          <link>${escapeXml(
            url
          )}</link>

          <guid isPermaLink="true">${escapeXml(
            url
          )}</guid>

          <description>${escapeXml(
            getDescription(
              apartment
            )
          )}</description>

          <category>${escapeXml(
            apartment.status ||
              "분양정보"
          )}</category>
        </item>
      `;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>홈픽(HomePick) 분양정보</title>
    <link>${SITE_URL}</link>

    <description>
       홈픽(HomePick)에서 제공하는 전국 분양 아파트, 청약 일정, 선착순 분양 단지와 계약조건 정보
    </description>

    <language>ko-KR</language>

    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

    <ttl>60</ttl>

    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type":
        "application/rss+xml; charset=utf-8",

      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}