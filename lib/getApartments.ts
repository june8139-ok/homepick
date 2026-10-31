import { unstable_cache } from "next/cache";
import { gzipSync, gunzipSync } from "node:zlib";
import type { Apartment } from "../types/apartment";

import { supabase } from "./supabase";
import { normalizeApartment } from "./normalizeApartment";

type GetApartmentsOptions = {
  publishedOnly?: boolean;
};

async function fetchPublishedApartments() {
  const { data, error } = await supabase
    .from("apartments")
    .select("*")
    .eq("is_published", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "단지 목록 조회 오류:",
      error
    );

    return [];
  }

  return (data ?? []).map(
    normalizeApartment
  );
}

const getCachedPublishedApartments =
  unstable_cache(
    async () => {
      const apartments = await fetchPublishedApartments();
      // Next Data Cache는 항목 하나당 2MB로 제한됩니다.
      // 전체 목록을 압축된 문자열로 저장하고 반환 직전에 복원합니다.
      // 원본 DB와 상세페이지의 청약 기록은 변경하지 않습니다.
      return gzipSync(Buffer.from(JSON.stringify(apartments), "utf8"))
        .toString("base64");
    },
    ["published-apartments-gzip-v1"],
    {
      revalidate: 3600,
      tags: ["apartments"],
    }
  );

export async function getApartments(
  options: GetApartmentsOptions = {}
) {
  const {
    publishedOnly = true,
  } = options;

  if (publishedOnly) {
    const compressed = await getCachedPublishedApartments();
    return JSON.parse(
      gunzipSync(Buffer.from(compressed, "base64")).toString("utf8")
    ) as Apartment[];
  }

  /*
   * 관리자/비공개 포함 조회는 캐시하지 않습니다.
   */
  const { data, error } = await supabase
    .from("apartments")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "단지 목록 조회 오류:",
      error
    );

    return [];
  }

  return (data ?? []).map(
    normalizeApartment
  );
}