import { getDetailSections, isDetailSection, sectionImages, sectionLabels } from "../../../../lib/apartmentPages";
import { getApartment } from "../../../../lib/getApartment";
import { getBriefing } from "../../../../lib/getBriefings";
import { getHeroImage } from "../../../../lib/apartmentHeroImage";
import { renderOgCard } from "../../../../lib/ogCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; slug: string }> },
) {
  const { kind, slug } = await params;
  if (slug.length > 250) return new Response(null, { status: 404 });

  const section = kind.startsWith("apartment-") ? kind.slice("apartment-".length) : "";
  if (kind === "apartment" || isDetailSection(section)) {
    const apartment = await getApartment(slug);
    if (apartment?.slug !== slug) return new Response(null, { status: 404 });
    if (isDetailSection(section)) {
      if (!getDetailSections(apartment).includes(section)) return new Response(null, { status: 404 });
      return renderOgCard({
        kind: "apartment",
        title: `${apartment.name} ${sectionLabels[section]}`,
        candidates: [sectionImages(apartment, section)[0] || "", getHeroImage(apartment)],
      });
    }
    return renderOgCard({ kind: "apartment", title: apartment.name, candidates: [getHeroImage(apartment)] });
  }
  if (kind === "briefing") {
    const briefing = await getBriefing(slug);
    if (briefing?.slug === slug) {
      const relatedSlug = briefing.relatedApartmentSlugs[0];
      const related = !briefing.thumbnailUrl && relatedSlug
        ? await getApartment(relatedSlug).catch((error) => {
          console.warn("OG 관련 단지 조회 실패", error);
          return null;
        })
        : null;
      return renderOgCard({
        kind, title: briefing.title,
        candidates: [briefing.thumbnailUrl || "", getHeroImage(related)],
      });
    }
  }
  return new Response(null, { status: 404 });
}
