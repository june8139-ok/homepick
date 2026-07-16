"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Apartment } from "../../types/apartment";
import SearchFilters, {
  type SearchFilterState,
  type SortOption,
} from "./components/SearchFilters";
import SearchMapPanel from "./components/SearchMapPanel";
import SearchResultCard from "./components/SearchResultCard";

const initialFilters: SearchFilterState = {
  status: "",
  benefits: [],
  minScore: 0,
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesKeyword(apartment: Apartment, keyword: string) {
  if (!keyword) return true;

  const targets = [
    apartment.name,
    apartment.region,
    apartment.city,
    apartment.cityName,
    apartment.district,
    apartment.districtName,
    apartment.type,
    apartment.status,
    apartment.price,
    apartment.condition,
    apartment.slug,
    ...(apartment.keywords ?? []),
    ...(apartment.pros ?? []),
    ...(apartment.cons ?? []),
  ].filter(Boolean);

  return targets.some((target) =>
    normalizeText(target).includes(keyword)
  );
}

function conditionMatches(conditionText: string, benefit: string) {
  switch (benefit) {
    case "1차 계약금 500만원":
      return conditionText.includes("500만원");

    case "1차 계약금 1,000만원":
      return (
        conditionText.includes("1,000만원") ||
        conditionText.includes("1000만원")
      );

    case "계약금 5%":
      return conditionText.includes("계약금 5%");

    case "계약금 10%":
      return conditionText.includes("계약금 10%");

    case "중도금 무이자":
      return (
        conditionText.includes("중도금 무이자") ||
        conditionText.includes("전액 무이자")
      );

    case "일부 무이자":
      return conditionText.includes("일부 무이자");

    case "이자후불제":
      return (
        conditionText.includes("이자후불제") ||
        conditionText.includes("이자 후불")
      );

    case "축하금":
      return (
        conditionText.includes("축하금") ||
        conditionText.includes("페이백")
      );

    case "발코니 무상":
      return (
        conditionText.includes("발코니") &&
        (conditionText.includes("무상") ||
          conditionText.includes("무료"))
      );

    case "풀옵션 무상":
      return (
        conditionText.includes("풀옵션") &&
        (conditionText.includes("무상") ||
          conditionText.includes("무료"))
      );

    case "잔금/입주지원":
      return (
        conditionText.includes("잔금") ||
        conditionText.includes("입주지원") ||
        conditionText.includes("입주 지원")
      );

    default:
      return conditionText.includes(normalizeText(benefit));
  }
}

function matchesFilters(
  apartment: Apartment,
  filters: SearchFilterState
) {
  const statusText = normalizeText(apartment.status);
  const conditionText = normalizeText(apartment.condition);

  const statusMatched =
    !filters.status ||
    statusText.includes(normalizeText(filters.status));

  const benefitsMatched =
    filters.benefits.length === 0 ||
    filters.benefits.every((benefit) =>
      conditionMatches(conditionText, benefit)
    );

  return (
    statusMatched &&
    benefitsMatched &&
    apartment.score.total >= filters.minScore
  );
}

function sortApartments(
  apartments: Apartment[],
  sort: SortOption
) {
  const copied = [...apartments];

  if (sort === "score") {
    return copied.sort(
      (a, b) => b.score.total - a.score.total
    );
  }

  if (sort === "contract") {
    return copied.sort(
      (a, b) => b.score.contract - a.score.contract
    );
  }

  return copied.sort((a, b) =>
    a.name.localeCompare(b.name, "ko")
  );
}

function isExactApartmentQuery(
  apartment: Apartment,
  query: string
) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return false;

  return [
    apartment.name,
    apartment.slug,
    ...(apartment.keywords ?? []),
  ].some(
    (target) =>
      normalizeText(target) === normalizedQuery
  );
}

