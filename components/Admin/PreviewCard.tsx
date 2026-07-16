import { calculateScore, type EvaluationInput } from "../../data/scoring";

type Props = {
  evaluation: EvaluationInput;
};

function getGrade(score: number) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  return "C";
}

export default function PreviewCard({ evaluation }: Props) {
  const score = calculateScore(evaluation);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">AI 점수 미리보기</p>

      <div className="mt-3 flex items-end gap-3">
        <p className="text-5xl font-bold">{score.total}점</p>
        <span className="mb-1 rounded-xl bg-zinc-900 px-3 py-1 text-white">
          {getGrade(score.total)}
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        <ScoreRow label="가격 경쟁력" value={score.price} max={25} />
        <ScoreRow label="계약조건" value={score.contract} max={20} />
        <ScoreRow label="입지·교통" value={score.location} max={20} />
        <ScoreRow label="실거주 환경" value={score.living} max={15} />
        <ScoreRow label="미래가치" value={score.future} max={10} />
        <ScoreRow label="리스크 관리" value={score.risk} max={10} />
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
        <span>{label}</span>
        <span>
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