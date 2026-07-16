"use client";

import { useState } from "react";
import { calculateScore } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

export default function AnalysisDetail() {
  const [open, setOpen] = useState(false);
  const { evaluation } = useAdmin();
  const score = calculateScore(evaluation);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-zinc-500">DETAIL</p>
          <h2 className="mt-1 text-2xl font-bold">상세점수</h2>
        </div>

        <span className="text-sm text-zinc-500">
          {open ? "접기 ↑" : "보기 ↓"}
        </span>
      </button>

      {open && (
        <div className="mt-5 space-y-3">
          <ScoreRow label="가격 경쟁력" value={score.price} max={25} />
          <ScoreRow label="계약조건" value={score.contract} max={20} />
          <ScoreRow label="입지·교통" value={score.location} max={20} />
          <ScoreRow label="실거주 환경" value={score.living} max={15} />
          <ScoreRow label="미래가치" value={score.future} max={10} />
          <ScoreRow label="리스크 관리" value={score.risk} max={10} />
        </div>
      )}
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