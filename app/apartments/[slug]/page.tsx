import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { conditionHistories } from "../../../data/history";

import { getApartment } from "../../../lib/getApartment";
import { getApartments } from "../../../lib/getApartments";
import { getBriefings } from "../../../lib/getBriefings";

import {
  getListingStage,
  isCompletedListing,
  isSubscriptionListing,
} from "../../../lib/listingStage";

import ApartmentHero from "../../../components/Apartment/ApartmentHero";
import SubscriptionDetail from "../../../components/Apartment/SubscriptionDetail";
import SaleDetail from "../../../components/Apartment/SaleDetail";
import RelatedApartments from "../../../components/Apartment/RelatedApartments";
import RelatedBriefings from "../../../components/Apartment/RelatedBriefings";
import ApartmentFAQ, {
  getApartmentFaqItems,
} from "../../../components/Apartment/ApartmentFAQ";

import type { Apartment } from "../../../types/apartment";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://homepick.kr";

function getHeroImage(
  apartment?: Apartment | null
) {
  if (!apartment) {
    return "";
  }

  const hero = apartment.images?.hero;

  if (
    typeof hero === "string" &&
    hero.trim() &&
    !hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        Boolean(image) &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
}

function cleanText(
  value?: string | null
) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(
  value: string,
  maximum = 155
) {
  if (value.length <= maximum) {
    return value;
  }

  return `${value.slice(
    0,
    maximum - 1
  ).trim()}…`;
}

function parseHouseholdCount(
  value?: string | number | null
) {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  ) {
    return Math.round(value);
  }

  const parsed = Number(
    String(value ?? "")
      .replace(/,/g, "")
      .replace(/[^\d]/g, "")
  );

  return Number.isFinite(parsed) &&
    parsed > 0
    ? parsed
    : undefined;
}

function getStatusKeyword(
  apartment: Apartment
) {
  const listingStage =
    getListingStage(apartment);

  if (
    listingStage === "subscription"
  ) {
    return apartment.status ||
      "청약 정보";
  }

  if (
    listingStage === "firstCome"
  ) {
    return "선착순 분양";
  }

  return apartment.status ||
    "분양 정보";
}

function getSeoTitle(
  apartment: Apartment
) {
  const listingStage =
    getListingStage(apartment);

  const city =
    apartment.cityName ||
    apartment.city ||
    "";

  const locationPrefix =
    city &&
    !apartment.name.includes(city)
      ? `${city} `
      : "";

  if (
    listingStage === "subscription"
  ) {
    return `${locationPrefix}${apartment.name} 청약일정·분양가`;
  }

  if (
    listingStage === "firstCome"
  ) {
    return `${locationPrefix}${apartment.name} 선착순 분양가·계약조건`;
  }

  return `${locationPrefix}${apartment.name} 분양정보`;
}

function getSeoDescription(
  apartment: Apartment
) {
  const status =
    getStatusKeyword(apartment);

  const summaryParts = [
    `${apartment.name} ${status}`,
    apartment.region,
    apartment.priceDetail?.salePrice ||
      apartment.price,
    apartment.priceDetail
      ?.contractPrice,
    apartment.condition,
    apartment.projectInfo
      ?.totalHouseholds,
    apartment.projectInfo
      ?.moveInDate
      ? `입주 예정 ${apartment.projectInfo.moveInDate}`
      : "",
  ]
    .map(cleanText)
    .filter(Boolean);

  return truncateText(
    `${summaryParts.join(
      " · "
    )}. 단지 규모, 평면도, 입지환경과 최신 분양 정보를 홈픽에서 확인하세요.`
  );
}

