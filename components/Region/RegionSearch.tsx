"use client";

import Link from "next/link";
import {
  useRef,
  useState,
} from "react";

type ApartmentSearchItem = {
  slug: string;
  name: string;
  region: string;
  parentRegion: string;
  status: string;
  image: string;
  price: string;
  condition: string;
};

type RegionSearchItem = {
  name: string;
  href: string;
  count: number;
};

type Props = {
  apartments: ApartmentSearchItem[];
  regions: RegionSearchItem[];
  compact?: boolean;
};

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(
      /[^\p{L}\p{N}]/gu,
      ""
    );
}

export default function RegionSearch({
  apartments,
  regions,
  compact = false,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    keyword,
    setKeyword,
  ] = useState("");

  const closeSearchKeyboard = () => {
    inputRef.current?.blur();
  };

  const query =
    keyword.trim();

  const normalizedQuery =
    normalize(query);

  const matchedApartments =
    normalizedQuery.length < 1
      ? []
      : apartments
          .filter(
            (apartment) =>
              normalize(
                [
                  apartment.name,
                  apartment.region,
                  apartment.parentRegion,
                  apartment.status,
                ].join(" ")
              ).includes(
                normalizedQuery
              )
          )
          .slice(0, 6);

  const matchedRegions =
    normalizedQuery.length < 1
      ? []
      : regions
          .filter((region) =>
            normalize(
              region.name
            ).includes(
              normalizedQuery
            )
          )
          .slice(0, 4);

  const parentRegionNames = [
    ...new Set(
      matchedApartments
        .map(
          (apartment) =>
            apartment.parentRegion
        )
        .filter(Boolean)
    ),
  ];

  const parentRegions =
    parentRegionNames
      .map((name) =>
        regions.find(
          (region) =>
            region.name ===
            name
        )
      )
      .filter(
        (
          region
        ): region is RegionSearchItem =>
          Boolean(region)
      )
      .slice(0, 3);

  const linkedRegions = [
    ...matchedRegions,
    ...parentRegions,
  ]
    .filter(
      (
        region,
        index,
        array
      ) =>
        array.findIndex(
          (item) =>
            item.name ===
            region.name
        ) === index
    )
    .slice(0, 4);

  const hasResults =
    matchedApartments.length >
      0 ||
    linkedRegions.length >
      0;

  return (
    <section
      className={[
        "relative z-20",
        compact
          ? "mt-6 sm:mt-8"
          : "mt-8 sm:mt-10",
      ].join(" ")}
    >
      <div
        className={
          compact
            ? "rounded-2xl border border-emerald-100 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4"
            : "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
        }
      >
        {!compact && (
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
              빠른 지역·단지 검색
            </p>

            <h2 className="mt-1 break-keep text-2xl font-black tracking-tight text-[#132238] sm:text-3xl">
              지역명이나 단지명을 검색하세요
            </h2>

            <p className="mt-2 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
              청주·천안·평택처럼 시·군을
              입력하면 관련 단지와 상위
              지역페이지를 함께 보여줍니다.
            </p>
          </div>
        )}

        {compact && (
          <div className="mb-2 px-1">
            <p className="text-[11px] font-black text-emerald-700 sm:text-xs">
              빠른 지역·단지 검색
            </p>

            <p className="mt-0.5 text-[11px] text-zinc-500 sm:text-xs">
              청주·평택·단지명을 바로 찾아보세요.
            </p>
          </div>
        )}

        <div
          className={
            compact
              ? "relative"
              : "relative mt-5"
          }
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400"
          >
            ⌕
          </span>

          <input
            ref={inputRef}
            value={keyword}
            onChange={(event) =>
              setKeyword(
                event.target.value
              )
            }
            placeholder="예: 청주, 평택, 하늘채"
            aria-label="지역명 또는 아파트명 검색"
            autoComplete="off"
            className={[
              "w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 font-bold text-[#132238] outline-none transition-all placeholder:font-medium placeholder:text-zinc-400 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10",
              compact
                ? "h-12 text-base sm:h-14 sm:text-base"
                : "h-14 text-base sm:h-16 sm:text-base",
            ].join(" ")}
          />

          {query && (
            <button
              type="button"
              onClick={() =>
                setKeyword("")
              }
              aria-label="검색어 지우기"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-lg text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              ×
            </button>
          )}
        </div>

        {query && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:rounded-3xl">
            {hasResults ? (
              <div className="max-h-[72vh] overflow-y-auto p-3 sm:p-4">
                {linkedRegions.length >
                  0 && (
                  <div>
                    <p className="px-1 text-[10px] font-black uppercase tracking-wide text-zinc-400 sm:text-xs">
                      상위 지역페이지
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {linkedRegions.map(
                        (region) => (
                          <Link
                            key={
                              region.name
                            }
                            href={
                              region.href
                            }
                            onClick={
                              closeSearchKeyboard
                            }
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-[#132238] transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            <span>
                              {
                                region.name
                              }{" "}
                              지역페이지
                            </span>

                            <span className="text-zinc-400">
                              {
                                region.count
                              }
                              개
                            </span>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}

                {matchedApartments.length >
                  0 && (
                  <div
                    className={
                      linkedRegions.length >
                        0
                        ? "mt-4 border-t border-zinc-100 pt-4"
                        : ""
                    }
                  >
                    <div className="flex items-end justify-between gap-3 px-1">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-zinc-400 sm:text-xs">
                          관련 분양 단지
                        </p>

                        <p className="mt-1 text-sm font-black text-[#132238]">
                          ‘{query}’ 관련 단지{" "}
                          {
                            matchedApartments.length
                          }
                          개
                        </p>
                      </div>

                      <Link
                        href={`/search?q=${encodeURIComponent(
                          query
                        )}`}
                        onClick={
                          closeSearchKeyboard
                        }
                        className="shrink-0 text-xs font-bold text-emerald-700 transition hover:text-emerald-600"
                      >
                        전체 검색 →
                      </Link>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {matchedApartments.map(
                        (
                          apartment
                        ) => (
                          <Link
                            key={
                              apartment.slug
                            }
                            href={`/apartments/${apartment.slug}`}
                            onClick={
                              closeSearchKeyboard
                            }
                            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            <div className="flex min-h-[118px]">
                              <div className="relative w-28 shrink-0 overflow-hidden bg-zinc-100 sm:w-32">
                                {apartment.image ? (
                                  <img
                                    src={
                                      apartment.image
                                    }
                                    alt={`${apartment.name} 대표 이미지`}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold text-zinc-400">
                                    이미지 준비 중
                                  </div>
                                )}

                                {apartment.status && (
                                  <span className="absolute left-2 top-2 max-w-[calc(100%-16px)] truncate rounded-full bg-black/60 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
                                    {
                                      apartment.status
                                    }
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 p-3">
                                <h3 className="line-clamp-2 break-keep text-sm font-black leading-5 text-[#132238] group-hover:text-emerald-700">
                                  {
                                    apartment.name
                                  }
                                </h3>

                                <p className="mt-1 line-clamp-1 text-[10px] text-zinc-500">
                                  {apartment.region ||
                                    apartment.parentRegion ||
                                    "지역 정보 확인 중"}
                                </p>

                                <p className="mt-2 line-clamp-1 text-[11px] font-black text-[#132238]">
                                  {
                                    apartment.price
                                  }
                                </p>

                                <p className="mt-1 line-clamp-1 text-[10px] text-zinc-500">
                                  {
                                    apartment.condition
                                  }
                                </p>
                              </div>
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm font-black text-[#132238]">
                  바로 표시할 결과가
                  없습니다.
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  전체 검색에서 더 넓은
                  범위로 확인해보세요.
                </p>

                <Link
                  href={`/search?q=${encodeURIComponent(
                    query
                  )}`}
                  onClick={
                    closeSearchKeyboard
                  }
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#132238] px-5 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  ‘{query}’ 전체 검색
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
