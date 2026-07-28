import {
  getApartments,
} from "../../lib/getApartments";

import {
  getBriefings,
} from "../../lib/getBriefings";

import {
  isCompletedListing,
} from "../../lib/listingStage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

function escapeXml(
  value: unknown
) {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&apos;"
    );
}

function getApartmentDescription(
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


function getBriefingDescription(
  briefing: {
    title: string;
    summary?: string;
    content?: string;
    category?: string;
    region?: string | null;
  }
) {
  return (
    briefing.summary ||
    [
      briefing.title,
      briefing.category,
      briefing.region,
      briefing.content,
    ]
      .filter(Boolean)
      .join(" · ")
  );
}

function getItemDate(
  apartment: unknown
) {
  if (
    !apartment ||
    typeof apartment !==
      "object"
  ) {
    return null;
  }

  const record =
    apartment as Record<
      string,
      unknown
    >;

  const rawDate =
    record.updatedAt ??
    record.updated_at ??
    record.createdAt ??
    record.created_at;

  if (
    typeof rawDate !==
      "string" ||
    !rawDate
  ) {
    return null;
  }

  const parsedDate =
    new Date(rawDate);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate.toUTCString();
}

export async function GET() {
  const [
    apartments,
    briefings,
  ] = await Promise.all([
    getApartments({
      publishedOnly: true,
    }),

    getBriefings({
      publishedOnly: true,
    }),
  ]);

  const apartmentItems =
    apartments
      .filter(
        (apartment) =>
          apartment.slug &&
          !isCompletedListing(
            apartment
          )
      )
      .map(
        (apartment) => ({
          sortDate:
            getItemDate(
              apartment
            ),

          xml: (() => {
            const url =
              `${SITE_URL}/apartments/${encodeURIComponent(
                apartment.slug
              )}`;

            const pubDate =
              getItemDate(
                apartment
              );

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
        getApartmentDescription(
          apartment
        )
      )}</description>
      <category>${escapeXml(
        apartment.status ||
          "분양정보"
      )}</category>${
        pubDate
          ? `
      <pubDate>${escapeXml(
        pubDate
      )}</pubDate>`
          : ""
      }
    </item>`;
          })(),
        })
      );

  const briefingItems =
    briefings
      .filter(
        (briefing) =>
          Boolean(
            briefing.slug
          )
      )
      .map(
        (briefing) => {
          const url =
            `${SITE_URL}/briefing/${encodeURIComponent(
              briefing.slug
            )}`;

          const pubDate =
            getItemDate({
              updatedAt:
                briefing.updatedAt,
              publishedAt:
                briefing.publishedAt,
              createdAt:
                briefing.createdAt,
            });

          return {
            sortDate:
              pubDate,

            xml: `
    <item>
      <title>${escapeXml(
        briefing.title
      )}</title>
      <link>${escapeXml(
        url
      )}</link>
      <guid isPermaLink="true">${escapeXml(
        url
      )}</guid>
      <description>${escapeXml(
        getBriefingDescription(
          briefing
        )
      )}</description>
      <category>${escapeXml(
        briefing.category ||
          "집눈 브리핑"
      )}</category>${
        pubDate
          ? `
      <pubDate>${escapeXml(
        pubDate
      )}</pubDate>`
          : ""
      }
    </item>`,
          };
        }
      );

  const items =
    [
      ...apartmentItems,
      ...briefingItems,
    ]
      .sort(
        (first, second) => {
          const firstTime =
            first.sortDate
              ? new Date(
                  first.sortDate
                ).getTime()
              : 0;

          const secondTime =
            second.sortDate
              ? new Date(
                  second.sortDate
                ).getTime()
              : 0;

          return (
            secondTime -
            firstTime
          );
        }
      )
      .slice(0, 50)
      .map(
        (item) =>
          item.xml
      )
      .join("");

  const now =
    new Date().toUTCString();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>
<rss
  version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
>
  <channel>
    <title>집눈 분양정보·브리핑</title>

    <link>${escapeXml(
      SITE_URL
    )}</link>

    <atom:link
      href="${escapeXml(
        `${SITE_URL}/rss.xml`
      )}"
      rel="self"
      type="application/rss+xml"
    />

    <description>집눈에서 제공하는 전국 분양 아파트, 청약 일정, 선착순 분양 단지, 계약조건과 부동산 브리핑</description>

    <language>ko-KR</language>

    <lastBuildDate>${escapeXml(
      now
    )}</lastBuildDate>

    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

  return new Response(
    xml,
    {
      headers: {
        "Content-Type":
          "application/rss+xml; charset=utf-8",

        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
