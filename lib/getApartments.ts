import { unstable_cache } from "next/cache";

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
    fetchPublishedApartments,
    ["published-apartments"],
    {
      revalidate: 60,
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
    return getCachedPublishedApartments();
  }

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