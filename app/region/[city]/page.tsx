import type {
  Metadata,
} from "next";

import Link from "next/link";

import { getApartments } from "../../../lib/getApartments";

import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../../lib/subscriptionVisibility";

import {
  isCompletedListing,
} from "../../../lib/listingStage";

import type { Apartment } from "../../../types/apartment";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://homepick.co.kr";

type PageProps = {
  params: Promise<{
    city: string;
  }>;
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

  if (
    Array.isArray(hero) &&
    hero.length > 0
  ) {
    return hero[0] ?? "";
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

      category:
        "subscription",
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

      category:
        "firstCome",
    };
  }

  return {
    label:
      apartment.status ||
      "분양중",

    className:
      "bg-amber-500 text-white",

    category: "sale",
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
  ].filter(Boolean);

  return (
    details
      .slice(0, 2)
      .join(" · ") ||
    "계약조건 확인 중"
  );
}

async function getRegionData(
  city: string
) {
  const decodedCity =
    decodeURIComponent(city);

  const apartments =
    (await getApartments({
      publishedOnly: true,
    })) as Apartment[];

  const regionApartments =
    apartments.filter(
      (apartment) =>
        apartment.city ===
          decodedCity &&
        apartment.slug &&
        !isCompletedListing(
          apartment
        )
    );

  const cityName =
    regionApartments[0]
      ?.cityName ||
    decodedCity;

  return {
    decodedCity,
    cityName,
    regionApartments,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } =
    await params;

  const {
    cityName,
    regionApartments,
  } = await getRegionData(city);

  const canonical =
    `${SITE_URL}/region/${encodeURIComponent(
      decodeURIComponent(city)
    )}`;

  const title =
    `${cityName} 분양 아파트·청약·선착순 정보`;

  const description =
    `${cityName} 분양 아파트와 청약 일정, 선착순 분양 단지의 분양가, 계약조건, 입지 정보를 홈픽에서 확인하고 비교하세요.`;

  if (
    regionApartments.length === 0
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

    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: canonical,
      siteName:
        "홈픽(HomePick)",
      title:
        `${title} | 홈픽`,
      description,

      images: representativeImage
        ? [
            {
              url:
                representativeImage,

              alt:
                `${cityName} 분양 아파트 정보`,
            },
          ]
        : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        `${title} | 홈픽`,

      description,

      images:
        representativeImage
          ? [
              representativeImage,
            ]
          : undefined,
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
    getStatusInfo(apartment);

  const image =
    getHeroImage(apartment);

  const price =
    getPriceText(apartment);

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
          className="relative h-44 shrink-0 overflow-hidden bg-zinc-100 sm:h-auto sm:w-56"
        >
          {image ? (
            <img
              src={image}
              alt={`${apartment.name} 대표 이미지`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              className="block"
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
              href={`/compare?left=${apartment.slug}`}
              className="
                inline-flex min-h-11
                items-center justify-center
                rounded-xl border
                border-zinc-200 bg-white
                px-4 py-2 text-sm
                font-bold text-zinc-700
                transition
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
                items-center justify-center
                rounded-xl bg-[#132238]
                px-4 py-2 text-sm
                font-bold text-white
                transition
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

export default async function RegionPage({
  params,
}: PageProps) {
  const { city } =
    await params;

  const {
    cityName,
    regionApartments,
  } = await getRegionData(city);

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

  const saleApartments =
    regionApartments.filter(
      (apartment) =>
        !isSubscriptionApartment(
          apartment
        ) &&
        !isFirstComeApartment(
          apartment
        )
    );

  const pageUrl =
    `${SITE_URL}/region/${encodeURIComponent(
      decodeURIComponent(city)
    )}`;

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
          `${cityName} 분양정보`,

        item: pageUrl,
      },
    ],
  };

  const itemListJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "ItemList",

    name:
      `${cityName} 분양 아파트 목록`,

    numberOfItems:
      regionApartments.length,

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
    regionApartments.length === 0
  ) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-zinc-50 px-4 py-16">
        <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:rounded-3xl sm:p-10">
          <p className="text-xs font-bold text-emerald-600">
            REGION INFORMATION
          </p>

          <h1 className="mt-2 text-2xl font-black">
            {cityName} 지역에 공개된
            단지가 없습니다.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            공개 중인 분양 단지가
            등록되면 이 페이지에 자동으로
            표시됩니다.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/region"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              지역 목록으로
            </Link>

            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
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
          __html: JSON.stringify(
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
          __html: JSON.stringify(
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
            className="transition hover:text-emerald-700"
          >
            홈
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            href="/region"
            className="transition hover:text-emerald-700"
          >
            지역
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="font-semibold text-zinc-700">
            {cityName}
          </span>
        </nav>

        <section className="mt-5 overflow-hidden rounded-2xl bg-[#132238] p-5 text-white shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
          <p className="text-xs font-bold tracking-wide text-emerald-300 sm:text-sm">
            {cityName.toUpperCase()} APARTMENT
          </p>

          <h1 className="mt-2 break-keep text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {cityName} 분양 아파트
          </h1>

          <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-300 sm:mt-4 sm:text-base sm:leading-8">
            {cityName} 지역에서 공개
            중인 청약 아파트와 선착순
            분양 단지의 분양가,
            계약조건과 입지 정보를
            확인해보세요.
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

        <section className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
          <SummaryBox
            label="청약 단지"
            count={
              subscriptionApartments.length
            }
            className="border-blue-100 bg-blue-50 text-blue-700"
          />

          <SummaryBox
            label="선착순 단지"
            count={
              firstComeApartments.length
            }
            className="border-emerald-100 bg-emerald-50 text-emerald-700"
          />

          <SummaryBox
            label="기타 분양"
            count={
              saleApartments.length
            }
            className="border-amber-100 bg-amber-50 text-amber-700"
          />
        </section>

        <section className="mt-8 sm:mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
                AVAILABLE APARTMENTS
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
                현재 확인 가능한 단지
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                최근 등록된 단지부터
                확인할 수 있습니다.
              </p>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(
                cityName
              )}`}
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