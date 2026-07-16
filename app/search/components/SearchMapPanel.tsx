"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Apartment } from "../../../types/apartment";

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

type MapViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

const DEFAULT_CENTER = {
  latitude: 36.5,
  longitude: 127.8,
};

const MAP_STATE_KEY = "homepick-search-map-view";

function getScoreColor(score: number) {
  if (score >= 90) return "#059669";
  if (score >= 80) return "#10b981";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
}

function getCoordinates(
  apartment: Apartment
): {
  latitude: number;
  longitude: number;
} | null {
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
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0
  ) {
    return { latitude, longitude };
  }

  return null;
}

function loadSavedMapView(): MapViewState | null {
  try {
    const saved = sessionStorage.getItem(MAP_STATE_KEY);

    if (!saved) return null;

    const parsed = JSON.parse(saved) as MapViewState;

    if (
      Number.isFinite(parsed.latitude) &&
      Number.isFinite(parsed.longitude) &&
      Number.isFinite(parsed.zoom)
    ) {
      return parsed;
    }
  } catch {
    // 저장된 지도 상태 오류는 무시합니다.
  }

  return null;
}

function saveMapView(map: any) {
  try {
    const center = map.getCenter();
    const zoom = map.getZoom();

    sessionStorage.setItem(
      MAP_STATE_KEY,
      JSON.stringify({
        latitude: center.lat(),
        longitude: center.lng(),
        zoom,
      } satisfies MapViewState)
    );
  } catch {
    // 저장 실패는 무시합니다.
  }
}

function loadNaverMapScript(clientId: string) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.naver?.maps) {
    return Promise.resolve();
  }

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
): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!window.naver?.maps?.Service) {
    return null;
  }

  const cacheKey = `homepick-geocode:${address}`;

  try {
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached) as {
        latitude: number;
        longitude: number;
      };

      if (
        Number.isFinite(parsed.latitude) &&
        Number.isFinite(parsed.longitude)
      ) {
        return parsed;
      }
    }
  } catch {
    // 캐시 오류는 무시합니다.
  }

  return new Promise((resolve) => {
    window.naver.maps.Service.geocode(
      { query: address },
      (status: unknown, response: any) => {
        if (
          status !==
            window.naver.maps.Service.Status.OK ||
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
          // 캐시 오류는 무시합니다.
        }

        resolve(result);
      }
    );
  });
}

