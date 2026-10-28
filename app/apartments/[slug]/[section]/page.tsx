import type { Metadata } from "next";
import Image from "next/image";
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
} from "../../../../lib/apartmentPages";
import PriceConditionCard from "../../../../components/Apartment/PriceConditionCard";
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
  return { a, section, content: a.detailPages![section]! };
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
  const images = a.images.hero
    ? [
        {
          url: new URL(a.images.hero, site).href,
          alt: `${a.name} ${sectionLabels[section]}`,
        },
      ]
    : [{ url: site + "/opengraph-image" }];
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
  const { a, section, content } = await resolve(params);
  const stage = getListingStage(a);
  const canInquire =
    (stage === "firstCome" || stage === "subscription") &&
    a.leadType !== "closed";
  const projectRows = [
    ["위치", a.region],
    ["규모", a.projectInfo?.scale],
    ["총 세대수", a.projectInfo?.totalHouseholds],
    ["시공사", a.builder],
    ["주차", a.projectInfo?.parking],
    ["입주예정", a.projectInfo?.moveInDate],
  ];
  const locationRows = [
    ["교통", a.locationInfo?.transport],
    ["교육", a.locationInfo?.education],
    ["생활", a.locationInfo?.living],
    ["자연환경", a.locationInfo?.nature],
    ["미래계획", a.locationInfo?.futureValue],
    ["확인사항", a.locationInfo?.cautions],
  ];
  const rows = section === "overview" ? projectRows : locationRows;
  const pictures =
    section === "plans"
      ? a.images.floorPlans
      : section === "location"
        ? a.images.location.map((url, i) => ({
            name: `${a.name} 입지 자료 ${i + 1}`,
            url,
          }))
        : [];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "집눈", item: "https://jibnun.com" },
      { name: a.name, item: "https://jibnun.com" + detailHref(a.slug) },
      {
        name: sectionLabels[section],
        item: "https://jibnun.com" + detailHref(a.slug, section),
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
      <div className="property-prose">
        {content.body?.split(/\n\s*\n/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {section === "pricing" && (
        <>
          <PriceConditionCard apartment={a} />
          {a.contractDetails && (
            <div className="property-prose">
              <h2>계약조건 상세</h2>
              <p>{a.contractDetails}</p>
            </div>
          )}
        </>
      )}
      {(section === "overview" || section === "location") && (
        <dl className="property-facts">
          {rows
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      )}
      {pictures.map((p, i) => (
        <figure key={p.url + i} className="property-figure">
          <h2>{p.name}</h2>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.name} 원본 크게 보기`}
          >
            <Image
              src={p.url}
              alt={p.name}
              width={1200}
              height={900}
              sizes="(max-width:768px) 100vw, 1000px"
              className="h-auto w-full object-contain"
            />
          </a>
          <figcaption>이미지를 누르면 원본을 크게 볼 수 있습니다.</figcaption>
        </figure>
      ))}
      {(content.source || content.checkedAt) && (
        <p className="property-source">
          {content.source && `자료 출처: ${content.source}`}{" "}
          {content.checkedAt && ` · 최근 확인: ${content.checkedAt}`}
        </p>
      )}
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
