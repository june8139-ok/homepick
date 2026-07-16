"use client";

import type { EvaluationInput } from "../../data/scoring";

type Props = {
  evaluation: EvaluationInput;
  setEvaluation: (evaluation: EvaluationInput) => void;
};

export default function EvaluationForm({ evaluation, setEvaluation }: Props) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">평가 조건 입력</p>
      <h2 className="mt-2 text-2xl font-bold">AI 채점 기준</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Select
          label="가격 경쟁력"
          value={evaluation.priceLevel}
          onChange={(value) =>
            setEvaluation({ ...evaluation, priceLevel: value as EvaluationInput["priceLevel"] })
          }
          options={[
            ["very-good", "주변 대비 매우 저렴"],
            ["good", "가격 메리트 있음"],
            ["normal", "주변 시세와 비슷"],
            ["high", "주변보다 다소 높음"],
            ["unknown", "가격 정보 부족"],
          ]}
        />

        <Select
          label="계약금"
          value={evaluation.contractType}
          onChange={(value) =>
            setEvaluation({ ...evaluation, contractType: value as EvaluationInput["contractType"] })
          }
          options={[
            ["fixed-500", "계약금 500만원"],
            ["fixed-1000", "계약금 1,000만원"],
            ["ratio-5", "계약금 5%"],
            ["ratio-10", "계약금 10%"],
            ["unknown", "확인 필요"],
          ]}
        />

        <Select
          label="중도금"
          value={evaluation.middlePaymentType}
          onChange={(value) =>
            setEvaluation({ ...evaluation, middlePaymentType: value as EvaluationInput["middlePaymentType"] })
          }
          options={[
            ["free", "전액 무이자"],
            ["partial-free", "일부 무이자"],
            ["interest-deferred", "이자후불제"],
            ["self", "자납"],
            ["unknown", "확인 필요"],
          ]}
        />

        <Select
          label="발코니/옵션"
          value={evaluation.optionBenefitType}
          onChange={(value) =>
            setEvaluation({ ...evaluation, optionBenefitType: value as EvaluationInput["optionBenefitType"] })
          }
          options={[
            ["balcony-and-options-free", "발코니+옵션 무상"],
            ["balcony-free", "발코니 무상"],
            ["some-options-free", "일부 옵션 무상"],
            ["paid", "유상"],
            ["unknown", "확인 필요"],
          ]}
        />
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        우선 핵심 조건 4개부터 입력하도록 만들었어. 다음 단계에서 학군, 교통, 실거주, 미래가치까지 확장하면 돼.
      </p>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}