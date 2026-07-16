import { supabase } from "./supabase";
import { normalizeApartment } from "./normalizeApartment";

type GetApartmentsOptions = {
  publishedOnly?: boolean;
};

export async function getApartments(
  options: GetApartmentsOptions = {}
) {
  const {
    publishedOnly = true,
  } = options;

  let query = supabase
    .from("apartments")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (publishedOnly) {
    query = query.eq(
      "is_published",
      true
    );
  }

  const { data, error } =
    await query;

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