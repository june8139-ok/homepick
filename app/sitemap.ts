import type {
  MetadataRoute,
} from "next";

import {
  getApartments,
} from "../lib/getApartments";

import {
  getBriefings,
} from "../lib/getBriefings";

import {
  getListingStage,
  isCompletedListing,
} from "../lib/listingStage";

import {
  getApartmentRegionKey,
} from "../lib/regionUtils";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";


function absoluteUrl(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  try {
    return new URL(
      value,
      SITE_URL
    ).toString();
  } catch {
    return null;
  }
}

function validDate(
  value: unknown
) {
  if (
    typeof value !== "string" ||
    !value
  ) {
    return undefined;
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? undefined
    : date;
}

function getApartmentModifiedDate(
  apartment: unknown
) {
  const record =
    apartment as Record<
      string,
      unknown
    >;

  return validDate(
    record.updatedAt ??
      record.updated_at ??
      record.createdAt ??
      record.created_at
  );
}

function getBriefingModifiedDate(
  briefing: {
    updatedAt?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
  }
) {
  return validDate(
    briefing.updatedAt ??
      briefing.publishedAt ??
      briefing.createdAt
  );
}

function getLatestDate(
  dates: Array<
    Date | undefined
  >
) {
  const timestamps =
    dates
      .filter(
        (
          date
        ): date is Date =>
          Boolean(date)
      )
      .map(
        (date) =>
          date.getTime()
      );

  if (
    timestamps.length === 0
  ) {
    return undefined;
  }

  return new Date(
    Math.max(...timestamps)
  );
}

export const revalidate =
  3600;

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
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

  const publicApartments =
    apartments.filter(
      (apartment) =>
        Boolean(
          apartment.slug
        ) &&
        !isCompletedListing(
          apartment
        )
    );

  const publicBriefings =
    briefings.filter(
      (briefing) =>
        Boolean(
          briefing.slug
        )
    );

  const regions =
    Array.from(
      new Set(
        publicApartments
          .map(
            getApartmentRegionKey
          )
          .filter(
            (
              region
            ): region is Exclude<
              ReturnType<
                typeof getApartmentRegionKey
              >,
              ""
            > =>
              Boolean(region)
          )
      )
    );

  const allApartmentLatest =
    getLatestDate(
      publicApartments.map(
        getApartmentModifiedDate
      )
    );

  const subscriptionLatest =
    getLatestDate(
      publicApartments
        .filter(
          (apartment) =>
            getListingStage(
              apartment
            ) ===
            "subscription"
        )
        .map(
          getApartmentModifiedDate
        )
    );

  const firstComeLatest =
    getLatestDate(
      publicApartments
        .filter(
          (apartment) =>
            getListingStage(
              apartment
            ) ===
            "firstCome"
        )
        .map(
          getApartmentModifiedDate
        )
    );

  const briefingLatest =
    getLatestDate(
      publicBriefings.map(
        getBriefingModifiedDate
      )
    );

  const homeLatest =
    getLatestDate([
      allApartmentLatest,
      briefingLatest,
    ]);

  const staticPages: MetadataRoute.Sitemap =
    [
      {
        url: SITE_URL,
        lastModified:
          homeLatest,
        changeFrequency:
          "daily",
        priority: 1,
      },

      {
        url:
          `${SITE_URL}/region`,
        lastModified:
          allApartmentLatest,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/search`,
        lastModified:
          allApartmentLatest,
        changeFrequency:
          "daily",
        priority: 0.85,
      },

      {
        url:
          `${SITE_URL}/subscription`,
        lastModified:
          subscriptionLatest,
        changeFrequency:
          "daily",
        priority: 0.9,
      },

      {
        url:
          `${SITE_URL}/first-come`,
        lastModified:
          firstComeLatest,
        changeFrequency:
          "daily",
        priority: 0.9,
      },

      {
        url:
          `${SITE_URL}/briefing`,
        lastModified:
          briefingLatest,
        changeFrequency:
          "daily",
        priority: 0.8,
      },
    ];

  const regionPages: MetadataRoute.Sitemap =
    regions.map(
      (region) => {
        const regionLatest =
          getLatestDate(
            publicApartments
              .filter(
                (apartment) =>
                  getApartmentRegionKey(
                    apartment
                  ) === region
              )
              .map(
                getApartmentModifiedDate
              )
          );

        return {
          url:
            `${SITE_URL}/region/${encodeURIComponent(
              region
            )}`,
          lastModified:
            regionLatest,
          changeFrequency:
            "daily",
          priority: 0.8,
        };
      }
    );

  const apartmentPages: MetadataRoute.Sitemap =
    publicApartments.map(
      (apartment) => {
        const image =
          absoluteUrl(
            typeof apartment.images
              ?.hero ===
              "string"
              ? apartment.images
                  .hero
              : null
          );

        return {
          url:
            `${SITE_URL}/apartments/${encodeURIComponent(
              apartment.slug
            )}`,

          lastModified:
            getApartmentModifiedDate(
              apartment
            ),

          changeFrequency:
            "daily" as const,

          priority:
            apartment.status?.includes(
              "청약"
            ) ||
            apartment.status?.includes(
              "선착순"
            )
              ? 0.9
              : 0.7,

          images:
            image
              ? [image]
              : undefined,
        };
      }
    );

  const briefingPages: MetadataRoute.Sitemap =
    publicBriefings.map(
      (briefing) => {
        const image =
          absoluteUrl(
            briefing.thumbnailUrl
          );

        return {
          url:
            `${SITE_URL}/briefing/${encodeURIComponent(
              briefing.slug
            )}`,

          lastModified:
            getBriefingModifiedDate(
              briefing
            ),

          changeFrequency:
            "weekly" as const,

          priority: 0.7,

          images:
            image
              ? [image]
              : undefined,
        };
      }
    );

  return [
    ...staticPages,
    ...regionPages,
    ...apartmentPages,
    ...briefingPages,
  ];
}
