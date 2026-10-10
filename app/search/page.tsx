import type { Metadata } from "next";
import { Suspense } from "react";

import SearchClient from "./SearchClient";
import { getApartments } from "../../lib/getApartments";

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

function SearchLoading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1760px] px-4 py-5 sm:px-5 sm:py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-36 rounded bg-zinc-200" />

            <div className="mt-3 h-9 w-64 max-w-full rounded bg-zinc-200 sm:h-10 sm:w-80" />

            <div className="mt-5 h-14 max-w-4xl rounded-2xl bg-zinc-100 sm:mt-6 sm:h-16" />

            <div className="mt-4 h-16 rounded-2xl bg-zinc-100 sm:mt-5 sm:h-20" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1760px] px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
        {/* 모바일 로딩 화면 */}
        <div className="lg:hidden">
          <div className="h-[42vh] min-h-[320px] max-h-[460px] animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="mt-4 h-5 w-32 animate-pulse rounded bg-zinc-200" />

          <div className="mt-3 flex gap-3 overflow-hidden">
            <div className="h-40 w-[84vw] max-w-[360px] shrink-0 animate-pulse rounded-2xl bg-white shadow-sm" />

            <div className="h-40 w-[84vw] max-w-[360px] shrink-0 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>

        {/* PC 로딩 화면 */}
        <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(410px,0.62fr)_minmax(700px,1.38fr)]">
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />

            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>

          <div className="min-h-[680px] animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </section>
    </main>
  );
}

export default async function SearchPage() {
  const apartments = await getApartments();

  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchClient apartments={apartments} />
    </Suspense>
  );
}
