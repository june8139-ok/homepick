import type {
  Metadata,
} from "next";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getBriefing,
  getBriefings,
} from "../../../lib/getBriefings";

import {
  getApartments,
} from "../../../lib/getApartments";

import type {
  Apartment,
} from "../../../types/apartment";

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

function truncateText(
  value: string,
  maximum = 155
) {
  const text = value
    .replace(/\s+/g, " ")
    .trim();

  if (
    text.length <=
    maximum
  ) {
    return text;
  }

  return `${text
    .slice(
      0,
      maximum - 1
    )
    .trim()}…`;
}

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
      month: "long",
      day: "numeric",
    }
  ).format(new Date(value));
}

function isExplicitlyUnpublished(
  briefing: unknown
) {
  if (
    !briefing ||
    typeof briefing !== "object"
  ) {
    return false;
  }

  const value = (
    briefing as {
      isPublished?: unknown;
      published?: unknown;
    }
  );

  return (
    value.isPublished === false ||
    value.published === false
  );
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const briefing =
    await getBriefing(slug);

  if (!briefing) {
    return {
      title:
        "브리핑을 찾을 수 없습니다 | 홈픽",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical =
    `${SITE_URL}/briefing/${briefing.slug}`;

  const description =
    truncateText(
      briefing.summary ||
        briefing.content
    );

  return {
    title: {
      absolute:
        `${briefing.title} | 홈픽 브리핑`,
    },

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "article",
      locale: "ko_KR",
      url: canonical,
      siteName:
        "홈픽(HomePick)",
      title:
        briefing.title,
      description,

      publishedTime:
        briefing.publishedAt ||
        briefing.createdAt,

      modifiedTime:
        briefing.updatedAt ||
        briefing.publishedAt ||
        briefing.createdAt,

      images:
        briefing.thumbnailUrl
          ? [
              {
                url:
                  briefing.thumbnailUrl,

                alt:
                  briefing.title,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        briefing.thumbnailUrl
          ? "summary_large_image"
          : "summary",

      title:
        briefing.title,

      description,

      images:
        briefing.thumbnailUrl
          ? [
              briefing.thumbnailUrl,
            ]
          : undefined,
    },
  };
}

export default async function BriefingDetailPage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const briefing =
    await getBriefing(slug);

  if (!briefing) {
    notFound();
  }

  const [
    apartments,
    briefings,
  ] = await Promise.all([
    getApartments({
      publishedOnly: true,
    }) as Promise<Apartment[]>,

    getBriefings({
      publishedOnly: true,
    }),
  ]);

  const relatedApartments =
    apartments.filter(
      (apartment) =>
        briefing.relatedApartmentSlugs.includes(
          apartment.slug
        )
    );

  const relatedBriefings =
    briefings
      .filter(
        (item) =>
          item.slug !==
            briefing.slug &&
          (
            item.region ===
              briefing.region ||
            item.category ===
              briefing.category
          )
      )
      .slice(0, 3);

  const canonical =
    `${SITE_URL}/briefing/${briefing.slug}`;

  const description =
    truncateText(
      briefing.summary ||
        briefing.content
    );

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
          "홈픽 브리핑",

        item:
          `${SITE_URL}/briefing`,
      },
      {
        "@type":
          "ListItem",

        position: 3,

        name:
          briefing.title,

        item: canonical,
      },
    ],
  };

  const articleJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    "@id":
      `${canonical}#article`,

    headline:
      briefing.title,

    description,

    image:
      briefing.thumbnailUrl
        ? [
            briefing.thumbnailUrl,
          ]
        : undefined,

    datePublished:
      briefing.publishedAt ||
      briefing.createdAt,

    dateModified:
      briefing.updatedAt ||
      briefing.publishedAt ||
      briefing.createdAt,

    inLanguage:
      "ko-KR",

    articleSection:
      briefing.category ||
      undefined,

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        canonical,
    },

    author: {
      "@type":
        "Organization",

      name:
        "홈픽(HomePick)",

      url:
        SITE_URL,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "홈픽(HomePick)",

      url:
        SITE_URL,

      logo: {
        "@type":
          "ImageObject",

        url:
          `${SITE_URL}/icon-512.png`,
      },
    },
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd
          ).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <article className="mx-auto max-w-4xl">
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
            href="/briefing"
            className="transition hover:text-emerald-700"
          >
            홈픽 브리핑
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="font-semibold text-zinc-700">
            {briefing.category}
          </span>
        </nav>

        <header className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
              {briefing.category}
            </span>

            {briefing.region && (
              <span className="text-xs font-semibold text-zinc-400">
                {briefing.region}
              </span>
            )}
          </div>

          <h1 className="mt-4 break-keep text-3xl font-black leading-tight tracking-tight text-[#132238] sm:text-4xl sm:leading-tight">
            {briefing.title}
          </h1>

          <p className="mt-4 break-keep text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
            {briefing.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-zinc-400">
            <time
              dateTime={
                briefing.publishedAt ||
                briefing.createdAt
              }
            >
              게시{" "}
              {formatDate(
                briefing.publishedAt ||
                  briefing.createdAt
              )}
            </time>

            {briefing.updatedAt &&
              briefing.updatedAt !==
                briefing.publishedAt &&
              briefing.updatedAt !==
                briefing.createdAt && (
                <time
                  dateTime={
                    briefing.updatedAt
                  }
                >
                  수정{" "}
                  {formatDate(
                    briefing.updatedAt
                  )}
                </time>
              )}
          </div>
        </header>

        {briefing.thumbnailUrl && (
          <div className="relative mt-5 h-[240px] overflow-hidden rounded-2xl bg-zinc-100 shadow-sm sm:mt-6 sm:h-[420px] sm:rounded-3xl">
            <Image
              src={
                briefing.thumbnailUrl
              }
              alt={`${briefing.title} 대표 이미지`}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8">
          <div className="whitespace-pre-wrap break-keep text-sm leading-8 text-zinc-700 sm:text-base sm:leading-9">
            {briefing.content}
          </div>
        </section>

        {relatedApartments.length >
          0 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6">
            <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
              RELATED APARTMENTS
            </p>

            <h2 className="mt-1 text-xl font-black text-[#132238] sm:text-2xl">
              관련 분양 단지
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedApartments.map(
                (apartment) => {
                  const image =
                    getHeroImage(
                      apartment
                    );

                  return (
                    <Link
                      key={
                        apartment.slug
                      }
                      href={`/apartments/${apartment.slug}`}
                      className="group flex min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="relative h-28 w-28 shrink-0 bg-zinc-100">
                        {image ? (
                          <Image
                            src={
                              image
                            }
                            alt={`${apartment.name} 대표 이미지`}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                            이미지 준비 중
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 p-3">
                        <p className="text-[10px] font-bold text-emerald-600">
                          {apartment.cityName ||
                            apartment.city}
                        </p>

                        <h3 className="mt-1 line-clamp-2 break-keep text-sm font-black leading-5 text-[#132238] group-hover:text-emerald-700">
                          {apartment.name}
                        </h3>

                        <p className="mt-1 line-clamp-1 text-[10px] text-zinc-500">
                          {apartment.priceDetail
                            ?.salePrice ||
                            apartment.price ||
                            "분양가 확인 중"}
                        </p>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        )}

        {relatedBriefings.length >
          0 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6">
            <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
              MORE BRIEFINGS
            </p>

            <h2 className="mt-1 text-xl font-black text-[#132238] sm:text-2xl">
              함께 읽을 브리핑
            </h2>

            <div className="mt-4 grid gap-2">
              {relatedBriefings.map(
                (item) => (
                  <Link
                    key={
                      item.id
                    }
                    href={`/briefing/${item.slug}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-emerald-600">
                        {item.category}
                      </p>

                      <p className="mt-1 truncate text-sm font-extrabold text-[#132238]">
                        {item.title}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-black text-emerald-700">
                      읽기 →
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        <div className="mt-6 flex justify-center sm:mt-8">
          <Link
            href="/briefing"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            브리핑 목록으로
          </Link>
        </div>
      </article>
    </main>
  );
}