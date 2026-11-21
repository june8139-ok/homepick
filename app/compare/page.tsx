import type { Metadata } from "next";
import { Suspense } from "react";

import CompareClient from "./CompareClient";
import { normalizeApartment } from "../../lib/normalizeApartment";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://jibnun.com";

/*
 * 비교페이지는 사용자가 선택한 단지 조합에 따라
 * ?left=...&right=... 형태의 URL이 계속 생성될 수 있습니다.
 *
 * 검색결과에 노출할 독립 콘텐츠 페이지가 아니라
 * 사이트 내부 기능 페이지이므로 noindex, follow 처리합니다.
 * 크롤러는 내부 링크를 계속 따라갈 수 있습니다.
 */
export const metadata: Metadata = {
  title: "아파트 비교",

  description:
    "집눈에서 관심 아파트의 분양가, 계약조건, 입지와 주요 정보를 같은 기준으로 비교하세요.",

  alternates: {
    canonical: `${SITE_URL}/compare`,
  },

  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${SITE_URL}/compare`,
    siteName: "집눈",
    title: "아파트 비교 | 집눈",
    description:
      "관심 아파트의 분양가, 계약조건과 주요 정보를 집눈에서 비교하세요.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "집눈 아파트 비교",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "아파트 비교 | 집눈",
    description:
      "관심 아파트의 분양가, 계약조건과 주요 정보를 집눈에서 비교하세요.",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

function CompareLoading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-zinc-200" />

          <div className="mt-4 h-10 w-64 rounded bg-zinc-200" />

          <div className="mt-3 h-5 w-96 max-w-full rounded bg-zinc-200" />

          <div className="mt-8 flex gap-4 overflow-hidden">
            <div className="h-[430px] min-w-[340px] rounded-3xl bg-white shadow-sm" />

            <div className="h-[430px] min-w-[340px] rounded-3xl bg-white shadow-sm" />
          </div>

          <div className="mt-8 h-96 rounded-3xl bg-white shadow-sm" />
        </div>
      </section>
    </main>
  );
}

type CompareParams = Record<string, string | string[] | undefined>;

async function CompareResults({ searchParams }: { searchParams: Promise<CompareParams> }) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const ids = first(params.ids)?.split(",").map((slug) => slug.trim()).filter(Boolean) ?? [];
  const legacy = [first(params.left), first(params.right)].filter((slug): slug is string => Boolean(slug));
  const slugs = [...new Set(ids.length ? ids : legacy)].slice(0, 2);
  if (!slugs.length) return <CompareClient apartments={[]} />;

  const { data, error } = await supabase.from("apartments").select("*")
    .eq("is_published", true).in("slug", slugs);
  if (error) throw new Error("비교할 단지를 조회하지 못했습니다.", { cause: error });

  const bySlug = new Map((data ?? []).map((row) => [row.slug, normalizeApartment(row)]));
  return <CompareClient apartments={slugs.flatMap((slug) => {
    const apartment = bySlug.get(slug);
    return apartment ? [apartment] : [];
  })} />;
}

export default function ComparePage({ searchParams }: { searchParams: Promise<CompareParams> }) {
  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareResults searchParams={searchParams} />
    </Suspense>
  );
}
