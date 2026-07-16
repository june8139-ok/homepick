"use client";

import type { EvaluationInput } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

export default function FutureSection() {
  const { evaluation, setEvaluation } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">미래가치</h2>
      <p className="mt-2 text-sm text-zinc-500">
        교통 개발, 일자리, 도시개발, 신축 희소성을 선택합니다.
      </p>

      <div className="mt-6 space-y-8">
        <GradeGroup
          title="교통 개발"
          value={evaluation.futureTransportGrade}
          options={[
            [0, "호재 없음"],
            [1, "일반 수준"],
            [2, "교통 호재 있음"],
            [3, "GTX/KTX/트램 등 핵심 호재"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              futureTransportGrade:
                value as EvaluationInput["futureTransportGrade"],
            })
          }
        />

        <GradeGroup
          title="일자리 개발"
          value={evaluation.futureJobGrade}
          options={[
            [0, "일자리 호재 없음"],
            [1, "일반 수준"],
            [2, "산단/업무지구 수요 있음"],
            [3, "대형 산단·기업유치 기대"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              futureJobGrade: value as EvaluationInput["futureJobGrade"],
            })
          }
        />

        <GradeGroup
          title="도시개발"
          value={evaluation.developmentGrade}
          options={[
            [0, "개발 내용 약함"],
            [1, "일반 수준"],
            [2, "도시확장·택지개발 기대"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              developmentGrade: value as EvaluationInput["developmentGrade"],
            })
          }
        />

        <GradeGroup
          title="신축 희소성"
          value={evaluation.scarcityGrade}
          options={[
            [0, "희소성 낮음"],
            [1, "일반 수준"],
            [2, "주변 신축 희소성 높음"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              scarcityGrade: value as EvaluationInput["scarcityGrade"],
            })
          }
        />

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700">
            미래가치 메모
          </p>
          <textarea
            rows={4}
            placeholder="예: 트램 예정, 산업단지 조성, 역세권 개발, 신도시 확장, 기업 이전 등"
            className="w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-zinc-400"
          />
        </div>
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