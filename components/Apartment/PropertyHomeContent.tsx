import type { Apartment } from "../../types/apartment";
import {
  getDetailSections,
  detailHref,
  sectionLabels,
} from "../../lib/apartmentPages";
import Link from "next/link";
import { formatSubscriptionDate } from "../../lib/subscriptionVisibility";
import { getListingStage } from "../../lib/listingStage";
import ReservationCard from "./ReservationCard";
import SubscriptionAlertForm from "./SubscriptionAlertForm";
import ProjectGroupLinks from "./ProjectGroupLinks";
export default function PropertyHomeContent({ a }: { a: Apartment }) {
  const stage = getListingStage(a);
  const canInquire =
    (stage === "firstCome" || stage === "subscription") &&
    a.leadType !== "closed";
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
