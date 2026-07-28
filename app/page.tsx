import type { Metadata } from "next";

import HomeClient from "../components/Home/HomeClient";
import { getApartments } from "../lib/getApartments";
import { getBriefings } from "../lib/getBriefings";

/*
 * 홈 데이터는 최대 60초마다 다시 갱신합니다.
 *
 * 새 단지 등록, 공개/숨김 변경, 청약·선착순 상태 변경이
 * 홈 현황과 지역별 지도 숫자에 자동 반영됩니다.
 */
export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

const SITE_NAME =
  "집눈";

const HOME_TITLE =
  "집눈 | 전국 부동산을 한눈에";

const HOME_DESCRIPTION =
  "집눈은 전국 분양 아파트와 청약·선착순 정보, 분양가·계약조건·입지를 한눈에 비교하는 부동산 플랫폼입니다.";

export const metadata: Metadata = {
  /*
   * layout의 title template이 중복 적용되지 않도록
   * 홈페이지에서는 absolute 제목을 사용합니다.
   */
  title: {
    absolute:
      HOME_TITLE,
  },

  description:
    HOME_DESCRIPTION,

  alternates: {
    canonical:
      SITE_URL,
  },

  openGraph: {
    type:
      "website",

    locale:
      "ko_KR",

    url:
      SITE_URL,

    siteName:
      SITE_NAME,

    title:
      HOME_TITLE,

    description:
      HOME_DESCRIPTION,

    images: [
      {
        url:
          "/opengraph-image",

        width:
          1200,

        height:
          630,

        alt:
          "집눈 전국 부동산을 한눈에",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      HOME_TITLE,

    description:
      HOME_DESCRIPTION,

    images: [
      "/opengraph-image",
    ],
  },
};

export default async function Home() {
  const [
    apartments,
    briefings,
  ] = await Promise.all([
    getApartments(),

    getBriefings({
      publishedOnly: true,
      limit: 3,
    }),
  ]);

  return (
    <HomeClient
      apartments={
        apartments
      }
      briefings={
        briefings
      }
    />
  );
}