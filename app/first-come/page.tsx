import type {
    Metadata,
  } from "next";
  
  import Link from "next/link";
  
  import ListingHubCard from "../../components/ListingHub/ListingHubCard";
  
  import {
    getApartments,
  } from "../../lib/getApartments";
  
  import {
    getVisibleFirstComeApartments,
  } from "../../lib/subscriptionVisibility";
  
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      ""
    ) || "https://jibnun.com";
  
  const PAGE_TITLE =
    "전국 선착순 분양 아파트·잔여세대";
  
  const PAGE_DESCRIPTION =
    "전국 선착순 분양 아파트와 잔여세대, 계약조건을 확인하세요. 분양가와 지역, 주요 조건을 집눈에서 한눈에 비교할 수 있습니다.";
  
  export const revalidate = 60;
  
  export const metadata: Metadata = {
    title: PAGE_TITLE,
    description:
      PAGE_DESCRIPTION,
  
    alternates: {
      canonical:
        `${SITE_URL}/first-come`,
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
        `${SITE_URL}/first-come`,
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
            "집눈 전국 선착순 분양 아파트",
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
  
  export default async function FirstComePage() {
    const apartments =
      await getApartments({
        publishedOnly: true,
      });
  
    const firstComeApartments =
      getVisibleFirstComeApartments(
        apartments
      );
  
    const itemListJsonLd = {
      "@context":
        "https://schema.org",
      "@type":
        "ItemList",
      name:
        "전국 선착순 분양 아파트",
      numberOfItems:
        firstComeApartments.length,
      itemListElement:
        firstComeApartments.map(
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
              선착순 분양
            </span>
          </nav>
  
          <section className="mt-5 overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f4fbf8_60%,#fff7f1_100%)] p-5 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-8 lg:p-10">
            <p className="text-xs font-extrabold text-emerald-700 sm:text-sm">
              집눈 선착순 분양
            </p>
  
            <h1 className="mt-2 break-keep text-3xl font-black tracking-tight text-[#132238] sm:text-4xl lg:text-5xl">
              전국 선착순 분양 아파트
            </h1>
  
            <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-zinc-600 sm:text-base sm:leading-8">
              선착순 동호지정,
              잔여세대와 계약조건이 공개된
              분양 단지를 지역과 분양가 기준으로
              한눈에 비교해보세요.
            </p>
  
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/search?q=선착순"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white transition hover:bg-emerald-700"
              >
                지도에서 선착순 단지 보기
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
            <div>
              <p className="text-xs font-extrabold text-emerald-700 sm:text-sm">
                현재 선착순 단지
              </p>
  
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
                {firstComeApartments.length}개 단지
              </h2>
            </div>
  
            {firstComeApartments.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3">
                {firstComeApartments.map(
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
                  현재 공개된 선착순 단지가 없습니다.
                </h2>
  
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  선착순으로 전환된 단지가 등록되면
                  자동으로 이 페이지에 표시됩니다.
                </p>
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }