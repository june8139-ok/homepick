"use client";

import Image from "next/image";

import {
  memo,
  useDeferredValue,
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

function normalizeText(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getHeroImage(
  apartment?: Apartment
) {
  const hero =
    apartment?.images?.hero;

  if (
    typeof hero === "string" &&
    hero.trim() &&
    !hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return hero;
  }

  return (
    apartment?.images?.gallery?.find(
      (image) =>
        Boolean(image) &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
}

function hasUsableImage(
  apartment: Apartment
) {
  return Boolean(
    getHeroImage(apartment)
  );
}

function getStatusStyle(
  apartment: Apartment
) {
  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getFeaturedLabel(
  apartment: Apartment
) {
  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return "추천 선착순 분양";
  }

  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return "진행 중 청약";
  }

  return "최근 등록 단지";
}

function getFeaturedPrice(
  apartment: Apartment
) {
  return (
    apartment.priceDetail
      ?.salePrice ||
    apartment.price ||
    apartment.condition ||
    apartment.region ||
    "상세정보를 확인해보세요."
  );
}

function getSearchTargets(
  apartment: Apartment
) {
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

    ...(apartment.images
      ?.floorPlans ?? []).map(
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
      normalizeText(
        apartment.name
      ) === normalizedKeyword ||
      normalizeText(
        apartment.slug
      ) === normalizedKeyword ||
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
    useRef<HTMLInputElement>(
      null
    );

  const [keyword, setKeyword] =
    useState("");

  const closeSearchKeyboard = () => {
    inputRef.current?.blur();
  };

  const [
    isFocused,
    setIsFocused,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(-1);

  const deferredKeyword =
    useDeferredValue(keyword);

  /*
   * 홈 대표 단지 선정 기준
   *
   * 1. 이미지가 있는 선착순 단지
   * 2. 이미지가 있는 청약 단지
   * 3. 이미지가 있는 기타 최신 단지
   * 4. 이미지 여부와 관계없이 첫 번째 단지
   *
   * getApartments()가 최신 등록순이므로
   * 각 조건에서 처음 발견되는 단지를 사용합니다.
   */
  const featuredApartment =
    useMemo(() => {
      const firstCome =
        apartments.find(
          (apartment) =>
            isFirstComeApartment(
              apartment
            ) &&
            hasUsableImage(
              apartment
            )
        );

      if (firstCome) {
        return firstCome;
      }

      const subscription =
        apartments.find(
          (apartment) =>
            isSubscriptionApartment(
              apartment
            ) &&
            hasUsableImage(
              apartment
            )
        );

      if (subscription) {
        return subscription;
      }

      const latestWithImage =
        apartments.find(
          hasUsableImage
        );

      return (
        latestWithImage ??
        apartments[0]
      );
    }, [apartments]);

  const featuredImage =
    getHeroImage(
      featuredApartment
    );

  const suggestions =
    useMemo(() => {
      const normalizedKeyword =
        normalizeText(
          deferredKeyword
        );

      if (!normalizedKeyword) {
        return [];
      }

      return apartments
        .filter((apartment) =>
          getSearchTargets(
            apartment
          ).some((target) =>
            normalizeText(
              target
            ).includes(
              normalizedKeyword
            )
          )
        )
        .slice(0, 6);
    }, [
      apartments,
      deferredKeyword,
    ]);

  const openApartment = (
    apartment: Apartment
  ) => {
    setKeyword(apartment.name);
    setIsFocused(false);
    setActiveIndex(-1);
    closeSearchKeyboard();

    router.push(
      `/apartments/${apartment.slug}`
    );
  };

  const openSearch = (
    value: string
  ) => {
    const trimmed =
      value.trim();

    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    setIsFocused(false);
    setActiveIndex(-1);
    closeSearchKeyboard();

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
      openApartment(
        exactApartment
      );

      return;
    }

    openSearch(keyword);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key ===
      "ArrowDown"
    ) {
      if (
        suggestions.length ===
        0
      ) {
        return;
      }

      event.preventDefault();

      setActiveIndex(
        (current) =>
          current <
          suggestions.length - 1
            ? current + 1
            : 0
      );

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      if (
        suggestions.length ===
        0
      ) {
        return;
      }

      event.preventDefault();

      setActiveIndex(
        (current) =>
          current > 0
            ? current - 1
            : suggestions.length -
              1
      );

      return;
    }

    if (
      event.key === "Escape"
    ) {
      setIsFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();

      return;
    }

    if (
      event.key === "Enter"
    ) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const showSuggestions =
    isFocused &&
    keyword.trim().length >
      0 &&
    suggestions.length > 0;

  return (
    <section className="relative z-30 w-full max-w-full overflow-x-hidden overflow-y-visible rounded-2xl border border-emerald-100 bg-white shadow-[0_12px_35px_rgba(15,118,110,0.08)] sm:rounded-[38px] sm:shadow-[0_18px_55px_rgba(15,118,110,0.08)]">
      <div className="grid lg:min-h-[430px] lg:grid-cols-[0.78fr_1.22fr] xl:min-h-[470px]">
        {/* 왼쪽 검색 영역 */}
        <div className="relative z-20 flex min-w-0 flex-col justify-center px-4 pb-6 pt-5 sm:px-10 sm:py-10 lg:px-12 xl:px-16">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold text-[#0F766E] shadow-sm sm:px-4 sm:py-2 sm:text-xs">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#FF5A5F] shadow-[0_0_0_4px_rgba(255,90,95,0.10)]"
            />
            전국 부동산 정보 플랫폼
          </div>

          <h1 className="mt-4 tracking-[-0.055em] sm:mt-6">
            <span className="flex items-center gap-3 sm:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_8px_24px_rgba(15,118,110,0.12)] sm:h-[72px] sm:w-[72px] xl:h-20 xl:w-20">
                <Image
                  src="/icon-512.png"
                  alt="집눈 로고"
                  width={64}
                  height={64}
                  priority
                  className="h-10 w-10 object-contain sm:h-[58px] sm:w-[58px] xl:h-16 xl:w-16"
                />
              </span>

              <span className="block text-[48px] font-black leading-none text-[#0F766E] drop-shadow-[0_3px_0_rgba(15,118,110,0.08)] sm:text-[76px] xl:text-[88px]">
                집눈
              </span>
            </span>

            <span className="mt-3 block whitespace-nowrap text-[22px] font-black leading-tight tracking-[-0.04em] text-[#132238] sm:mt-4 sm:text-[30px] xl:text-[34px]">
              전국 부동산을 한눈에
            </span>
          </h1>

          <p className="mt-4 max-w-lg break-keep text-xs font-semibold leading-5 text-zinc-500 sm:mt-5 sm:text-base sm:leading-7">
            분양 아파트부터 청약 일정,
            선착순 분양과 계약조건까지
            한 번에 찾고 비교하세요.
          </p>

          {/* 검색창 */}
          <div className="relative mt-4 w-full min-w-0 max-w-2xl sm:mt-7">
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
                  setKeyword(
                    event.target.value
                  );
                  setActiveIndex(-1);
                }}
                onFocus={() =>
                  setIsFocused(true)
                }
                onBlur={() => {
                  window.setTimeout(
                    () =>
                      setIsFocused(
                        false
                      ),
                    150
                  );
                }}
                onKeyDown={
                  handleKeyDown
                }
                placeholder="지역, 단지명, 계약조건 검색"
                autoComplete="off"
                role="combobox"
                aria-expanded={
                  showSuggestions
                }
                aria-controls="home-search-results"
                aria-autocomplete="list"
                className="h-[50px] w-full min-w-0 rounded-xl bg-white pl-10 pr-[58px] text-base font-semibold text-[#111827] outline-none placeholder:font-medium placeholder:text-zinc-400 sm:h-[60px] sm:pl-14 sm:pr-20 sm:text-base"
              />

              <button
                type="button"
                onClick={
                  handleSubmit
                }
                aria-label="검색하기"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl bg-[#10B981] text-white shadow-sm transition-all hover:-translate-y-[55%] hover:bg-[#0F766E] hover:shadow-lg active:translate-y-[-50%] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:right-3 sm:h-12 sm:w-14"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 sm:h-5 sm:w-5"
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
                className="absolute left-0 right-0 top-[62px] z-[100] max-h-[300px] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl sm:top-[76px] sm:max-h-[320px] sm:rounded-2xl sm:p-2"
              >
                {suggestions.map(
                  (
                    apartment,
                    index
                  ) => {
                    const active =
                      index ===
                      activeIndex;

                    return (
                      <button
                        key={
                          apartment.slug
                        }
                        type="button"
                        role="option"
                        aria-selected={
                          active
                        }
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
                          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition sm:rounded-xl sm:px-4 sm:py-3",
                          active
                            ? "bg-emerald-50"
                            : "hover:bg-zinc-50",
                        ].join(
                          " "
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-extrabold text-[#111827] sm:text-base">
                              {
                                apartment.name
                              }
                            </p>

                            <span
                              className={[
                                "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px]",
                                getStatusStyle(
                                  apartment
                                ),
                              ].join(
                                " "
                              )}
                            >
                              {apartment.status ||
                                "정보 확인"}
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
                  }
                )}

                <button
                  type="button"
                  onMouseDown={(
                    event
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    openSearch(
                      keyword
                    )
                  }
                  className="mt-1 w-full cursor-pointer rounded-lg bg-zinc-50 px-3 py-2.5 text-xs font-bold text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                >
                  ‘{keyword.trim()}’ 전체
                  검색결과 보기 →
                </button>
              </div>
            )}
          </div>

          {/* 빠른 검색 */}
          <div className="mt-3 w-full min-w-0 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4 sm:overflow-visible sm:pb-0">
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {quickKeywords.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      openSearch(item)
                    }
                    className={[
                      "shrink-0 cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-all",
                      "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                      "sm:px-3 sm:py-2 sm:text-xs",
                      item === "선착순"
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-100"
                        : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
                    ].join(" ")}
                  >
                    # {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 대표 단지 */}
        <div className="relative hidden min-h-[260px] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 sm:block lg:min-h-full">
          {featuredImage &&
          featuredApartment ? (
            <Image
              src={
                featuredImage
              }
              alt={`${featuredApartment.name} 대표 이미지`}
              fill
              loading="lazy"
              quality={72}
              sizes="
                (max-width: 639px) 1px,
                (max-width: 1023px) 100vw,
                60vw
              "
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.03] lg:scale-[1.035] lg:hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-100">
              <div className="text-center">
                <span className="text-5xl sm:text-6xl">
                  🏢
                </span>

                <p className="mt-3 text-xs font-bold text-zinc-400">
                  대표 이미지 준비 중
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white lg:via-white/40 lg:via-30% lg:to-transparent" />

          {featuredApartment && (
            <button
              type="button"
              onClick={() =>
                openApartment(
                  featuredApartment
                )
              }
              className="
                group absolute bottom-3
                left-3 right-3 z-20
                cursor-pointer rounded-xl
                border border-white/70
                bg-white/92 p-3
                text-left shadow-xl
                backdrop-blur-xl
                transition-all
                hover:-translate-y-1
                hover:bg-white
                hover:shadow-2xl
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
                sm:bottom-5 sm:left-5
                sm:right-5 sm:rounded-2xl
                sm:p-5
                lg:bottom-7 lg:left-auto
                lg:right-7 lg:w-[340px]
              "
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={[
                    "rounded-full px-2 py-1 text-[9px] font-extrabold sm:px-3 sm:text-[10px]",
                    isSubscriptionApartment(
                      featuredApartment
                    )
                      ? "bg-blue-50 text-blue-700"
                      : isFirstComeApartment(
                            featuredApartment
                          )
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700",
                  ].join(" ")}
                >
                  {getFeaturedLabel(
                    featuredApartment
                  )}
                </span>

                <span className="max-w-[40%] truncate text-[9px] font-bold text-zinc-400 sm:text-xs">
                  {featuredApartment.cityName ||
                    featuredApartment.city ||
                    featuredApartment.region}
                </span>
              </div>

              <p className="mt-2 line-clamp-1 text-sm font-black leading-5 text-[#111827] sm:mt-3 sm:line-clamp-2 sm:text-lg sm:leading-7">
                {
                  featuredApartment.name
                }
              </p>

              <p className="mt-1 line-clamp-2 break-keep text-[10px] leading-4 text-zinc-500 sm:text-sm sm:leading-6">
                {getFeaturedPrice(
                  featuredApartment
                )}
              </p>

              <span className="mt-2 inline-flex text-[10px] font-extrabold text-emerald-700 transition-transform group-hover:translate-x-1 sm:mt-4 sm:text-sm">
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