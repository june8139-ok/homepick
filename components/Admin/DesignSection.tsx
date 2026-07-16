"use client";

import type { EvaluationInput } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

export default function DesignSection() {
  const { evaluation, setEvaluation } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">단지설계</h2>
      <p className="mt-2 text-sm text-zinc-500">
        브랜드, 커뮤니티, 주차, 평면, 단지규모를 선택합니다.
      </p>

      <div className="mt-6 space-y-8">
        <GradeGroup
          title="브랜드"
          value={evaluation.brandGrade}
          options={[
            [0, "브랜드 약함"],
            [1, "일반 브랜드"],
            [2, "인지도 있음"],
            [3, "1군 브랜드"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              brandGrade: value as EvaluationInput["brandGrade"],
            })
          }
        />

        <GradeGroup
          title="커뮤니티"
          value={evaluation.communityGrade}
          options={[
            [0, "커뮤니티 약함"],
            [1, "기본 수준"],
            [2, "양호"],
            [3, "골프·피트니스·사우나 등 우수"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              communityGrade: value as EvaluationInput["communityGrade"],
            })
          }
        />

        <GradeGroup
          title="주차"
          value={evaluation.parkingGrade}
          options={[
            [0, "주차 약함"],
            [1, "보통"],
            [2, "양호"],
            [3, "세대당 1.3대 이상 / 광폭주차 우수"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              parkingGrade: value as EvaluationInput["parkingGrade"],
            })
          }
        />

        <GradeGroup
          title="평면"
          value={evaluation.floorPlanGrade}
          options={[
            [0, "평면 약함"],
            [1, "보통"],
            [2, "양호"],
            [3, "4Bay·팬트리·드레스룸 등 우수"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              floorPlanGrade: value as EvaluationInput["floorPlanGrade"],
            })
          }
        />

        <GradeGroup
          title="단지규모"
          value={evaluation.scaleGrade}
          options={[
            [0, "소규모"],
            [1, "보통"],
            [2, "중대형 단지"],
            [3, "700세대 이상 대단지"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              scaleGrade: value as EvaluationInput["scaleGrade"],
            })
          }
        />

        <textarea
          rows={4}
          placeholder="예: 세대당 주차 1.5대, 사우나, 골프연습장, 4Bay 평면 등"
          className="w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-zinc-400"
        />
      </div>
    </section>
  );
}

function GradeGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: [number, string][];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <h3 className="font-bold">{title}</h3>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(([optionValue, label]) => {
          const selected = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}