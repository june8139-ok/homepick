"use client";

import type {
  ApartmentConditionHistoryItem,
} from "../../types/apartment";

import {
  useAdmin,
} from "./AdminContext";

const contractOptions = [
  ["unknown", "확인 필요"],
  ["fixed-500", "계약금 500만원"],
  ["fixed-1000", "계약금 1,000만원"],
  ["ratio-5", "계약금 5%"],
  ["ratio-10", "계약금 10%"],
] as const;

const middlePaymentOptions = [
  ["unknown", "확인 필요"],
  ["free", "중도금 무이자"],
  ["partial-free", "일부 무이자"],
  ["interest-deferred", "이자후불제"],
  ["self", "자납"],
] as const;

const optionBenefitOptions = [
  ["unknown", "확인 필요"],
  ["balcony-and-options-free", "발코니+옵션 무상"],
  ["balcony-free", "발코니 무상"],
  ["some-options-free", "일부 옵션 무상"],
  ["paid", "유상"],
] as const;

const cashBenefitOptions = [
  ["unknown", "확인 필요"],
  ["over-2000", "2,000만원 이상"],
  ["over-1000", "1,000만원 이상"],
  ["small", "1,000만원 미만"],
  ["none", "없음"],
] as const;

const balanceSupportOptions = [
  ["unknown", "확인 필요"],
  ["yes", "지원 있음"],
  ["no", "일반 잔금"],
] as const;

function createEmptyBlock(): ApartmentConditionHistoryItem {
  return {
    date: "",
    title: "",
    description: "",
    contractType: "unknown",
    middlePaymentType: "unknown",
    optionBenefitType: "unknown",
    cashBenefitType: "unknown",
    balanceSupport: "unknown",
  };
}

export default function ConditionHistorySection() {
  const {
    conditionHistory,
    setConditionHistory,
  } = useAdmin();

  const updateBlock = (
    index: number,
    patch: Partial<ApartmentConditionHistoryItem>
  ) => {
    setConditionHistory(
      conditionHistory.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...patch,
              }
            : item
      )
    );
  };

  const moveBlock = (
    index: number,
    direction: -1 | 1
  ) => {
    const target =
      index + direction;

    if (
      target < 0 ||
      target >=
        conditionHistory.length
    ) {
      return;
    }

    const next = [
      ...conditionHistory,
    ];

    [
      next[index],
      next[target],
    ] = [
      next[target],
      next[index],
    ];

    setConditionHistory(next);
  };

  const removeBlock = (
    index: number
  ) => {
    setConditionHistory(
      conditionHistory.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-amber-600">
            CONDITION HISTORY
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
            계약조건 변경 이력
          </h2>

          <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
            날짜·제목·내용을 글쓰기
            블록처럼 추가하고 순서를
            변경할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setConditionHistory([
              ...conditionHistory,
              createEmptyBlock(),
            ])
          }
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          + 변경 이력 추가
        </button>
      </div>

      {conditionHistory.length ===
      0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center">
          <p className="text-sm font-bold text-zinc-600">
            아직 등록된 변경 이력이
            없습니다.
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            실제 계약조건이 변경된
            경우에만 블록을 추가해주세요.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {conditionHistory.map(
            (item, index) => (
              <article
                key={index}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-[#132238]">
                    변경 이력 {index + 1}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <BlockButton
                      label="위로"
                      disabled={
                        index === 0
                      }
                      onClick={() =>
                        moveBlock(
                          index,
                          -1
                        )
                      }
                    />

                    <BlockButton
                      label="아래로"
                      disabled={
                        index ===
                        conditionHistory.length -
                          1
                      }
                      onClick={() =>
                        moveBlock(
                          index,
                          1
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeBlock(
                          index
                        )
                      }
                      className="min-h-9 cursor-pointer rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <Field label="날짜">
                    <input
                      type="text"
                      value={item.date}
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            date:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder="예: 2026.08.01"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="제목">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            title:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder="예: 계약축하금 적용 조건 변경"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="mt-3">
                  <Field label="내용">
                    <textarea
                      value={
                        item.description
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            description:
                              event.target
                                .value,
                          }
                        )
                      }
                      rows={4}
                      placeholder="변경된 조건과 적용 대상, 확인할 점을 입력해주세요."
                      className={`${inputClass} min-h-28 resize-y`}
                    />
                  </Field>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <SelectField
                    label="계약금"
                    value={
                      item.contractType ??
                      "unknown"
                    }
                    options={
                      contractOptions
                    }
                    onChange={(value) =>
                      updateBlock(
                        index,
                        {
                          contractType:
                            value as ApartmentConditionHistoryItem["contractType"],
                        }
                      )
                    }
                  />

                  <SelectField
                    label="중도금"
                    value={
                      item.middlePaymentType ??
                      "unknown"
                    }
                    options={
                      middlePaymentOptions
                    }
                    onChange={(value) =>
                      updateBlock(
                        index,
                        {
                          middlePaymentType:
                            value as ApartmentConditionHistoryItem["middlePaymentType"],
                        }
                      )
                    }
                  />

                  <SelectField
                    label="발코니/옵션"
                    value={
                      item.optionBenefitType ??
                      "unknown"
                    }
                    options={
                      optionBenefitOptions
                    }
                    onChange={(value) =>
                      updateBlock(
                        index,
                        {
                          optionBenefitType:
                            value as ApartmentConditionHistoryItem["optionBenefitType"],
                        }
                      )
                    }
                  />

                  <SelectField
                    label="현금혜택"
                    value={
                      item.cashBenefitType ??
                      "unknown"
                    }
                    options={
                      cashBenefitOptions
                    }
                    onChange={(value) =>
                      updateBlock(
                        index,
                        {
                          cashBenefitType:
                            value as ApartmentConditionHistoryItem["cashBenefitType"],
                        }
                      )
                    }
                  />

                  <SelectField
                    label="잔금지원"
                    value={
                      item.balanceSupport ??
                      "unknown"
                    }
                    options={
                      balanceSupportOptions
                    }
                    onChange={(value) =>
                      updateBlock(
                        index,
                        {
                          balanceSupport:
                            value as ApartmentConditionHistoryItem["balanceSupport"],
                        }
                      )
                    }
                  />
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-[#132238] outline-none transition placeholder:text-zinc-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-zinc-600">
        {label}
      </span>

      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (
    readonly [string, string]
  )[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={inputClass}
      >
        {options.map(
          ([optionValue, text]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {text}
            </option>
          )
        )}
      </select>
    </Field>
  );
}

function BlockButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-9 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {label}
    </button>
  );
}
