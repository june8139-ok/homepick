import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";
import {
  notFound,
  permanentRedirect,
} from "next/navigation";

import { cache } from "react";

import {
  getApartments,
} from "../../../lib/getApartments";

import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../../lib/subscriptionVisibility";

import {
  isCompletedListing,
} from "../../../lib/listingStage";

import {
  isApartmentInRegion,
  normalizeRegionRoute,
} from "../../../lib/regionUtils";

import type {
  Apartment,
} from "../../../types/apartment";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

export const revalidate = 300;

type PageProps = {
  params: Promise<{
    city: string;
  }>;
};

function decodeRouteValue(
  value: string
) {
  try {
    return decodeURIComponent(
      value
    )
      .replace(/\+/g, " ")
      .trim();
  } catch {
    return value
      .replace(/\+/g, " ")
      .trim();
  }
}

function getHeroImage(
  apartment: Apartment
) {
  const hero =
    apartment.images?.hero;

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

function getStatusInfo(
  apartment: Apartment
) {
  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return {
      label:
        apartment.status ||
        "청약",
      className:
        "bg-blue-600 text-white",
    };
  }

  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return {
      label: "선착순",
      className:
        "bg-emerald-600 text-white",
    };
  }

  return {
    label:
      apartment.status ||
      "분양중",
    className:
      "bg-amber-500 text-white",
  };
}

function getPriceText(
  apartment: Apartment
) {
  return (
    apartment.priceDetail
      ?.salePrice ||
    apartment.price ||
    "분양가 확인 중"
  );
}

function getConditionText(
  apartment: Apartment
) {
  if (
    apartment.condition?.trim()
  ) {
    return apartment.condition;
  }

  const details = [
    apartment.priceDetail
      ?.contractPrice,
    apartment.priceDetail
      ?.middlePayment,
    ...(apartment.priceDetail
      ?.options ?? []),
  ].filter(
    (
      value
    ): value is string =>
      Boolean(value)
  );

  return (
    details
      .slice(0, 2)
      .join(" · ") ||
    "계약조건 확인 중"
  );
}

function normalizeConditionText(
  apartment: Apartment
) {
  return [
    apartment.condition,
    apartment.priceDetail
      ?.contractPrice,
    apartment.priceDetail
      ?.middlePayment,
    apartment.priceDetail
      ?.balance,
    ...(apartment.priceDetail
      ?.options ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .toLowerCase();
}

function hasFreeMiddlePayment(
  apartment: Apartment
) {
  if (
    apartment.evaluation
      ?.middlePaymentType ===
    "free"
  ) {
    return true;
  }

  const text =
    normalizeConditionText(
      apartment
    );

  return (
    text.includes(
      "중도금무이자"
    ) &&
    !text.includes(
      "일부무이자"
    )
  );
}

function hasFixed500Contract(
  apartment: Apartment
) {
  if (
    apartment.evaluation
      ?.contractType ===
    "fixed-500"
  ) {
    return true;
  }

  const text =
    normalizeConditionText(
      apartment
    );

  return (
    text.includes(
      "계약금500만원"
    ) ||
    text.includes(
      "계약금500만"
    )
  );
}

function hasLowInitialContract(
  apartment: Apartment
) {
  const contractType =
    apartment.evaluation
      ?.contractType;

  if (
    contractType ===
      "fixed-500" ||
    contractType ===
      "fixed-1000" ||
    contractType ===
      "ratio-5"
  ) {
    return true;
  }

  const text =
    normalizeConditionText(
      apartment
    );

  return (
    text.includes(
      "계약금500만원"
    ) ||
    text.includes(
      "계약금500만"
    ) ||
    text.includes(
      "계약금1000만원"
    ) ||
    text.includes(
      "계약금1000만"
    ) ||
    text.includes(
      "계약금5%"
    )
  );
}

function getListingPriority(
  apartment: Apartment
) {
  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return 3;
  }

  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return 2;
  }

  return 1;
}

const getPublishedApartments =
  cache(async () => {
    return (
      await getApartments({
        publishedOnly: true,
      })
    ) as Apartment[];
  });

