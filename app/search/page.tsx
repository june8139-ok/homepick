import type { Metadata } from "next";
import { Suspense } from "react";

import SearchClient from "./SearchClient";
import SearchLoading from "./components/SearchLoading";
import { getApartments } from "../../lib/getApartments";
import { toSearchApartment } from "../../lib/searchApartmentData";

/*
 * 검색페이지는 청약홈 동기화 직후에도 충분히 빠르게 반영되도록
 * 60초 단위로 재검증합니다.
 *
 * 매 이동마다 전체 단지 데이터를 다시 읽는 force-dynamic은
 * 모바일 페이지 전환 지연을 크게 만들 수 있어 사용하지 않습니다.
 */
export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://jibnun.com";

type SearchPageProps = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

/*
 * /search 자체는 대표 검색 페이지이므로 색인을 허용합니다.
 *
 * 반면 /search?q=..., /search?recent=... 같은 검색결과 URL은
 * 조합이 무한히 늘어날 수 있고 내용·제목 중복 진단의 원인이 되므로
 * noindex, follow 처리합니다.
 *
 * canonical은 항상 /search로 통일합니다.
 */
export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = searchParams
    ? await searchParams
    : {};

  const hasSearchParams =
    Object.keys(params).length > 0;

  return {
    title: "전국 분양 아파트 지도검색",

    description:
      "집눈에서 전국 분양 아파트와 청약 단지, 선착순 분양 정보를 지도와 목록으로 검색하고 비교하세요.",

    alternates: {
      canonical: `${SITE_URL}/search`,
    },

    robots: hasSearchParams
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

            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },

    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: `${SITE_URL}/search`,
      siteName: "집눈",

      title: "전국 분양 아파트 지도검색 | 집눈",

      description:
        "전국 청약·선착순 분양 단지를 지도에서 찾고 분양가와 계약조건을 비교하세요.",

      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "집눈 | 전국 부동산을 한눈에",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: "전국 분양 아파트 지도검색 | 집눈",

      description:
        "전국 청약·선착순 분양 단지를 지도에서 검색하고 비교하세요.",

      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

async function SearchResults() {
  // 서버 처리 시간을 측정하는 임시 진단 코드입니다.
  // 원인 확인이 끝나면 측정 코드와 검사 예외 주석을 제거합니다.

  // eslint-disable-next-line react-hooks/purity
  const startedAt = performance.now();

  const apartments = await getApartments();

  // eslint-disable-next-line react-hooks/purity
  const fetchedAt = performance.now();

  const searchApartments = apartments.map(toSearchApartment);

  // eslint-disable-next-line react-hooks/purity
  const preparedAt = performance.now();

  console.info("[집눈 검색 처리시간]", {
    데이터조회_ms: Math.round(fetchedAt - startedAt),
    검색데이터정리_ms: Math.round(preparedAt - fetchedAt),
    전체_ms: Math.round(preparedAt - startedAt),
    단지수: searchApartments.length,
  });

  return <SearchClient apartments={searchApartments} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  );
}
