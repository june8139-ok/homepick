import type { Metadata } from "next";

import { Suspense } from "react";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import SiteHeader from "../components/Layout/SiteHeader";
import SiteFooter from "../components/Layout/SiteFooter";
import RouteLoadingIndicator from "../components/Layout/RouteLoadingIndicator";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

const SITE_NAME = "집눈";

const DEFAULT_TITLE =
  "집눈 | 전국 부동산을 한눈에";

const DEFAULT_DESCRIPTION =
  "집눈은 전국 분양 아파트와 청약·선착순 정보, 분양가·계약조건·입지를 한눈에 비교하는 부동산 플랫폼입니다.";

const googleVerification =
  process.env
    .NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const naverVerification =
  process.env
    .NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(
    SITE_URL
  ),

  title: {
    default: DEFAULT_TITLE,

    /*
     * 단지 상세페이지 등에서는
     * "단지명 분양가·계약조건 | 집눈" 형태로 표시됩니다.
     */
    template: "%s | 집눈",
  },

  description:
    DEFAULT_DESCRIPTION,

  applicationName:
    SITE_NAME,

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,

  publisher: SITE_NAME,

  category: "real estate",

  keywords: [
    "집눈",
    "집눈 부동산",
    "전국 부동산",
    "부동산 플랫폼",
    "분양 아파트",
    "아파트 분양",
    "분양정보",
    "청약 일정",
    "청약 아파트",
    "선착순 분양",
    "미분양 아파트",
    "잔여세대",
    "신규 아파트",
    "아파트 비교",
    "분양가",
    "계약조건",
    "평면도",
    "모델하우스",
  ],

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,

    siteName:
      SITE_NAME,

    title:
      DEFAULT_TITLE,

    description:
      DEFAULT_DESCRIPTION,

    /*
     * app/opengraph-image.tsx에서
     * 카카오톡·네이버·SNS 공유 이미지를 제공합니다.
     */
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "집눈 전국 부동산을 한눈에",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      DEFAULT_TITLE,

    description:
      DEFAULT_DESCRIPTION,

    images: [
      "/opengraph-image",
    ],
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

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
    ],

    shortcut:
      "/favicon.ico",

    apple:
      "/apple-touch-icon.png",
  },

  /*
   * 인증값이 있을 때만
   * 검색엔진 인증 메타태그를 생성합니다.
   */
  verification: {
    ...(googleVerification
      ? {
          google:
            googleVerification,
        }
      : {}),

    ...(naverVerification
      ? {
          other: {
            "naver-site-verification":
              naverVerification,
          },
        }
      : {}),
  },
};

const organizationJsonLd = {
  "@context":
    "https://schema.org",

  "@type":
    "Organization",

  "@id":
    `${SITE_URL}/#organization`,

  name:
    SITE_NAME,

  url:
    SITE_URL,

  slogan:
    "전국 부동산을 한눈에",

  logo: {
    "@type":
      "ImageObject",

    url:
      `${SITE_URL}/icon-512.png`,
  },

  description:
    DEFAULT_DESCRIPTION,
};

const websiteJsonLd = {
  "@context":
    "https://schema.org",

  "@type":
    "WebSite",

  "@id":
    `${SITE_URL}/#website`,

  url:
    SITE_URL,

  name:
    SITE_NAME,

  description:
    DEFAULT_DESCRIPTION,

  publisher: {
    "@id":
      `${SITE_URL}/#organization`,
  },

  inLanguage:
    "ko-KR",

  potentialAction: {
    "@type":
      "SearchAction",

    target: {
      "@type":
        "EntryPoint",

      urlTemplate:
        `${SITE_URL}/search?q={search_term_string}`,
    },

    "query-input":
      "required name=search_term_string",
  },
};

function JsonLd({
  data,
}: {
  data: unknown;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          JSON.stringify(
            data
          ).replace(
            /</g,
            "\\u003c"
          ),
      }}
    />
  );
}

function SiteHeaderFallback() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[68px] border-b border-zinc-200/80 bg-white sm:min-h-[72px]"
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-[#F7F8FA] antialiased`}
    >
      <body className="min-h-full bg-[#F7F8FA] text-[#111827]">
        <JsonLd
          data={
            organizationJsonLd
          }
        />

        <JsonLd
          data={
            websiteJsonLd
          }
        />

        <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
          <Suspense fallback={null}>
            <RouteLoadingIndicator />
          </Suspense>

          <Suspense
            fallback={
              <SiteHeaderFallback />
            }
          >
            <SiteHeader />
          </Suspense>

          <div className="min-w-0 min-h-[calc(100svh-72px)] flex-1 bg-[#F7F8FA]">
            {children}
          </div>

          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
