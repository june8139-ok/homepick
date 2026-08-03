import type {
  Metadata,
} from "next";

import {
  getApartments,
} from "../../lib/getApartments";

import type {
  Apartment,
} from "../../types/apartment";

import FavoritesClient from "./FavoritesClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

export const metadata: Metadata = {
  title: "관심단지",

  description:
    "저장한 관심 분양 아파트를 확인하고 두 단지를 비교해보세요.",

  alternates: {
    canonical:
      `${SITE_URL}/favorites`,
  },

  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default async function FavoritesPage() {
  const apartments =
    (await getApartments({
      publishedOnly: true,
    })) as Apartment[];

  return (
    <FavoritesClient
      apartments={apartments}
    />
  );
}