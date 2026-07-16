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

export default function AnalysisSection() {
  const { evaluation } = useAdmin();
  const score = calculateScore(evaluation);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">LIVE ANALYSIS</p>
      <h2 className="mt-2 text-2xl font-bold">실시간 분석</h2>

      <div className="mt-6 rounded-3xl bg-zinc-900 p-6 text-white">
        <p className="text-sm text-zinc-300">종합 분석점수</p>

        <div className="mt-2 flex items-end gap-3">
          <p className="text-5xl font-bold">{score.total}점</p>
          <span className="mb-1 rounded-xl bg-white px-3 py-1 text-sm font-bold text-zinc-900">
            {getGrade(score.total)}
          </span>
        </div>

        <p className="mt-3 text-sm text-zinc-300">
          계약조건, 입지, 생활환경, 미래가치 입력에 따라 점수가 실시간으로
          변경됩니다.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <ScoreRow label="가격 경쟁력" value={score.price} max={25} />
        <ScoreRow label="계약조건" value={score.contract} max={20} />
        <ScoreRow label="입지·교통" value={score.location} max={20} />
        <ScoreRow label="실거주 환경" value={score.living} max={15} />
        <ScoreRow label="미래가치" value={score.future} max={10} />
        <ScoreRow label="리스크 관리" value={score.risk} max={10} />
      </div>

      <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
        <p className="font-bold">분석 포인트</p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          <li>✔ 계약금이 낮을수록 계약조건 점수가 올라갑니다.</li>
          <li>✔ 중도금 무이자는 높은 가점으로 반영됩니다.</li>
          <li>✔ 학군·교통·미래가치 선택값도 점수에 반영됩니다.</li>
        </ul>
      </div>
    </section>
  );
}

function ScoreRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="text-zinc-500">
          {value} / {max}
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-zinc-200">
        <div
          className="h-2 rounded-full bg-zinc-900"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}