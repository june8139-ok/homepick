"use client";

import {
  useState,
} from "react";

import type {
  ApartmentConditionHistoryItem,
} from "../../types/apartment";

type Props = {
  items?: ApartmentConditionHistoryItem[];
};

function getDateLabel(
  item: ApartmentConditionHistoryItem
) {
  const date =
    item.date?.trim();

  switch (item.dateType) {
    case "changed":
      return date
        ? `변경일 ${date}`
        : "변경일 확인 필요";

    case "month-only":
      return date
        ? `${date} 기준 확인`
        : "연월 확인 필요";

    case "unknown":
      return "날짜 미확인";

    case "checked":
    default:
      return date
        ? `확인일 ${date}`
        : "확인일 입력 필요";
  }
}

function getContractLabel(
  value?: string
) {
  const labels: Record<string, string> = {
    "fixed-500": "계약금 500만원",
    "fixed-1000": "계약금 1,000만원",
    "ratio-5": "계약금 5%",
    "ratio-10": "계약금 10%",
    unknown: "확인 필요",
  };

  return labels[
    value || "unknown"
  ] ?? value ?? "확인 필요";
}

function getMiddlePaymentLabel(
  value?: string
) {
  const labels: Record<string, string> = {
    free: "중도금 무이자",
    "partial-free": "일부 무이자",
    "interest-deferred": "이자후불제",
    self: "자납",
    unknown: "확인 필요",
  };

  return labels[
    value || "unknown"
  ] ?? value ?? "확인 필요";
}

function getOptionLabel(
  value?: string
) {
  const labels: Record<string, string> = {
    "balcony-and-options-free":
      "발코니+옵션 무상",
    "balcony-free":
      "발코니 무상",
    "some-options-free":
      "일부 옵션 무상",
    paid: "유상",
    unknown: "확인 필요",
  };

  return labels[
    value || "unknown"
  ] ?? value ?? "확인 필요";
}

function getCashBenefitLabel(
  value?: string
) {
  const labels: Record<string, string> = {
    "over-2000":
      "2,000만원 이상",
    "over-1000":
      "1,000만원 이상",
    small: "1,000만원 미만",
    none: "없음",
    unknown: "확인 필요",
  };

  return labels[
    value || "unknown"
  ] ?? value ?? "확인 필요";
}

function getBalanceSupportLabel(
  value?: string
) {
  const labels: Record<string, string> = {
    yes: "지원 있음",
    no: "일반 잔금",
    unknown: "확인 필요",
  };

  return labels[
    value || "unknown"
  ] ?? value ?? "확인 필요";
}

export default function ConditionHistory({
  items = [],
}: Props) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const visibleItems =
    expanded
      ? items
      : items.slice(0, 2);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="space-y-4">
        {visibleItems.map(
          (item, index) => (
            <article
              key={`${item.date}-${item.title}-${index}`}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-500 sm:text-sm">
                    {getDateLabel(
                      item
                    )}
                  </p>

                  <h3 className="mt-1 text-base font-extrabold text-[#132238] sm:text-lg">
                    {item.title ||
                      "조건 변경"}
                  </h3>
                </div>

                <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  조건 변경
                </span>
              </div>

              {item.description && (
                <p className="mt-3 whitespace-pre-line break-keep text-xs leading-6 text-zinc-600 sm:text-sm sm:leading-7">
                  {item.description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <Info
                  title="계약금"
                  value={getContractLabel(
                    item.contractType
                  )}
                />

                <Info
                  title="중도금"
                  value={getMiddlePaymentLabel(
                    item.middlePaymentType
                  )}
                />

                <Info
                  title="발코니/옵션"
                  value={getOptionLabel(
                    item.optionBenefitType
                  )}
                />

                <Info
                  title="현금혜택"
                  value={getCashBenefitLabel(
                    item.cashBenefitType
                  )}
                />

                <Info
                  title="잔금지원"
                  value={getBalanceSupportLabel(
                    item.balanceSupport
                  )}
                />
              </div>
            </article>
          )
        )}
      </div>

      {items.length > 2 && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              (value) => !value
            )
          }
          className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
        >
          {expanded
            ? "변경 이력 접기"
            : `전체 이력 ${items.length}개 보기`}
        </button>
      )}
    </section>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 text-xs sm:text-sm">
      <p className="text-zinc-500">
        {title}
      </p>

      <p className="mt-1 font-bold text-[#132238]">
        {value}
      </p>
    </div>
  );
}
