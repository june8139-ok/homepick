"use client";
import dynamic from "next/dynamic";
import MobileSearchCarousel from "./components/MobileSearchCarousel";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import type { Apartment } from "../../types/apartment";

import {
  getHomeVisibleApartments,
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

import SearchFilters, {
  type LocationStatus,
  type SearchFilterState,
  type SortOption,
} from "./components/SearchFilters";

import SearchResultCard from "./components/SearchResultCard";

const SearchMapPanel = dynamic(
  () =>
    import(
      "./components/SearchMapPanel"
    ),
  {
    ssr: false,

    loading: () => (
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:rounded-3xl">
        <div className="border-b border-zinc-200 px-5 py-4">
          <div className="h-3 w-24 animate-pulse rounded bg-emerald-100" />
          <div className="mt-2 h-6 w-28 animate-pulse rounded bg-zinc-200" />
        </div>

        <div className="flex h-[42vh] min-h-[320px] max-h-[460px] items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-500 lg:h-[calc(100vh-190px)] lg:min-h-[680px] lg:max-h-none">
          지도를 준비하고 있습니다.
        </div>
      </section>
    ),
  }
);

import {
  isApplyHomeUnverified,
} from "../../lib/apartmentDisplay";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

const DEFAULT_FILTERS: SearchFilterState = {
  status: "",
  benefits: [],
};

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function keywordMatch(
  apartment: Apartment,
  keyword: string
) {
  if (!keyword) {
    return true;
  }

  return [
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
  ]
    .filter(Boolean)
    .some((value) =>
      normalize(value).includes(keyword)
    );
}

function benefitMatch(
  text: string,
  benefit: string
) {
  const rules: Record<string, string[]> = {
    "계약금 500만원": [
      "500만원",
      "500만",
    ],

    "계약금 1,000만원": [
      "1,000만원",
      "1000만원",
      "천만원",
    ],

    "계약금 5%": [
      "계약금5%",
    ],

    "계약금 10%": [
      "계약금10%",
    ],

    "중도금 무이자": [
      "중도금무이자",
      "전액무이자",
    ],

    이자후불제: [
      "이자후불제",
      "이자후불",
    ],

    축하금: [
      "축하금",
      "페이백",
      "지원금",
    ],

    "발코니 무상": [
      "발코니무상",
      "발코니무료",
    ],

    "풀옵션 무상": [
      "풀옵션무상",
      "풀옵션무료",
    ],

    잔금유예: [
      "잔금유예",
      "입주유예",
    ],
  };

  return (
    rules[benefit] ??
    [normalize(benefit)]
  ).some((rule) =>
    text.includes(rule)
  );
}

function contractPriority(
  apartment: Apartment
) {
  if (
    isApplyHomeUnverified(
      apartment
    )
  ) {
    return 0;
  }

  const text = normalize(
    [
      apartment.condition,
      apartment.price,
      apartment.priceDetail?.salePrice,
    ]
      .filter(Boolean)
      .join(" ")
  );

  let score = 0;

  /*
   * 초기 자금 부담이 낮을수록 높은 점수
   */
  if (
    text.includes("계약금500만원") ||
    text.includes("계약금500만")
  ) {
    score += 100;
  } else if (
    text.includes("계약금1000만원") ||
    text.includes("계약금1,000만원") ||
    text.includes("계약금천만원")
  ) {
    score += 90;
  } else if (
    text.includes("계약금5%")
  ) {
    score += 80;
  } else if (
    text.includes("계약금10%")
  ) {
    score += 60;
  }

  /*
   * 금융 조건
   */
  if (
    text.includes("중도금무이자") ||
    text.includes("전액무이자")
  ) {
    score += 40;
  }

  if (
    text.includes("잔금유예") ||
    text.includes("입주유예")
  ) {
    score += 35;
  }

  if (
    text.includes("이자후불")
  ) {
    score += 20;
  }

  /*
   * 무상 제공 및 현금성 혜택
   */
  if (
    text.includes("발코니무상") ||
    text.includes("발코니확장무상") ||
    text.includes("발코니무료")
  ) {
    score += 25;
  }

  if (
    text.includes("풀옵션무상") ||
    text.includes("풀옵션무료")
  ) {
    score += 25;
  }

  if (
    text.includes("축하금") ||
    text.includes("페이백") ||
    text.includes("지원금")
  ) {
    score += 20;
  }

  return score;
}


function getListingStage(
  apartment: Apartment
): "subscription" | "firstCome" | "existing" | "completed" | "" {
  const stage =
    apartment.listingStage;

  if (
    stage === "subscription" ||
    stage === "firstCome" ||
    stage === "existing" ||
    stage === "completed"
  ) {
    return stage;
  }

  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return "firstCome";
  }

  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return "subscription";
  }

  return "";
}

