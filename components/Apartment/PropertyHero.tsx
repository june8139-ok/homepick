import Image from "next/image";
import Link from "next/link";
import type { Apartment } from "../../types/apartment";
import { getListingCardPrice, getMoveInText } from "../../lib/apartmentDisplay";
import { getListingStage } from "../../lib/listingStage";
import {
  detailHref,
  getDetailSections,
  sectionLabels,
} from "../../lib/apartmentPages";
import InquiryActions from "./InquiryActions";
import ApartmentDataTrust from "./ApartmentDataTrust";
export default function PropertyHero({
  apartment: a,
}: {
  apartment: Apartment;
}) {
  const stage = getListingStage(a);
  const first = stage === "firstCome";
  const image = [a.images.hero, ...a.images.gallery].find(
    (x) => x && !x.includes("/default/"),
  );
  const price = getListingCardPrice(a, first).text;
  const facts = [
    [a.housingSupplyType === "privateRental" ? "임대보증금" : "분양가", price],
    ["계약조건", a.condition],
    ["입주예정", getMoveInText(a)],
    ["규모", a.projectInfo?.totalHouseholds || a.projectInfo?.scale],
  ];
  return (
    <section className="property-hero">
      {image && (
        <div className="property-hero-image">
          <Image
            src={image}
            alt={`${a.name} 대표 이미지`}
            fill
            priority
            sizes="(max-width:768px) 100vw, 1152px"
            quality={80}
            className="object-cover"
          />
          <span>단지 대표 이미지</span>
        </div>
      )}
      <div className="property-hero-summary">
        <p className="property-status">
          {first
            ? "선착순 분양"
            : stage === "soldOut"
              ? "분양완료 · 보관 정보"
              : "단지 정보"}
          {a.housingSupplyType === "privateRental" ? " · 민간임대" : ""}
        </p>
        <h1>{a.name}</h1>
        <p className="property-address">{a.region}</p>
        {a.jibnunSummary && <p className="property-intro">{a.jibnunSummary}</p>}
        <dl className="property-summary-grid">
          {facts
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
        <div className="property-quick-links">
          <Link href={`/compare?left=${encodeURIComponent(a.slug)}`}>
            비교하기 +
          </Link>
          <Link href="/favorites">관심단지 보기 ♡</Link>
        </div>
        <ApartmentDataTrust apartment={a} />
        {first && a.leadType !== "closed" && (
          <InquiryActions apartmentSlug={a.slug} />
        )}
      </div>
      {getDetailSections(a).length > 0 && (
        <nav className="property-page-cards" aria-label="단지 정보 바로가기">
          {getDetailSections(a).map((key) => (
            <Link key={key} href={detailHref(a.slug, key)}>
              <span>{sectionLabels[key]}</span>
              <small>
                {key === "pricing"
                  ? "가격과 납부조건 확인"
                  : key === "plans"
                    ? "타입별 구조 살펴보기"
                    : key === "overview"
                      ? "규모와 사업정보 확인"
                      : "교통·교육·생활환경"}
              </small>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}
