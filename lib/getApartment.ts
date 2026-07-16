import { supabase } from "./supabase";
import { normalizeApartment } from "./normalizeApartment";

export async function getApartment(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const nameLikeSlug = decodedSlug.replaceAll("-", " ");

  const { data, error } = await supabase
    .from("apartments")
    .select("*")
    .or(`slug.eq.${decodedSlug},slug.eq.${nameLikeSlug},name.eq.${nameLikeSlug}`)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeApartment(data);
}