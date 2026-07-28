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

  const now =
    new Date();

  const staticPages: MetadataRoute.Sitemap =
    [
      {
        url: SITE_URL,
        lastModified: now,
        changeFrequency:
          "daily",
        priority: 1,
      },

      {
        url:
          `${SITE_URL}/region`,
        lastModified: now,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/briefing`,
        lastModified: now,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/compare`,
        lastModified: now,
        changeFrequency:
          "weekly",
        priority: 0.5,
      },
    ];

  /*
   * /search는 noindex 페이지이므로 사이트맵에서 제외합니다.
   */
  const regionPages: MetadataRoute.Sitemap =
    regions.map(
      (region) => ({
        url:
          `${SITE_URL}/region/${encodeURIComponent(
            region
          )}`,
        lastModified: now,
        changeFrequency:
          "daily",
        priority: 0.8,
      })
    );

  const apartmentPages: MetadataRoute.Sitemap =
    publicApartments.map(
      (apartment) => ({
        url:
          `${SITE_URL}/apartments/${encodeURIComponent(
            apartment.slug
          )}`,
        lastModified: now,
        changeFrequency:
          "daily",
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
          apartment.images
            ?.hero
            ? [
                apartment.images
                  .hero,
              ]
            : undefined,
      })
    );

  const briefingPages: MetadataRoute.Sitemap =
    publicBriefings.map(
      (briefing) => ({
        url:
          `${SITE_URL}/briefing/${encodeURIComponent(
            briefing.slug
          )}`,
        lastModified:
          briefing.updatedAt
            ? new Date(
                briefing.updatedAt
              )
            : now,
        changeFrequency:
          "weekly",
        priority: 0.7,

        images:
          briefing.thumbnailUrl
            ? [
                briefing.thumbnailUrl,
              ]
            : undefined,
      })
    );

  return [
    ...staticPages,
    ...regionPages,
    ...apartmentPages,
    ...briefingPages,
  ];
}