function statusMatch(
  apartment: Apartment,
  status: SearchFilterState["status"]
) {
  if (!status) {
    return true;
  }

  const stage =
    getListingStage(
      apartment
    );

  if (status === "청약") {
    return stage === "subscription";
  }

  if (status === "선착순") {
    return stage === "firstCome";
  }

  return true;
}

function coordinateOf(
  apartment: Apartment
) {
  const data =
    apartment as Apartment & {
      data?: {
        latitude?:
          | number
          | string
          | null;

        longitude?:
          | number
          | string
          | null;
      };
    };

  const latitude = Number(
    apartment.latitude ??
      data.data?.latitude
  );

  const longitude = Number(
    apartment.longitude ??
      data.data?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude === 0 ||
    longitude === 0
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function distanceKm(
  first: UserLocation,
  second: UserLocation
) {
  const radius = 6371;

  const rad = (value: number) =>
    (value * Math.PI) / 180;

  const dLat = rad(
    second.latitude -
      first.latitude
  );

  const dLng = rad(
    second.longitude -
      first.longitude
  );

  const lat1 = rad(
    first.latitude
  );

  const lat2 = rad(
    second.latitude
  );

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  return (
    radius *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function getPresetStatus(
  query: string
): SearchFilterState["status"] {
  if (query === "청약") {
    return "청약";
  }

  if (query === "선착순") {
    return "선착순";
  }

  return "";
}

export default function SearchClient({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const query =
    searchParams.get("q") ?? "";

  const sourceApartments =
    useMemo(
      () =>
        getHomeVisibleApartments(
          apartments
        ),
      [apartments]
    );

  const [keyword, setKeyword] =
    useState(query);

  const [filters, setFilters] =
    useState<SearchFilterState>(
      () => ({
        ...DEFAULT_FILTERS,
        status:
          getPresetStatus(query),
      })
    );

  const [sort, setSort] =
    useState<SortOption>(
      "default"
    );

  const [
    hoveredSlug,
    setHoveredSlug,
  ] = useState<string | null>(
    null
  );

  const [
    selectedSlug,
    setSelectedSlug,
  ] = useState<string | null>(
    null
  );

  const [
    mapFocusedSlug,
    setMapFocusedSlug,
  ] = useState<string | null>(
    null
  );

  const [
    visibleSlugs,
    setVisibleSlugs,
  ] = useState<string[] | null>(
    null
  );

  const [
    userLocation,
    setUserLocation,
  ] = useState<UserLocation | null>(
    null
  );

  const [
    locationStatus,
    setLocationStatus,
  ] =
    useState<LocationStatus>(
      "idle"
    );

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    suggestionIndex,
    setSuggestionIndex,
  ] = useState(-1);

  const searchInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const desktopCardRefs =
    useRef<
      Map<string, HTMLElement>
    >(new Map());

  const deferredKeyword =
    useDeferredValue(keyword);

  useEffect(() => {
    const frame =
      requestAnimationFrame(() => {
        setKeyword(query);
        setSuggestionIndex(-1);

        setFilters((current) => ({
          ...current,
          status:
            getPresetStatus(
              query
            ),
        }));
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [query]);

  const distances = useMemo(() => {
    if (!userLocation) {
      return {};
    }

    const result: Record<
      string,
      number
    > = {};

    sourceApartments.forEach(
      (apartment) => {
        const coordinate =
          coordinateOf(
            apartment
          );

        if (!coordinate) {
          return;
        }

        result[apartment.slug] =
          distanceKm(
            userLocation,
            coordinate
          );
      }
    );

    return result;
  }, [
    sourceApartments,
    userLocation,
  ]);

  const filteredResults =
    useMemo(() => {
      const presetStatus =
        getPresetStatus(query);

      const normalizedQuery =
        presetStatus
          ? ""
          : normalize(query);

      const effectiveStatus =
        presetStatus ||
        filters.status;

      const result =
        sourceApartments.filter(
          (apartment) => {
            const condition =
              isApplyHomeUnverified(
                apartment
              )
                ? ""
                : normalize(
                    apartment.condition
                  );

            return (
              keywordMatch(
                apartment,
                normalizedQuery
              ) &&
              statusMatch(
                apartment,
                effectiveStatus
              ) &&
              (filters.benefits
                .length === 0 ||
                filters.benefits.every(
                  (benefit) =>
                    benefitMatch(
                      condition,
                      benefit
                    )
                ))
            );
          }
        );

      if (
        sort === "distance"
      ) {
        return [...result].sort(
          (first, second) =>
            (distances[
              first.slug
            ] ??
              Number.MAX_SAFE_INTEGER) -
            (distances[
              second.slug
            ] ??
              Number.MAX_SAFE_INTEGER)
        );
      }

      if (sort === "contract") {
        return [...result].sort(
          (first, second) => {
            const scoreDifference =
              contractPriority(second) -
              contractPriority(first);
      
            if (scoreDifference !== 0) {
              return scoreDifference;
            }
      
            return first.name.localeCompare(
              second.name,
              "ko"
            );
          }
        );
      }

      if (sort === "name") {
        return [...result].sort(
          (first, second) =>
            first.name.localeCompare(
              second.name,
              "ko"
            )
        );
      }

      return result;
    }, [
      distances,
      filters,
      query,
      sort,
      sourceApartments,
    ]);

  const resultSignature =
    useMemo(
      () =>
        filteredResults
          .map(
            (item) =>
              item.slug
          )
          .join("|"),
      [filteredResults]
    );

  useEffect(() => {
    const frame =
      requestAnimationFrame(() => {
        setVisibleSlugs(null);
        setHoveredSlug(null);
        setMapFocusedSlug(null);

        if (
          selectedSlug &&
          !filteredResults.some(
            (item) =>
              item.slug ===
              selectedSlug
          )
        ) {
          setSelectedSlug(null);
        }
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    filteredResults,
    resultSignature,
    selectedSlug,
  ]);

  /*
   * 검색 결과 목록은 지도 이동·확대와 분리합니다.
   * 지도 범위는 숫자 안내에만 사용하고,
   * 사용자가 검색하거나 필터링한 결과는 목록에서 사라지지 않습니다.
   */
  const listResults =
    filteredResults;

  const mapVisibleCount =
    visibleSlugs === null
      ? filteredResults.length
      : visibleSlugs.length;

  const selectedApartment =
    filteredResults.find(
      (item) =>
        item.slug === selectedSlug
    ) ?? null;

  const activeApartment =
    filteredResults.find(
      (item) =>
        item.slug ===
        (hoveredSlug ??
          selectedSlug ??
          mapFocusedSlug)
    ) ?? null;

  const suggestions =
    useMemo(() => {
      const value =
        normalize(
          deferredKeyword
        );

      if (
        !value ||
        value ===
          normalize(query)
      ) {
        return [];
      }

      return sourceApartments
        .filter((apartment) =>
          keywordMatch(
            apartment,
            value
          )
        )
        .slice(0, 6);
    }, [
      deferredKeyword,
      query,
      sourceApartments,
    ]);

    const scrollToCard =
      useCallback((slug: string) => {
        requestAnimationFrame(() => {
          const isMobile =
            typeof window !== "undefined" &&
            window.innerWidth < 1024;
  
        /*
         * 모바일은 MobileSearchCarousel 내부의
         * selectedSlug useEffect에서 자동 이동합니다.
         */
          if (isMobile) {
            return;
          }
  
          desktopCardRefs.current
            .get(slug)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
        });
      }, []);

  const handleMapSelect =
    useCallback(
      (slug: string) => {
        setSelectedSlug(slug);
        setMapFocusedSlug(slug);
        setHoveredSlug(null);
        scrollToCard(slug);
      },
      [scrollToCard]
    );

    const handleListSelect =
    useCallback(
      (slug: string) => {
        setSelectedSlug(slug);
        setMapFocusedSlug(slug);
        setHoveredSlug(null);
        scrollToCard(slug);
      },
      [scrollToCard]
    );

  const handleStatusSearch =
    useCallback(
      (
        status: SearchFilterState["status"]
      ) => {
        const nextQuery =
          status || "";

        setFilters((current) => ({
          ...current,
          status,
        }));

        setKeyword(nextQuery);
        setSuggestionIndex(-1);
        setVisibleSlugs(null);
        setHoveredSlug(null);
        setSelectedSlug(null);
        setMapFocusedSlug(null);

        router.push(
          nextQuery
            ? `/search?q=${encodeURIComponent(
                nextQuery
              )}`
            : "/search"
        );
      },
      [router]
    );

  const submitSearch = (
    value?: string,
    slug?: string
  ) => {
    searchInputRef.current?.blur();
    const next = (
      value ?? keyword
    ).trim();

    if (!next) {
      router.push("/search");
      return;
    }

    if (slug) {
      setSelectedSlug(slug);
    }

    setVisibleSlugs(null);
    setSuggestionIndex(-1);

    router.push(
      `/search?q=${encodeURIComponent(
        next
      )}`
    );
  };

  const requestLocation =
    useCallback(() => {
      if (
        typeof navigator ===
          "undefined" ||
        !navigator.geolocation
      ) {
        setLocationStatus(
          "unsupported"
        );

        setLocationMessage(
          "현재 브라우저에서는 위치 기능을 사용할 수 없습니다."
        );

        return;
      }

      setLocationStatus(
        "loading"
      );

      setLocationMessage(
        "현재 위치를 확인하고 있습니다."
      );

      navigator.geolocation
        .getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude:
                position.coords
                  .latitude,

              longitude:
                position.coords
                  .longitude,
            });

            setLocationStatus(
              "granted"
            );

            setLocationMessage(
              "현재 위치를 기준으로 가까운 단지를 정렬했습니다."
            );

            setSort("distance");
          },

          (error) => {
            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              setLocationStatus(
                "denied"
              );

              setLocationMessage(
                "브라우저 주소창에서 위치 권한을 허용해주세요."
              );

              return;
            }

            setLocationStatus(
              "error"
            );

            setLocationMessage(
              "현재 위치를 확인하지 못했습니다."
            );
          },

          {
            enableHighAccuracy:
              false,

            timeout: 10000,
            maximumAge: 300000,
          }
        );
    }, []);

  const clearAll = () => {
    searchInputRef.current?.blur();
    setKeyword("");
    setFilters(
      DEFAULT_FILTERS
    );
    setSort("default");
    setHoveredSlug(null);
    setSelectedSlug(null);
    setMapFocusedSlug(null);
    setVisibleSlugs(null);
    setSuggestionIndex(-1);

    router.push("/search");
  };

  return (
    <main className="min-h-0 overflow-x-hidden bg-zinc-50 text-zinc-900">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1760px] px-3 py-3 sm:px-5 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="hidden text-xs font-semibold text-emerald-600 sm:block sm:text-sm">
                JIBNUN SEARCH
              </p>

              <h1 className="break-keep text-xl font-extrabold tracking-tight sm:mt-1 sm:text-3xl">
                {query
                  ? `“${query}” 관련 부동산`
                  : "전국 부동산 찾기"}
              </h1>

              <p className="mt-1 text-[11px] leading-4 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-5">
                지도와 단지 목록을 함께
                보며 분양 정보를
                확인하세요.
              </p>
            </div>

            <div className="w-fit rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 sm:px-4 sm:py-2 sm:text-sm">
              검색 결과{" "}
              {filteredResults.length}개
            </div>
          </div>

          <div className="relative mt-3 max-w-4xl sm:mt-6">
            <div className="flex gap-1.5 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm sm:gap-3 sm:rounded-2xl sm:p-3">
              <input
                ref={searchInputRef}
                value={keyword}
                onChange={(event) =>
                  setKeyword(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                      "ArrowDown" &&
                    suggestions.length
                  ) {
                    event.preventDefault();

                    setSuggestionIndex(
                      (index) =>
                        index <
                        suggestions.length -
                          1
                          ? index + 1
                          : 0
                    );
                  } else if (
                    event.key ===
                      "ArrowUp" &&
                    suggestions.length
                  ) {
                    event.preventDefault();

                    setSuggestionIndex(
                      (index) =>
                        index > 0
                          ? index - 1
                          : suggestions.length -
                            1
                    );
                  } else if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();

                    const suggestion =
                      suggestionIndex >=
                      0
                        ? suggestions[
                            suggestionIndex
                          ]
                        : null;

                    submitSearch(
                      suggestion?.name ??
                        keyword,

                      suggestion?.slug
                    );
                  } else if (
                    event.key ===
                    "Escape"
                  ) {
                    setSuggestionIndex(
                      -1
                    );
                  }
                }}
                placeholder="단지명, 지역, 계약조건 검색"
                autoComplete="off"
                className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
              />

              <button
                type="button"
                onClick={() =>
                  submitSearch()
                }
                className="min-w-[54px] cursor-pointer rounded-lg bg-zinc-900 px-2.5 text-xs font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:min-w-20 sm:rounded-xl sm:px-6 sm:text-sm"
              >
                검색
              </button>
            </div>

            {suggestions.length >
              0 && (
              <div className="absolute left-0 right-0 top-[52px] z-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:top-[72px]">
                {suggestions.map(
                  (
                    apartment,
                    index
                  ) => (
                    <button
                      key={
                        apartment.slug
                      }
                      type="button"
                      onMouseEnter={() =>
                        setSuggestionIndex(
                          index
                        )
                      }
                      onClick={() =>
                        submitSearch(
                          apartment.name,
                          apartment.slug
                        )
                      }
                      className={[
                        "block w-full cursor-pointer px-4 py-3 text-left transition",
                        suggestionIndex ===
                        index
                          ? "bg-emerald-50"
                          : "hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <p className="truncate text-sm font-semibold">
                        {
                          apartment.name
                        }
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {
                          apartment.region
                        }
                      </p>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <SearchFilters
            filters={filters}
            sort={sort}
            locationStatus={
              locationStatus
            }
            locationMessage={
              locationMessage
            }
            hasUserLocation={Boolean(
              userLocation
            )}
            onFiltersChange={
              setFilters
            }
            onStatusChange={
              handleStatusSearch
            }
            onSortChange={setSort}
            onRequestLocation={
              requestLocation
            }
            onClear={clearAll}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1760px] px-2.5 pb-6 pt-2.5 sm:px-5 sm:pb-8 sm:pt-5 lg:px-8">
        {/* 모바일: 지도와 카드 목록 동시 노출 */}
        <div className="min-w-0 overflow-hidden lg:hidden">
          <SearchMapPanel
            apartments={
              filteredResults
            }
            activeApartment={
              activeApartment
            }
            selectedApartment={
              selectedApartment
            }
            userLocation={
              userLocation
            }
            distanceBySlug={
              distances
            }
            onHover={
              setHoveredSlug
            }
            onSelect={
              handleMapSelect
            }
            onAutoFocus={
              setMapFocusedSlug
            }
            onUserMapInteraction={() => {
              setSelectedSlug(null);
              setHoveredSlug(null);
            }}
            onViewportChange={
              setVisibleSlugs
            }
          />

          <div className="mt-4 flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-black">
                검색 결과 단지
              </h2>

              <p className="mt-0.5 text-xs text-zinc-500">
                검색 결과는 지도 이동과 관계없이
                그대로 유지됩니다.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 shadow-sm">
              {listResults.length}개
            </span>
          </div>

          <MobileSearchCarousel
            apartments={listResults}
            selectedSlug={
              selectedSlug ??
              mapFocusedSlug
            }
            distanceBySlug={distances}
            onSelect={handleListSelect}
          />
        </div>
        {/* PC: 기존 목록 + 지도 구조 유지 */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                부동산 목록
              </h2>

              <p className="text-sm text-zinc-500">
                지도 안{" "}
                {mapVisibleCount}개 / 전체{" "}
                {listResults.length}개
              </p>
            </div>

            <div className="space-y-4 lg:max-h-[calc(100vh-185px)] lg:overflow-y-auto lg:pr-2">
              {listResults.map(
                (apartment) => (
                  <SearchResultCard
                    ref={(element) => {
                      if (element) {
                        desktopCardRefs.current.set(
                          apartment.slug,
                          element
                        );
                      } else {
                        desktopCardRefs.current.delete(
                          apartment.slug
                        );
                      }
                    }}
                    key={
                      apartment.slug
                    }
                    apartment={
                      apartment
                    }
                    selected={
                      selectedSlug ===
                      apartment.slug
                    }
                    hovered={
                      hoveredSlug ===
                      apartment.slug
                    }
                    distanceKm={
                      distances[
                        apartment.slug
                      ]
                    }
                    onHover={() =>
                      setHoveredSlug(
                        apartment.slug
                      )
                    }
                    onLeave={() =>
                      setHoveredSlug(
                        null
                      )
                    }
                    onSelect={() =>
                      handleListSelect(
                        apartment.slug
                      )
                    }
                  />
                )
              )}

              {listResults.length ===
                0 && (
                <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
                  <h3 className="text-xl font-bold">
                    검색 조건에 맞는 단지가
                    없습니다.
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    검색어 또는 필터를
                    다시 확인해보세요.
                  </p>
                </div>
              )}
            </div>
          </div>

          <SearchMapPanel
            apartments={
              filteredResults
            }
            activeApartment={
              activeApartment
            }
            selectedApartment={
              selectedApartment
            }
            userLocation={
              userLocation
            }
            distanceBySlug={
              distances
            }
            onHover={
              setHoveredSlug
            }
            onSelect={
              handleMapSelect
            }
            onViewportChange={
              setVisibleSlugs
            }
          />
        </div>
      </section>
    </main>
  );
}
