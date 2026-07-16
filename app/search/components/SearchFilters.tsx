"use client";

import { useState } from "react";

export type SortOption = "default" | "distance" | "contract" | "name";
export type SearchStatus = "" | "분양중" | "선착순" | "청약중";

export type SearchFilterState = {
  status: SearchStatus;
  benefits: string[];
};

export type LocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "error"
  | "unsupported";

const statusOptions: SearchStatus[] = ["", "분양중", "선착순", "청약중"];

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
    items: ["중도금 무이자", "일부 무이자", "이자후불제"],
  },
  {
    title: "추가 혜택",
    items: ["축하금", "발코니 무상", "풀옵션 무상", "잔금/입주지원"],
  },
];

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getLocationButtonText(status: LocationStatus) {
  switch (status) {
    case "loading":
      return "위치 확인 중";
    case "granted":
      return "내 주변 적용됨";
    case "denied":
      return "위치 권한 다시 요청";
    case "error":
      return "위치 다시 찾기";
    case "unsupported":
      return "위치 기능 미지원";
    default:
      return "내 주변";
  }
}

export default function SearchFilters({
  filters,
  sort,
  locationStatus,
  locationMessage,
  hasUserLocation,
  onFiltersChange,
  onSortChange,
  onRequestLocation,
  onClear,
}: {
  filters: SearchFilterState;
  sort: SortOption;
  locationStatus: LocationStatus;
  locationMessage?: string;
  hasUserLocation: boolean;
  onFiltersChange: (filters: SearchFilterState) => void;
  onSortChange: (sort: SortOption) => void;
  onRequestLocation: () => void;
  onClear: () => void;
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const activeDetailCount = filters.benefits.length;
  const locationDisabled =
    locationStatus === "loading" || locationStatus === "unsupported";

  const changeSort = (nextSort: SortOption) => {
    if (nextSort === "distance" && !hasUserLocation) {
      onRequestLocation();
      return;
    }

    onSortChange(nextSort);
  };

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold text-zinc-500">분양 상태</span>

          {statusOptions.map((status) => {
            const active = filters.status === status;
            const label = status || "전체";

            return (
              <button
                key={label}
                type="button"
                onClick={() => onFiltersChange({ ...filters, status })}
                className={[
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  active
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}

          <button
            type="button"
            aria-expanded={isDetailOpen}
            onClick={() => setIsDetailOpen((value) => !value)}
            className={[
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
              activeDetailCount > 0
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
            ].join(" ")}
          >
            조건 필터
            {activeDetailCount > 0 ? ` ${activeDetailCount}` : ""}
            <span className="ml-1">{isDetailOpen ? "↑" : "↓"}</span>
          </button>

          <button
            type="button"
            disabled={locationDisabled}
            onClick={onRequestLocation}
            className={[
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasUserLocation
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
            ].join(" ")}
          >
            <span aria-hidden="true">📍</span>
            {getLocationButtonText(locationStatus)}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(event) => changeSort(event.target.value as SortOption)}
            className="h-10 cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-400"
          >
            <option value="default">기본순</option>
            <option value="distance">가까운 순</option>
            <option value="contract">계약조건순</option>
            <option value="name">이름순</option>
          </select>

          <button
            type="button"
            onClick={onClear}
            className="h-10 cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
          >
            초기화
          </button>
        </div>
      </div>

      {locationMessage && (
        <p
          className={[
            "mt-3 text-xs font-medium",
            locationStatus === "granted"
              ? "text-emerald-700"
              : locationStatus === "denied" || locationStatus === "error"
                ? "text-rose-600"
                : "text-zinc-500",
          ].join(" ")}
        >
          {locationMessage}
        </p>
      )}

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
                            benefits: toggleValue(filters.benefits, item),
                          })
                        }
                        className={[
                          "cursor-pointer rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200",
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
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

          <p className="mt-4 border-t border-zinc-200 pt-4 text-xs text-zinc-400">
            선택한 조건은 목록과 지도에 동시에 반영됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
