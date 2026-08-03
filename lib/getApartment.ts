import { cache } from "react";

import { supabase } from "./supabase";
import { normalizeApartment } from "./normalizeApartment";

const getApartmentCached = cache(
  async (slug: string) => {
    const decodedSlug =
      decodeURIComponent(slug);

    const nameLikeSlug =
      decodedSlug.replaceAll(
        "-",
        " "
      );

    const { data, error } =
      await supabase
        .from("apartments")
        .select("*")
        .or(
          [
            `slug.eq.${decodedSlug}`,
            `slug.eq.${nameLikeSlug}`,
            `name.eq.${nameLikeSlug}`,
          ].join(",")
        )
        .maybeSingle();

    if (error || !data) {
      return null;
    }

    return normalizeApartment(
      data
    );
  }
);

export async function getApartment(
  slug: string
) {
  return getApartmentCached(
    slug
  );
}