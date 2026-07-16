"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import SearchMapPanel from "./components/SearchMapPanel";
import SearchResultCard from "./components/SearchResultCard";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

const initialFilters: SearchFilterState = {
  status: "",
  benefits: [],
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
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
    ...(apartment.images?.floorPlans ?? []).map(
      (floorPlan) => floorPlan.name
    ),
  ].filter(Boolean);

  return targets.some((target) =>
    normalizeText(target).includes(keyword)
  );
}

function conditionMatches(conditionText: string, benefit: string) {
  switch (benefit) {
    case "1차 계약금 500만원":
      return (
        conditionText.includes("500만원") ||
        conditionText.includes("500만")
      );
    case "1차 계약금 1,000만원":
      return (
        conditionText.includes("1,000만원") ||
        conditionText.includes("1000만원") ||
        conditionText.includes("천만원")
      );
    case "계약금 5%":
      return conditionText.includes("계약금5%");
    case "계약금 10%":
      return conditionText.includes("계약금10%");
    case "중도금 무이자":
      return (
        conditionText.includes("중도금무이자") ||
        conditionText.includes("전액무이자")
      );
    case "일부 무이자":
      return conditionText.includes("일부무이자");
    case "이자후불제":
      return (
        conditionText.includes("이자후불제") ||
        conditionText.includes("이자후불")
      );
    case "축하금":
      return (
        conditionText.includes("축하금") ||
        conditionText.includes("페이백") ||
        conditionText.includes("지원금")
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
        conditionText.includes("입주유예")
      );
    default:
      return conditionText.includes(normalizeText(benefit));
  }
}

function matchesStatus(
  apartment: Apartment,
  status: SearchFilterState["status"]
) {
  if (!status) return true;

  const subscription = isSubscriptionApartment(apartment);
  const firstCome =
    !subscription && isFirstComeApartment(apartment);

  if (status === "청약중") return subscription;
  if (status === "선착순") return firstCome;
  if (status === "분양중") return !subscription && !firstCome;

  return true;
}

function matchesFilters(
  apartment: Apartment,
  filters: SearchFilterState
) {
  const conditionText = normalizeText(apartment.condition);

  return (
    matchesStatus(apartment, filters.status) &&
    (filters.benefits.length === 0 ||
      filters.benefits.every((benefit) =>
        conditionMatches(conditionText, benefit)
      ))
  );
}

function getApartmentCoordinates(apartment: Apartment) {
  const source = apartment as Apartment & {
    data?: {
      latitude?: number | string | null;
      longitude?: number | string | null;
    };
  };

  const latitude = Number(
    apartment.latitude ?? source.data?.latitude
  );
  const longitude = Number(
    apartment.longitude ?? source.data?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude === 0 ||
    longitude === 0
  ) {
    return null;
  }

  return { latitude, longitude };
}

function calculateDistanceKm(
  first: UserLocation,
  second: UserLocation
) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const latitudeDifference = toRadians(
    second.latitude - first.latitude
  );
  const longitudeDifference = toRadians(
    second.longitude - first.longitude
  );

  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(1 - haversine)
    )
  );
}

