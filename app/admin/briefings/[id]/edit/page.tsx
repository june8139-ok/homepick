import {
    notFound,
  } from "next/navigation";
  
  import {
    requireAdmin,
  } from "../../../../../lib/requireAdmin";
  
  import BriefingEditor from "../../../../../components/Admin/BriefingEditor";
  
  import type {
    BriefingRow,
  } from "../../../../../types/briefing";
  
  type PageProps = {
    params: Promise<{
      id: string;
    }>;
  };
  
  export default async function EditBriefingPage({
    params,
  }: PageProps) {
    const {
      id,
    } = await params;
  
    const {
      supabase,
    } = await requireAdmin();
  
    const {
      data,
      error,
    } = await supabase
      .from("briefings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
  
    if (
      error ||
      !data
    ) {
      notFound();
    }
  
    const row =
      data as BriefingRow;
  
    const briefing = {
      id: row.id,
  
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      content: row.content,
  
      category:
        row.category,
  
      region:
        row.region,
  
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
  
    return (
      <BriefingEditor
        mode="edit"
        initialBriefing={
          briefing
        }
      />
    );
  }