import { cache } from "react";
import { supabase } from "./supabase";
import { normalizeApartment } from "./normalizeApartment";

const getApartmentCached = cache(async (slug: string) => {
  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    return null;
  }
  // 이름이 같은 다른 공고가 있어도 정확한 주소의 단지는 우선 반환합니다.
  const exact = await supabase.from("apartments").select("*")
    .eq("is_published", true).eq("slug", decodedSlug).maybeSingle();
  if (exact.error) {
    throw new Error("단지 주소 조회에 실패했습니다.", { cause: exact.error });
  }
  if (exact.data) return normalizeApartment(exact.data);

  const nameLikeSlug = decodedSlug.replaceAll("-", " ");
  // 레거시 공백 주소 호환. OR 문자열에 사용자 입력을 삽입하지 않습니다.
  if (nameLikeSlug !== decodedSlug) {
    const legacy = await supabase.from("apartments").select("*")
      .eq("is_published", true).eq("slug", nameLikeSlug).maybeSingle();
    if (legacy.error) {
      throw new Error("이전 단지 주소 조회에 실패했습니다.", { cause: legacy.error });
    }
    if (legacy.data) return normalizeApartment(legacy.data);
  }
  const byName = await supabase.from("apartments").select("*")
    .eq("is_published", true).eq("name", nameLikeSlug).limit(2);
  if (byName.error) {
    throw new Error("단지 이름 조회에 실패했습니다.", { cause: byName.error });
  }
  // 이름만 일치하는 후보가 여러 개라면 임의로 다른 공고에 연결하지 않습니다.
  if (byName.data?.length !== 1) return null;
  return normalizeApartment(byName.data[0]);
});

export async function getApartment(slug: string) {
  return getApartmentCached(slug);
}