function getSeoKeywords(
  apartment: Apartment
) {
  const city =
    apartment.cityName ||
    apartment.city ||
    "";

  const district =
    apartment.districtName ||
    apartment.district ||
    "";

  const status =
    getStatusKeyword(apartment);

  return [
    apartment.name,
    `${apartment.name} 분양`,
    `${apartment.name} 분양가`,
    `${apartment.name} 계약조건`,
    `${apartment.name} 모델하우스`,
    `${apartment.name} 평면도`,
    `${apartment.name} 위치`,
    `${apartment.name} 입주`,
    `${apartment.name} ${status}`,
    city
      ? `${city} 아파트 분양`
      : "",
    city
      ? `${city} 선착순 아파트`
      : "",
    district
      ? `${district} 아파트 분양`
      : "",
    ...(apartment.keywords ?? []),
  ]
    .map(cleanText)
    .filter(Boolean)
    .filter(
      (keyword, index, array) =>
        array.indexOf(keyword) ===
        index
    );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const apartment =
    (await getApartment(
      slug
    )) as Apartment | null;

  if (!apartment) {
    return {
      title:
        "단지를 찾을 수 없습니다 | 홈픽",

      description:
        "요청한 분양 단지 정보를 찾을 수 없습니다.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl =
    `${SITE_URL}/apartments/${apartment.slug}`;

  const title =
    getSeoTitle(apartment);

  const description =
    getSeoDescription(apartment);

  const image =
    getHeroImage(apartment);

  const completed =
    isCompletedListing(apartment);

  return {
    title,
    description,

    keywords:
      getSeoKeywords(apartment),

    alternates: {
      canonical: canonicalUrl,
    },

    robots: completed
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview":
              "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },

    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: canonicalUrl,
      siteName: "홈픽(HomePick)",
      title,
      description,

      images: image
        ? [
            {
              url: image,
              alt: `${apartment.name} 대표 이미지`,
            },
          ]
        : undefined,
    },

    twitter: {
      card:
        image
          ? "summary_large_image"
          : "summary",

      title,
      description,

      images: image
        ? [image]
        : undefined,
    },
  };
}

function createJsonLd(
  apartment: Apartment
) {
  const canonicalUrl =
    `${SITE_URL}/apartments/${apartment.slug}`;

  const image =
    getHeroImage(apartment);

  const description =
    getSeoDescription(apartment);

  const city =
    apartment.cityName ||
    apartment.city ||
    "";

  const district =
    apartment.districtName ||
    apartment.district ||
    "";

  const breadcrumbJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement: [
      {
        "@type":
          "ListItem",

        position: 1,
        name: "홈",
        item: SITE_URL,
      },
      {
        "@type":
          "ListItem",

        position: 2,
        name:
          city || "분양 단지",

        item: city
          ? `${SITE_URL}/region/${encodeURIComponent(
              apartment.city ||
                city
            )}`
          : `${SITE_URL}/region`,
      },
      {
        "@type":
          "ListItem",

        position: 3,
        name: apartment.name,
        item: canonicalUrl,
      },
    ],
  };

  const residenceJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "ApartmentComplex",

    "@id":
      `${canonicalUrl}#apartment`,

    name: apartment.name,
    description,
    url: canonicalUrl,

    image: image
      ? [image]
      : undefined,

    address: {
      "@type":
        "PostalAddress",

      addressCountry: "KR",

      addressRegion: city ||
        undefined,

      addressLocality:
        district || undefined,

      streetAddress:
        apartment.region ||
        undefined,
    },

    numberOfAccommodationUnits:
      parseHouseholdCount(
        apartment.totalSupply ??
          apartment.projectInfo
            ?.totalHouseholds
      ),

    brand: apartment.brand
      ? {
          "@type": "Brand",
          name: apartment.brand,
        }
      : undefined,

    provider: {
      "@type":
        "Organization",

      name: "홈픽(HomePick)",
      url: SITE_URL,
    },

    amenityFeature: (
      apartment.pros ?? []
    )
      .slice(0, 8)
      .map((item) => ({
        "@type":
          "LocationFeatureSpecification",

        name: item,
        value: true,
      })),
  };

  const faqItems =
    getApartmentFaqItems(
      apartment
    );

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context":
            "https://schema.org",

          "@type":
            "FAQPage",

          "@id":
            `${canonicalUrl}#faq`,

          mainEntity:
            faqItems.map(
              (faq) => ({
                "@type":
                  "Question",

                name:
                  faq.question,

                acceptedAnswer: {
                  "@type":
                    "Answer",

                  text:
                    faq.answer,
                },
              })
            ),
        }
      : null;

  return [
    breadcrumbJsonLd,
    residenceJsonLd,
    ...(faqJsonLd
      ? [faqJsonLd]
      : []),
  ];
}

