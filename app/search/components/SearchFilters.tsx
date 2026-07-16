"use client";

import { useState } from "react";

export type SortOption = "score" | "contract" | "name";

export type SearchFilterState = {
  status: "" | "분양중" | "선착순" | "청약중";
  benefits: string[];
  minScore: number;
};

const statusOptions: SearchFilterState["status"][] = [
  "",
  "분양중",
  "선착순",
  "청약중",
];

const benefitGroups = [
  {
    title: "계약금",
    items: [
      "1차 계약금 500만원",
      "1차 계약금 1,000만원",
      "계약금 5%",
      "계약금 10%",
    ],
  },
  {
    title: "중도금",
    items: [
      "중도금 무이자",
      "일부 무이자",
      "이자후불제",
    ],
  },
  {
    title: "추가 혜택",
    items: [
      "축하금",
      "발코니 무상",
      "풀옵션 무상",
      "잔금/입주지원",
    ],
  },
];

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function SearchFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClear,
}: {
  filters: SearchFilterState;
  sort: SortOption;
  onFiltersChange: (filters: SearchFilterState) => void;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const activeDetailCount =
    filters.benefits.length + (filters.minScore > 0 ? 1 : 0);

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold text-zinc-500">
            분양 상태
          </span>

          {statusOptions.map((item) => {
            const active = filters.status === item;
            const label = item || "전체";

            return (
              <button
                key={label}
                type="button"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    status: item,
                  })
                }
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}

          <button
            type="button"
            aria-expanded={isDetailOpen}
            onClick={() => setIsDetailOpen((prev) => !prev)}
            className={[
              "ml-1 rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeDetailCount > 0
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
            ].join(" ")}
          >
            조건 필터
            {activeDetailCount > 0 ? ` ${activeDetailCount}` : ""}
            <span className="ml-1">{isDetailOpen ? "↑" : "↓"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as SortOption)
            }
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
          >
            <option value="score">종합점수순</option>
            <option value="contract">계약조건순</option>
            <option value="name">이름순</option>
          </select>

          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            초기화
          </button>
        </div>
      </div>

      {isDetailOpen && (
        <div className="mt-4 border-t border-zinc-200 pt-4">
          <div className="grid gap-5 lg:grid-cols-3">
            {benefitGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-2 text-xs font-bold text-zinc-500">
                  {group.title}
                </p>

                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const active = filters.benefits.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            benefits: toggleValue(
                              filters.benefits,
                              item
                            ),
                          })
                        }
                        className={[
                          "rounded-full border px-3 py-2 text-sm font-medium transition",
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                        ].join(" ")}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4">
            <span className="text-xs font-bold text-zinc-500">
              분석 점수
            </span>

            <select
              value={filters.minScore}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  minScore: Number(event.target.value),
                })
              }
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none"
            >
              <option value={0}>전체 점수</option>
              <option value={70}>70점 이상</option>
              <option value={80}>80점 이상</option>
              <option value={90}>90점 이상</option>
            </select>

            <p className="text-xs text-zinc-400">
              선택한 조건은 목록과 지도 핀에 동시에 반영됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}