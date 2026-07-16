import type { Metadata } from "next";
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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HomePick | 전국 부동산을 한눈에",
    template: "%s | HomePick",
  },

  description:
    "전국 부동산과 분양정보, 청약 일정, 선착순 단지와 지역별 정보를 한눈에 확인하세요.",

  keywords: [
    "HomePick",
    "홈픽",
    "부동산",
    "아파트",
    "분양정보",
    "청약일정",
    "선착순 분양",
    "신규 아파트",
  ],

  openGraph: {
    title: "HomePick | 전국 부동산을 한눈에",
    description:
      "분양정보, 청약 일정, 선착순 단지와 지역별 부동산 정보를 한눈에 확인하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "HomePick",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F7F8FA] text-[#111827]">
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <SiteHeader />

          {/* Main */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}