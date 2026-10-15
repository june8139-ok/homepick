"use client";

import { useRef, useState } from "react";
import { getFirstComeReviewState, type ReviewAction } from "../../lib/firstComeReview";

type SavedApartment = { id: string; data: Record<string, unknown>; status: string | null; updated_at: string };
type Props = {
  apartment: { id: string; name: string; data: unknown };
  stage: string;
  onSaved: (apartment: SavedApartment) => void;
};
const labels: Record<ReviewAction, string> = {
  confirmed: "분양 중 확인", excluded: "추적 제외", resumed: "추적 재개", soldOut: "분양완료 확인",
};
export default function FirstComeReviewControls({ apartment, stage, onSaved }: Props) {
  const state = getFirstComeReviewState(apartment.data, stage);
  const [interval, setInterval] = useState<30 | 60>(state.intervalDays);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  if (stage !== "firstCome" && stage !== "subscription") return null;

  async function save(result: ReviewAction) {
    if (lock.current) return;
    let note = "";
    if (result === "excluded") {
      const reason = window.prompt("추적 제외 사유를 입력해 주세요. 예: 취소분, 공가세대, 소량 무순위\n제외하면 전환·재확인 대상에서 빠지며 공개 상태는 유지됩니다.");
      if (reason === null) return;
      note = reason.trim();
      if (!note || note.length > 500) { setError("추적 제외 사유를 1~500자로 입력해 주세요."); return; }
    } else if (!window.confirm(result === "soldOut"
      ? `“${apartment.name}”의 완판을 확인했나요?\n100% 분양완료로 변경하며 기존 정보와 게시 여부는 유지합니다.`
      : result === "confirmed"
        ? `“${apartment.name}”이 현재 분양 중임을 확인했나요?\n오늘을 확인일로 저장하고 ${interval}일 후 다시 확인합니다.`
        : "추적을 재개할까요? 실제 확인일은 갱신하지 않고 확인 대상에 다시 포함합니다.")) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/apartments/action", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reviewFirstCome", apartmentId: apartment.id, result, intervalDays: interval, note }),
      });
      const body = await response.json();
      if (!response.ok || !body.apartment) throw new Error(body.message || "저장하지 못했습니다.");
      onSaved(body.apartment);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally { lock.current = false; setBusy(false); }
  }
  const review = state.review;
  const last = review.lastConfirmedAt && state.elapsedDays !== null && state.elapsedDays >= 0
    ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(review.lastConfirmedAt))
    : "확인 이력 없음";
  return (
    <section aria-label={`${apartment.name} 분양 여부 확인`} className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm font-bold text-zinc-800">
        {review.excluded ? "추적 제외" : stage === "subscription" ? "전환 추적 관리" : state.urgent ? "90일 이상 미확인 · 우선 확인" : state.unknown ? "확인 이력 없음 · 최초 확인 필요" : state.due ? "선착순 재확인 필요" : "선착순 확인 완료"}
      </p>
      {stage === "firstCome" && <p className="mt-1 text-xs leading-5 text-zinc-600">
        마지막 확인: {last}{state.elapsedDays !== null && state.elapsedDays >= 0 ? ` · ${state.elapsedDays}일 경과` : ""}
        {review.nextCheckDate && !review.excluded ? ` · 다음 확인: ${review.nextCheckDate}` : ""}
      </p>}
      {review.excluded && <p className="mt-1 break-words text-xs text-zinc-600">사유: {review.exclusionReason || "사유 미등록"}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {stage === "firstCome" && <label className="text-xs text-zinc-600">확인 주기{" "}
          <select disabled={busy} value={interval} onChange={e => setInterval(Number(e.target.value) as 30 | 60)} className="rounded-lg border border-zinc-300 bg-white p-2">
            <option value={30}>30일</option><option value={60}>60일</option>
          </select>
        </label>}
        {stage === "firstCome" && <button disabled={busy} onClick={() => save("confirmed")} type="button" className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">분양 중 확인</button>}
        {stage === "firstCome" && <button disabled={busy} onClick={() => save("soldOut")} type="button" className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-900 disabled:opacity-50">분양완료</button>}
        <button disabled={busy} onClick={() => save(review.excluded ? "resumed" : "excluded")} type="button" className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-700 disabled:opacity-50">{review.excluded ? "추적 재개" : "추적 제외"}</button>
        {busy && <span role="status" className="text-xs">저장 중…</span>}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
      {Array.isArray(review.history) && review.history.length > 0 && <details className="mt-3 text-xs text-zinc-600">
        <summary className="cursor-pointer">확인 이력 {review.history.length}건</summary>
        <ul className="mt-2 space-y-2">{[...review.history].reverse().map((item, i) => <li key={`${item.at}-${i}`} className="break-words">
          {new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(item.at))} · {labels[item.action]}{item.note ? ` · ${item.note}` : ""}
        </li>)}</ul>
      </details>}
    </section>
  );
}