function createMarkerHtml(
  apartment: Apartment,
  selected: boolean
) {
  const score = apartment.score.total;
  const color = getScoreColor(score);

  return `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      transform:${selected ? "scale(1.12)" : "scale(1)"};
      transform-origin:center bottom;
      transition:transform .18s ease;
      cursor:pointer;
    ">
      <div style="
        min-width:58px;
        padding:9px 13px;
        border-radius:999px;
        background:${color};
        border:3px solid #ffffff;
        box-shadow:0 8px 24px rgba(15,23,42,.22);
        color:#ffffff;
        font-size:13px;
        line-height:1;
        font-weight:900;
        text-align:center;
        white-space:nowrap;
      ">
        ${score}점
      </div>
      ${
        selected
          ? `
            <div style="
              max-width:160px;
              margin-top:5px;
              padding:6px 9px;
              overflow:hidden;
              border:1px solid #e4e4e7;
              border-radius:9px;
              background:#ffffff;
              box-shadow:0 6px 16px rgba(15,23,42,.14);
              color:#18181b;
              font-size:11px;
              line-height:1.25;
              font-weight:800;
              text-overflow:ellipsis;
              white-space:nowrap;
            ">
              ${apartment.name}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function createClusterHtml(count: number) {
  return `
    <div style="
      display:flex;
      height:52px;
      min-width:52px;
      align-items:center;
      justify-content:center;
      border:4px solid #ffffff;
      border-radius:999px;
      background:#111827;
      box-shadow:0 10px 28px rgba(15,23,42,.28);
      color:#ffffff;
      font-size:15px;
      font-weight:900;
      cursor:pointer;
    ">
      ${count}
    </div>
  `;
}

function getClusterCellSize(zoom: number) {
  if (zoom >= 14) return 0;
  if (zoom >= 12) return 0.025;
  if (zoom >= 10) return 0.07;
  if (zoom >= 8) return 0.18;
  return 0.42;
}

function clusterApartments(
  apartments: LocatedApartment[],
  zoom: number,
  selectedSlug?: string
) {
  const cellSize = getClusterCellSize(zoom);

  if (cellSize === 0) {
    return apartments.map((apartment) => ({
      type: "single" as const,
      apartments: [apartment],
      latitude: apartment.latitude,
      longitude: apartment.longitude,
    }));
  }

  const selected = selectedSlug
    ? apartments.find(
        (apartment) => apartment.slug === selectedSlug
      )
    : undefined;

  const normalApartments = selected
    ? apartments.filter(
        (apartment) => apartment.slug !== selected.slug
      )
    : apartments;

  const groups = new Map<string, LocatedApartment[]>();

  normalApartments.forEach((apartment) => {
    const latKey = Math.round(
      apartment.latitude / cellSize
    );
    const lngKey = Math.round(
      apartment.longitude / cellSize
    );
    const key = `${latKey}:${lngKey}`;

    const current = groups.get(key) ?? [];
    current.push(apartment);
    groups.set(key, current);
  });

  const clustered = [...groups.values()].map((group) => {
    const latitude =
      group.reduce(
        (sum, apartment) =>
          sum + apartment.latitude,
        0
      ) / group.length;

    const longitude =
      group.reduce(
        (sum, apartment) =>
          sum + apartment.longitude,
        0
      ) / group.length;

    return {
      type:
        group.length > 1
          ? ("cluster" as const)
          : ("single" as const),
      apartments: group,
      latitude,
      longitude,
    };
  });

  if (selected) {
    clustered.push({
      type: "single" as const,
      apartments: [selected],
      latitude: selected.latitude,
      longitude: selected.longitude,
    });
  }

  return clustered;
}

export default function SearchMapPanel({
  apartments,
  selectedApartment,
  onSelect,
  onOpen,
  onViewportChange,
}: {
  apartments: Apartment[];
  selectedApartment: Apartment | null;
  onSelect: (slug: string) => void;
  onOpen: (slug: string) => void;
  onViewportChange: (slugs: string[]) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const idleListenerRef = useRef<any>(null);
  const restoredViewRef = useRef(false);

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
      !window.naver?.maps
    ) {
      return;
    }

    let cancelled = false;
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null =
      null;

    const createMapWhenSized = () => {
      if (
        cancelled ||
        !mapElementRef.current ||
        !window.naver?.maps
      ) {
        return;
      }

      const element = mapElementRef.current;
      const rect = element.getBoundingClientRect();

      if (
        (rect.width < 10 || rect.height < 10) &&
        retryCount < 30
      ) {
        retryCount += 1;
        retryTimer = setTimeout(
          createMapWhenSized,
          100
        );
        return;
      }

      const savedView = loadSavedMapView();

      if (!mapRef.current) {
        mapRef.current = new window.naver.maps.Map(
          element,
          {
            center: new window.naver.maps.LatLng(
              savedView?.latitude ??
                DEFAULT_CENTER.latitude,
              savedView?.longitude ??
                DEFAULT_CENTER.longitude
            ),
            zoom: savedView?.zoom ?? 7,
            minZoom: 6,
            maxZoom: 19,
            zoomControl: true,
            zoomControlOptions: {
              position:
                window.naver.maps.Position.TOP_RIGHT,
            },
            mapTypeControl: false,
            scaleControl: false,
            logoControl: true,
            mapDataControl: false,
          }
        );

        restoredViewRef.current = Boolean(savedView);
      }

      const map = mapRef.current;

      map.setSize(
        new window.naver.maps.Size(
          Math.max(1, Math.round(rect.width)),
          Math.max(1, Math.round(rect.height))
        )
      );

      window.naver.maps.Event.trigger(map, "resize");

      requestAnimationFrame(() => {
        if (!cancelled) {
          window.naver.maps.Event.trigger(
            map,
            "resize"
          );
          setMapReady(true);
        }
      });
    };

    requestAnimationFrame(createMapWhenSized);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
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
      onViewportChange([]);
      return;
    }

    const bounds = map.getBounds();

    const visible = locatedApartments
      .filter((apartment) =>
        bounds.hasLatLng(
          new window.naver.maps.LatLng(
            apartment.latitude,
            apartment.longitude
          )
        )
      )
      .map((apartment) => apartment.slug);

    onViewportChange(visible);
  }, [locatedApartments, onViewportChange]);

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;

    if (!map || !window.naver?.maps) return;

    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    const groups = clusterApartments(
      locatedApartments,
      map.getZoom(),
      selectedApartment?.slug
    );

    groups.forEach((group) => {
      if (
        group.type === "cluster" &&
        group.apartments.length > 1
      ) {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            group.latitude,
            group.longitude
          ),
          map,
          icon: {
            content: createClusterHtml(
              group.apartments.length
            ),
            anchor: new window.naver.maps.Point(28, 28),
          },
          zIndex: 80,
        });

        window.naver.maps.Event.addListener(
          marker,
          "click",
          () => {
            map.morph(
              new window.naver.maps.LatLng(
                group.latitude,
                group.longitude
              ),
              Math.min(map.getZoom() + 2, 16)
            );
          }
        );

        markersRef.current.push(marker);
        return;
      }

      const apartment = group.apartments[0];
      const selected =
        selectedApartment?.slug === apartment.slug;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        ),
        map,
        title: apartment.name,
        icon: {
          content: createMarkerHtml(
            apartment,
            selected
          ),
          anchor: new window.naver.maps.Point(
            selected ? 42 : 31,
            selected ? 68 : 45
          ),
        },
        zIndex: selected ? 200 : 100,
      });

      window.naver.maps.Event.addListener(
        marker,
        "click",
        () => onSelect(apartment.slug)
      );

      window.naver.maps.Event.addListener(
        marker,
        "dblclick",
        () => onOpen(apartment.slug)
      );

      markersRef.current.push(marker);
    });
  }, [
    locatedApartments,
    onOpen,
    onSelect,
    selectedApartment?.slug,
  ]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    renderMarkers();
  }, [mapReady, renderMarkers]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps
    ) {
      return;
    }

    if (idleListenerRef.current) {
      window.naver.maps.Event.removeListener(
        idleListenerRef.current
      );
    }

    idleListenerRef.current =
      window.naver.maps.Event.addListener(
        map,
        "idle",
        () => {
          saveMapView(map);
          updateVisibleApartments();
          renderMarkers();
        }
      );

    return () => {
      if (idleListenerRef.current) {
        window.naver.maps.Event.removeListener(
          idleListenerRef.current
        );
        idleListenerRef.current = null;
      }
    };
  }, [
    mapReady,
    renderMarkers,
    updateVisibleApartments,
  ]);

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
      const only = locatedApartments[0];

      map.morph(
        new window.naver.maps.LatLng(
          only.latitude,
          only.longitude
        ),
        16
      );
      return;
    }

    if (
      restoredViewRef.current &&
      apartments.length > 1
    ) {
      restoredViewRef.current = false;
      updateVisibleApartments();
      return;
    }

    const bounds =
      new window.naver.maps.LatLngBounds();

    locatedApartments.forEach((apartment) => {
      bounds.extend(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        )
      );
    });

    map.fitBounds(bounds, {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    });
  }, [
    apartmentSignature,
    apartments.length,
    locatedApartments,
    mapReady,
    updateVisibleApartments,
  ]);

  useEffect(() => {
    if (!mapReady || !mapElementRef.current) {
      return;
    }

    const element = mapElementRef.current;
    const map = mapRef.current;

    const resizeMap = () => {
      if (!map || !window.naver?.maps) return;

      const rect = element.getBoundingClientRect();

      if (rect.width < 10 || rect.height < 10) {
        return;
      }

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

    const firstTimer = window.setTimeout(
      resizeMap,
      100
    );
    const secondTimer = window.setTimeout(
      resizeMap,
      500
    );

    return () => {
      observer.disconnect();
      window.removeEventListener(
        "resize",
        resizeMap
      );
      window.clearTimeout(firstTimer);
      window.clearTimeout(secondTimer);
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

    const bounds =
      new window.naver.maps.LatLngBounds();

    locatedApartments.forEach((apartment) => {
      bounds.extend(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        )
      );
    });

    map.fitBounds(bounds, {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    });
  };

  return (
    <section className="sticky top-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-emerald-600">
            NAVER MAP
          </p>
          <h2 className="mt-1 text-lg font-bold">
            분양지도
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fitAllApartments}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            전체 핀 보기
          </button>

          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
            핀 {locatedApartments.length}개
          </span>
        </div>
      </div>

      <div className="relative h-[calc(100vh-190px)] min-h-[680px] overflow-hidden">
        <div
          ref={mapElementRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "680px",
          }}
          className="absolute inset-0 bg-[#eaf5f8]"
        />

        {(mapError || !scriptReady) && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/95 p-8 text-center">
            <div>
              <p className="font-bold">
                네이버 지도 연결 확인
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                {mapError ||
                  "네이버 지도 스크립트를 불러오는 중입니다."}
              </p>
            </div>
          </div>
        )}

        {scriptReady && !mapReady && !mapError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-sm font-semibold text-zinc-500">
            지도 화면 크기를 맞추는 중입니다...
          </div>
        )}

        {scriptReady && mapReady && isLocating && (
          <div className="absolute left-5 top-5 z-20 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur">
            지도를 불러오는 중입니다...
          </div>
        )}

        {scriptReady &&
          mapReady &&
          !isLocating &&
          locatedApartments.length > 0 && (
            <div className="pointer-events-none absolute bottom-5 left-5 z-20 rounded-full border border-zinc-200 bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-600 shadow-sm backdrop-blur">
              지도를 이동하면 왼쪽 목록이 자동으로 바뀝니다.
            </div>
          )}
      </div>
    </section>
  );
}