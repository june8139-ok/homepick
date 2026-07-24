import { supabase } from "./supabase";

import type {
  Briefing,
  BriefingRow,
} from "../types/briefing";

function mapBriefing(
  row: BriefingRow
): Briefing {
  return {
    id: row.id,

    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,

    category: row.category,
    region: row.region,

    thumbnailUrl:
      row.thumbnail_url,

    relatedApartmentSlugs:
      row.related_apartment_slugs ??
      [],

    isPublished:
      row.is_published,

    publishedAt:
      row.published_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

export async function getBriefings({
  publishedOnly = true,
  limit,
}: {
  publishedOnly?: boolean;
  limit?: number;
} = {}) {
  let query = supabase
    .from("briefings")
    .select("*")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (publishedOnly) {
    query = query.eq(
      "is_published",
      true
    );
  }

  if (
    typeof limit ===
      "number" &&
    limit > 0
  ) {
    query = query.limit(limit);
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "브리핑 목록 조회 오류:",
      error
    );

    return [];
  }

  return (
    (data as BriefingRow[]) ??
    []
  ).map(mapBriefing);
}

export async function getBriefing(
  slug: string
) {
  let decodedSlug = slug;

  try {
    decodedSlug =
      decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }

  const normalizedSlug =
    decodedSlug
      .normalize("NFC")
      .trim();

  const {
    data,
    error,
  } = await supabase
    .from("briefings")
    .select("*")
    .eq(
      "slug",
      normalizedSlug
    )
    .eq(
      "is_published",
      true
    )
    .maybeSingle();

  if (error) {
    console.error(
      "브리핑 상세 조회 오류:",
      {
        slug,
        decodedSlug,
        normalizedSlug,
        error,
      }
    );

    return null;
  }

  if (!data) {
    console.error(
      "브리핑을 찾지 못했습니다:",
      {
        slug,
        decodedSlug,
        normalizedSlug,
      }
    );

    return null;
  }

  return mapBriefing(
    data as BriefingRow
  );
}