export default function SearchClient({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";

  const [keyword, setKeyword] = useState(initialQuery);
  const [filters, setFilters] =
    useState<SearchFilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("score");
  const [mobileView, setMobileView] = useState<"list" | "map">(
    "list"
  );
  const [selectedSlug, setSelectedSlug] =
    useState<string | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
    useState(-1);
  const [visibleSlugs, setVisibleSlugs] =
    useState<string[] | null>(null);

  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const deferredKeyword = useDeferredValue(keyword);

  const suggestions = useMemo(() => {
    const text = normalizeText(deferredKeyword);

    if (!text) return [];

    return apartments
      .filter((apartment) =>
        matchesKeyword(apartment, text)
      )
      .slice(0, 6);
  }, [apartments, deferredKeyword]);

  const filteredResults = useMemo(() => {
    const query = normalizeText(initialQuery);

    const filtered = apartments.filter(
      (apartment) =>
        matchesKeyword(apartment, query) &&
        matchesFilters(apartment, filters)
    );

    return sortApartments(filtered, sort);
  }, [apartments, filters, initialQuery, sort]);

  const filteredSignature = useMemo(
    () =>
      filteredResults
        .map((apartment) => apartment.slug)
        .join("|"),
    [filteredResults]
  );

  useEffect(() => {
    setVisibleSlugs(null);
  }, [filteredSignature]);

  const listResults = useMemo(() => {
    if (visibleSlugs === null) {
      return filteredResults;
    }

    const visibleSet = new Set(visibleSlugs);

    return filteredResults.filter((apartment) =>
      visibleSet.has(apartment.slug)
    );
  }, [filteredResults, visibleSlugs]);

  const exactQueryApartment = useMemo(
    () =>
      apartments.find((apartment) =>
        isExactApartmentQuery(apartment, initialQuery)
      ) ?? null,
    [apartments, initialQuery]
  );

  useEffect(() => {
    setKeyword(initialQuery);
    setActiveSuggestionIndex(-1);
  }, [initialQuery]);

  useEffect(() => {
    if (
      exactQueryApartment &&
      filteredResults.some(
        (apartment) =>
          apartment.slug === exactQueryApartment.slug
      )
    ) {
      setSelectedSlug(exactQueryApartment.slug);
      return;
    }

    setSelectedSlug(null);
  }, [
    exactQueryApartment,
    filters,
    initialQuery,
    filteredResults,
  ]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [deferredKeyword]);

  const selectedApartment =
    filteredResults.find(
      (apartment) =>
        apartment.slug === selectedSlug
    ) ?? null;

  const selectApartment = (
    slug: string,
    scrollToCard = false
  ) => {
    setSelectedSlug(slug);

    if (scrollToCard) {
      requestAnimationFrame(() => {
        cardRefs.current
          .get(slug)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      });
    }
  };

  const moveToSearch = (
    text: string,
    preferredSlug?: string
  ) => {
    const trimmed = text.trim();

    if (!trimmed) {
      router.push("/search");
      return;
    }

    setKeyword(trimmed);
    setActiveSuggestionIndex(-1);
    setVisibleSlugs(null);

    if (preferredSlug) {
      setSelectedSlug(preferredSlug);
    }

    router.push(
      `/search?q=${encodeURIComponent(trimmed)}`
    );
  };

  const handleSearch = () => {
    if (
      activeSuggestionIndex >= 0 &&
      suggestions[activeSuggestionIndex]
    ) {
      const selected =
        suggestions[activeSuggestionIndex];

      moveToSearch(selected.name, selected.slug);
      return;
    }

    const text = keyword.trim();

    if (!text) {
      router.push("/search");
      return;
    }

    const exactApartment = apartments.find(
      (apartment) =>
        isExactApartmentQuery(apartment, text)
    );

    moveToSearch(
      exactApartment?.name ?? text,
      exactApartment?.slug
    );
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      if (suggestions.length === 0) return;

      event.preventDefault();
      setActiveSuggestionIndex((current) =>
        current < suggestions.length - 1
          ? current + 1
          : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      if (suggestions.length === 0) return;

      event.preventDefault();
      setActiveSuggestionIndex((current) =>
        current > 0
          ? current - 1
          : suggestions.length - 1
      );
      return;
    }

    if (event.key === "Escape") {
      setActiveSuggestionIndex(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const clearAll = () => {
    setKeyword("");
    setFilters(initialFilters);
    setSort("score");
    setSelectedSlug(null);
    setActiveSuggestionIndex(-1);
    setVisibleSlugs(null);
    router.push("/search");
  };

  const showSuggestions =
    suggestions.length > 0 &&
    normalizeText(keyword) !==
      normalizeText(initialQuery);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1760px] px-5 py-6 lg:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                HOMEPICK SEARCH
              </p>

              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                {initialQuery
                  ? `“${initialQuery}” 관련 분양 단지`
                  : "전국 분양 단지 찾기"}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                지역, 분양가, 계약조건과 분석 점수를
                한 번에 비교하세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                ← 홈으로
              </button>

              <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-600">
                검색 결과 {filteredResults.length}개
              </div>
            </div>
          </div>

          <div className="relative mt-6 max-w-4xl">
            <div className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <input
                value={keyword}
                onChange={(event) =>
                  setKeyword(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="단지명, 지역, 계약조건을 검색하세요"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                aria-controls="search-suggestion-list"
                className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 text-base outline-none transition focus:border-zinc-400"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-xl bg-zinc-900 px-6 font-bold text-white transition hover:bg-zinc-700"
              >
                검색
              </button>
            </div>

            {showSuggestions && (
              <div
                id="search-suggestion-list"
                role="listbox"
                className="absolute left-0 right-0 top-[72px] z-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
              >
                {suggestions.map(
                  (apartment, index) => {
                    const active =
                      index === activeSuggestionIndex;

                    return (
                      <button
                        key={apartment.slug}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() =>
                          setActiveSuggestionIndex(index)
                        }
                        onClick={() =>
                          moveToSearch(
                            apartment.name,
                            apartment.slug
                          )
                        }
                        className={[
                          "flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition",
                          active
                            ? "bg-emerald-50"
                            : "hover:bg-zinc-50",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {apartment.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {apartment.region} ·{" "}
                            {apartment.condition}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-emerald-600">
                          {apartment.score.total}점
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <SearchFilters
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            onClear={clearAll}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1760px] px-5 py-5 lg:px-8">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex rounded-xl bg-zinc-200 p-1">
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className={[
                "rounded-lg px-4 py-2 text-sm font-bold transition",
                mobileView === "list"
                  ? "bg-white shadow-sm"
                  : "text-zinc-500",
              ].join(" ")}
            >
              목록
            </button>

            <button
              type="button"
              onClick={() => setMobileView("map")}
              className={[
                "rounded-lg px-4 py-2 text-sm font-bold transition",
                mobileView === "map"
                  ? "bg-white shadow-sm"
                  : "text-zinc-500",
              ].join(" ")}
            >
              지도
            </button>
          </div>

          <span className="text-sm text-zinc-500">
            {listResults.length}개 단지
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(380px,0.58fr)_minmax(760px,1.42fr)]">
          <div
            className={
              mobileView === "map"
                ? "hidden lg:block"
                : "block"
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  SEARCH RESULT
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  분양 단지 목록
                </h2>
              </div>

              <p className="text-sm text-zinc-500">
                지도 안 {listResults.length}개
                {filteredResults.length !== listResults.length
                  ? ` · 전체 ${filteredResults.length}개`
                  : ""}
              </p>
            </div>

            <div className="space-y-4 lg:max-h-[calc(100vh-185px)] lg:overflow-y-auto lg:pr-2">
              {listResults.length === 0 ? (
                <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
                  <h3 className="text-xl font-bold">
                    현재 지도 안에 단지가 없습니다.
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    지도를 이동하거나 확대·축소해보세요.
                  </p>
                </div>
              ) : (
                listResults.map((apartment) => (
                  <SearchResultCard
                    ref={(element) => {
                      if (element) {
                        cardRefs.current.set(
                          apartment.slug,
                          element
                        );
                      } else {
                        cardRefs.current.delete(
                          apartment.slug
                        );
                      }
                    }}
                    key={apartment.slug}
                    apartment={apartment}
                    selected={
                      selectedApartment?.slug ===
                      apartment.slug
                    }
                    onHover={() =>
                      selectApartment(apartment.slug)
                    }
                    onClick={() =>
                      router.push(
                        `/apartments/${apartment.slug}`
                      )
                    }
                  />
                ))
              )}
            </div>
          </div>

          <div
            className={
              mobileView === "list"
                ? "hidden lg:block"
                : "block"
            }
          >
            <SearchMapPanel
              apartments={filteredResults}
              selectedApartment={selectedApartment}
              onSelect={(slug) =>
                selectApartment(slug, true)
              }
              onOpen={(slug) =>
                router.push(`/apartments/${slug}`)
              }
              onViewportChange={setVisibleSlugs}
            />
          </div>
        </div>
      </section>
    </main>
  );
}