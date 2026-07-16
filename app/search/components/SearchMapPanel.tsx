"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Apartment } from "../../../types/apartment";
import type { UserLocation } from "../SearchClient";
import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../../lib/subscriptionVisibility";

declare global {
  interface Window {
    naver?: any;
    __homepickNaverMapPromise?: Promise<void>;
  }
}

type LocatedApartment = Apartment & {
  latitude: number;
  longitude: number;
};

type MarkerEntry = {
  marker: any;
  apartment: LocatedApartment;
};

const DEFAULT_CENTER = {
  latitude: 36.5,
  longitude: 127.8,
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStatusInfo(apartment: Apartment) {
  if (isSubscriptionApartment(apartment)) {
    return {
      label: apartment.status || "청약",
      color: "#2563eb",
      light: "#eff6ff",
      text: "#1d4ed8",
    };
  }

  if (isFirstComeApartment(apartment)) {
    return {
      label: "선착순",
      color: "#059669",
      light: "#ecfdf5",
      text: "#047857",
    };
  }

  return {
    label: apartment.status || "분양중",
    color: "#f59e0b",
    light: "#fffbeb",
    text: "#b45309",
  };
}

function getHeroImage(apartment?: Apartment | null) {
  if (!apartment) return "";

  const hero = apartment.images?.hero;
  if (Array.isArray(hero)) return hero[0] ?? "";

  if (
    typeof hero === "string" &&
    !hero.includes("/images/apartments/default/main.jpg")
  ) {
    return hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        Boolean(image) &&
        !image.includes("/images/apartments/default/main.jpg")
    ) ?? ""
  );
}

function getCoordinates(apartment: Apartment) {
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

function loadNaverMapScript(clientId: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.naver?.maps) return Promise.resolve();

  if (window.__homepickNaverMapPromise) {
    return window.__homepickNaverMapPromise;
  }

  window.__homepickNaverMapPromise = new Promise<void>(
    (resolve, reject) => {
      const existing =
        document.querySelector<HTMLScriptElement>(
          'script[data-homepick-naver-map="true"]'
        );

      if (existing) {
        if (window.naver?.maps) {
          resolve();
          return;
        }

        existing.addEventListener("load", () => resolve(), {
          once: true,
        });
        existing.addEventListener(
          "error",
          () =>
            reject(
              new Error("네이버 지도 스크립트 로드 실패")
            ),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.dataset.homepickNaverMap = "true";
      script.async = true;
      script.src =
        "https://oapi.map.naver.com/openapi/v3/maps.js" +
        `?ncpKeyId=${encodeURIComponent(clientId)}` +
        "&submodules=geocoder";

      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error("네이버 지도 스크립트 로드 실패")
        );

      document.head.appendChild(script);
    }
  );

  return window.__homepickNaverMapPromise;
}

async function geocodeAddress(
  address: string
): Promise<UserLocation | null> {
  if (!window.naver?.maps?.Service) return null;

  const cacheKey = `homepick-geocode:${address}`;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as UserLocation;

      if (
        Number.isFinite(parsed.latitude) &&
        Number.isFinite(parsed.longitude)
      ) {
        return parsed;
      }
    }
  } catch {
    // 캐시 오류 무시
  }

  return new Promise((resolve) => {
    window.naver.maps.Service.geocode(
      { query: address },
      (status: unknown, response: any) => {
        if (
          status !== window.naver.maps.Service.Status.OK ||
          !response?.v2?.addresses?.length
        ) {
          resolve(null);
          return;
        }

        const first = response.v2.addresses[0];
        const result = {
          latitude: Number(first.y),
          longitude: Number(first.x),
        };

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify(result)
          );
        } catch {
          // 캐시 오류 무시
        }

        resolve(result);
      }
    );
  });
}

