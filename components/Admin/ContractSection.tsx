"use client";

import type {
  EvaluationInput,
} from "../../data/scoring";

import {
  useAdmin,
} from "./AdminContext";

export default function ContractSection() {
  const {
    evaluation,
    setEvaluation,
  } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-extrabold text-emerald-600">
          CONTRACT CONDITIONS
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
          계약조건
        </h2>

        <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
          실제 적용되는 계약금, 중도금,
          옵션과 입주지원 조건을 선택합니다.
          선택한 내용은 상세페이지와
          노출 미리보기에 자동 반영됩니다.
        </p>
      </div>

      <div className="mt-7 space-y-8">
        <OptionGroup
          title="계약금"
          description="현재 안내 중인 대표 계약금 조건을 선택하세요."
          options={[
            [
              "ratio-10",
              "계약금 10%",
            ],
            [
              "ratio-5",
              "계약금 5%",
            ],
            [
              "fixed-1000",
              "계약금 1,000만원",
            ],
            [
              "fixed-500",
              "계약금 500만원",
            ],
          ]}
          value={
            evaluation.contractType
          }
          onChange={(value) =>
            setEvaluation({
              ...evaluation,

              contractType:
                value as EvaluationInput["contractType"],
            })
          }
        />

        <OptionGroup
          title="중도금"
          description="중도금 이자와 납부 방식을 선택하세요."
          options={[
            [
              "interest-deferred",
              "이자후불제",
            ],
            [
              "partial-free",
              "일부 무이자",
            ],
            [
              "free",
              "중도금 무이자",
            ],
            [
              "self",
              "중도금 자납",
            ],
          ]}
          value={
            evaluation.middlePaymentType
          }
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
          description="대표 옵션 혜택만 선택하고, 개별 품목은 추후 기타조건에 입력합니다."
          options={[
            [
              "paid",
              "발코니 확장 유상",
            ],
            [
              "balcony-free",
              "발코니 확장 무상",
            ],
            [
              "balcony-and-options-free",
              "풀옵션 무상",
            ],
          ]}
          value={
            evaluation.optionBenefitType
          }
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
          description="축하금·지원금 등 현금성 혜택의 대략적인 규모를 선택하세요."
          options={[
            [
              "none",
              "없음",
            ],
            [
              "small",
              "1,000만원 미만",
            ],
            [
              "over-1000",
              "1,000만원 이상",
            ],
            [
              "over-2000",
              "2,000만원 이상",
            ],
          ]}
          value={
            evaluation.cashBenefitType
          }
          onChange={(value) =>
            setEvaluation({
              ...evaluation,

              cashBenefitType:
                value as EvaluationInput["cashBenefitType"],
            })
          }
        />

        <OptionGroup
          title="잔금 / 입주지원"
          description="잔금유예나 입주지원 제도가 있는지 선택하세요."
          options={[
            [
              "no",
              "일반 잔금",
            ],
            [
              "yes",
              "잔금유예 / 입주지원",
            ],
          ]}
          value={
            evaluation.balanceSupport
          }
          onChange={(value) =>
            setEvaluation({
              ...evaluation,

              balanceSupport:
                value as EvaluationInput["balanceSupport"],
            })
          }
        />

        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-extrabold text-amber-800">
            기타 계약조건 입력 예정
          </p>

          <p className="mt-1 break-keep text-xs leading-5 text-amber-800/75">
            시스템에어컨 무상, 계약금 분납,
            일부 세대 한정처럼 개별 조건을
            저장할 수 있는 입력칸은 다음
            데이터 정리 단계에서 추가합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function OptionGroup({
  title,
  description,
  options,
  value,
  onChange,
}: {
  title: string;
  description: string;
  options: Array<
    [
      string,
      string,
    ]
  >;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <fieldset>
      <legend className="text-base font-extrabold text-[#132238]">
        {title}
      </legend>

      <p className="mt-1 break-keep text-xs leading-5 text-zinc-400">
        {description}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(
          ([
            optionValue,
            label,
          ]) => {
            const selected =
              value ===
              optionValue;

            return (
              <button
                key={
                  optionValue
                }
                type="button"
                aria-pressed={
                  selected
                }
                onClick={() =>
                  onChange(
                    optionValue
                  )
                }
                className={[
                  "min-h-12 cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-bold",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  "active:translate-y-0 active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  selected
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                ].join(
                  " "
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>
                    {label}
                  </span>

                  {selected && (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-base"
                    >
                      ✓
                    </span>
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </fieldset>
  );
}