const getRegionData =
  cache(async (
    city: string
  ) => {
    const normalizedCity =
      normalizeRegionRoute(
        city
      );

    const apartments =
      await getPublishedApartments();

    const regionApartments =
      normalizedCity
        ? apartments
            .filter(
              (apartment) =>
                Boolean(
                  apartment.slug
                ) &&
                !isCompletedListing(
                  apartment
                ) &&
                isApartmentInRegion(
                  apartment,
                  normalizedCity
                )
            )
            .sort(
              (a, b) =>
                getListingPriority(b) -
                getListingPriority(a)
            )
        : [];

    return {
      cityKey:
        normalizedCity,
      cityName:
        normalizedCity,
      regionApartments,
    };
  });

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } =
    await params;

  const {
    cityKey,
    cityName,
    regionApartments,
  } = await getRegionData(
    city
  );

  const safeCityName =
    cityName ||
    decodeRouteValue(city) ||
    "지역";

  const canonical =
    cityKey
      ? `${SITE_URL}/region/${encodeURIComponent(
          cityKey
        )}`
      : `${SITE_URL}/region`;

  const title =
    `${safeCityName} 분양 아파트·청약·선착순 정보`;

  const description =
    `${safeCityName} 분양 아파트와 청약 일정, 선착순 분양 단지의 분양가, 계약조건, 입지 정보를 집눈에서 확인하고 비교하세요.`;

  if (
    !cityKey ||
    regionApartments.length ===
      0
  ) {
    return {
      title,
      description,

      alternates: {
        canonical,
      },

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const representativeImage =
    getHeroImage(
      regionApartments[0]
    );

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: canonical,
      siteName: "집눈",
      title:
        `${title} | 집눈`,
      description,

      images: [
        {
          url:
            representativeImage ||
            "/opengraph-image",
          width:
            representativeImage
              ? undefined
              : 1200,
          height:
            representativeImage
              ? undefined
              : 630,
          alt:
            `${safeCityName} 분양 아파트 정보`,
        },
      ],
    },

    twitter: {
      card:
        representativeImage
          ? "summary_large_image"
          : "summary",
      title:
        `${title} | 집눈`,
      description,
      images: [
        representativeImage ||
          "/opengraph-image",
      ],
    },
  };
}

