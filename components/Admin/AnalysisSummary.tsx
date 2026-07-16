"use client";

import { calculateScore } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

function getGrade(score: number) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  return "C";
}

function getStrengths(evaluation: ReturnType<typeof useAdmin>["evaluation"]) {
  const strengths = [];

  if (evaluation.contractType === "fixed-500") strengths.push("계약금 500만원");
  if (evaluation.middlePaymentType === "free") strengths.push("중도금 무이자");
  if (evaluation.optionBenefitType === "balcony-free") strengths.push("발코니 확장 무상");
  if (evaluation.optionBenefitType === "balcony-and-options-free") strengths.push("풀옵션 무상");
  if (evaluation.cashBenefitType !== "none") strengths.push("현금성 혜택");
  if (evaluation.schoolLevel.includes("elementary")) strengths.push("학군 접근성");
  if (evaluation.transportLevel.includes("station")) strengths.push("교통 호재");

  return strengths.slice(0, 5);
}

export default function AnalysisSummary() {
  const { evaluation, savedScore, isDirty } = useAdmin();

  const calculatedScore = calculateScore(evaluation);
  const displayScore = !isDirty && savedScore ? savedScore : calculatedScore;

  const strengths = getStrengths(evaluation);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">DASHBOARD</p>

      <div className="mt-4 rounded-3xl bg-zinc-900 p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-300">현재 분석점수</p>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200">
            {isDirty ? "수정중" : "저장된 점수"}
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <p className="text-5xl font-bold">{displayScore.total}점</p>

          <span className="rounded-xl bg-white px-3 py-1 text-sm font-bold text-zinc-900">
            {getGrade(displayScore.total)}
          </span>
        </div>

        <p className="mt-3 text-sm text-zinc-300">
          {isDirty
            ? "수정한 조건을 기준으로 점수가 다시 계산되고 있습니다."
            : "현재 저장된 단지 점수를 표시합니다."}
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
        <p className="font-bold">주요 장점</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {strengths.length > 0 ? (
            strengths.map((item) => (
              <span
                key={item}
                className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-white"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-zinc-500">
              조건을 선택하면 장점이 자동 표시됩니다.
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
        <p className="font-bold">저장 상태</p>

        <p className="mt-2 text-sm text-zinc-500">
          {isDirty ? "🟡 변경사항 있음" : "🟢 저장된 상태"}
        </p>
      </div>
    </section>
  );
}