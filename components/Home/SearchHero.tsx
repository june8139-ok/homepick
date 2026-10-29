"use client";

import Link from "next/link";

import {
  memo,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import type { Apartment } from "../../types/apartment";

import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getStatusStyle(apartment: Apartment) {
  if (isSubscriptionApartment(apartment)) {
    return "bg-blue-50 text-blue-700";
  }

  if (isFirstComeApartment(apartment)) {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getSearchTargets(apartment: Apartment) {
  return [
    apartment.name,
    apartment.slug,
    apartment.region,
    apartment.city,
    apartment.cityName,
    apartment.district,
    apartment.districtName,
    apartment.brand,
    apartment.builder,
    apartment.status,
    apartment.condition,
    apartment.price,
    ...(apartment.searchAliases ?? []),
    ...(apartment.keywords ?? []),

    ...(apartment.images?.floorPlans ?? []).map((item) => item.name),
  ].filter(Boolean);
}

function splitSearchTokens(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .split(/[\s,/·|()\[\]{}_-]+/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function isLocationSearch(apartments: Apartment[], keyword: string) {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  return apartments.some((apartment) => {
    const directLocations = [
      apartment.city,
      apartment.cityName,
      apartment.district,
      apartment.districtName,
    ]
      .filter(Boolean)
      .map((value) => normalizeText(value));

    if (
      directLocations.some(
        (value) =>
          value === normalizedKeyword || value.startsWith(normalizedKeyword),
      )
    ) {
      return true;
    }

    return splitSearchTokens(apartment.region).some((token) =>
      token.startsWith(normalizedKeyword),
    );
  });
}

function locationSearchMatch(apartment: Apartment, keyword: string) {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  const directLocations = [
    apartment.city,
    apartment.cityName,
    apartment.district,
    apartment.districtName,
  ]
    .filter(Boolean)
    .map((value) => normalizeText(value));

  if (
    directLocations.some(
      (value) =>
        value === normalizedKeyword || value.startsWith(normalizedKeyword),
    )
  ) {
    return true;
  }

  const locationTokens = [
    ...splitSearchTokens(apartment.region),
    ...splitSearchTokens(apartment.name),
    ...splitSearchTokens(apartment.slug),
  ];

  return locationTokens.some((token) => token.startsWith(normalizedKeyword));
}

function findExactApartment(apartments: Apartment[], keyword: string) {
  const normalizedKeyword = normalizeText(keyword);

  return apartments.find(
    (apartment) =>
      normalizeText(apartment.name) === normalizedKeyword ||
      normalizeText(apartment.slug) === normalizedKeyword ||
      apartment.searchAliases?.some(
        (item) => normalizeText(item) === normalizedKeyword,
      ) ||
      apartment.keywords?.some(
        (item) => normalizeText(item) === normalizedKeyword,
      ),
  );
}

function SearchHero({ apartments }: { apartments: Apartment[] }) {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");

  const [isNavigating, startNavigation] = useTransition();

  const closeSearchKeyboard = () => {
    inputRef.current?.blur();
  };

  const [isFocused, setIsFocused] = useState(false);

  const [activeIndex, setActiveIndex] = useState(-1);

  const deferredKeyword = useDeferredValue(keyword);

  const suggestions = useMemo(() => {
    const normalizedKeyword = normalizeText(deferredKeyword);

    if (!normalizedKeyword) {
      return [];
    }

    const locationMode = isLocationSearch(apartments, normalizedKeyword);

    return apartments
      .filter((apartment) => {
        if (locationMode) {
          return locationSearchMatch(apartment, normalizedKeyword);
        }

        return getSearchTargets(apartment).some((target) =>
          normalizeText(target).includes(normalizedKeyword),
        );
      })
      .slice(0, 6);
  }, [apartments, deferredKeyword]);

  const openApartment = (apartment: Apartment) => {
    setKeyword(apartment.name);
    setIsFocused(false);
    setActiveIndex(-1);
    closeSearchKeyboard();

    router.push(`/apartments/${apartment.slug}`);
  };

  const openSearch = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    setIsFocused(false);
    setActiveIndex(-1);
    closeSearchKeyboard();

    const href = `/search?q=${encodeURIComponent(trimmed)}`;

    // A fresh-home intent resets old filters/selection even when Next restores
    // a previously visited search page. Keep the public URL unchanged.
    try {
      window.sessionStorage.setItem(
        "jibnun:home-search",
        JSON.stringify({ query: trimmed, createdAt: Date.now() }),
      );
      startNavigation(() => router.push(href));
    } catch {
      // If storage is blocked, preserve the original fresh-page guarantee.
      window.location.assign(href);
    }
  };

  const handleSubmit = () => {
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      openApartment(suggestions[activeIndex]);

      return;
    }

    const exactApartment = findExactApartment(apartments, keyword);

    if (exactApartment) {
      openApartment(exactApartment);

      return;
    }

    openSearch(keyword);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "ArrowDown") {
      if (suggestions.length === 0) {
        return;
      }

      event.preventDefault();

      setActiveIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );

      return;
    }

    if (event.key === "ArrowUp") {
      if (suggestions.length === 0) {
        return;
      }

      event.preventDefault();

      setActiveIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );

      return;
    }

    if (event.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const showSuggestions =
    isFocused && keyword.trim().length > 0 && suggestions.length > 0;

  return (
    <section className="home-search-compact relative z-20 w-full overflow-visible bg-white">
      <div className="mx-auto w-full max-w-7xl">
        {/* 왼쪽 검색 영역 */}
        <div className="relative px-5 py-5 sm:px-8 sm:py-6">
          {/* 검색창 */}
          <div className="relative z-[240] mt-4 w-full min-w-0 max-w-2xl sm:mt-7">
            <div className="relative w-full min-w-0 rounded-2xl border border-emerald-100 bg-gradient-to-r from-white via-white to-emerald-50/60 p-1.5 shadow-[0_10px_30px_rgba(17,24,39,0.09)] transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:p-2 sm:shadow-[0_12px_35px_rgba(17,24,39,0.09)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:left-5 sm:h-5 sm:w-5"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M16 16L21 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                ref={inputRef}
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setActiveIndex(-1);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsFocused(false), 150);
                }}
                onKeyDown={handleKeyDown}
                placeholder="지역, 단지명, 계약조건 검색"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls="home-search-results"
                aria-autocomplete="list"
                className="h-[50px] w-full min-w-0 rounded-xl bg-white pl-10 pr-[58px] text-base font-semibold text-[#111827] outline-none placeholder:font-medium placeholder:text-zinc-400 sm:h-[60px] sm:pl-14 sm:pr-20 sm:text-base"
              />

              <button
                type="button"
                onClick={handleSubmit}
                aria-label={isNavigating ? "검색결과로 이동 중" : "검색하기"}
                aria-busy={isNavigating}
                disabled={isNavigating}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl bg-[#10B981] text-white shadow-sm transition-all hover:-translate-y-[55%] hover:bg-[#0F766E] hover:shadow-lg active:translate-y-[-50%] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:right-3 sm:h-12 sm:w-14"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isNavigating ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M16 16L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* 검색 자동완성 */}
            {showSuggestions && (
              <div
                id="home-search-results"
                role="listbox"
                className="absolute left-0 right-0 top-[62px] z-[999] max-h-[360px] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl sm:top-[76px] sm:max-h-[420px] sm:rounded-2xl sm:p-2"
              >
                {suggestions.map((apartment, index) => {
                  const active = index === activeIndex;

                  return (
                    <button
                      key={apartment.slug}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openApartment(apartment)}
                      className={[
                        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition sm:rounded-xl sm:px-4 sm:py-3",
                        active ? "bg-emerald-50" : "hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-extrabold text-[#111827] sm:text-base">
                            {apartment.name}
                          </p>

                          <span
                            className={[
                              "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px]",
                              getStatusStyle(apartment),
                            ].join(" ")}
                          >
                            {apartment.status || "정보 확인"}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[10px] text-zinc-500 sm:text-xs">
                          {apartment.region ||
                            apartment.cityName ||
                            apartment.city}
                        </p>
                      </div>

                      <span className="hidden shrink-0 text-sm font-bold text-emerald-700 sm:block">
                        상세보기 →
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openSearch(keyword)}
                  className="mt-1 w-full cursor-pointer rounded-lg bg-zinc-50 px-3 py-2.5 text-xs font-bold text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                >
                  ‘{keyword.trim()}’ 전체 검색결과 보기 →
                </button>
              </div>
            )}
          </div>

          <nav className="home-search-shortcuts" aria-label="빠른 이동">
            <Link href="/search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              지도 검색
            </Link>
            <Link href="/region">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16" />
              </svg>
              지역별 보기
            </Link>
            <Link href="/favorites">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 0 9 8 15 8-6 12-11 8-15Z" />
              </svg>
              관심단지
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}

export default memo(SearchHero);
