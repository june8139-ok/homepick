"use client";

import type { EvaluationInput } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

export default function ContractSection() {
  const { evaluation, setEvaluation } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">계약조건</h2>
      <p className="mt-2 text-sm text-zinc-500">
        선택한 조건이 오른쪽 분석점수에 바로 반영됩니다.
      </p>

      <div className="mt-6 space-y-8">
        <OptionGroup
          title="계약금"
          options={[
            ["ratio-10", "계약금 10%"],
            ["ratio-5", "계약금 5%"],
            ["fixed-1000", "계약금 1,000만원"],
            ["fixed-500", "계약금 500만원"],
          ]}
          value={evaluation.contractType}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              contractType: value as EvaluationInput["contractType"],
            })
          }
        />

        <OptionGroup
          title="중도금"
          options={[
            ["interest-deferred", "이자후불제"],
            ["partial-free", "일부 무이자"],
            ["free", "중도금 무이자"],
            ["self", "자납"],
          ]}
          value={evaluation.middlePaymentType}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              middlePaymentType:
                value as EvaluationInput["middlePaymentType"],
            })
          }
        />

        <OptionGroup
          title="발코니 / 옵션"
          options={[
            ["paid", "발코니 확장 유상"],
            ["balcony-free", "발코니 확장 무상"],
            ["balcony-and-options-free", "풀옵션 무상"],
          ]}
          value={evaluation.optionBenefitType}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              optionBenefitType:
                value as EvaluationInput["optionBenefitType"],
            })
          }
        />

        <OptionGroup
          title="현금성 혜택"
          options={[
            ["none", "없음"],
            ["small", "소액 혜택"],
            ["over-1000", "1,000만원 이상"],
            ["over-2000", "2,000만원 이상"],
          ]}
          value={evaluation.cashBenefitType}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              cashBenefitType: value as EvaluationInput["cashBenefitType"],
            })
          }
        />

        <OptionGroup
          title="잔금 / 입주지원"
          options={[
            ["no", "일반 잔금"],
            ["yes", "잔금유예 / 입주지원"],
          ]}
          value={evaluation.balanceSupport}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              balanceSupport: value as EvaluationInput["balanceSupport"],
            })
          }
        />

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700">
            기타 계약조건
          </p>
          <textarea
            rows={4}
            placeholder="예: 시스템에어컨 무상, 일부 세대 한정, 고층 제외, 계약금 3회 분납 등"
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