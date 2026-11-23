import { conditionHistoryId, getApartmentConditionHistory } from "../../lib/apartmentConditionHistory";
import { canAcceptApartmentInquiry } from "../../lib/apartmentInquiryPolicy";
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
import priceStyles from "./PropertyHeroPrice.module.css";
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
  const priceParts = !rental
    ? price.match(/^(\d+(?:\.\d+)?\s*(?:㎡|m²|m2))\s*(.+)$/u)
    : null;
  const reviewed = !isApplyHomeUnverified(a);
  const clean = (value?: string) => {
    const text = value?.trim() || "";
    return ["-", "없음", "정보 없음", "확인 필요"].includes(text) ? "" : text;
  };
  const paymentRows = reviewed && !rental
    ? [
        ["계약금", clean(a.priceDetail?.contractPrice)],
        ["중도금", a.evaluation?.middlePaymentType === "not-applicable" ? "" : clean(a.priceDetail?.middlePayment)],
      ].filter(([, value]) => value)
    : [];
  const condition = reviewed ? clean(a.condition) : "";
  const sections = getDetailSections(a);
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const datedUpdates = sections.includes("pricing")
    ? getApartmentConditionHistory(a).flatMap((item) => {
        const date = item.date?.trim().replace(/[./]/g, "-");
        if (!item.title?.trim() || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
        if (item.dateType === "unknown" || item.dateType === "month-only") return [];
        const parsed = new Date(date);
        if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return [];
        return [{ item, date }];
      }).sort((left, right) => left.date.localeCompare(right.date))
    : [];
  const update = datedUpdates.find(({ date }) => date >= today) ?? datedUpdates.at(-1);
  const updateLink = update && (
    <Link
      href={`${detailHref(a.slug, "pricing")}#${conditionHistoryId}`}
      className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border border-emerald-900/10 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-950 hover:bg-emerald-50"
    >
      <span className="shrink-0 text-xs font-semibold">
        {update.date >= today ? "예정" : update.item.dateType === "changed" ? "최근 변경" : "최근 소식"}
      </span>
      <time className="shrink-0 text-xs tabular-nums" dateTime={update.date}>
        {update.date.slice(5).replace("-", ".")}
      </time>
      <span className="min-w-0 flex-1 truncate font-medium">{update.item.title}</span>
      <span aria-hidden="true" className="shrink-0">›</span>
    </Link>
  );
  const facts = [
    [a.housingSupplyType === "privateRental" ? "임대보증금" : "분양가", price],
    ["계약조건", a.condition],
    ["입주예정", getMoveInText(a)],
    ["규모", a.projectInfo?.totalHouseholds || a.projectInfo?.scale],
  ];
  return (
    <section className="property-hero">
      <div className="min-w-0">
        <PropertyGallery
          key={a.slug}
          name={a.name}
          images={[
            ...new Set([a.images.hero, ...a.images.gallery].filter(validImage)),
          ]}
        />
        {updateLink && <div className="hidden lg:block">{updateLink}</div>}
      </div>
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
                <dd>
                  {label === "분양가" && priceParts ? (
                    <span className={priceStyles.price}>
                      <span className={priceStyles.area}>{priceParts[1]}</span>{" "}
                      <span className={priceStyles.amount}>{priceParts[2]}</span>
                    </span>
                  ) : value}
                </dd>
              </div>
            ))}
        </dl>
        {updateLink && <div className="lg:hidden">{updateLink}</div>}
        <div className="property-quick-links">
          <Link href={`/compare?left=${encodeURIComponent(a.slug)}`}>
            비교하기 +
          </Link>
          <Link href="/favorites">관심단지 보기 ♡</Link>
        </div>
        <ApartmentDataTrust apartment={a} />
        {first && canAcceptApartmentInquiry(a) && (
          <InquiryActions apartmentSlug={a.slug} apartmentName={a.name} />
        )}
      </div>
      {sections.length > 0 && (
        <nav className="property-page-cards" aria-label="단지 정보 바로가기">
          {sections.map((key) => (
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