function createMarkerHtml(
  apartment: Apartment,
  highlighted: boolean
) {
  const status = getStatusInfo(apartment);

  return `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      transform:${highlighted ? "scale(1.12)" : "scale(1)"};
      transform-origin:center bottom;
      transition:transform .16s ease;
      cursor:pointer;
    ">
      <div style="
        min-width:64px;
        padding:9px 13px;
        border-radius:999px;
        background:${status.color};
        border:3px solid #ffffff;
        box-shadow:0 8px 24px rgba(15,23,42,.22);
        color:#ffffff;
        font-size:12px;
        line-height:1;
        font-weight:900;
        text-align:center;
        white-space:nowrap;
      ">
        ${escapeHtml(status.label)}
      </div>
      ${
        highlighted
          ? `
            <div style="
              max-width:190px;
              margin-top:5px;
              padding:7px 10px;
              overflow:hidden;
              border:1px solid #e4e4e7;
              border-radius:10px;
              background:#ffffff;
              box-shadow:0 8px 20px rgba(15,23,42,.16);
              color:#18181b;
              font-size:11px;
              font-weight:800;
              text-overflow:ellipsis;
              white-space:nowrap;
            ">
              ${escapeHtml(apartment.name)}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function createUserLocationHtml() {
  return `
    <div style="
      display:flex;
      height:24px;
      width:24px;
      align-items:center;
      justify-content:center;
      border:4px solid #ffffff;
      border-radius:999px;
      background:#2563eb;
      box-shadow:0 0 0 8px rgba(37,99,235,.16);
    ">
      <div style="
        height:7px;
        width:7px;
        border-radius:999px;
        background:#ffffff;
      "></div>
    </div>
  `;
}

function formatDistance(distanceKm?: number) {
  if (
    distanceKm === undefined ||
    !Number.isFinite(distanceKm)
  ) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }

  return `${Math.round(distanceKm)}km`;
}

