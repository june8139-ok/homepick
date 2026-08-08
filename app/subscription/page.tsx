import type {
    Metadata,
  } from "next";
  
  import Link from "next/link";
  
  import ListingHubCard from "../../components/ListingHub/ListingHubCard";
  
  import {
    getApartments,
  } from "../../lib/getApartments";
  
  import {
    getSubscriptionSortDate,
    getVisibleSubscriptions,
  } from "../../lib/subscriptionVisibility";
  
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      ""
    ) || "https://jibnun.com";
  
  const PAGE_TITLE =
    "전국 아파트 청약일정·청약중 단지";
  
  const PAGE_DESCRIPTION =
    "전국 아파트 청약일정과 청약예정·청약중 단지를 확인하세요. 특별공급, 1순위, 당첨자발표와 계약일정을 집눈에서 한눈에 볼 수 있습니다.";
  
  export const revalidate = 60;
  
  export const metadata: Metadata = {
    title: PAGE_TITLE,
    description:
      PAGE_DESCRIPTION,
  
    alternates: {
      canonical:
        `${SITE_URL}/subscription`,
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
        "max-video-preview": -1,
      },
    },
  
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url:
        `${SITE_URL}/subscription`,
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
            "집눈 전국 아파트 청약일정",
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
  
  export default async function SubscriptionPage() {
    const apartments =
      await getApartments({
        publishedOnly: true,
      });
  
    const subscriptions =
      getVisibleSubscriptions(
        apartments
      ).sort(
        (first, second) =>
          getSubscriptionSortDate(
            first
          ) -
          getSubscriptionSortDate(
            second
          )
      );
  
    const itemListJsonLd = {
      "@context":
        "https://schema.org",
      "@type":
        "ItemList",
      name:
        "전국 아파트 청약일정",
      numberOfItems:
        subscriptions.length,
      itemListElement:
        subscriptions.map(
          (apartment, index) => ({
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
  
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 sm:py-10">
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
              className="transition hover:text-emerald-700"
            >
              홈
            </Link>
  
            <span className="mx-2">
              /
            </span>
  
            <span className="font-semibold text-zinc-700">
              청약일정
            </span>
          </nav>
  
          <section className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_58%,#f0fbf7_100%)] p-5 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
            <p className="text-xs font-extrabold text-blue-700 sm:text-sm">
              집눈 청약일정
            </p>
  
            <h1 className="mt-2 break-keep text-3xl font-black tracking-tight text-[#132238] sm:text-4xl lg:text-5xl">
              전국 아파트 청약일정
            </h1>
  
            <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-600 sm:text-base sm:leading-8">
              청약예정부터 특별공급,
              1순위, 당첨자발표와 계약일정까지
              현재 확인 가능한 청약 단지를
              한곳에서 확인하세요.
            </p>
  
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/search?q=청약"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white transition hover:bg-blue-700"
              >
                지도에서 청약단지 보기
              </Link>
  
              <Link
                href="/region"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-xs font-extrabold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                지역별 분양정보
              </Link>
            </div>
          </section>
  
          <section className="mt-8 sm:mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-blue-700 sm:text-sm">
                  현재 청약 단지
                </p>
  
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
                  {subscriptions.length}개 단지
                </h2>
              </div>
            </div>
  
            {subscriptions.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3">
                {subscriptions.map(
                  (apartment, index) => (
                    <ListingHubCard
                      key={
                        apartment.slug
                      }
                      apartment={
                        apartment
                      }
                      priority={
                        index === 0
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-3xl">
                <h2 className="text-xl font-black">
                  현재 노출 가능한 청약 단지가 없습니다.
                </h2>
  
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  신규 청약공고가 등록되면
                  자동으로 이 페이지에 표시됩니다.
                </p>
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }