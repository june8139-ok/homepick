import type {
  Metadata,
} from "next";

import Link from "next/link";

import RegionSearch from "../../components/Region/RegionSearch";

import {
  getApartments,
} from "../../lib/getApartments";

import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

import {
  isCompletedListing,
} from "../../lib/listingStage";

import {
  getApartmentRegionKey,
} from "../../lib/regionUtils";

import type {
  Apartment,
} from "../../types/apartment";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

const PAGE_TITLE =
  "전국 지역별 분양 아파트·청약·선착순 정보";

const PAGE_DESCRIPTION =
  "전국 17개 시·도별 분양 아파트와 청약 단지, 선착순 분양 정보를 확인하세요. 지역별 분양가와 계약조건을 집눈에서 한눈에 비교할 수 있습니다.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description:
    PAGE_DESCRIPTION,

  alternates: {
    canonical:
      `${SITE_URL}/region`,
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url:
      `${SITE_URL}/region`,
    siteName: "집눈",
    title:
      `${PAGE_TITLE} | 집눈`,
    description:
      PAGE_DESCRIPTION,
    images: [
      {
        url:
          "/opengraph-image",
        width: 1200,
        height: 630,
        alt:
          "집눈 전국 지역별 분양정보",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",
    title:
      `${PAGE_TITLE} | 집눈`,
    description:
      PAGE_DESCRIPTION,
    images: [
      "/opengraph-image",
    ],
  },
};

type CitySummary = {
  city: string;
  cityName: string;

  totalCount: number;
  subscriptionCount: number;
  firstComeCount: number;
  saleCount: number;

  latestApartment:
    Apartment;
};

type RegionSearchApartment = {
  slug: string;
  name: string;
  region: string;
  parentRegion: string;
  status: string;
};

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

function getStatusCounts(
  apartments: Apartment[]
) {
  let subscriptionCount = 0;
  let firstComeCount = 0;
  let saleCount = 0;

  apartments.forEach(
    (apartment) => {
      if (
        isSubscriptionApartment(
          apartment
        )
      ) {
        subscriptionCount += 1;
        return;
      }

      if (
        isFirstComeApartment(
          apartment
        )
      ) {
        firstComeCount += 1;
        return;
      }

      saleCount += 1;
    }
  );

  return {
    subscriptionCount,
    firstComeCount,
    saleCount,
  };
}

function buildCitySummaries(
  apartments: Apartment[]
) {
  const cityMap =
    new Map<
      string,
      Apartment[]
    >();

  apartments.forEach(
    (apartment) => {
      const regionKey =
        getApartmentRegionKey(
          apartment
        );

      if (!regionKey) {
        return;
      }

      const current =
        cityMap.get(
          regionKey
        ) ?? [];

      current.push(apartment);

      cityMap.set(
        regionKey,
        current
      );
    }
  );

  return Array.from(
    cityMap.entries()
  )
    .map(
      ([
        city,
        cityApartments,
      ]): CitySummary => {
        const counts =
          getStatusCounts(
            cityApartments
          );

        return {
          city,
          cityName: city,

          totalCount:
            cityApartments.length,

          ...counts,

          latestApartment:
            cityApartments[0],
        };
      }
    )
    .sort(
      (first, second) => {
        if (
          second.totalCount !==
          first.totalCount
        ) {
          return (
            second.totalCount -
            first.totalCount
          );
        }

        return first.cityName.localeCompare(
          second.cityName,
          "ko"
        );
      }
    );
}

function StatBox({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-zinc-50 px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
      <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-xl font-black sm:text-2xl",
          colorClass,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function CityCard({
  city,
}: {
  city: CitySummary;
}) {
  const apartment =
    city.latestApartment;

  const image =
    getHeroImage(
      apartment
    );

  return (
    <Link
      href={`/region/${encodeURIComponent(
        city.city
      )}`}
      className="
        group min-w-0 overflow-hidden
        rounded-2xl border
        border-zinc-200 bg-white
        shadow-sm transition-all
        duration-200
        hover:-translate-y-1
        hover:border-emerald-300
        hover:shadow-lg
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-500
        focus-visible:ring-offset-2
        sm:rounded-3xl
      "
    >
      <div className="relative h-36 overflow-hidden bg-zinc-100 sm:h-44">
        {image ? (
          <img
            src={image}
            alt={`${city.cityName} 최근 등록 분양 아파트`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-400">
            지역 이미지 준비 중
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-bold text-white/75">
            지역별 분양정보
          </p>

          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            {city.cityName}
          </h2>
        </div>

        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-zinc-800 shadow-sm backdrop-blur">
          총 {city.totalCount}개
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2">
          <StatBox
            label="청약"
            value={
              city.subscriptionCount
            }
            colorClass="text-blue-600"
          />

          <StatBox
            label="선착순"
            value={
              city.firstComeCount
            }
            colorClass="text-emerald-600"
          />

          <StatBox
            label="기타 분양"
            value={
              city.saleCount
            }
            colorClass="text-amber-600"
          />
        </div>

        <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
          <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
            최근 등록 단지
          </p>

          <p className="mt-1 line-clamp-1 text-sm font-black text-[#132238] sm:text-base">
            {apartment.name}
          </p>

          <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 sm:text-xs">
            {apartment.region ||
              `${city.cityName} 지역`}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-500">
            분양가·계약조건 확인
          </p>

          <span className="text-sm font-black text-emerald-700 transition-transform group-hover:translate-x-1">
            지역 단지 보기 →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function RegionIndexPage() {
  const apartments =
    (await getApartments({
      publishedOnly: true,
    })) as Apartment[];

  const publicApartments =
    apartments.filter(
      (apartment) =>
        apartment.slug &&
        !isCompletedListing(
          apartment
        )
    );

  const cities =
    buildCitySummaries(
      publicApartments
    );

  const subscriptionTotal =
    publicApartments.filter(
      isSubscriptionApartment
    ).length;

  const firstComeTotal =
    publicApartments.filter(
      (apartment) =>
        !isSubscriptionApartment(
          apartment
        ) &&
        isFirstComeApartment(
          apartment
        )
    ).length;

  const regionSearchApartments:
    RegionSearchApartment[] =
    publicApartments.map(
      (apartment) => ({
        slug:
          apartment.slug,
        name:
          apartment.name,
        region:
          apartment.region ||
          "",
        parentRegion:
          getApartmentRegionKey(
            apartment
          ),
        status:
          apartment.status ||
          "",
      })
    );

  const regionSearchCities =
    cities.map((city) => ({
      name:
        city.cityName,
      href:
        `/region/${encodeURIComponent(
          city.city
        )}`,
      count:
        city.totalCount,
    }));

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
    ],
  };

  const collectionJsonLd = {
    "@context":
      "https://schema.org",
    "@type":
      "CollectionPage",
    name: PAGE_TITLE,
    description:
      PAGE_DESCRIPTION,
    url:
      `${SITE_URL}/region`,
    mainEntity: {
      "@type":
        "ItemList",
      numberOfItems:
        cities.length,
      itemListElement:
        cities.map(
          (city, index) => ({
            "@type":
              "ListItem",
            position:
              index + 1,
            name:
              `${city.cityName} 분양정보`,
            url:
              `${SITE_URL}/region/${encodeURIComponent(
                city.city
              )}`,
          })
        ),
    },
  };

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
              collectionJsonLd
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
            className="transition hover:text-emerald-700"
          >
            홈
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="font-semibold text-zinc-700">
            지역별 분양정보
          </span>
        </nav>

        <section className="relative mt-5 overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f4fbf8_60%,#fff4ef_100%)] p-5 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-orange-100/70 blur-3xl"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-extrabold tracking-wide text-emerald-700 sm:text-sm">
                집눈 지역별 분양정보
              </p>
            </div>

            <h1 className="mt-4 break-keep text-3xl font-black tracking-tight text-[#132238] sm:text-4xl lg:text-5xl">
              전국 부동산을
              <span className="text-emerald-600"> 한눈에</span>
            </h1>

            <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-600 sm:mt-4 sm:text-base sm:leading-8">
              17개 시·도 기준으로 현재 청약
              중인 아파트와 선착순 분양 단지,
              분양가와 계약조건을 비교해보세요.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:max-w-2xl sm:gap-3">
              <div className="rounded-xl border border-zinc-200 bg-white/90 px-3 py-3 shadow-sm backdrop-blur sm:rounded-2xl sm:px-4 sm:py-4">
                <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
                  등록 지역
                </p>

                <p className="mt-1 text-xl font-black text-[#132238] sm:text-2xl">
                  {cities.length}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/90 px-3 py-3 shadow-sm backdrop-blur sm:rounded-2xl sm:px-4 sm:py-4">
                <p className="text-[10px] font-bold text-blue-600 sm:text-xs">
                  청약 단지
                </p>

                <p className="mt-1 text-xl font-black text-blue-700 sm:text-2xl">
                  {subscriptionTotal}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/90 px-3 py-3 shadow-sm backdrop-blur sm:rounded-2xl sm:px-4 sm:py-4">
                <p className="text-[10px] font-bold text-emerald-600 sm:text-xs">
                  선착순 단지
                </p>

                <p className="mt-1 text-xl font-black text-emerald-700 sm:text-2xl">
                  {firstComeTotal}
                </p>
              </div>
            </div>
          </div>
        </section>

        <RegionSearch
          apartments={
            regionSearchApartments
          }
          regions={
            regionSearchCities
          }
        />

        <section className="mt-8 sm:mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
                지역별 단지 찾기
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
                지역을 선택하세요
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                등록 단지가 많은 지역부터
                표시됩니다.
              </p>
            </div>

            <Link
              href="/search"
              className="
                inline-flex min-h-11
                w-fit items-center
                justify-center rounded-xl
                border border-zinc-200
                bg-white px-4 py-2
                text-sm font-bold
                text-zinc-700 shadow-sm
                transition
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
              지도로 전국 검색 →
            </Link>
          </div>

          {cities.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3">
              {cities.map(
                (city) => (
                  <CityCard
                    key={
                      city.city
                    }
                    city={city}
                  />
                )
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-3xl">
              <h2 className="text-xl font-black">
                등록된 지역이 없습니다.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                공개된 분양 단지가
                등록되면 지역별로 자동
                표시됩니다.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
