"use client";

import Link from "next/link";
import {
  useState,
} from "react";

type ApartmentSearchItem = {
  slug: string;
  name: string;
  region: string;
  parentRegion: string;
  status: string;
};

type RegionSearchItem = {
  name: string;
  href: string;
  count: number;
};

type Props = {
  apartments: ApartmentSearchItem[];
  regions: RegionSearchItem[];
};

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function getMunicipalityLabel(
  regionText: string,
  query: string
) {
  const compactQuery =
    query.trim();

  if (!compactQuery) {
    return "";
  }

  const normalizedRegion =
    normalize(regionText);

  if (
    normalizedRegion.includes(
      normalize(compactQuery)
    )
  ) {
    return compactQuery;
  }

  return "";
}

export default function RegionSearch({
  apartments,
  regions,
}: Props) {
  const [
    keyword,
    setKeyword,
  ] = useState("");

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
          .slice(0, 5);

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

  const municipalityLabel =
    matchedApartments
      .map((apartment) =>
        getMunicipalityLabel(
          apartment.region,
          query
        )
      )
      .find(Boolean) || query;

  const hasResults =
    matchedApartments.length >
      0 ||
    matchedRegions.length >
      0 ||
    parentRegions.length >
      0;

  return (
    <section className="relative z-20 mt-8 sm:mt-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
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

        <div className="relative mt-5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400"
          >
            ⌕
          </span>

          <input
            value={keyword}
            onChange={(event) =>
              setKeyword(
                event.target.value
              )
            }
            placeholder="예: 청주, 평택, 하늘채"
            aria-label="지역명 또는 아파트명 검색"
            autoComplete="off"
            className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-sm font-bold text-[#132238] outline-none transition-all placeholder:font-medium placeholder:text-zinc-400 hover:border-emerald-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:h-16 sm:text-base"
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

          {query && (
            <div className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-3xl">
              {hasResults ? (
                <div className="max-h-[70vh] overflow-y-auto p-3 sm:p-4">
                  {(matchedRegions.length >
                    0 ||
                    parentRegions.length >
                      0 ||
                    matchedApartments.length >
                      0) && (
                    <div>
                      <p className="px-2 text-[10px] font-black uppercase tracking-wide text-zinc-400 sm:text-xs">
                        지역 바로가기
                      </p>

                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {matchedApartments.length >
                          0 && (
                          <Link
                            href={`/search?q=${encodeURIComponent(
                              municipalityLabel
                            )}`}
                            className="flex min-h-14 items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            <div>
                              <p className="text-sm font-black text-emerald-800">
                                {
                                  municipalityLabel
                                }{" "}
                                분양정보
                              </p>

                              <p className="mt-0.5 text-[11px] text-emerald-700/70">
                                관련 단지 전체보기
                              </p>
                            </div>

                            <span className="font-black text-emerald-700">
                              →
                            </span>
                          </Link>
                        )}

                        {[
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
                          .slice(0, 4)
                          .map(
                            (region) => (
                              <Link
                                key={
                                  region.name
                                }
                                href={
                                  region.href
                                }
                                className="flex min-h-14 items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                <div>
                                  <p className="text-sm font-black text-[#132238]">
                                    {
                                      region.name
                                    }{" "}
                                    지역페이지
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-zinc-500">
                                    등록 단지{" "}
                                    {
                                      region.count
                                    }
                                    개
                                  </p>
                                </div>

                                <span className="font-black text-emerald-700">
                                  →
                                </span>
                              </Link>
                            )
                          )}
                      </div>
                    </div>
                  )}

                  {matchedApartments.length >
                    0 && (
                    <div className="mt-4 border-t border-zinc-100 pt-4">
                      <p className="px-2 text-[10px] font-black uppercase tracking-wide text-zinc-400 sm:text-xs">
                        관련 분양 단지
                      </p>

                      <div className="mt-2 grid gap-1">
                        {matchedApartments.map(
                          (
                            apartment
                          ) => (
                            <Link
                              key={
                                apartment.slug
                              }
                              href={`/apartments/${apartment.slug}`}
                              className="flex min-h-14 items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-[#132238]">
                                  {
                                    apartment.name
                                  }
                                </p>

                                <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                                  {apartment.region ||
                                    apartment.parentRegion ||
                                    "지역 정보 확인 중"}
                                </p>
                              </div>

                              <span className="ml-3 shrink-0 text-sm font-black text-emerald-700">
                                상세 →
                              </span>
                            </Link>
                          )
                        )}
                      </div>

                      <Link
                        href={`/search?q=${encodeURIComponent(
                          query
                        )}`}
                        className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-[#132238] px-4 text-sm font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        ‘{query}’ 전체 검색
                      </Link>
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
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#132238] px-5 text-sm font-bold text-white transition hover:bg-emerald-600"
                  >
                    ‘{query}’ 전체 검색
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
