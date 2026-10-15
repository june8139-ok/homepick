/** 관리자 전용 분양 여부 확인 기록. 일반 수정일·공개 계약조건 이력과 분리합니다. */
export type ReviewAction = "confirmed" | "excluded" | "resumed" | "soldOut";
export type FirstComeReview = {
  firstComeStartedAt?: string;
  lastConfirmedAt?: string;
  nextCheckDate?: string | null;
  intervalDays?: 30 | 60;
  excluded?: boolean;
  exclusionReason?: string;
  history?: { at: string; action: ReviewAction; note: string; intervalDays: 30 | 60 }[];
};
type Data = Record<string, unknown>;
export function asRecord(value: unknown): Data {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Data : {};
}
export function readFirstComeReview(data: unknown): FirstComeReview {
  return asRecord(asRecord(data).firstComeReview) as FirstComeReview;
}
const DAY = 86400000;
function kstDay(date: Date) {
  return Math.floor((date.getTime() + 9 * 3600000) / DAY);
}
export function reviewDate(date: Date) {
  return new Date(kstDay(date) * DAY).toISOString().slice(0, 10);
}
function validInstant(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}
function validDay(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + "T00:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value
    ? Math.floor(d.getTime() / DAY) : null;
}
export function getFirstComeReviewState(data: unknown, stage: string, now = new Date()) {
  const review = readFirstComeReview(data);
  const last = validInstant(review.lastConfirmedAt);
  const elapsedDays = last ? kstDay(now) - kstDay(last) : null;
  const intervalDays: 30 | 60 = review.intervalDays === 60 ? 60 : 30;
  const active = stage === "firstCome" && review.excluded !== true;
  const unknown = active && (elapsedDays === null || elapsedDays < 0);
  const dueDay = validDay(review.nextCheckDate);
  const due = active && (unknown || (dueDay !== null
    ? kstDay(now) >= dueDay : (elapsedDays ?? 0) >= intervalDays));
  const urgent = active && elapsedDays !== null && elapsedDays >= 90;
  return { review, intervalDays, elapsedDays, unknown, due: due || urgent, urgent,
    priority: urgent ? 3 : unknown ? 2 : due ? 1 : 0 };
}
/** 최신 DB 데이터에만 적용하며 날짜는 서버에서 기록합니다. */
export function updateFirstComeReview(
  data: unknown, action: ReviewAction, intervalDays: 30 | 60,
  note: string, now = new Date(),
): Data {
  const current = asRecord(data);
  const old = readFirstComeReview(current);
  const at = now.toISOString();
  const review: FirstComeReview = { ...old, intervalDays };
  if (action === "confirmed") {
    review.lastConfirmedAt = at;
    review.nextCheckDate = new Date((kstDay(now) + intervalDays) * DAY).toISOString().slice(0, 10);
    review.excluded = false;
    review.exclusionReason = "";
  } else if (action === "excluded") {
    review.excluded = true;
    review.exclusionReason = note;
    review.nextCheckDate = null;
  } else if (action === "resumed") {
    review.excluded = false;
    review.exclusionReason = "";
    // 추적 재개는 분양 중 확인이 아닙니다. 오늘 다시 확인할 대상으로 올립니다.
    review.nextCheckDate = reviewDate(now);
  } else {
    review.nextCheckDate = null;
  }
  review.history = [
    ...(Array.isArray(old.history) ? old.history : []),
    { at, action, note, intervalDays },
  ];
  return { ...current, firstComeReview: review };
}
