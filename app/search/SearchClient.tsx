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

function keywordMatch(apartment: Apartment, keyword: string) {
  if (!keyword) return true;

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
    .some((value) => normalize(value).includes(keyword));
}

function benefitMatch(text: string, benefit: string) {
  const rules: Record<string, string[]> = {
    "계약금 500만원": ["500만원", "500만"],
    "계약금 1,000만원": ["1,000만원", "1000만원", "천만원"],
    "계약금 5%": ["계약금5%"],
    "계약금 10%": ["계약금10%"],
    "중도금 무이자": ["중도금무이자", "전액무이자"],
    이자후불제: ["이자후불제", "이자후불"],
    축하금: ["축하금", "페이백", "지원금"],
    "발코니 무상": ["발코니무상", "발코니무료"],
    "풀옵션 무상": ["풀옵션무상", "풀옵션무료"],
    잔금유예: ["잔금유예", "입주유예"],
  };

  return (rules[benefit] ?? [normalize(benefit)]).some((rule) =>
    text.includes(rule)
  );
}

function statusMatch(
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

function coordinateOf(apartment: Apartment) {
  const data = apartment as Apartment & {
    data?: {
      latitude?: number | string | null;
      longitude?: number | string | null;
    };
  };

  const latitude = Number(
    apartment.latitude ?? data.data?.latitude
  );
  const longitude = Number(
    apartment.longitude ?? data.data?.longitude
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

function distanceKm(first: UserLocation, second: UserLocation) {
  const radius = 6371;
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(second.latitude - first.latitude);
  const dLng = rad(second.longitude - first.longitude);
  const lat1 = rad(first.latitude);
  const lat2 = rad(second.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SearchClient({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const sourceApartments = useMemo(
    () => getHomeVisibleApartments(apartments),
    [apartments]
  );

  const [keyword, setKeyword] = useState(query);
  const [filters, setFilters] =
    useState<SearchFilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("default");
  const [mobileView, setMobileView] =
    useState<"list" | "map">("list");
  const [hoveredSlug, setHoveredSlug] =
    useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] =
    useState<string | null>(null);
  const [visibleSlugs, setVisibleSlugs] =
    useState<string[] | null>(null);
  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const deferredKeyword = useDeferredValue(keyword);

  useEffect(() => {
    setKeyword(query);
    setSuggestionIndex(-1);
  }, [query]);

  const distances = useMemo(() => {
    if (!userLocation) return {};

    const result: Record<string, number> = {};

    sourceApartments.forEach((apartment) => {
      const coordinate = coordinateOf(apartment);
      if (!coordinate) return;
      result[apartment.slug] = distanceKm(userLocation, coordinate);
    });

    return result;
  }, [sourceApartments, userLocation]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = normalize(query);

    const result = sourceApartments.filter((apartment) => {
      const condition = normalize(apartment.condition);

      return (
        keywordMatch(apartment, normalizedQuery) &&
        statusMatch(apartment, filters.status) &&
        (filters.benefits.length === 0 ||
          filters.benefits.every((benefit) =>
            benefitMatch(condition, benefit)
          ))
      );
    });

    if (sort === "distance") {
      return [...result].sort(
        (a, b) =>
          (distances[a.slug] ?? Number.MAX_SAFE_INTEGER) -
          (distances[b.slug] ?? Number.MAX_SAFE_INTEGER)
      );
    }

    if (sort === "contract") {
      return [...result].sort(
        (a, b) =>
          (b.score?.contract ?? 0) -
          (a.score?.contract ?? 0)
      );
    }

    if (sort === "name") {
      return [...result].sort((a, b) =>
        a.name.localeCompare(b.name, "ko")
      );
    }

    return result;
  }, [distances, filters, query, sort, sourceApartments]);

  const resultSignature = useMemo(
    () => filteredResults.map((item) => item.slug).join("|"),
    [filteredResults]
  );

  useEffect(() => {
    setVisibleSlugs(null);
    setHoveredSlug(null);

    if (
      selectedSlug &&
      !filteredResults.some((item) => item.slug === selectedSlug)
    ) {
      setSelectedSlug(null);
    }
  }, [filteredResults, resultSignature, selectedSlug]);

  const listResults = useMemo(() => {
    if (visibleSlugs === null) return filteredResults;

    const visible = new Set(visibleSlugs);
    return filteredResults.filter((item) => visible.has(item.slug));
  }, [filteredResults, visibleSlugs]);

  const selectedApartment =
    filteredResults.find((item) => item.slug === selectedSlug) ??
    null;

  const activeApartment =
    filteredResults.find(
      (item) => item.slug === (hoveredSlug ?? selectedSlug)
    ) ?? null;

  const suggestions = useMemo(() => {
    const value = normalize(deferredKeyword);

    if (!value || value === normalize(query)) return [];

    return sourceApartments
      .filter((apartment) => keywordMatch(apartment, value))
      .slice(0, 6);
  }, [deferredKeyword, query, sourceApartments]);

  const scrollToCard = useCallback((slug: string) => {
    requestAnimationFrame(() => {
      cardRefs.current.get(slug)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, []);

  const handleMapSelect = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      scrollToCard(slug);
    },
    [scrollToCard]
  );

  const submitSearch = (value?: string, slug?: string) => {
    const next = (value ?? keyword).trim();

    if (!next) {
      router.push("/search");
      return;
    }

    if (slug) setSelectedSlug(slug);
    setVisibleSlugs(null);
    setSuggestionIndex(-1);
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  const requestLocation = useCallback(() => {
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
        setLocationMessage("현재 위치를 확인하지 못했습니다.");
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
    setFilters(DEFAULT_FILTERS);
    setSort("default");
    setHoveredSlug(null);
    setSelectedSlug(null);
    setVisibleSlugs(null);
    setSuggestionIndex(-1);
    router.push("/search");
  };

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
                {query
                  ? `“${query}” 관련 부동산`
                  : "전국 부동산 찾기"}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                목록과 지도를 함께 보며 분양 단지를 비교하세요.
              </p>
            </div>

            <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-600">
              검색 결과 {filteredResults.length}개
            </div>
          </div>

          <div className="relative mt-6 max-w-4xl">
            <div className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "ArrowDown" &&
                    suggestions.length
                  ) {
                    event.preventDefault();
                    setSuggestionIndex((index) =>
                      index < suggestions.length - 1
                        ? index + 1
                        : 0
                    );
                  } else if (
                    event.key === "ArrowUp" &&
                    suggestions.length
                  ) {
                    event.preventDefault();
                    setSuggestionIndex((index) =>
                      index > 0
                        ? index - 1
                        : suggestions.length - 1
                    );
                  } else if (event.key === "Enter") {
                    event.preventDefault();

                    const suggestion =
                      suggestionIndex >= 0
                        ? suggestions[suggestionIndex]
                        : null;

                    submitSearch(
                      suggestion?.name ?? keyword,
                      suggestion?.slug
                    );
                  } else if (event.key === "Escape") {
                    setSuggestionIndex(-1);
                  }
                }}
                placeholder="단지명, 지역, 계약조건을 검색하세요"
                autoComplete="off"
                className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 text-base outline-none focus:border-emerald-400"
              />

              <button
                type="button"
                onClick={() => submitSearch()}
                className="rounded-xl bg-zinc-900 px-6 font-bold text-white transition hover:bg-emerald-600"
              >
                검색
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[72px] z-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
                {suggestions.map((apartment, index) => (
                  <button
                    key={apartment.slug}
                    type="button"
                    onMouseEnter={() => setSuggestionIndex(index)}
                    onClick={() =>
                      submitSearch(apartment.name, apartment.slug)
                    }
                    className={[
                      "block w-full px-4 py-3 text-left transition",
                      suggestionIndex === index
                        ? "bg-emerald-50"
                        : "hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <p className="truncate font-semibold">
                      {apartment.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {apartment.region}
                    </p>
                  </button>
                ))}
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
            onRequestLocation={requestLocation}
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
              <h2 className="text-xl font-bold">부동산 목록</h2>
              <p className="text-sm text-zinc-500">
                지도 안 {listResults.length}개
              </p>
            </div>

            <div className="space-y-4 lg:max-h-[calc(100vh-185px)] lg:overflow-y-auto lg:pr-2">
              {listResults.map((apartment) => (
                <SearchResultCard
                  ref={(element) => {
                    if (element) {
                      cardRefs.current.set(
                        apartment.slug,
                        element
                      );
                    } else {
                      cardRefs.current.delete(apartment.slug);
                    }
                  }}
                  key={apartment.slug}
                  apartment={apartment}
                  selected={selectedSlug === apartment.slug}
                  hovered={hoveredSlug === apartment.slug}
                  distanceKm={distances[apartment.slug]}
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
              ))}

              {listResults.length === 0 && (
                <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
                  <h3 className="text-xl font-bold">
                    현재 지도 안에 단지가 없습니다.
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    지도를 이동하거나 필터를 초기화해보세요.
                  </p>
                </div>
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
              distanceBySlug={distances}
              onHover={setHoveredSlug}
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