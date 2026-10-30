import type { Apartment } from "../../types/apartment";
import {
  getDetailSections,
  detailHref,
  sectionLabels,
  overviewRows,
  locationRows,
} from "../../lib/apartmentPages";
import Link from "next/link";
import { formatSubscriptionDate } from "../../lib/subscriptionVisibility";
import { getListingStage } from "../../lib/listingStage";
import PropertyConditionSummary from "./PropertyConditionSummary";
import styles from "./PropertyDetailSummary.module.css";
import ReservationCard from "./ReservationCard";
import SubscriptionAlertForm from "./SubscriptionAlertForm";
import ProjectGroupLinks from "./ProjectGroupLinks";
export default function PropertyHomeContent({ a }: { a: Apartment }) {
  const stage = getListingStage(a);
  const canInquire =
    (stage === "firstCome" || stage === "subscription") &&
    a.leadType !== "closed";
  const sections = getDetailSections(a);
  const overview = sections.includes("overview")
    ? overviewRows(a).filter(([label]) => ["사업지 위치", "건축 용도", "시공사", "건축 규모", "총 세대수", "주차", "입주예정"].includes(label))
    : [];
  const location = sections.includes("location") ? locationRows(a) : [];
  const schedule = a.subscription;
  const rows = [
    ["특별공급", schedule?.specialSupplyStartDate],
    ["1순위", schedule?.firstPriorityStartDate],
    ["2순위", schedule?.secondPriorityStartDate],
    ["당첨자 발표", schedule?.winnerDate],
    ["계약 시작", schedule?.contractStartDate],
    ["계약 종료", schedule?.contractEndDate],
  ].filter(([, v]) => v);
  return (
    <>
      {stage === "soldOut" && (
        <p className="property-source">
          분양이 완료된 단지입니다. 보관된 분양 당시 자료로 현재 모집 조건과
          다를 수 있습니다.
        </p>
      )}
      {stage === "subscription" && rows.length > 0 && (
        <section className="property-home-schedule">
          <h2>청약 주요 일정</h2>
          <dl className="property-facts">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{formatSubscriptionDate(v)}</dd>
              </div>
            ))}
          </dl>
          {(schedule?.noticeUrl ||
            schedule?.applyHomeUrl ||
            a.applyHomeUrl) && (
            <a
              href={
                schedule?.noticeUrl ||
                schedule?.applyHomeUrl ||
                a.applyHomeUrl ||
                "#"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              모집공고·청약홈 확인 ↗
            </a>
          )}
        </section>
      )}
      {overview.length > 0 && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>집눈 · 단지 기본정보</p>
          <h2 className={styles.heading}>{a.name} 사업개요</h2>
          <dl className={styles.facts}>
            {overview.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <Link className={styles.more} href={detailHref(a.slug, "overview")}>
            사업개요 자세히 보기 <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}
      {sections.includes("pricing") && (
        <>
          <PropertyConditionSummary apartment={a} compact />
          <Link className={styles.more} href={detailHref(a.slug, "pricing")}>
            {a.housingSupplyType === "privateRental" ? "임대·계약조건" : "평형별 분양가·계약조건"} 자세히 보기 <span aria-hidden="true">→</span>
          </Link>
        </>
      )}
      {location.length > 0 && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>집눈 · 주변 환경</p>
          <h2 className={styles.heading}>입지·생활환경 살펴보기</h2>
          <dl className={styles.facts}>
            {location.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <p className={styles.note}>예정·계획 사항은 추진 상황에 따라 달라질 수 있습니다.</p>
          <Link className={styles.more} href={detailHref(a.slug, "location")}>
            입지환경 자료 보기 <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}
      <ProjectGroupLinks apartment={a} />
      {!getDetailSections(a).length && (
        <p className="property-source">
          세부 자료를 확인 중입니다. 등록된 정보가 준비되면 상세 메뉴가
          표시됩니다.
        </p>
      )}
      {getDetailSections(a).length > 0 && (
        <p className="property-home-help">
          자세한{" "}
          {getDetailSections(a)
            .map((k) => sectionLabels[k])
            .join(" · ")}{" "}
          정보는 위 메뉴에서 확인하세요.{" "}
          <Link href={detailHref(a.slug, getDetailSections(a)[0])}>
            상세 정보 보기 →
          </Link>
        </p>
      )}
      {canInquire && (
        <section id="inquiry" tabIndex={-1} className="property-home-inquiry">
          {stage === "subscription" ? (
            <SubscriptionAlertForm
              apartmentName={a.name}
              apartmentSlug={a.slug}
              leadType={a.leadType || "schedule"}
            />
          ) : (
            <ReservationCard
              apartmentName={a.name}
              apartmentSlug={a.slug}
              floorPlanNames={[
                ...new Set(a.images.floorPlans.map((p) => p.name)),
              ]}
            />
          )}
        </section>
      )}
    </>
  );
}