export default function SearchMapPanel({
  apartments,
  activeApartment,
  selectedApartment,
  userLocation,
  distanceBySlug,
  onHover,
  onSelect,
  onOpen,
  onViewportChange,
}: {
  apartments: Apartment[];
  activeApartment: Apartment | null;
  selectedApartment: Apartment | null;
  userLocation: UserLocation | null;
  distanceBySlug: Record<string, number>;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  onOpen: (slug: string) => void;
  onViewportChange: (slugs: string[] | null) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(
    new Map()
  );
  const userMarkerRef = useRef<any>(null);
  const idleListenerRef = useRef<any>(null);
  const previousActiveSlugRef = useRef<string | null>(null);

  const [scriptReady, setScriptReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [locatedApartments, setLocatedApartments] =
    useState<LocatedApartment[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";

  const apartmentSignature = useMemo(
    () =>
      apartments
        .map(
          (apartment) =>
            `${apartment.slug}:${apartment.region}:${apartment.latitude}:${apartment.longitude}`
        )
        .join("|"),
    [apartments]
  );

  useEffect(() => {
    if (!clientId) {
      setMapError(
        ".env.local에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 등록해주세요."
      );
      return;
    }

    let cancelled = false;

    loadNaverMapScript(clientId)
      .then(() => {
        if (!cancelled) {
          setScriptReady(true);
          setMapError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMapError(
            error instanceof Error
              ? error.message
              : "네이버 지도를 불러오지 못했습니다."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (
      !scriptReady ||
      !mapElementRef.current ||
      !window.naver?.maps ||
      mapRef.current
    ) {
      return;
    }

    const element = mapElementRef.current;

    mapRef.current = new window.naver.maps.Map(element, {
      center: new window.naver.maps.LatLng(
        DEFAULT_CENTER.latitude,
        DEFAULT_CENTER.longitude
      ),
      zoom: 7,
      minZoom: 6,
      maxZoom: 19,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
      mapTypeControl: false,
      scaleControl: false,
      logoControl: true,
      mapDataControl: false,
    });

    setMapReady(true);
  }, [scriptReady]);

  useEffect(() => {
    if (!scriptReady) return;

    let cancelled = false;

    async function locateApartments() {
      setIsLocating(true);

      const located = await Promise.all(
        apartments.map(async (apartment) => {
          const saved = getCoordinates(apartment);

          if (saved) {
            return {
              ...apartment,
              ...saved,
            } satisfies LocatedApartment;
          }

          const address = apartment.region?.trim();
          if (!address) return null;

          const geocoded = await geocodeAddress(address);
          if (!geocoded) return null;

          return {
            ...apartment,
            ...geocoded,
          } satisfies LocatedApartment;
        })
      );

      if (!cancelled) {
        setLocatedApartments(
          located.filter(
            (
              apartment
            ): apartment is LocatedApartment =>
              apartment !== null
          )
        );
        setIsLocating(false);
      }
    }

    locateApartments();

    return () => {
      cancelled = true;
    };
  }, [apartmentSignature, apartments, scriptReady]);

  const updateVisibleApartments = useCallback(() => {
    const map = mapRef.current;

    if (
      !map ||
      !window.naver?.maps ||
      locatedApartments.length === 0
    ) {
      onViewportChange(null);
      return;
    }

    const bounds = map.getBounds();

    onViewportChange(
      locatedApartments
        .filter((apartment) =>
          bounds.hasLatLng(
            new window.naver.maps.LatLng(
              apartment.latitude,
              apartment.longitude
            )
          )
        )
        .map((apartment) => apartment.slug)
    );
  }, [locatedApartments, onViewportChange]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !window.naver?.maps) return;

    markersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    locatedApartments.forEach((apartment) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        ),
        map,
        title: apartment.name,
        icon: {
          content: createMarkerHtml(apartment, false),
          anchor: new window.naver.maps.Point(34, 46),
        },
        zIndex: 100,
      });

      window.naver.maps.Event.addListener(
        marker,
        "mouseover",
        () => onHover(apartment.slug)
      );
      window.naver.maps.Event.addListener(
        marker,
        "mouseout",
        () => onHover(null)
      );
      window.naver.maps.Event.addListener(
        marker,
        "click",
        () => onSelect(apartment.slug)
      );

      markersRef.current.set(apartment.slug, {
        marker,
        apartment,
      });
    });

    if (idleListenerRef.current) {
      window.naver.maps.Event.removeListener(
        idleListenerRef.current
      );
    }

    idleListenerRef.current =
      window.naver.maps.Event.addListener(map, "idle", () => {
        updateVisibleApartments();
      });

    updateVisibleApartments();

    return () => {
      if (idleListenerRef.current) {
        window.naver.maps.Event.removeListener(
          idleListenerRef.current
        );
        idleListenerRef.current = null;
      }
    };
  }, [
    locatedApartments,
    mapReady,
    onHover,
    onSelect,
    updateVisibleApartments,
  ]);

  const activeSlug =
    activeApartment?.slug ??
    selectedApartment?.slug ??
    null;

  useEffect(() => {
    const previousSlug = previousActiveSlugRef.current;

    if (previousSlug && previousSlug !== activeSlug) {
      const previous = markersRef.current.get(previousSlug);

      if (previous) {
        previous.marker.setIcon({
          content: createMarkerHtml(
            previous.apartment,
            false
          ),
          anchor: new window.naver.maps.Point(34, 46),
        });
        previous.marker.setZIndex(100);
      }
    }

    if (activeSlug) {
      const active = markersRef.current.get(activeSlug);

      if (active) {
        active.marker.setIcon({
          content: createMarkerHtml(active.apartment, true),
          anchor: new window.naver.maps.Point(48, 72),
        });
        active.marker.setZIndex(220);
      }
    }

    previousActiveSlugRef.current = activeSlug;
  }, [activeSlug]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps ||
      locatedApartments.length === 0
    ) {
      return;
    }

    if (locatedApartments.length === 1) {
      const apartment = locatedApartments[0];

      map.morph(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        ),
        16
      );
      return;
    }

    const bounds = new window.naver.maps.LatLngBounds();

    locatedApartments.forEach((apartment) => {
      bounds.extend(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        )
      );
    });

    map.fitBounds(bounds, {
      top: 70,
      right: 70,
      bottom: 70,
      left: 70,
    });
  }, [apartmentSignature, locatedApartments, mapReady]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps ||
      !selectedApartment
    ) {
      return;
    }

    const located = markersRef.current.get(
      selectedApartment.slug
    );

    if (!located) return;

    map.panTo(located.marker.getPosition());
  }, [mapReady, selectedApartment]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !window.naver?.maps) return;

    if (!userLocation) {
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      return;
    }

    const position = new window.naver.maps.LatLng(
      userLocation.latitude,
      userLocation.longitude
    );

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(position);
      userMarkerRef.current.setMap(map);
    } else {
      userMarkerRef.current = new window.naver.maps.Marker({
        position,
        map,
        title: "현재 위치",
        icon: {
          content: createUserLocationHtml(),
          anchor: new window.naver.maps.Point(12, 12),
        },
        zIndex: 500,
      });
    }

    map.morph(position, 13);
  }, [mapReady, userLocation]);

  useEffect(() => {
    if (!mapReady || !mapElementRef.current) return;

    const element = mapElementRef.current;
    const map = mapRef.current;

    const resizeMap = () => {
      if (!map || !window.naver?.maps) return;

      const rect = element.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      map.setSize(
        new window.naver.maps.Size(
          Math.round(rect.width),
          Math.round(rect.height)
        )
      );
      window.naver.maps.Event.trigger(map, "resize");
    };

    const observer = new ResizeObserver(resizeMap);
    observer.observe(element);
    window.addEventListener("resize", resizeMap);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeMap);
    };
  }, [mapReady]);

  const fitAllApartments = () => {
    const map = mapRef.current;
    if (
      !map ||
      !window.naver?.maps ||
      locatedApartments.length === 0
    ) {
      return;
    }

    const bounds = new window.naver.maps.LatLngBounds();

    locatedApartments.forEach((apartment) => {
      bounds.extend(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        )
      );
    });

    map.fitBounds(bounds, {
      top: 70,
      right: 70,
      bottom: 70,
      left: 70,
    });
  };

  const floatingApartment =
    activeApartment ?? selectedApartment;
  const floatingImage = getHeroImage(floatingApartment);
  const floatingStatus = floatingApartment
    ? getStatusInfo(floatingApartment)
    : null;
  const floatingDistance = floatingApartment
    ? formatDistance(distanceBySlug[floatingApartment.slug])
    : "";

  return (
    <section className="sticky top-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-emerald-600">
            NAVER MAP
          </p>
          <h2 className="mt-1 text-lg font-bold">
            부동산지도
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fitAllApartments}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            전체 핀 보기
          </button>

          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
            핀 {locatedApartments.length}개
          </span>
        </div>
      </div>

      <div className="relative h-[calc(100vh-190px)] min-h-[680px] overflow-hidden">
        <div
          ref={mapElementRef}
          className="absolute inset-0 bg-[#eaf5f8]"
        />

        {floatingApartment && floatingStatus && (
          <div className="absolute bottom-5 right-5 z-30 hidden w-[330px] overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl md:block">
            <div className="flex gap-3 p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                {floatingImage ? (
                  <img
                    src={floatingImage}
                    alt={floatingApartment.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    이미지 준비 중
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={{
                      backgroundColor: floatingStatus.light,
                      color: floatingStatus.text,
                    }}
                    className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                  >
                    {floatingStatus.label}
                  </span>

                  {floatingDistance && (
                    <span className="text-[11px] font-bold text-blue-600">
                      {floatingDistance}
                    </span>
                  )}
                </div>

                <h3 className="mt-2 line-clamp-2 break-keep text-base font-black leading-6">
                  {floatingApartment.name}
                </h3>

                <p className="mt-1 truncate text-xs text-zinc-500">
                  {floatingApartment.region}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-100 px-4 py-3">
              <p className="line-clamp-2 text-xs font-bold text-zinc-700">
                {floatingApartment.condition || "조건 확인 필요"}
              </p>

              <button
                type="button"
                onClick={() => onOpen(floatingApartment.slug)}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                상세정보 확인 →
              </button>
            </div>
          </div>
        )}

        {(mapError || !scriptReady) && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/95 p-8 text-center">
            <div>
              <p className="font-bold">네이버 지도 연결 확인</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                {mapError ||
                  "네이버 지도 스크립트를 불러오는 중입니다."}
              </p>
            </div>
          </div>
        )}

        {scriptReady && !mapReady && !mapError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-sm font-semibold text-zinc-500">
            지도 화면을 준비하고 있습니다.
          </div>
        )}

        {scriptReady && mapReady && isLocating && (
          <div className="absolute left-5 top-5 z-20 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 text-sm font-semibold shadow-lg">
            단지 위치를 불러오는 중입니다.
          </div>
        )}
      </div>
    </section>
  );
}
