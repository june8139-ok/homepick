import type { Metadata } from "next";

import { Suspense } from "react";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import SiteHeader from "../components/Layout/SiteHeader";
import SiteFooter from "../components/Layout/SiteFooter";

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
  ) || "https://homepick.co.kr";

const SITE_NAME = "HomePick";
const KOREAN_SITE_NAME = "홈픽";
const DISPLAY_SITE_NAME =
  "홈픽(HomePick)";

const DEFAULT_TITLE =
  "홈픽(HomePick) | 전국 분양 아파트·청약·선착순 정보";

const DEFAULT_DESCRIPTION =
  "홈픽(HomePick)은 전국 분양 아파트와 청약 일정, 선착순 분양 단지의 분양가, 계약조건, 입지와 평면도를 검색하고 비교할 수 있는 부동산 플랫폼입니다.";

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
     * "단지명 분양가·계약조건 | 홈픽" 형태로 표시됩니다.
     */
    template: "%s | 홈픽",
  },

  description:
    DEFAULT_DESCRIPTION,

  applicationName:
    DISPLAY_SITE_NAME,

  authors: [
    {
      name:
        DISPLAY_SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator:
    DISPLAY_SITE_NAME,

  publisher:
    DISPLAY_SITE_NAME,

  category: "real estate",

  keywords: [
    "홈픽",
    "HomePick",
    "홈픽 부동산",
    "홈픽 분양",
    "HomePick 부동산",
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

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName:
      DISPLAY_SITE_NAME,
    title: DEFAULT_TITLE,
    description:
      DEFAULT_DESCRIPTION,

    /*
     * app/opengraph-image.tsx를 만들면
     * 이 주소에서 자동으로 이미지가 제공됩니다.
     */
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "홈픽 전국 분양 아파트·청약·선착순 정보",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",
    title: DEFAULT_TITLE,
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
   * 인증값이 있을 때만 해당 메타태그를 생성합니다.
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

  name: SITE_NAME,

  alternateName: [
    KOREAN_SITE_NAME,
    DISPLAY_SITE_NAME,
  ],

  url: SITE_URL,

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

  "@type": "WebSite",

  "@id":
    `${SITE_URL}/#website`,

  url: SITE_URL,

  name: SITE_NAME,

  alternateName: [
    KOREAN_SITE_NAME,
    DISPLAY_SITE_NAME,
  ],

  description:
    DEFAULT_DESCRIPTION,

  publisher: {
    "@id":
      `${SITE_URL}/#organization`,
  },

  inLanguage: "ko-KR",

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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

        <div className="flex min-h-screen flex-col">
          <Suspense
            fallback={
              <SiteHeaderFallback />
            }
          >
            <SiteHeader />
          </Suspense>

          <div className="flex-1">
            {children}
          </div>

          <SiteFooter />
        </div>
      </body>
    </html>
  );
}