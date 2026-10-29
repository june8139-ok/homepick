import PropertySectionContent from "../../../../components/Apartment/PropertySectionContent";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getApartment } from "../../../../lib/getApartment";
import {
  isCompletedListing,
  getListingStage,
} from "../../../../lib/listingStage";
import {
  detailHref,
  isDetailSection,
  getDetailSections,
  sectionLabels,
  detailDescription,
  sectionImages,
} from "../../../../lib/apartmentPages";
import InquiryActions from "../../../../components/Apartment/InquiryActions";
import SubscriptionAlertForm from "../../../../components/Apartment/SubscriptionAlertForm";
import ReservationCard from "../../../../components/Apartment/ReservationCard";
type Props = { params: Promise<{ slug: string; section: string }> };
async function resolve(params: Props["params"]) {
  const { slug, section } = await params;
  if (!isDetailSection(section)) notFound();
  const a = await getApartment(slug);
  if (!a || isCompletedListing(a) || !getDetailSections(a).includes(section))
    notFound();
  if (decodeURIComponent(slug) !== a.slug)
    permanentRedirect(detailHref(a.slug, section));
  return { a, section, content: a.detailPages?.[section] || {} };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { a, section, content } = await resolve(params);
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://jibnun.com";
  // 단지명과 메뉴명을 항상 포함해 관리자 입력이 같아도 페이지 역할을 구분합니다.
  const title = `${a.name} ${sectionLabels[section]}${content.seoTitle ? ` · ${content.seoTitle}` : ""} | 집눈`;
  const description = detailDescription(a, section);
  const url = site + detailHref(a.slug, section);
  const representative=sectionImages(a,section)[0]||a.images.hero;
  const images=representative?[{url:new URL(representative,site).href,alt:`${a.name} ${sectionLabels[section]}`}]:[{url:site+"/opengraph-image"}];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "집눈",
      title,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((x) => x.url),
    },
  };
}
export default async function DetailSectionPage({ params }: Props) {
  const { a, section } = await resolve(params);
  const stage = getListingStage(a);
  const canInquire =
    (stage === "firstCome" || stage === "subscription") &&
    a.leadType !== "closed";
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://jibnun.com";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "집눈", item: site },
      { name: a.name, item: site + detailHref(a.slug) },
      {
        name: sectionLabels[section],
        item: site + detailHref(a.slug, section),
      },
    ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
  };
  return (
    <main className="property-subpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\u003c"),
        }}
      />
      <nav aria-label="현재 위치" className="property-breadcrumb">
        <Link href={detailHref(a.slug)}>{a.name}</Link>
        <span>/</span>
        {sectionLabels[section]}
      </nav>
      <h1>
        {a.name}
        <br />
        <span>{sectionLabels[section]}</span>
      </h1>
      <PropertySectionContent a={a} section={section}/>
      <nav aria-label="다른 단지 정보" className="property-next">
        {getDetailSections(a)
          .filter((k) => k !== section)
          .map((k) => (
            <Link key={k} href={detailHref(a.slug, k)}>
              {sectionLabels[k]} →
            </Link>
          ))}
      </nav>
      {canInquire && (
        <>
          <section id="inquiry" tabIndex={-1} className="scroll-mt-40">
            {stage === "subscription" ? (
              <SubscriptionAlertForm
                apartmentName={a.name}
                apartmentSlug={a.slug}
                leadType={a.leadType || "schedule"}
              />
            ) : (
              <ReservationCard apartmentName={a.name} apartmentSlug={a.slug} />
            )}
          </section>
          <InquiryActions
            apartmentSlug={a.slug}
            placement="mobile"
            inquiryLabel={
              stage === "subscription"
                ? a.leadType === "consult"
                  ? "청약 상담신청"
                  : "청약알림 신청"
                : "상담신청"
            }
          />
        </>
      )}
    </main>
  );
}
