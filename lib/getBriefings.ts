import { unstable_cache } from "next/cache";

import { supabase } from "./supabase";

import type {
  Briefing,
  BriefingRow,
} from "../types/briefing";

type BriefingListRow = Pick<
  BriefingRow,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "category"
  | "region"
  | "thumbnail_url"
  | "related_apartment_slugs"
  | "is_published"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

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

function mapBriefingList(
  row: BriefingListRow
): Briefing {
  return {
    id: row.id,

    slug: row.slug,
    title: row.title,
    summary: row.summary,

    /*
     * 목록/카드에서는 본문 content를 사용하지 않습니다.
     * 긴 본문을 Supabase에서 전송하지 않아 Egress를 줄입니다.
     */
    content: "",

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
    .select(
      "id, slug, title, summary, category, region, thumbnail_url, related_apartment_slugs, is_published, published_at, created_at, updated_at"
    )
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

  return (data ?? []).map(
    (row) =>
      mapBriefingList(
        row as BriefingListRow
      )
  );
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
      revalidate: 3600,
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
      revalidate: 3600,
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

  /*
   * 관리자/비공개 포함 조회는 기존 동작을 그대로 유지합니다.
   */
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
