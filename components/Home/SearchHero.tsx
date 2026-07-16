"use client";

import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { Apartment } from "../../types/apartment";

import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

const quickKeywords = [
  "선착순",
  "청약중",
  "계약금 500만원",
  "중도금 무이자",
  "84타입",
];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getHeroImage(apartment?: Apartment) {
  const hero = apartment?.images?.hero;

  if (Array.isArray(hero)) {
    return hero[0] ?? "";
  }

  return typeof hero === "string" ? hero : "";
}

function hasUsableImage(apartment: Apartment) {
  const image = getHeroImage(apartment);

  return (
    Boolean(image) &&
    !image.includes(
      "/images/apartments/default/main.jpg"
    )
  );
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

function getFeaturedLabel(apartment: Apartment) {
  if (isSubscriptionApartment(apartment)) {
    return "진행 중 청약";
  }

  if (isFirstComeApartment(apartment)) {
    return "선착순 분양";
  }

  return "주목할 부동산";
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
    ...(apartment.keywords ?? []),
    ...(apartment.images?.floorPlans ?? []).map(
      (item) => item.name
    ),
  ].filter(Boolean);
}

function findExactApartment(
  apartments: Apartment[],
  keyword: string
) {
  const normalizedKeyword =
    normalizeText(keyword);

  return apartments.find(
    (apartment) =>
      normalizeText(apartment.name) ===
        normalizedKeyword ||
      normalizeText(apartment.slug) ===
        normalizedKeyword ||
      apartment.keywords?.some(
        (item) =>
          normalizeText(item) ===
          normalizedKeyword
      )
  );
}

