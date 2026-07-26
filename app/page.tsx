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
  ) || "https://homepick.kr";

const HOME_TITLE =
  "홈픽(HomePick) | 전국 분양 아파트·청약·선착순 정보";

const HOME_DESCRIPTION =
  "홈픽(HomePick)은 전국 분양 아파트와 청약 일정, 선착순 분양 단지의 분양가, 계약조건, 입지와 평면도를 검색하고 비교할 수 있는 부동산 플랫폼입니다.";

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },

  description: HOME_DESCRIPTION,

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "홈픽(HomePick)",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },

  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default async function Home() {
  const [apartments, briefings] =
    await Promise.all([
      getApartments(),

      getBriefings({
        publishedOnly: true,
        limit: 3,
      }),
    ]);

  return (
    <HomeClient
      apartments={apartments}
      briefings={briefings}
    />
  );
}