function sortApartments(
  apartments: Apartment[],
  sort: SortOption,
  distanceBySlug: Record<string, number>
) {
  const copied = [...apartments];

  if (sort === "distance") {
    return copied.sort(
      (a, b) =>
        (distanceBySlug[a.slug] ?? Number.MAX_SAFE_INTEGER) -
        (distanceBySlug[b.slug] ?? Number.MAX_SAFE_INTEGER)
    );
  }

  if (sort === "contract") {
    return copied.sort(
      (a, b) =>
        (b.score?.contract ?? 0) -
        (a.score?.contract ?? 0)
    );
  }

  if (sort === "name") {
    return copied.sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );
  }

  return copied;
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
    (target) => normalizeText(target) === normalizedQuery
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

  const visibleApartments = useMemo(
    () => getHomeVisibleApartments(apartments),
    [apartments]
  );

  const [keyword, setKeyword] = useState(initialQuery);
  const [filters, setFilters] =
    useState<SearchFilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("default");
  const [mobileView, setMobileView] =
    useState<"list" | "map">("list");
  const [hoveredSlug, setHoveredSlug] =
    useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] =
    useState<string | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
    useState(-1);
  const [visibleSlugs, setVisibleSlugs] =
    useState<string[] | null>(null);
  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] =
    useState("");

  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const deferredKeyword = useDeferredValue(keyword);

  const distanceBySlug = useMemo(() => {
    if (!userLocation) return {};

    const result: Record<string, number> = {};

    visibleApartments.forEach((apartment) => {
      const coordinates = getApartmentCoordinates(apartment);
      if (!coordinates) return;

      result[apartment.slug] = calculateDistanceKm(
        userLocation,
        coordinates
      );
    });

    return result;
  }, [userLocation, visibleApartments]);

  const suggestions = useMemo(() => {
    const text = normalizeText(deferredKeyword);
    if (!text) return [];

    return visibleApartments
      .filter((apartment) => matchesKeyword(apartment, text))
      .slice(0, 6);
  }, [deferredKeyword, visibleApartments]);

  const filteredResults = useMemo(() => {
    const query = normalizeText(initialQuery);

    const filtered = visibleApartments.filter(
      (apartment) =>
        matchesKeyword(apartment, query) &&
        matchesFilters(apartment, filters)
    );

    return sortApartments(filtered, sort, distanceBySlug);
  }, [
    distanceBySlug,
    filters,
    initialQuery,
    sort,
    visibleApartments,
  ]);

  const filteredSignature = useMemo(
    () =>
      filteredResults
        .map((apartment) => apartment.slug)
        .join("|"),
    [filteredResults]
  );

  useEffect(() => {
    setVisibleSlugs(null);
    setHoveredSlug(null);
  }, [filteredSignature]);

  const listResults = useMemo(() => {
    if (visibleSlugs === null) return filteredResults;

    const visibleSet = new Set(visibleSlugs);
    return filteredResults.filter((apartment) =>
      visibleSet.has(apartment.slug)
    );
  }, [filteredResults, visibleSlugs]);

  const exactQueryApartment = useMemo(
    () =>
      visibleApartments.find((apartment) =>
        isExactApartmentQuery(apartment, initialQuery)
      ) ?? null,
    [initialQuery, visibleApartments]
  );

  useEffect(() => {
    setKeyword(initialQuery);
    setActiveSuggestionIndex(-1);
  }, [initialQuery]);

  useEffect(() => {
    if (
      selectedSlug &&
      filteredResults.some(
        (apartment) => apartment.slug === selectedSlug
      )
    ) {
      return;
    }

    setSelectedSlug(exactQueryApartment?.slug ?? null);
  }, [exactQueryApartment, filteredResults, selectedSlug]);

  const selectedApartment =
    filteredResults.find(
      (apartment) => apartment.slug === selectedSlug
    ) ?? null;

  const activeApartment =
    filteredResults.find(
      (apartment) =>
        apartment.slug === (hoveredSlug ?? selectedSlug)
    ) ?? null;

  const scrollToCard = useCallback((slug: string) => {
    requestAnimationFrame(() => {
      cardRefs.current.get(slug)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, []);

  const handleMapHover = useCallback(
    (slug: string | null) => {
      setHoveredSlug(slug);
    },
    []
  );

  const handleMapSelect = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      scrollToCard(slug);
    },
    [scrollToCard]
  );

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

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearch = () => {
    if (
      activeSuggestionIndex >= 0 &&
      suggestions[activeSuggestionIndex]
    ) {
      const selected = suggestions[activeSuggestionIndex];
      moveToSearch(selected.name, selected.slug);
      return;
    }

    const text = keyword.trim();

    if (!text) {
      router.push("/search");
      return;
    }

    const exactApartment = visibleApartments.find(
      (apartment) => isExactApartmentQuery(apartment, text)
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
        current < suggestions.length - 1 ? current + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      if (suggestions.length === 0) return;

      event.preventDefault();
      setActiveSuggestionIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1
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

  const requestUserLocation = useCallback(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      setLocationStatus("unsupported");
      setLocationMessage(
        "현재 브라우저에서는 위치 기능을 사용할 수 없습니다."
      );
      return;
    }

    setLocationStatus("loading");
    setLocationMessage("현재 위치를 확인하고 있습니다.");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("granted");
        setLocationMessage(
          "현재 위치를 기준으로 가까운 단지를 정렬했습니다."
        );
        setSort("distance");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          setLocationMessage(
            "브라우저 주소창에서 위치 권한을 허용해주세요."
          );
          return;
        }

        setLocationStatus("error");
        setLocationMessage(
          "현재 위치를 확인하지 못했습니다."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const clearAll = () => {
    setKeyword("");
    setFilters(initialFilters);
    setSort("default");
    setHoveredSlug(null);
    setSelectedSlug(null);
    setActiveSuggestionIndex(-1);
    setVisibleSlugs(null);
    router.push("/search");
  };

  const showSuggestions =
    suggestions.length > 0 &&
    normalizeText(keyword) !== normalizeText(initialQuery);

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
                  ? `“${initialQuery}” 관련 부동산`
                  : "전국 부동산 찾기"}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                지역, 분양가와 계약조건을 목록과 지도에서 함께 비교하세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
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
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="단지명, 지역, 계약조건을 검색하세요"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                aria-controls="search-suggestion-list"
                className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 text-base outline-none focus:border-emerald-400"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-xl bg-zinc-900 px-6 font-bold text-white transition hover:bg-emerald-600"
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
                {suggestions.map((apartment, index) => {
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
                          {apartment.condition || "조건 확인"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <SearchFilters
            filters={filters}
            sort={sort}
            locationStatus={locationStatus}
            locationMessage={locationMessage}
            hasUserLocation={Boolean(userLocation)}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            onRequestLocation={requestUserLocation}
            onClear={clearAll}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1760px] px-5 py-5 lg:px-8">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex rounded-xl bg-zinc-200 p-1">
            {(["list", "map"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setMobileView(view)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-bold transition",
                  mobileView === view
                    ? "bg-white shadow-sm"
                    : "text-zinc-500",
                ].join(" ")}
              >
                {view === "list" ? "목록" : "지도"}
              </button>
            ))}
          </div>

          <span className="text-sm text-zinc-500">
            {listResults.length}개 단지
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(410px,0.62fr)_minmax(700px,1.38fr)]">
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
                  부동산 목록
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
                    지도를 이동하거나 전체 핀 보기를 눌러보세요.
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
                    selected={selectedSlug === apartment.slug}
                    hovered={hoveredSlug === apartment.slug}
                    distanceKm={distanceBySlug[apartment.slug]}
                    onHover={() =>
                      setHoveredSlug(apartment.slug)
                    }
                    onLeave={() => setHoveredSlug(null)}
                    onSelect={() =>
                      setSelectedSlug(apartment.slug)
                    }
                    onOpen={() =>
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
              activeApartment={activeApartment}
              selectedApartment={selectedApartment}
              userLocation={userLocation}
              distanceBySlug={distanceBySlug}
              onHover={handleMapHover}
              onSelect={handleMapSelect}
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
