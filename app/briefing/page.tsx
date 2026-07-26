import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import {
  getBriefings,
} from "../../lib/getBriefings";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://homepick.kr";

const TITLE =
  "홈픽 브리핑 | 청약·선착순·계약조건 변경 소식";

const DESCRIPTION =
  "전국 청약 일정, 선착순 분양 소식, 계약조건 변경과 지역별 분양시장 정보를 홈픽 브리핑에서 확인하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical:
      `${SITE_URL}/briefing`,
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url:
      `${SITE_URL}/briefing`,
    siteName:
      "홈픽(HomePick)",
    title: TITLE,
    description: DESCRIPTION,
  },

  twitter: {
    card:
      "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date(value));
}

function getCategoryClass(
  category: string
) {
  if (
    category === "청약 일정"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    category ===
    "선착순 소식"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    category ===
    "계약조건 변경"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-violet-50 text-violet-700";
}

export default async function BriefingPage() {
  const briefings =
    await getBriefings({
      publishedOnly: true,
    });

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
        name: "홈픽 브리핑",
        item:
          `${SITE_URL}/briefing`,
      },
    ],
  };

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
            홈픽 브리핑
          </span>
        </nav>

        <section className="mt-5 overflow-hidden rounded-2xl bg-[#132238] p-5 text-white shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
          <p className="text-xs font-extrabold tracking-wide text-emerald-300 sm:text-sm">
            HOMEPICK BRIEFING
          </p>

          <h1 className="mt-2 break-keep text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            홈픽 브리핑
          </h1>

          <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-300 sm:mt-4 sm:text-base sm:leading-8">
            청약 일정과 선착순 분양,
            계약조건 변경과 지역별
            분양시장 소식을 빠르게
            정리해드립니다.
          </p>
        </section>

        {briefings.length > 0 ? (
          <section className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 xl:grid-cols-3">
            {briefings.map(
              (briefing) => (
                <article
                  key={briefing.id}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg sm:rounded-3xl"
                >
                  <Link
                    href={`/briefing/${briefing.slug}`}
                    className="block"
                  >
                    <div className="relative h-44 overflow-hidden bg-zinc-100 sm:h-48">
                      {briefing.thumbnailUrl ? (
                        <Image
                          src={
                            briefing.thumbnailUrl
                          }
                          alt={`${briefing.title} 대표 이미지`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50">
                          <div className="text-center">
                            <p className="text-4xl">
                              📰
                            </p>

                            <p className="mt-2 text-xs font-bold text-zinc-400">
                              홈픽 브리핑
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[10px] font-extrabold sm:text-xs",
                            getCategoryClass(
                              briefing.category
                            ),
                          ].join(" ")}
                        >
                          {
                            briefing.category
                          }
                        </span>

                        {briefing.region && (
                          <span className="text-[10px] font-semibold text-zinc-400 sm:text-xs">
                            {
                              briefing.region
                            }
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3 line-clamp-2 break-keep text-lg font-black leading-7 text-[#132238] transition group-hover:text-emerald-700 sm:text-xl">
                        {briefing.title}
                      </h2>

                      <p className="mt-2 line-clamp-3 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                        {briefing.summary}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <time className="text-[10px] font-medium text-zinc-400 sm:text-xs">
                          {formatDate(
                            briefing.publishedAt ||
                              briefing.createdAt
                          )}
                        </time>

                        <span className="text-xs font-black text-emerald-700 transition-transform group-hover:translate-x-1 sm:text-sm">
                          자세히 보기 →
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            )}
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white px-5 py-14 text-center shadow-sm sm:mt-10 sm:rounded-3xl">
            <h2 className="text-xl font-black">
              아직 공개된 브리핑이 없습니다.
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              청약과 분양시장 소식이
              등록되면 이곳에 자동으로
              표시됩니다.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}