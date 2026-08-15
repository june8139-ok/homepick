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

type RegionDescription = {
  title: string;
  paragraphs: [
    string,
    string,
  ];
};

const REGION_DESCRIPTIONS: Record<
  string,
  RegionDescription
> = {
  서울: {
    title:
      "서울 분양시장 한눈에 보기",
    paragraphs: [
      "서울은 도심 생활권과 재개발·재건축 사업지를 중심으로 신규 공급이 이어지는 지역입니다. 같은 서울 안에서도 교통, 학군, 업무지구 접근성과 공급 방식에 따라 단지별 조건 차이가 크게 나타날 수 있습니다.",
      "집눈에서는 서울 지역의 청약·선착순 분양 단지를 모아 분양가, 계약조건, 입주 예정일과 주요 생활환경을 한눈에 확인하고 관심단지 저장과 비교 기능까지 이용할 수 있습니다.",
    ],
  },
  부산: {
    title:
      "부산 분양시장 한눈에 보기",
    paragraphs: [
      "부산은 해운대·수영권을 비롯해 동부산과 서부산, 원도심 정비사업지까지 생활권별 특성이 뚜렷한 지역입니다. 교통망과 바다 조망, 상권 접근성, 정비사업 진행 상황을 함께 살펴보는 것이 중요합니다.",
      "집눈에서는 부산 지역의 청약·선착순 분양 단지를 모아 분양가와 계약조건, 입주 예정일, 교통·교육·생활환경을 단지별로 비교할 수 있습니다.",
    ],
  },
  대구: {
    title:
      "대구 분양시장 한눈에 보기",
    paragraphs: [
      "대구는 수성권과 도심권, 달서·북구 생활권 등 지역별 주거환경과 공급 여건이 구분되는 시장입니다. 역세권 여부와 학군, 생활 인프라, 입주 시점에 따라 단지별 체감 가치가 달라질 수 있습니다.",
      "집눈에서는 대구 지역의 분양 단지를 모아 분양가, 계약금, 중도금 조건과 입주 예정일을 확인하고 관심단지 저장과 비교 기능으로 조건을 나란히 살펴볼 수 있습니다.",
    ],
  },
  인천: {
    title:
      "인천 분양시장 한눈에 보기",
    paragraphs: [
      "인천은 송도·청라·검단 등 신도시 생활권과 기존 도심 정비사업지가 함께 형성된 지역입니다. 서울 접근성, 철도 계획, 업무지구와 생활 인프라를 단지별로 구분해 확인하는 것이 중요합니다.",
      "집눈에서는 인천 지역의 청약·선착순 분양 단지를 모아 분양가와 계약조건, 입지, 입주 예정일을 확인하고 두 단지를 같은 기준으로 비교할 수 있습니다.",
    ],
  },
  광주: {
    title:
      "광주 분양시장 한눈에 보기",
    paragraphs: [
      "광주는 도심 재정비 지역과 택지개발 생활권을 중심으로 신규 주거 공급이 이어지는 지역입니다. 생활권별 교통, 교육환경과 주변 신축 공급량을 함께 비교해보는 것이 좋습니다.",
      "집눈에서는 광주 지역의 현재 공개된 분양 단지를 모아 분양가, 계약조건, 입주 일정과 주요 생활환경을 단지별로 확인할 수 있습니다.",
    ],
  },
  대전: {
    title:
      "대전 분양시장 한눈에 보기",
    paragraphs: [
      "대전은 도안·유성 생활권과 중구·동구의 도심 정비사업지를 중심으로 신규 분양과 선착순 공급이 함께 나타나는 지역입니다. 생활권에 따라 교통, 학군, 연구·업무지역 접근성의 차이를 비교할 필요가 있습니다.",
      "집눈에서는 대전 지역의 분양가와 계약조건, 입주 예정일, 교통·교육·생활환경을 단지별로 확인하고 관심단지 저장과 비교 기능까지 이용할 수 있습니다.",
    ],
  },
  울산: {
    title:
      "울산 분양시장 한눈에 보기",
    paragraphs: [
      "울산은 남구 중심 생활권과 북구·울주군의 신규 주거지역이 함께 형성된 시장입니다. 산업단지 접근성, 도심 생활 인프라, 교통망과 입주 시점을 단지별로 비교해보는 것이 중요합니다.",
      "집눈에서는 울산 지역의 청약·선착순 분양 단지를 모아 분양가, 계약조건, 주차와 입주 정보를 한눈에 확인할 수 있습니다.",
    ],
  },
  세종: {
    title:
      "세종 분양시장 한눈에 보기",
    paragraphs: [
      "세종은 행정중심복합도시 생활권을 중심으로 주거·업무·교육 인프라가 계획적으로 배치된 지역입니다. 생활권 위치와 BRT 접근성, 학교와 상업시설 이용 여건을 함께 확인하는 것이 좋습니다.",
      "집눈에서는 세종 지역의 현재 공개된 분양 단지를 모아 청약 일정, 분양가, 입주 예정일과 입지 정보를 단지별로 비교할 수 있습니다.",
    ],
  },
  경기: {
    title:
      "경기 분양시장 한눈에 보기",
    paragraphs: [
      "경기도는 서울 인접 지역과 수도권 신도시, 산업도시와 외곽 생활권까지 주거환경이 매우 다양합니다. 같은 경기도라도 서울 접근성, 철도망, 자족시설과 공급 규모에 따라 단지별 조건 차이가 큽니다.",
      "집눈에서는 경기 지역의 청약·선착순 분양 단지를 모아 분양가, 계약조건, 입주 예정일과 주요 입지를 확인하고 관심단지 저장과 비교 기능까지 이용할 수 있습니다.",
    ],
  },
  강원: {
    title:
      "강원 분양시장 한눈에 보기",
    paragraphs: [
      "강원은 춘천·원주·강릉 등 주요 도시를 중심으로 생활권과 교통 여건이 구분되는 지역입니다. 수도권 접근성, 지역 내 산업·관광 수요와 생활 인프라를 단지별로 살펴볼 필요가 있습니다.",
      "집눈에서는 강원 지역의 현재 공개된 분양 단지를 모아 분양가, 계약조건, 입주 예정일과 생활환경을 한눈에 확인할 수 있습니다.",
    ],
  },
  충북: {
    title:
      "충북 분양시장 한눈에 보기",
    paragraphs: [
      "충북은 청주 생활권을 중심으로 충주·음성·진천 등 산업단지 배후 주거지역의 공급이 함께 나타나는 지역입니다. 직주근접성, 광역교통망과 생활 인프라를 단지별로 비교하는 것이 중요합니다.",
      "집눈에서는 충북 지역의 청약·선착순 분양 단지를 모아 분양가와 계약조건, 입주 일정, 교통·교육환경을 한눈에 확인할 수 있습니다.",
    ],
  },
  충남: {
    title:
      "충남 분양시장 한눈에 보기",
    paragraphs: [
      "충남은 천안·아산 생활권과 내포신도시, 서해안 산업도시 등 다양한 주거시장이 형성된 지역입니다. 산업단지 접근성, 철도와 고속도로, 신도시 생활 인프라를 함께 살펴보는 것이 좋습니다.",
      "집눈에서는 충남 지역의 분양 단지를 모아 분양가, 계약금과 중도금 조건, 입주 예정일을 확인하고 두 단지를 같은 기준으로 비교할 수 있습니다.",
    ],
  },
  전북: {
    title:
      "전북 분양시장 한눈에 보기",
    paragraphs: [
      "전북은 전주 생활권을 중심으로 익산·군산 등 주요 도시의 신규 공급이 함께 나타나는 지역입니다. 도심 접근성, 산업단지와 교통망, 주변 신축 공급을 단지별로 확인하는 것이 중요합니다.",
      "집눈에서는 전북 지역의 현재 공개된 분양 단지를 모아 분양가, 계약조건, 입주 일정과 주요 생활환경을 비교할 수 있습니다.",
    ],
  },
  전남: {
    title:
      "전남 분양시장 한눈에 보기",
    paragraphs: [
      "전남은 순천·여수·광양과 나주 등 도시별 산업과 생활권 특성이 뚜렷한 지역입니다. 직주근접성, 교통망과 지역 내 생활 인프라를 단지별로 구분해 살펴보는 것이 좋습니다.",
      "집눈에서는 전남 지역의 청약·선착순 분양 단지를 모아 분양가, 계약조건, 입주 예정일과 입지 정보를 한눈에 확인할 수 있습니다.",
    ],
  },
  경북: {
    title:
      "경북 분양시장 한눈에 보기",
    paragraphs: [
      "경북은 포항·구미·경산 등 주요 도시와 산업단지 배후 생활권을 중심으로 신규 공급이 이루어지는 지역입니다. 산업 접근성, 대구 생활권 연계와 교통 여건을 단지별로 비교할 필요가 있습니다.",
      "집눈에서는 경북 지역의 현재 공개된 분양 단지를 모아 분양가, 계약조건, 입주 일정과 주요 생활환경을 확인할 수 있습니다.",
    ],
  },
  경남: {
    title:
      "경남 분양시장 한눈에 보기",
    paragraphs: [
      "경남은 창원·김해·양산·진주 등 도시별 생활권과 산업 기반이 뚜렷한 지역입니다. 부산·울산 접근성, 산업단지와 도심 인프라를 단지별로 나누어 살펴보는 것이 중요합니다.",
      "집눈에서는 경남 지역의 청약·선착순 분양 단지를 모아 분양가와 계약조건, 입주 예정일, 교통·교육·생활환경을 비교할 수 있습니다.",
    ],
  },
  제주: {
    title:
      "제주 분양시장 한눈에 보기",
    paragraphs: [
      "제주는 제주시와 서귀포시를 중심으로 생활권과 공급 여건이 구분되는 지역입니다. 도심 접근성, 관광·업무 수요, 교통과 생활 인프라를 단지별로 확인하는 것이 중요합니다.",
      "집눈에서는 제주 지역의 현재 공개된 분양 단지를 모아 분양가, 계약조건, 입주 예정일과 주요 입지 정보를 한눈에 확인할 수 있습니다.",
    ],
  },
};

