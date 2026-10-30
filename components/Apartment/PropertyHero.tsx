import Image from "next/image";
import PropertyGallery from "./PropertyGallery";
import Link from "next/link";
import type { Apartment } from "../../types/apartment";
import { getListingCardPrice, getMoveInText, isApplyHomeUnverified } from "../../lib/apartmentDisplay";
import { getListingStage } from "../../lib/listingStage";
import {
  detailHref,
  getDetailSections,
  sectionLabels,
  sectionImages,
  validImage,
} from "../../lib/apartmentPages";
import styles from "./PropertyPricePreview.module.css";
import InquiryActions from "./InquiryActions";
import ApartmentDataTrust from "./ApartmentDataTrust";
export default function PropertyHero({
  apartment: a,
}: {
  apartment: Apartment;
}) {
  const stage = getListingStage(a);
  const first = stage === "firstCome";

  const price = getListingCardPrice(a, first).text;
  const rental = a.housingSupplyType === "privateRental";
  const reviewed = !isApplyHomeUnverified(a);
  const clean = (value?: string) => {
    const text = value?.trim() || "";
    return ["-", "없음", "정보 없음", "확인 필요"].includes(text) ? "" : text;
  };
  const paymentRows = reviewed && !rental
    ? [
        ["계약금", clean(a.priceDetail?.contractPrice)],
        ["중도금", clean(a.priceDetail?.middlePayment)],
      ].filter(([, value]) => value)
    : [];
  const condition = reviewed ? clean(a.condition) : "";
  const facts = [
    [a.housingSupplyType === "privateRental" ? "임대보증금" : "분양가", price],
    ["계약조건", a.condition],
    ["입주예정", getMoveInText(a)],
    ["규모", a.projectInfo?.totalHouseholds || a.projectInfo?.scale],
  ];
  return (
    <section className="property-hero">
      <PropertyGallery
        key={a.slug}
        name={a.name}
        images={[
          ...new Set([a.images.hero, ...a.images.gallery].filter(validImage)),
        ]}
      />
      <div className="property-hero-summary">
        <p className="property-status">
          {first
            ? "선착순 분양"
            : stage === "soldOut"
              ? "분양완료 · 보관 정보"
              : stage === "subscription"
                ? a.status || "청약 정보"
                : "단지 정보"}
          {a.housingSupplyType === "privateRental" ? " · 민간임대" : ""}
        </p>
        <h1>{a.name}</h1>
        <p className="property-address">{a.region}</p>
        {a.jibnunSummary && (
          <p className="property-intro">
            {a.jibnunSummary.slice(0, 240)}
            {a.jibnunSummary.length > 240 ? "…" : ""}
          </p>
        )}
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
              {key === "pricing" ? (
                <div className={`property-page-preview ${styles.preview}`}>
                  <div className={styles.brand}>집눈 · {rental ? "임대조건" : "분양정보"}</div>
                  <div className={styles.label}>{rental ? "임대조건" : "분양가"}</div>
                  <div className={styles.price}>{clean(price) || "가격 확인 중"}</div>
                  <div className={styles.details}>
                    {paymentRows.length > 0 ? paymentRows.map(([label, value]) => (
                      <div className={styles.row} key={label}>
                        <div className={styles.term}>{label}</div>
                        <div className={styles.value}>{value}</div>
                      </div>
                    )) : (
                      <div className={styles.condition}>
                        {condition || "상세 조건을 확인해 주세요"}
                      </div>
                    )}
                  </div>
                </div>
              ) : (sectionImages(a, key)[0] || a.images.hero) ? (
                <div className="property-page-preview">
                  <Image
                    src={sectionImages(a, key)[0] || a.images.hero!}
                    alt={`${a.name} ${sectionLabels[key]} 바로가기`}
                    fill
                    sizes="(max-width:768px) 45vw,280px"
                    quality={88}
                    className={
                      key === "plans" ? "object-contain" : "object-cover"
                    }
                  />
                </div>
              ) : null}
              <span>{rental && key === "pricing" ? "임대·계약조건" : sectionLabels[key]}</span>
              <small>
                {key === "pricing"
                  ? rental ? "보증금과 임대조건 확인" : "가격과 납부조건 확인"
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