function SearchHero({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router = useRouter();
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] =
    useState("");
  const [isFocused, setIsFocused] =
    useState(false);
  const [activeIndex, setActiveIndex] =
    useState(-1);

  const deferredKeyword =
    useDeferredValue(keyword);

  const featuredApartment = useMemo(
    () =>
      apartments.find(
        (apartment) =>
          !isSubscriptionApartment(
            apartment
          ) &&
          hasUsableImage(apartment)
      ) ??
      apartments.find(hasUsableImage) ??
      apartments[0],
    [apartments]
  );

  const featuredImage =
    getHeroImage(featuredApartment);

  const suggestions = useMemo(() => {
    const normalizedKeyword =
      normalizeText(deferredKeyword);

    if (!normalizedKeyword) {
      return [];
    }

    return apartments
      .filter((apartment) =>
        getSearchTargets(apartment).some(
          (target) =>
            normalizeText(target).includes(
              normalizedKeyword
            )
        )
      )
      .slice(0, 6);
  }, [apartments, deferredKeyword]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [deferredKeyword]);

  const openApartment = (
    apartment: Apartment
  ) => {
    setKeyword(apartment.name);
    setIsFocused(false);
    setActiveIndex(-1);

    router.push(
      `/apartments/${apartment.slug}`
    );
  };

  const openSearch = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    setIsFocused(false);
    setActiveIndex(-1);

    router.push(
      `/search?q=${encodeURIComponent(
        trimmed
      )}`
    );
  };

  const handleSubmit = () => {
    if (
      activeIndex >= 0 &&
      suggestions[activeIndex]
    ) {
      openApartment(
        suggestions[activeIndex]
      );
      return;
    }

    const exactApartment =
      findExactApartment(
        apartments,
        keyword
      );

    if (exactApartment) {
      openApartment(exactApartment);
      return;
    }

    openSearch(keyword);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      if (suggestions.length === 0) {
        return;
      }

      event.preventDefault();

      setActiveIndex((current) =>
        current <
        suggestions.length - 1
          ? current + 1
          : 0
      );

      return;
    }

    if (event.key === "ArrowUp") {
      if (suggestions.length === 0) {
        return;
      }

      event.preventDefault();

      setActiveIndex((current) =>
        current > 0
          ? current - 1
          : suggestions.length - 1
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
    isFocused &&
    keyword.trim().length > 0 &&
    suggestions.length > 0;

  return (
    <section className="overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-[0_18px_55px_rgba(15,118,110,0.08)] sm:rounded-[38px]">
      <div className="grid min-h-[430px] lg:grid-cols-[0.78fr_1.22fr] xl:min-h-[470px]">
        <div className="relative z-20 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="inline-flex w-fit items-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-[#0F766E]">
            전국 부동산 정보 플랫폼
          </div>

          <h1 className="mt-5 text-[54px] font-black leading-none tracking-[-0.055em] text-[#0F766E] sm:text-[66px] xl:text-[78px]">
            HomePick
          </h1>

          <p className="mt-3 text-xl font-extrabold tracking-[-0.025em] text-[#111827] sm:text-2xl xl:text-[28px]">
            전국 부동산을 한눈에.
          </p>

          <p className="mt-2 text-[27px] font-black tracking-[-0.04em] text-[#111827] sm:text-3xl xl:text-[36px]">
            내 집은 내가{" "}
            <span className="text-[#10B981]">
              Pick
            </span>
          </p>

          <p className="mt-4 max-w-lg break-keep text-sm leading-7 text-zinc-500 sm:text-base">
            분양과 청약 일정, 선착순
            단지부터 지역별 아파트까지
            필요한 부동산 정보를 빠르게
            찾아보세요.
          </p>

          <div className="relative mt-7 max-w-2xl">
            <div className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(17,24,39,0.09)] transition-all focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <div className="relative min-w-0 flex-1">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
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
                  onChange={(event) =>
                    setKeyword(
                      event.target.value
                    )
                  }
                  onFocus={() =>
                    setIsFocused(true)
                  }
                  onBlur={() => {
                    window.setTimeout(
                      () =>
                        setIsFocused(false),
                      150
                    );
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="지역, 단지명, 계약조건을 검색해보세요"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={
                    showSuggestions
                  }
                  aria-controls="home-search-results"
                  className="h-[64px] w-full bg-white pl-14 pr-4 text-sm font-semibold text-[#111827] outline-none placeholder:font-medium placeholder:text-zinc-400 sm:text-base"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                aria-label="검색하기"
                className="m-2 flex h-12 w-14 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#10B981] text-white transition-all hover:-translate-y-0.5 hover:bg-[#0F766E] hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:w-16"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
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

            {showSuggestions && (
              <div
                id="home-search-results"
                role="listbox"
                className="absolute left-0 right-0 top-[74px] z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl"
              >
                {suggestions.map(
                  (
                    apartment,
                    index
                  ) => {
                    const active =
                      index === activeIndex;

                    return (
                      <button
                        key={
                          apartment.slug
                        }
                        type="button"
                        onMouseEnter={() =>
                          setActiveIndex(
                            index
                          )
                        }
                        onMouseDown={(
                          event
                        ) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          openApartment(
                            apartment
                          )
                        }
                        className={[
                          "flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition",
                          active
                            ? "bg-emerald-50"
                            : "hover:bg-zinc-50",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-extrabold text-[#111827]">
                              {
                                apartment.name
                              }
                            </p>

                            <span
                              className={[
                                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                getStatusStyle(
                                  apartment
                                ),
                              ].join(" ")}
                            >
                              {apartment.status ||
                                "정보 확인"}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {apartment.region ||
                              apartment.cityName ||
                              apartment.city}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-emerald-700">
                          상세보기 →
                        </span>
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  onMouseDown={(event) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    openSearch(keyword)
                  }
                  className="mt-1 w-full cursor-pointer rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  ‘{keyword.trim()}’ 전체
                  검색결과 보기 →
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickKeywords.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  openSearch(item)
                }
                className="cursor-pointer rounded-full bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-600 transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700"
              >
                # {item}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 lg:min-h-full">
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={
                featuredApartment?.name ||
                "HomePick 대표 아파트"
              }
              className="absolute inset-0 h-full w-full scale-[1.035] object-cover object-center transition-transform duration-700 hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-100">
              <span className="text-6xl">
                🏢
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/40 via-30% to-transparent" />

          {featuredApartment && (
            <button
              type="button"
              onClick={() =>
                openApartment(
                  featuredApartment
                )
              }
              className="group absolute bottom-5 left-5 right-5 cursor-pointer rounded-2xl border border-white/70 bg-white/90 p-5 text-left shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white hover:shadow-2xl sm:bottom-7 sm:left-auto sm:right-7 sm:w-[320px]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-700">
                  {getFeaturedLabel(
                    featuredApartment
                  )}
                </span>

                <span className="text-xs font-bold text-zinc-400">
                  {featuredApartment.cityName ||
                    featuredApartment.city}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-lg font-black leading-7 text-[#111827]">
                {featuredApartment.name}
              </p>

              <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                {featuredApartment.price ||
                  featuredApartment.condition ||
                  featuredApartment.region}
              </p>

              <span className="mt-4 inline-flex text-sm font-extrabold text-emerald-700 transition-transform group-hover:translate-x-1">
                상세정보 확인 →
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(SearchHero);