function JsonLd({
  data,
}: {
  data: unknown;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          data
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}


function RelatedContentFallback() {
  return (
    <div className="mt-7 grid gap-5">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-zinc-200" />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-zinc-200" />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

async function RelatedApartmentContent({
  apartment,
}: {
  apartment: Apartment;
}) {
  const [
    apartments,
    briefings,
  ] = await Promise.all([
    getApartments() as Promise<Apartment[]>,

    getBriefings({
      publishedOnly: true,
    }),
  ]);

  const relatedApartments =
    apartments
      .filter((item) => {
        if (
          item.slug ===
          apartment.slug
        ) {
          return false;
        }

        if (
          item.city !==
          apartment.city
        ) {
          return false;
        }

        if (
          isCompletedListing(
            item
          )
        ) {
          return false;
        }

        return true;
      })
      .slice(0, 6);

  const relatedBriefings =
    briefings
      .filter(
        (briefing) =>
          briefing.relatedApartmentSlugs.includes(
            apartment.slug
          )
      )
      .slice(0, 3);

  return (
    <>
      <RelatedBriefings
        briefings={
          relatedBriefings
        }
      />

      <RelatedApartments
        apartment={apartment}
        relatedApartments={
          relatedApartments
        }
      />
    </>
  );
}

export default async function ApartmentDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const apartment =
    (await getApartment(
      slug
    )) as Apartment | null;

  if (!apartment) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-20 text-zinc-900 sm:px-6">
        <section className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <h1 className="text-2xl font-black">
            단지를 찾을 수 없습니다.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            삭제되었거나 현재 공개되지
            않은 단지일 수 있습니다.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            분양 단지 찾기
          </Link>
        </section>
      </main>
    );
  }
  const listingStage =
    getListingStage(apartment);

  const isSubscription =
    isSubscriptionListing(
      apartment
    );

  const isCompleted =
    isCompletedListing(
      apartment
    );

  if (isCompleted) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-20 text-zinc-900 sm:px-6">
        <section className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
            노출 종료
          </span>

          <h1 className="mt-5 break-keep text-2xl font-black sm:text-3xl">
            {apartment.name}의 현재
            노출이 종료되었습니다.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            분양 또는 청약 일정이
            종료되어 현재 상세 내용을
            제공하지 않습니다.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              다른 단지 보기
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
            >
              홈으로
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const conditionHistory =
    conditionHistories.find(
      (item) =>
        item.apartmentSlug ===
        apartment.slug
    );

  const cityName =
    apartment.cityName ||
    apartment.city ||
    "전국";

  const cityPathValue =
    apartment.city ||
    cityName;

  const jsonLdItems =
    createJsonLd(apartment);

  return (
    <>
      {jsonLdItems.map(
        (data, index) => (
          <JsonLd
            key={index}
            data={data}
          />
        )
      )}

      <main className="min-h-screen bg-zinc-50 px-3 py-5 text-zinc-900 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-6xl">
          <nav
            aria-label="현재 위치"
            className="mb-4 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-zinc-500 sm:text-sm"
          >
            <Link
              href="/"
              className="shrink-0 transition hover:text-emerald-700"
            >
              홈
            </Link>

            <span
              aria-hidden="true"
              className="text-zinc-300"
            >
              /
            </span>

            <Link
              href={`/region/${encodeURIComponent(
                cityPathValue
              )}`}
              className="shrink-0 transition hover:text-emerald-700"
            >
              {cityName}
            </Link>

            <span
              aria-hidden="true"
              className="text-zinc-300"
            >
              /
            </span>

            <span className="truncate font-semibold text-zinc-700">
              {apartment.name}
            </span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/search"
              className="inline-flex min-h-9 items-center text-xs font-semibold text-zinc-500 transition hover:text-emerald-700 sm:text-sm"
            >
              ← 분양 단지 목록으로
            </Link>

            <span
              className={[
                "rounded-full px-3 py-1.5 text-xs font-bold",
                listingStage ===
                "subscription"
                  ? "bg-blue-50 text-blue-700"
                  : listingStage ===
                      "firstCome"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-violet-50 text-violet-700",
              ].join(" ")}
            >
              {listingStage ===
              "subscription"
                ? "청약 상세"
                : listingStage ===
                    "firstCome"
                  ? "선착순 분양"
                  : "기존 아파트"}
            </span>
          </div>

          <ApartmentHero
            apartment={apartment}
          />

          {isSubscription ? (
            <SubscriptionDetail
              apartment={apartment}
            />
          ) : (
            <SaleDetail
              apartment={apartment}
              conditionHistory={
                conditionHistory
              }
            />
          )}

          <ApartmentFAQ
            apartment={apartment}
          />

          <Suspense
            fallback={
              <RelatedContentFallback />
            }
          >
            <RelatedApartmentContent
              apartment={apartment}
            />
          </Suspense>
        </section>
      </main>
    </>
  );
}