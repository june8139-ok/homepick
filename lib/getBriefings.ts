import { unstable_cache } from "next/cache";

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

async function fetchPublishedBriefings(
  limit?: number
) {
  let query = supabase
    .from("briefings")
    .select("*")
    .eq(
      "is_published",
      true
    )
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

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

const getCachedPublishedBriefings =
  unstable_cache(
    async (limit?: number) => {
      return fetchPublishedBriefings(
        limit
      );
    },
    ["published-briefings"],
    {
      revalidate: 60,
      tags: ["briefings"],
    }
  );

async function fetchPublishedBriefing(
  normalizedSlug: string
) {
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
        normalizedSlug,
        error,
      }
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapBriefing(
    data as BriefingRow
  );
}

const getCachedPublishedBriefing =
  unstable_cache(
    async (
      normalizedSlug: string
    ) => {
      return fetchPublishedBriefing(
        normalizedSlug
      );
    },
    ["published-briefing"],
    {
      revalidate: 60,
      tags: ["briefings"],
    }
  );

export async function getBriefings({
  publishedOnly = true,
  limit,
}: {
  publishedOnly?: boolean;
  limit?: number;
} = {}) {
  if (publishedOnly) {
    return getCachedPublishedBriefings(
      limit
    );
  }

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

  const data =
    await getCachedPublishedBriefing(
      normalizedSlug
    );

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

  return data;
}