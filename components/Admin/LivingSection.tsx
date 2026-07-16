"use client";

import type { EvaluationInput } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

export default function LivingSection() {
  const { evaluation, setEvaluation } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">생활환경</h2>
      <p className="mt-2 text-sm text-zinc-500">
        실거주 만족도에 영향을 주는 생활 인프라와 쾌적성을 선택합니다.
      </p>

      <div className="mt-6 space-y-8">
        <OptionGroup
          title="직주근접"
          value={evaluation.jobLevel}
          options={[
            ["excellent", "산업단지·업무지구 접근 우수"],
            ["good", "차량권 일자리 수요 있음"],
            ["weak", "직주근접 약함"],
            ["unknown", "확인 필요"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              jobLevel: value as EvaluationInput["jobLevel"],
            })
          }
        />

        <OptionGroup
          title="자연·쾌적성"
          value={evaluation.natureLevel}
          options={[
            ["good", "공원·하천·녹지 우수"],
            ["normal", "기본 쾌적성 보통"],
            ["weak", "쾌적성 약함"],
            ["unknown", "확인 필요"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              natureLevel: value as EvaluationInput["natureLevel"],
            })
          }
        />

        <OptionGroup
          title="도로망"
          value={evaluation.roadLevel}
          options={[
            ["good", "주요 도로 접근 양호"],
            ["weak", "도로 접근 약함"],
            ["unknown", "확인 필요"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              roadLevel: value as EvaluationInput["roadLevel"],
            })
          }
        />

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700">
            생활환경 메모
          </p>
          <textarea
            rows={4}
            placeholder="예: 대형마트 차량 5분, 병원 인접, 공원 도보권, 맛집거리 형성 등"
            className="w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-zinc-400"
          />
        </div>
      </div>
    </section>
  );
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
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