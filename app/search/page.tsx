import type { Metadata } from "next";
import { Suspense } from "react";

import SearchClient from "./SearchClient";
import { getApartments } from "../../lib/getApartments";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://homepick.co.kr";

export const metadata: Metadata = {
  title: "전국 분양 아파트 지도검색",

  description:
    "홈픽에서 전국 분양 아파트와 청약 단지, 선착순 분양 정보를 지도와 목록으로 검색하고 비교하세요.",

  alternates: {
    canonical: `${SITE_URL}/search`,
  },

  /*
   * 검색어·필터 조합으로 비슷한 URL이 많이 만들어질 수 있으므로
   * 검색 결과 페이지 자체는 색인하지 않고 링크 탐색만 허용합니다.
   */
  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
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
    siteName: "홈픽(HomePick)",

    title:
      "전국 분양 아파트 지도검색 | 홈픽",

    description:
      "전국 청약·선착순 분양 단지를 지도에서 찾고 분양가와 계약조건을 비교하세요.",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "전국 분양 아파트 지도검색 | 홈픽",

    description:
      "전국 청약·선착순 분양 단지를 지도에서 검색하고 비교하세요.",
  },
};

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
  const apartments =
    await getApartments();

  return (
    <Suspense
      fallback={<SearchLoading />}
    >
      <SearchClient
        apartments={apartments}
      />
    </Suspense>
  );
}