function getRegionDescription(
  cityName: string
): RegionDescription {
  return (
    REGION_DESCRIPTIONS[
      cityName
    ] ?? {
      title:
        `${cityName} 분양시장 한눈에 보기`,
      paragraphs: [
        `${cityName} 지역의 신규 분양과 청약·선착순 공급은 생활권, 교통, 교육환경과 입주 시점에 따라 단지별 차이가 나타날 수 있습니다.`,
        `집눈에서는 ${cityName} 지역의 분양가, 계약조건, 입주 예정일과 주요 입지를 단지별로 확인하고 관심단지 저장과 비교 기능까지 이용할 수 있습니다.`,
      ],
    }
  );
}

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
        "min-w-0 rounded-2xl border px-4 py-4",
        "sm:px-5 sm:py-5",
        className,
      ].join(" ")}
    >
      <p className="text-[11px] font-extrabold opacity-70 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
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
    getConditionText(apartment);

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:rounded-3xl">
      <Link
        href={`/apartments/${apartment.slug}`}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
      >
        {image ? (
          <Image
            src={image}
            alt={`${apartment.name} 대표 이미지`}
            fill
            loading="lazy"
            quality={68}
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 50vw, 580px"
            className="object-cover"
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

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {apartment.brand && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600 sm:text-xs">
              {apartment.brand}
            </span>
          )}

          {apartment.type && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600 sm:text-xs">
              {apartment.type}
            </span>
          )}
        </div>

        <Link
          href={`/apartments/${apartment.slug}`}
          className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <h3 className="mt-3 line-clamp-2 break-keep text-lg font-black leading-6 text-[#132238] transition group-hover:text-emerald-700 sm:text-xl">
            {apartment.name}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-1 text-xs text-zinc-500 sm:text-sm">
          {apartment.region ||
            "주소 정보 확인 중"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="min-w-0 rounded-xl bg-zinc-50 px-3 py-3">
            <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
              대표 분양가
            </p>

            <p className="mt-1 line-clamp-2 break-keep text-xs font-black leading-5 text-[#132238] sm:text-sm">
              {price}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-emerald-50/70 px-3 py-3">
            <p className="text-[10px] font-bold text-emerald-700 sm:text-xs">
              핵심 계약조건
            </p>

            <p className="mt-1 line-clamp-2 break-keep text-xs font-black leading-5 text-emerald-900 sm:text-sm">
              {condition}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/compare?left=${encodeURIComponent(
              apartment.slug
            )}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
          >
            비교하기
          </Link>

          <Link
            href={`/apartments/${apartment.slug}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#132238] px-3 text-xs font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
          >
            상세보기 →
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactBenefitCard({
  apartment,
}: {
  apartment: Apartment;
}) {
  const image =
    getHeroImage(apartment);

  const lowInitial =
    hasLowInitialContract(
      apartment
    );

  const freeMiddle =
    hasFreeMiddlePayment(
      apartment
    );

  const fixed500 =
    hasFixed500Contract(
      apartment
    );

  return (
    <Link
      href={`/apartments/${apartment.slug}`}
      className="group flex w-[280px] shrink-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:w-[320px]"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        {image ? (
          <Image
            src={image}
            alt={`${apartment.name} 대표 이미지`}
            fill
            loading="lazy"
            quality={60}
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] font-bold text-zinc-400">
            이미지 준비 중
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1">
          {fixed500 && (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
              계약금 500만원
            </span>
          )}

          {!fixed500 &&
            lowInitial && (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
                초기부담 낮음
              </span>
            )}

          {freeMiddle && (
            <span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-black text-violet-700">
              중도금 무이자
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-2 break-keep text-sm font-black leading-5 text-[#132238] transition group-hover:text-emerald-700">
          {apartment.name}
        </p>

        <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">
          {getConditionText(
            apartment
          )}
        </p>
      </div>
    </Link>
  );
}

function MainApartmentSection({
  eyebrow,
  title,
  description,
  apartments,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  apartments: Apartment[];
  accent: "emerald" | "blue";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-600"
      : "text-blue-600";

  return (
    <section className="mt-9 sm:mt-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={[
              "text-xs font-extrabold sm:text-sm",
              accentClass,
            ].join(" ")}
          >
            {eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
            {description}
          </p>
        </div>

        <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-black text-zinc-600 shadow-sm ring-1 ring-zinc-200">
          {apartments.length}개 단지
        </span>
      </div>

      {apartments.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {apartments.map(
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
      ) : (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
          현재 공개된 단지가 없습니다.
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

  const featuredConditionApartments =
    Array.from(
      new Map(
        [
          ...fixed500Apartments,
          ...freeMiddlePaymentApartments,
          ...lowInitialContractApartments,
        ].map((apartment) => [
          apartment.slug,
          apartment,
        ])
      ).values()
    ).slice(0, 10);

  const regionDescription =
    getRegionDescription(
      safeCityName
    );

  const currentStatusSummary = [
    `${safeCityName} 지역에서 현재 ${regionApartments.length}개 단지를 확인할 수 있습니다.`,
    subscriptionApartments.length >
    0
      ? `청약 단지는 ${subscriptionApartments.length}개입니다.`
      : "",
    firstComeApartments.length >
    0
      ? `선착순 분양 단지는 ${firstComeApartments.length}개입니다.`
      : "",
    freeMiddlePaymentApartments.length >
    0
      ? `중도금 무이자 조건이 확인된 단지는 ${freeMiddlePaymentApartments.length}개입니다.`
      : "",
    lowInitialContractApartments.length >
    0
      ? `초기 계약금 부담이 낮은 단지는 ${lowInitialContractApartments.length}개입니다.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

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
              {cityName} 분양 아파트
            </h1>

            <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-600 sm:mt-4 sm:text-base sm:leading-8">
              {cityName} 지역에서 공개
              중인 청약 아파트와 선착순
              분양 단지의 분양가,
              계약조건과 입지 정보를
              한눈에 확인해보세요.
            </p>

          </div>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
          <SummaryBox
            label="전체 공개"
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
        </section>

        {featuredConditionApartments.length >
          0 && (
          <section className="mt-8 sm:mt-10">
            <div>
              <p className="text-xs font-extrabold text-amber-600 sm:text-sm">
                GOOD CONDITIONS
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-[#132238] sm:text-2xl">
                조건 좋은 단지 빠르게 보기
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-zinc-500 sm:text-sm">
                계약금 부담이 낮거나 중도금 무이자 조건이 확인된 단지입니다.
              </p>
            </div>

            <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
              <div className="flex w-max gap-3">
                {featuredConditionApartments.map(
                  (apartment) => (
                    <CompactBenefitCard
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
            </div>
          </section>
        )}

        <MainApartmentSection
          eyebrow="FIRST COME"
          title={`${cityName} 선착순 분양`}
          description="현재 선착순 방식으로 확인할 수 있는 단지를 2열 카드로 모았습니다."
          apartments={
            firstComeApartments
          }
          accent="emerald"
        />

        <MainApartmentSection
          eyebrow="SUBSCRIPTION"
          title={`${cityName} 청약 아파트`}
          description="현재 공개된 청약 단지를 한곳에서 확인할 수 있습니다."
          apartments={
            subscriptionApartments
          }
          accent="blue"
        />

        <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-12 sm:rounded-3xl sm:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div>
              <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
                REGION GUIDE
              </p>

              <h2 className="mt-1 break-keep text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
                {
                  regionDescription.title
                }
              </h2>

              <div className="mt-4 space-y-3 break-keep text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                {regionDescription.paragraphs.map(
                  (
                    paragraph
                  ) => (
                    <p
                      key={
                        paragraph
                      }
                    >
                      {
                        paragraph
                      }
                    </p>
                  )
                )}
              </div>

              <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-4 sm:rounded-2xl sm:px-5">
                <p className="text-xs font-black text-emerald-700 sm:text-sm">
                  현재 등록 현황
                </p>

                <p className="mt-1.5 break-keep text-xs leading-6 text-emerald-900/80 sm:text-sm sm:leading-7">
                  {
                    currentStatusSummary
                  }
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
              <p className="text-sm font-black text-[#132238]">
                {safeCityName} 단지 더 찾아보기
              </p>

              <p className="mt-2 break-keep text-xs leading-5 text-zinc-500">
                지도검색에서 위치와 목록을 함께 확인하거나 전국 지역 허브로 이동할 수 있습니다.
              </p>

              <div className="mt-4 grid gap-2">
                <Link
                  href={`/search?q=${encodeURIComponent(
                    safeCityName
                  )}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#132238] px-4 text-sm font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  {safeCityName} 지도검색 →
                </Link>

                <Link
                  href="/region"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  전국 지역별 보기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
