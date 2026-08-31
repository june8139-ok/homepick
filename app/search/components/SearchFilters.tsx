"use client";

import { useState } from "react";

export type SearchStatus =
  | ""
  | "청약"
  | "선착순"
  | "분양완료";

export type SortOption =
  | "default"
  | "distance"
  | "contract"
  | "name";

export type LocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "error"
  | "unsupported";

export type SearchFilterState = {
  status: SearchStatus;
  benefits: string[];
};

const statusOptions: Array<{
  value: SearchStatus;
  label: string;
}> = [
  { value: "", label: "전체" },
  { value: "청약", label: "청약" },
  { value: "선착순", label: "선착순" },
  {
    value: "분양완료",
    label: "분양완료",
  },
];

const benefitOptions = [
  "계약금 500만원",
  "계약금 1,000만원",
  "계약금 5%",
  "계약금 10%",
  "중도금 무이자",
  "이자후불제",
  "축하금",
  "발코니 무상",
  "풀옵션 무상",
  "잔금유예",
];

function locationLabel(status: LocationStatus) {
  switch (status) {
    case "loading":
      return "위치 확인 중";
    case "granted":
      return "내 주변 적용";
    case "denied":
      return "권한 재요청";
    case "error":
      return "위치 다시 찾기";
    case "unsupported":
      return "위치 미지원";
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
  onStatusChange,
  onSortChange,
  onRequestLocation,
  onClear,
}: {
  filters: SearchFilterState;
  sort: SortOption;
  locationStatus: LocationStatus;
  locationMessage?: string;
  hasUserLocation: boolean;
  onFiltersChange: (
    filters: SearchFilterState
  ) => void;
  onStatusChange?: (
    status: SearchStatus
  ) => void;
  onSortChange: (sort: SortOption) => void;
  onRequestLocation: () => void;
  onClear: () => void;
}) {
  const [detailOpen, setDetailOpen] =
    useState(false);

  const toggleBenefit = (value: string) => {
    const exists =
      filters.benefits.includes(value);

    onFiltersChange({
      ...filters,
      benefits: exists
        ? filters.benefits.filter(
            (item) => item !== value
          )
        : [...filters.benefits, value],
    });
  };

  const changeStatus = (
    value: SearchStatus
  ) => {
    if (onStatusChange) {
      onStatusChange(value);
      return;
    }

    onFiltersChange({
      ...filters,
      status: value,
    });
  };

  const changeSort = (value: SortOption) => {
    if (
      value === "distance" &&
      !hasUserLocation
    ) {
      onRequestLocation();
      return;
    }

    onSortChange(value);
  };

  return (
    <section className="mt-2 w-full min-w-0 sm:mt-5">
      <div className="sm:hidden">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statusOptions.map((option) => {
            const active =
              filters.status === option.value;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() =>
                  changeStatus(option.value)
                }
                aria-pressed={active}
                className={[
                  "h-8 shrink-0 cursor-pointer rounded-full border px-3 text-[11px] font-extrabold transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-700",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setDetailOpen((value) => !value)}
            aria-expanded={detailOpen}
            className={[
              "ml-auto inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full border px-3 text-[11px] font-extrabold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2",
              detailOpen || filters.benefits.length > 0 || hasUserLocation || sort !== "default"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                : "border-zinc-200 bg-white text-zinc-700",
            ].join(" ")}
          >
            필터
            {filters.benefits.length > 0 ? ` ${filters.benefits.length}` : ""}
            <span className="ml-1">{detailOpen ? "↑" : "↓"}</span>
          </button>
        </div>

        {detailOpen && (
          <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 shadow-sm">
            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                disabled={locationStatus === "loading" || locationStatus === "unsupported"}
                onClick={onRequestLocation}
                className={[
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-[11px] font-bold",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  hasUserLocation
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-300 bg-white text-zinc-700",
                ].join(" ")}
              >
                <span aria-hidden="true">📍</span>
                {locationLabel(locationStatus)}
              </button>

              <select
                value={sort}
                onChange={(event) => changeSort(event.target.value as SortOption)}
                aria-label="정렬 방식"
                className="h-8 shrink-0 cursor-pointer rounded-full border border-zinc-300 bg-white px-2.5 text-[11px] font-bold outline-none"
              >
                <option value="default">기본순</option>
                <option value="distance">가까운 순</option>
                <option value="contract">계약조건순</option>
                <option value="name">이름순</option>
              </select>

              <button
                type="button"
                onClick={onClear}
                className="h-8 shrink-0 cursor-pointer rounded-full border border-zinc-300 bg-white px-2.5 text-[11px] font-bold text-zinc-600"
              >
                초기화
              </button>
            </div>

            <div className="mt-3 border-t border-zinc-200 pt-3">
              <p className="mb-2 text-[11px] font-extrabold text-zinc-500">계약조건</p>
              <div className="flex flex-wrap gap-1.5">
                {benefitOptions.map((benefit) => {
                  const active = filters.benefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => toggleBenefit(benefit)}
                      aria-pressed={active}
                      className={[
                        "cursor-pointer rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-700",
                      ].join(" ")}
                    >
                      {benefit}
                    </button>
                  );
                })}
              </div>
            </div>

            {locationMessage && (
              <p className="mt-2 text-[11px] font-medium leading-5 text-zinc-500">
                {locationMessage}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:block">
        <div className="space-y-3">
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="mr-1 shrink-0 text-xs font-bold text-zinc-500">단지 구분</span>
            {statusOptions.map((option) => {
              const active = filters.status === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => changeStatus(option.value)}
                  aria-pressed={active}
                  className={[
                    "h-10 shrink-0 cursor-pointer rounded-full border px-4 text-sm font-bold transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                    active
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDetailOpen((value) => !value)}
              aria-expanded={detailOpen}
              className={[
                "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full border px-4 text-sm font-bold transition-all",
                filters.benefits.length > 0
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                  : "border-zinc-300 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-zinc-400",
              ].join(" ")}
            >
              조건 필터{filters.benefits.length > 0 ? ` ${filters.benefits.length}` : ""}
              <span className="ml-1">{detailOpen ? "↑" : "↓"}</span>
            </button>

            <button
              type="button"
              disabled={locationStatus === "loading" || locationStatus === "unsupported"}
              onClick={onRequestLocation}
              className={[
                "inline-flex h-10 shrink-0 cursor-pointer items-center gap-1 rounded-full border px-4 text-sm font-bold transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                hasUserLocation
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
              ].join(" ")}
            >
              <span aria-hidden="true">📍</span>{locationLabel(locationStatus)}
            </button>

            <select
              value={sort}
              onChange={(event) => changeSort(event.target.value as SortOption)}
              aria-label="정렬 방식"
              className="h-10 shrink-0 cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold outline-none"
            >
              <option value="default">기본순</option>
              <option value="distance">가까운 순</option>
              <option value="contract">계약조건순</option>
              <option value="name">이름순</option>
            </select>

            <button type="button" onClick={onClear} className="h-10 shrink-0 cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-500">초기화</button>
          </div>
        </div>

        {locationMessage && (
          <p className="mt-3 text-xs font-medium leading-5 text-zinc-500">{locationMessage}</p>
        )}

        {detailOpen && (
          <div className="mt-4 border-t border-zinc-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {benefitOptions.map((benefit) => {
                const active = filters.benefits.includes(benefit);
                return (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => toggleBenefit(benefit)}
                    aria-pressed={active}
                    className={[
                      "cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold transition-all",
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                        : "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                    ].join(" ")}
                  >
                    {benefit}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}