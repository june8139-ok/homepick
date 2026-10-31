import type { Apartment } from "../../types/apartment";
import { formatSubscriptionDate } from "../../lib/subscriptionVisibility";
import { getMoveInText } from "../../lib/apartmentDisplay";
import styles from "./PropertyDetailSummary.module.css";

type Row = Record<string, unknown>;
function text(row: Row, key: string) {
  const value = row[key];
  return value == null ? "" : String(value).trim();
}
function count(row: Row, key: string): number | null {
  const value = text(row, key).replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
function period(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  return start && end && start !== end
    ? `${formatSubscriptionDate(start)} ~ ${formatSubscriptionDate(end)}`
    : formatSubscriptionDate(start || end);
}
function safeUrl(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch { return ""; }
}
function amount(value: number | null) {
  if (value === null || value <= 0) return "—";
  const eok = Math.floor(value / 10000);
  const rest = value % 10000;
  return `${eok ? `${eok}억 ` : ""}${rest ? `${rest.toLocaleString("ko-KR")}만원` : eok ? "원" : ""}`.trim();
}

/** 청약 원문만 사용합니다. 현재 선착순 가격·계약조건으로 과거 기록을 덮지 않습니다. */
export default function SubscriptionDetail({ apartment: a, archived = false }: {
  apartment: Apartment;
  archived?: boolean;
}) {
  const raw = a.applyHome || {};
  const schedule = a.subscription;
  const schedules = [
    ["모집공고", period(schedule?.announcementDate || text(raw, "RCRIT_PBLANC_DE"))],
    ["특별공급", period(schedule?.specialSupplyStartDate || text(raw, "SPSPLY_RCEPT_BGNDE"), schedule?.specialSupplyEndDate || text(raw, "SPSPLY_RCEPT_ENDDE"))],
    ["1순위", period(schedule?.firstPriorityStartDate, schedule?.firstPriorityEndDate)],
    ["2순위", period(schedule?.secondPriorityStartDate, schedule?.secondPriorityEndDate)],
    ["당첨자 발표", period(schedule?.winnerDate || text(raw, "PRZWNER_PRESNATN_DE"))],
    ["계약기간", period(schedule?.contractStartDate || text(raw, "CNTRCT_CNCLS_BGNDE"), schedule?.contractEndDate || text(raw, "CNTRCT_CNCLS_ENDDE"))],
  ].filter(([, value]) => Boolean(value));
  // 지역별 일정이 다른 경우 접수일을 별도로 보존합니다.
  const regional = [
    ["1순위 해당지역", "GNRL_RNK1_CRSPAREA_RCEPT_PD"],
    ["1순위 기타경기", "GNRL_RNK1_ETC_GG_RCPTDE_PD"],
    ["1순위 기타지역", "GNRL_RNK1_ETC_AREA_RCPTDE_PD"],
    ["2순위 해당지역", "GNRL_RNK2_CRSPAREA_RCEPT_PD"],
    ["2순위 기타경기", "GNRL_RNK2_ETC_GG_RCPTDE_PD"],
    ["2순위 기타지역", "GNRL_RNK2_ETC_AREA_RCPTDE_PD"],
  ].map(([label, key]) => [label, text(raw, key)]).filter(([, value]) => value);
  const supply = count(raw, "TOT_SUPLY_HSHLDCO") ?? a.totalSupply;
  const moveIn = text(raw, "MVN_PREARNGE_YM");
  const moveInText = moveIn ? getMoveInText({ ...a, projectInfo: { moveInDate: moveIn } }) : "";
  const facts = [
    ["공고명", text(raw, "HOUSE_NM") || (!archived ? a.name : "")],
    ["공급위치", text(raw, "HSSPLY_ADRES") || (!archived ? a.region : "")],
    ["이번 공고 공급 세대수", supply != null && supply > 0 ? `${supply.toLocaleString("ko-KR")}세대` : ""],
    ["주택 구분", text(raw, "HOUSE_DTL_SECD_NM")],
    ["시공사", text(raw, "CNSTRCT_ENTRPS_NM")],
    ["사업주체", text(raw, "BSNS_MBY_NM")],
    ["공고 당시 입주예정", moveInText],
  ].filter(([, value]) => Boolean(value));
  const notice = safeUrl(schedule?.noticeUrl || text(raw, "PBLANC_URL") || a.applyHomeUrl);
  const homepage = safeUrl(text(raw, "HMPG_ADRES"));
  const models = (a.applyHomeModels || []).filter((row) => text(row, "HOUSE_TY"));
  const flags = [
    ["분양가상한제 적용", "PARCPRC_ULS_AT"],
    ["투기과열지구", "SPECLT_RDN_EARTH_AT"],
    ["조정대상지역", "MDAT_TRGET_AREA_SECD"],
    ["공공주택지구", "PUBLIC_HOUSE_EARTH_AT"],
  ].filter(([, key]) => text(raw, key) === "Y");
  if (!schedules.length && !Object.keys(raw).length && !models.length) return null;

  const content = (
    <>
      <p className={styles.note}>
        {archived
          ? "청약홈에 등록된 공고 당시 기록입니다. 아래 공급세대수·공급금액은 현재 잔여세대수·선착순 계약조건을 뜻하지 않습니다."
          : "청약홈 공개자료 기준입니다. 공급 유형과 신청자별 자격·세부 조건은 공식 모집공고를 확인하세요."}
      </p>
      {schedules.length > 0 && (
        <div id={archived ? undefined : "schedule"}>
          <h3 className={styles.subheading}>{archived ? "공고 당시 청약 일정" : "청약 주요 일정"}</h3>
          <dl className={styles.facts}>
            {schedules.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          {regional.length > 0 && (
            <details className={styles.subdetails}>
              <summary>지역별 접수 일정</summary>
              <dl className={styles.facts}>
                {regional.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            </details>
          )}
        </div>
      )}
      {facts.length > 0 && (
        <div>
          <h3 className={styles.subheading}>모집공고 기본정보</h3>
          <dl className={styles.facts}>
            {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      )}
      {flags.length > 0 && <p className={styles.note}>공고 기준: {flags.map(([label]) => label).join(" · ")}</p>}
      {models.length > 0 && (
        <div>
          <h3 className={styles.subheading}>공고 당시 타입별 공급정보</h3>
          <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="타입별 공급정보 표">
            <table className={styles.supplyTable}>
              <caption className="sr-only">{a.name} 공고 당시 주택형별 공급정보</caption>
              <thead><tr><th scope="col">주택형</th><th scope="col">일반공급</th><th scope="col">특별공급</th><th scope="col">최고 공급금액</th></tr></thead>
              <tbody>{models.map((row, index) => {
                const general = count(row, "SUPLY_HSHLDCO");
                const special = count(row, "SPSPLY_HSHLDCO");
                return <tr key={`${text(row, "MODEL_NO")}-${index}`}>
                  <th scope="row">{text(row, "HOUSE_TY").replace(/^0+(?=\d)/, "")}㎡</th>
                  <td>{general == null ? "—" : `${general.toLocaleString("ko-KR")}세대`}</td>
                  <td>{special == null ? "—" : `${special.toLocaleString("ko-KR")}세대`}</td>
                  <td>{amount(count(row, "LTTOT_TOP_AMOUNT"))}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          <p className={styles.note}>최고 공급금액은 해당 타입의 공고 당시 최고금액입니다. 실제 최저가·현재 판매가격·발코니 및 옵션 포함 총액과 다릅니다. ‘—’는 제공된 값이 없는 항목입니다.</p>
        </div>
      )}
      {(notice || homepage) && <div className={styles.sourceLinks}>
        {notice && <a className={styles.more} href={notice} target="_blank" rel="noopener noreferrer">공식 모집공고 확인 ↗</a>}
        {homepage && <a className={styles.more} href={homepage} target="_blank" rel="noopener noreferrer">공고에 등록된 홈페이지 ↗</a>}
      </div>}
    </>
  );
  return archived ? (
    <details className={styles.panel}>
      <summary className={styles.archiveSummary}>청약·모집공고 기록 보기</summary>
      {content}
    </details>
  ) : (
    <section className={styles.panel} aria-label="청약 공고 정보">
      <p className={styles.eyebrow}>집눈 · 청약홈 공개자료</p>
      <h2 className={styles.heading}>청약 일정·공급정보</h2>
      {content}
    </section>
  );
}
