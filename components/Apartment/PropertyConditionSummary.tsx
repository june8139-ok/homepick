import type { Apartment } from "../../types/apartment";
import { paymentRows } from "../../lib/apartmentPages";
import { isApplyHomeUnverified } from "../../lib/apartmentDisplay";
import { getListingStage } from "../../lib/listingStage";
import styles from "./PropertyDetailSummary.module.css";

function meaningful(value?: string) {
  const text = value?.trim() || "";
  return ["-", "없음", "정보 없음", "확인 필요"].includes(text) ? "" : text;
}

export default function PropertyConditionSummary({
  apartment: a,
  compact = false,
}: {
  apartment: Apartment;
  compact?: boolean;
}) {
  const stage = getListingStage(a);
  if (stage === "completed" || isApplyHomeUnverified(a)) return null;
  const rental = a.housingSupplyType === "privateRental";
  const archived = stage === "soldOut";
  const allRows = paymentRows(a).filter(([, value]) => meaningful(value));
  const rows = compact
    ? allRows.filter(([label]) => ["계약금 총액·비율", "1차 계약금", "중도금 비율·납부·이자", "잔금·납부 시점"].includes(label)).slice(0, 3)
    : allRows;
  const condition = meaningful(a.condition);
  const rentalTerms = rental ? meaningful(a.priceDetail?.salePrice || a.price) : "";
  if (!rows.length && !condition && !rentalTerms) return null;
  return (
    <section className={`${styles.panel} ${styles.conditions}`}>
      <p className={styles.eyebrow}>집눈 · {rental ? "임대조건 안내" : "계약조건 안내"}</p>
      <h2 className={styles.heading}>
        {archived ? "모집 당시" : "등록된"} {rental ? "임대·계약조건" : "핵심 계약조건"}
      </h2>
      {rentalTerms && <p className={styles.rentalTerms}>{rentalTerms}</p>}
      {condition && <p className={styles.intro}>{condition}</p>}
      {rows.length > 0 && (
        <dl className={styles.conditionGrid}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className={styles.note}>
        {archived
          ? "모집 당시 보관 자료이며 현재 적용되는 조건이 아닙니다."
          : compact
            ? "등록된 조건의 요약입니다. 적용 대상·납부 시점·유의사항은 상세 안내에서 확인하세요."
            : "타입·층·적용 세대에 따라 조건이 다를 수 있습니다. 계약 전 공식 자료와 최신 안내를 확인하세요."}
      </p>
    </section>
  );
}