function SummaryBox({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <div
      className={[
        "rounded-xl border px-3 py-3 shadow-sm",
        "sm:rounded-2xl sm:px-5 sm:py-5",
        className,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold opacity-75 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black sm:text-3xl">
        {count}
      </p>
    </div>
  );
}

function ApartmentCard({
  apartment,
}: {
  apartment: Apartment;
}) {
  const status =
    getStatusInfo(
      apartment
    );

  const image =
    getHeroImage(
      apartment
    );

  const price =
    getPriceText(
      apartment
    );

  const condition =
    getConditionText(
      apartment
    );

  return (
    <article
      className="
        group min-w-0 overflow-hidden
        rounded-2xl border
        border-zinc-200 bg-white
        shadow-sm transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-emerald-300
        hover:shadow-lg
        sm:rounded-3xl
      "
    >
      <div className="flex flex-col sm:min-h-[210px] sm:flex-row">
        <Link
          href={`/apartments/${apartment.slug}`}
          className="
            relative h-44 shrink-0
            cursor-pointer overflow-hidden
            bg-zinc-100
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-inset
            sm:h-auto sm:w-56
          "
        >
          {image ? (
            <Image
              src={image}
              alt={`${apartment.name} 대표 이미지`}
              fill
              loading="lazy"
              quality={68}
              sizes="
                (max-width: 639px) calc(100vw - 32px),
                224px
              "
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-400">
              이미지 준비 중
            </div>
          )}

          <span
            className={[
              "absolute left-3 top-3 rounded-full px-3 py-1.5",
              "text-xs font-black shadow-sm",
              status.className,
            ].join(" ")}
          >
            {status.label}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {apartment.brand && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold text-zinc-600 sm:text-xs">
                  {apartment.brand}
                </span>
              )}

              {apartment.type && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold text-zinc-600 sm:text-xs">
                  {apartment.type}
                </span>
              )}
            </div>

            <Link
              href={`/apartments/${apartment.slug}`}
              className="
                block rounded-lg
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              <h2 className="mt-3 break-keep text-xl font-black leading-tight text-[#132238] transition group-hover:text-emerald-700 sm:text-2xl">
                {apartment.name}
              </h2>
            </Link>

            <p className="mt-2 line-clamp-1 text-xs text-zinc-500 sm:text-sm">
              {apartment.region ||
                "주소 정보 확인 중"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="min-w-0 rounded-xl bg-zinc-50 px-3 py-3 sm:rounded-2xl sm:px-4">
                <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
                  대표 분양가
                </p>

                <p className="mt-1 line-clamp-2 break-keep text-xs font-black leading-5 text-[#132238] sm:text-sm sm:leading-6">
                  {price}
                </p>
              </div>

              <div className="min-w-0 rounded-xl bg-zinc-50 px-3 py-3 sm:rounded-2xl sm:px-4">
                <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
                  핵심 계약조건
                </p>

                <p className="mt-1 line-clamp-2 break-keep text-xs font-black leading-5 text-[#132238] sm:text-sm sm:leading-6">
                  {condition}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Link
              href={`/compare?left=${encodeURIComponent(
                apartment.slug
              )}`}
              className="
                inline-flex min-h-11
                cursor-pointer items-center
                justify-center rounded-xl
                border border-zinc-200
                bg-white px-4 py-2
                text-sm font-bold
                text-zinc-700
                transition-all
                active:scale-[0.98]
                active:bg-emerald-50
                active:text-emerald-700
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:text-emerald-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              비교할 단지 선택
            </Link>

            <Link
              href={`/apartments/${apartment.slug}`}
              className="
                inline-flex min-h-11
                cursor-pointer items-center
                justify-center rounded-xl
                bg-[#132238] px-4 py-2
                text-sm font-bold
                text-white
                transition-all
                hover:-translate-y-0.5
                hover:bg-emerald-600
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              상세정보 확인 →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}


function ApartmentGroupSection({
  eyebrow,
  title,
  description,
  apartments,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  apartments: Apartment[];
  emptyMessage: string;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-6">
      <div>
        <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>

      {apartments.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {apartments
            .slice(0, 4)
            .map(
              (
                apartment
              ) => (
                <ApartmentCard
                  key={
                    apartment.slug
                  }
                  apartment={
                    apartment
                  }
                />
              )
            )}
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500 sm:rounded-2xl">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

export default async function RegionPage({
  params,
}: PageProps) {
  const { city } =
    await params;

  const routeCity =
    decodeRouteValue(city);

  const {
    cityKey,
    cityName,
    regionApartments,
  } = await getRegionData(
    city
  );

  /*
   * 기존 시·군 URL을 광역시·도 URL로 영구 이전합니다.
   * 예: /region/김포 → /region/경기
   */
  if (
    cityKey &&
    routeCity !== cityKey
  ) {
    permanentRedirect(
      `/region/${encodeURIComponent(
        cityKey
      )}`
    );
  }

  if (!cityKey) {
    notFound();
  }

  const safeCityName =
    cityName ||
    routeCity ||
    "해당";

  const subscriptionApartments =
    regionApartments.filter(
      isSubscriptionApartment
    );

  const firstComeApartments =
    regionApartments.filter(
      (apartment) =>
        !isSubscriptionApartment(
          apartment
        ) &&
        isFirstComeApartment(
          apartment
        )
    );


  const freeMiddlePaymentApartments =
    regionApartments.filter(
      hasFreeMiddlePayment
    );

  const fixed500Apartments =
    regionApartments.filter(
      hasFixed500Contract
    );

  const lowInitialContractApartments =
    regionApartments.filter(
      hasLowInitialContract
    );

  const pageUrl =
    cityKey
      ? `${SITE_URL}/region/${encodeURIComponent(
          cityKey
        )}`
      : `${SITE_URL}/region`;

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
          "지역별 분양정보",
        item:
          `${SITE_URL}/region`,
      },
      {
        "@type":
          "ListItem",
        position: 3,
        name:
          `${safeCityName} 분양정보`,
        item:
          pageUrl,
      },
    ],
  };

  const itemListJsonLd = {
    "@context":
      "https://schema.org",
    "@type":
      "ItemList",
    "@id":
      `${pageUrl}#apartment-list`,
    name:
      `${safeCityName} 분양 아파트 목록`,
    numberOfItems:
      regionApartments.length,
    itemListOrder:
      "https://schema.org/ItemListOrderDescending",

    itemListElement:
      regionApartments.map(
        (
          apartment,
          index
        ) => ({
          "@type":
            "ListItem",
          position:
            index + 1,
          name:
            apartment.name,
          url:
            `${SITE_URL}/apartments/${encodeURIComponent(
              apartment.slug
            )}`,
        })
      ),
  };

  if (
    !cityKey ||
    regionApartments.length ===
      0
  ) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-zinc-50 px-4 py-16">
        <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:rounded-3xl sm:p-10">
          <p className="text-xs font-bold text-emerald-600">
            집눈 지역별 분양정보
          </p>

          <h1 className="mt-2 break-keep text-2xl font-black">
            {safeCityName} 지역에 공개된
            단지가 없습니다.
          </h1>

          <p className="mt-3 break-keep text-sm leading-6 text-zinc-500">
            공개 중인 분양 단지가
            등록되면 이 페이지에 자동으로
            표시됩니다.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/region"
              className="
                inline-flex min-h-11
                cursor-pointer items-center
                justify-center rounded-xl
                border border-zinc-200
                px-5 py-3 text-sm
                font-bold text-zinc-700
                transition-all
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:text-emerald-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              지역 목록으로
            </Link>

            <Link
              href="/search"
              className="
                inline-flex min-h-11
                cursor-pointer items-center
                justify-center rounded-xl
                bg-zinc-900 px-5 py-3
                text-sm font-bold text-white
                transition-all
                hover:-translate-y-0.5
                hover:bg-emerald-600
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              전국 단지 검색
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbJsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              itemListJsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <section className="mx-auto max-w-7xl">
        <nav
          aria-label="현재 위치"
          className="text-xs text-zinc-500 sm:text-sm"
        >
          <Link
            href="/"
            className="rounded transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            홈
          </Link>

          <span
            aria-hidden="true"
            className="mx-2"
          >
            /
          </span>

          <Link
            href="/region"
            className="rounded transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            지역
          </Link>

          <span
            aria-hidden="true"
            className="mx-2"
          >
            /
          </span>

          <span className="font-semibold text-zinc-700">
            {cityName}
          </span>
        </nav>

        <section className="mt-5 overflow-hidden rounded-2xl bg-[#132238] p-5 text-white shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
          <p className="text-xs font-bold tracking-wide text-emerald-300 sm:text-sm">
            집눈 지역별 분양정보
          </p>

          <h1 className="mt-2 break-keep text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {cityName} 분양 아파트
          </h1>

          <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-300 sm:mt-4 sm:text-base sm:leading-8">
            {cityName} 지역에서 공개
            중인 청약 아파트와 선착순
            분양 단지의 분양가,
            계약조건과 입지 정보를
            한눈에 확인해보세요.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:max-w-xl sm:gap-3">
            <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur sm:rounded-2xl sm:px-4 sm:py-4">
              <p className="text-[10px] font-bold text-zinc-300 sm:text-xs">
                전체 단지
              </p>

              <p className="mt-1 text-xl font-black sm:text-2xl">
                {regionApartments.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/15 px-3 py-3 backdrop-blur sm:rounded-2xl sm:px-4 sm:py-4">
              <p className="text-[10px] font-bold text-blue-200 sm:text-xs">
                청약
              </p>

              <p className="mt-1 text-xl font-black sm:text-2xl">
                {subscriptionApartments.length}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/15 px-3 py-3 backdrop-blur sm:rounded-2xl sm:px-4 sm:py-4">
              <p className="text-[10px] font-bold text-emerald-200 sm:text-xs">
                선착순
              </p>

              <p className="mt-1 text-xl font-black sm:text-2xl">
                {firstComeApartments.length}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
          <SummaryBox
            label="현재 분양 중"
            count={
              regionApartments.length
            }
            className="border-zinc-200 bg-white text-[#132238]"
          />

          <SummaryBox
            label="선착순"
            count={
              firstComeApartments.length
            }
            className="border-emerald-100 bg-emerald-50 text-emerald-700"
          />

          <SummaryBox
            label="청약"
            count={
              subscriptionApartments.length
            }
            className="border-blue-100 bg-blue-50 text-blue-700"
          />

          <SummaryBox
            label="중도금 무이자"
            count={
              freeMiddlePaymentApartments.length
            }
            className="border-violet-100 bg-violet-50 text-violet-700"
          />

          <SummaryBox
            label="계약금 500만원"
            count={
              fixed500Apartments.length
            }
            className="border-amber-100 bg-amber-50 text-amber-700"
          />
        </section>

        <ApartmentGroupSection
          eyebrow="FIRST COME"
          title={`${cityName} 선착순 분양`}
          description="현재 동·호수 지정 방식으로 확인할 수 있는 단지를 모았습니다."
          apartments={
            firstComeApartments
          }
          emptyMessage="현재 공개된 선착순 분양 단지가 없습니다."
        />

        <ApartmentGroupSection
          eyebrow="LOW INITIAL COST"
          title="계약금 부담이 낮은 단지"
          description="계약금 500만원·1,000만원 또는 계약금 5% 조건이 등록된 단지입니다."
          apartments={
            lowInitialContractApartments
          }
          emptyMessage="현재 계약금 부담이 낮은 조건으로 등록된 단지가 없습니다."
        />

        <ApartmentGroupSection
          eyebrow="INTEREST FREE"
          title="중도금 무이자 단지"
          description="등록된 계약조건 기준으로 중도금 전액 무이자가 확인되는 단지입니다."
          apartments={
            freeMiddlePaymentApartments
          }
          emptyMessage="현재 중도금 무이자 조건으로 등록된 단지가 없습니다."
        />

        <section className="mt-8 sm:mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
                현재 분양정보
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
                현재 확인 가능한 단지
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                선착순·청약 단지를 우선해
                확인할 수 있습니다.
              </p>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(
                cityName
              )}`}
              className="
                inline-flex min-h-11
                w-fit cursor-pointer
                items-center justify-center
                rounded-xl border
                border-zinc-200 bg-white
                px-4 py-2 text-sm
                font-bold text-zinc-700
                shadow-sm transition-all
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:text-emerald-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              {cityName} 지도검색 →
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:mt-6">
            {regionApartments.map(
              (apartment) => (
                <ApartmentCard
                  key={
                    apartment.slug
                  }
                  apartment={
                    apartment
                  }
                />
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
