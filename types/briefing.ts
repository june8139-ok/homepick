export type BriefingCategory =
  | "청약 일정"
  | "선착순 소식"
  | "계약조건 변경"
  | "지역 분양 브리핑";

export type Briefing = {
  id: string;

  slug: string;
  title: string;
  summary: string;
  content: string;

  category: BriefingCategory;
  region: string;

  thumbnailUrl: string | null;
  relatedApartmentSlugs: string[];

  isPublished: boolean;
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type BriefingRow = {
  id: string;

  slug: string;
  title: string;
  summary: string;
  content: string;

  category: BriefingCategory;
  region: string;

  thumbnail_url: string | null;
  related_apartment_slugs: string[] | null;

  is_published: boolean;
  published_at: string | null;

  created_at: string;
  updated_at: string;
};