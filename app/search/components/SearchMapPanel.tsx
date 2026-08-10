"use client";

import Image from "next/image";
import Link from "next/link";

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
    __jibnunNaverMapPromise?: Promise<void>;
  }
}

type LocatedApartment = Apartment & {
  latitude: number;
  longitude: number;
};

type MarkerEntry = {
  marker: any;
  apartment: LocatedApartment;
  listeners: any[];
};

type ClusterGroup = {
  key: string;
  latitude: number;
  longitude: number;
  apartments: LocatedApartment[];
};

const DEFAULT_CENTER = {
  latitude: 36.5,
  longitude: 127.8,
};

const SELECTED_ZOOM = 16;


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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function statusInfo(apartment: Apartment) {
  const stage =
    getListingStage(
      apartment
    );

  if (stage === "subscription") {
    return {
      label: apartment.status || "청약",
      color: "#2563eb",
      light: "#eff6ff",
      text: "#1d4ed8",
    };
  }

  if (stage === "firstCome") {
    return {
      label: "선착순",
      color: "#059669",
      light: "#ecfdf5",
      text: "#047857",
    };
  }

  return {
    label: apartment.status || "분양",
    color: "#f59e0b",
    light: "#fffbeb",
    text: "#b45309",
  };
}

function heroImage(
  apartment?: Apartment | null
) {
  if (!apartment) {
    return "";
  }

  const hero = apartment.images?.hero;

  if (Array.isArray(hero)) {
    return hero[0] ?? "";
  }

  if (typeof hero === "string") {
    return hero.includes(
      "/images/apartments/default/main.jpg"
    )
      ? ""
      : hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        image &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
}

function coordinatesOf(
  apartment: Apartment
) {
  const data = apartment as Apartment & {
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

function loadNaverMapScript(
  clientId: string
) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (
    window.__jibnunNaverMapPromise
  ) {
    return window.__jibnunNaverMapPromise;
  }

  window.__jibnunNaverMapPromise =
    new Promise<void>(
      (resolve, reject) => {
        const existing =
          document.querySelector<HTMLScriptElement>(
            'script[data-jibnun-naver-map="true"], script[data-homepick-naver-map="true"]'
          );

        if (existing) {
          if (window.naver?.maps) {
            resolve();
            return;
          }

          existing.addEventListener(
            "load",
            () => resolve(),
            {
              once: true,
            }
          );

          existing.addEventListener(
            "error",
            () =>
              reject(
                new Error(
                  "네이버 지도 스크립트 로드 실패"
                )
              ),
            {
              once: true,
            }
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.dataset.jibnunNaverMap =
          "true";

        script.async = true;

        script.src =
          "https://oapi.map.naver.com/openapi/v3/maps.js" +
          `?ncpKeyId=${encodeURIComponent(
            clientId
          )}` +
          "&submodules=geocoder";

        script.onload = () =>
          resolve();

        script.onerror = () =>
          reject(
            new Error(
              "네이버 지도 스크립트 로드 실패"
            )
          );

        document.head.appendChild(
          script
        );
      }
    );

  return window.__jibnunNaverMapPromise;
}

async function geocodeAddress(
  address: string
): Promise<UserLocation | null> {
  if (
    !window.naver?.maps?.Service
  ) {
    return null;
  }

  const cacheKey =
    `jibnun-geocode:${address}`;

  try {
    const cached =
      sessionStorage.getItem(
        cacheKey
      );

    if (cached) {
      const parsed =
        JSON.parse(
          cached
        ) as UserLocation;

      if (
        Number.isFinite(
          parsed.latitude
        ) &&
        Number.isFinite(
          parsed.longitude
        )
      ) {
        return parsed;
      }
    }
  } catch {
    // 세션 캐시 오류는 무시합니다.
  }

  return new Promise((resolve) => {
    window.naver.maps.Service.geocode(
      {
        query: address,
      },
      (
        status: unknown,
        response: any
      ) => {
        if (
          status !==
            window.naver.maps.Service
              .Status.OK ||
          !response?.v2?.addresses
            ?.length
        ) {
          resolve(null);
          return;
        }

        const first =
          response.v2.addresses[0];

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
          // 세션 캐시 오류는 무시합니다.
        }

        resolve(result);
      }
    );
  });
}


function addressCandidates(
  address: string
) {
  const normalized =
    address
      .replace(/\s+/g, " ")
      .trim();

  const withoutBlock =
    normalized
      .replace(
        /\b[A-Za-z]*\d+\s*(?:BL|블록)\b/gi,
        " "
      )
      .replace(
        /\b(?:A|B|C|D|E|F)?\d+\s*(?:BL|블록)\b/gi,
        " "
      )
      .replace(
        /(?:도시개발구역|도시개발사업지구|공동주택용지|주택건설사업계획구역)/g,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

  const administrative =
    normalized.match(
      /^(.+?(?:동|읍|면))(?:\s|$)/
    )?.[1]?.trim();

  return [
    normalized,
    withoutBlock,
    administrative,
  ].filter(
    (
      value,
      index,
      values
    ): value is string =>
      Boolean(value) &&
      values.indexOf(value) === index
  );
}

async function geocodeWithFallback(
  address: string
) {
  const candidates =
    addressCandidates(address);

  for (const candidate of candidates) {
    const result =
      await geocodeAddress(
        candidate
      );

    if (result) {
      return result;
    }
  }

  return null;
}

/*
 * 같은 행정동 중심 좌표나 동일 블록 좌표가 겹치는 경우
 * 마커가 완전히 포개지지 않도록 화면 표시 좌표만 아주 조금 분산합니다.
 * 저장된 실제 좌표 데이터는 변경하지 않습니다.
 */
function spreadOverlappingMarkers(
  apartments: LocatedApartment[]
) {
  const groups =
    new Map<
      string,
      LocatedApartment[]
    >();

  apartments.forEach(
    (apartment) => {
      const key = [
        apartment.latitude.toFixed(5),
        apartment.longitude.toFixed(5),
      ].join(":");

      const group =
        groups.get(key) ?? [];

      group.push(apartment);
      groups.set(key, group);
    }
  );

  return apartments.map(
    (apartment) => {
      const key = [
        apartment.latitude.toFixed(5),
        apartment.longitude.toFixed(5),
      ].join(":");

      const group =
        groups.get(key) ?? [];

      if (group.length <= 1) {
        return apartment;
      }

      const index =
        group.findIndex(
          (item) =>
            item.slug ===
            apartment.slug
        );

      const angle =
        (Math.PI * 2 * index) /
        group.length;

      const radius = 0.00018;

      return {
        ...apartment,
        latitude:
          apartment.latitude +
          Math.sin(angle) *
            radius,
        longitude:
          apartment.longitude +
          Math.cos(angle) *
            radius,
      };
    }
  );
}


function clusterCellSize(
  zoom: number
) {
  if (zoom <= 7) {
    return 1.8;
  }

  if (zoom === 8) {
    return 1.1;
  }

  if (zoom === 9) {
    return 0.65;
  }

  if (zoom === 10) {
    return 0.34;
  }

  if (zoom === 11) {
    return 0.17;
  }

  if (zoom === 12) {
    return 0.085;
  }

  if (zoom === 13) {
    return 0.04;
  }

  return 0;
}

function buildClusters(
  apartments: LocatedApartment[],
  zoom: number
): ClusterGroup[] {
  const cellSize =
    clusterCellSize(zoom);

  if (cellSize <= 0) {
    return apartments.map(
      (apartment) => ({
        key: apartment.slug,
        latitude:
          apartment.latitude,
        longitude:
          apartment.longitude,
        apartments: [apartment],
      })
    );
  }

  const groups =
    new Map<
      string,
      LocatedApartment[]
    >();

  apartments.forEach(
    (apartment) => {
      const latitudeCell =
        Math.floor(
          apartment.latitude /
            cellSize
        );

      const longitudeCell =
        Math.floor(
          apartment.longitude /
            cellSize
        );

      const key =
        `${latitudeCell}:${longitudeCell}`;

      const group =
        groups.get(key) ?? [];

      group.push(apartment);
      groups.set(key, group);
    }
  );

  return Array.from(
    groups.entries()
  ).map(([key, group]) => ({
    key,
    latitude:
      group.reduce(
        (sum, apartment) =>
          sum +
          apartment.latitude,
        0
      ) / group.length,

    longitude:
      group.reduce(
        (sum, apartment) =>
          sum +
          apartment.longitude,
        0
      ) / group.length,

    apartments: group,
  }));
}

function clusterHtml(
  count: number
) {
  return `
    <div style="
      display:flex;
      height:50px;
      min-width:50px;
      align-items:center;
      justify-content:center;
      border:4px solid #ffffff;
      border-radius:999px;
      background:#0f766e;
      box-shadow:0 10px 26px rgba(15,23,42,.25);
      color:#ffffff;
      cursor:pointer;
      font-size:14px;
      font-weight:900;
      line-height:1;
      padding:0 12px;
      white-space:nowrap;
    ">
      ${count}
    </div>
  `;
}

function markerHtml(
  apartment: Apartment,
  highlighted: boolean
) {
  const status =
    statusInfo(apartment);

  return `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      transform:${
        highlighted
          ? "scale(1.14) translateY(-3px)"
          : "scale(1)"
      };
      transform-origin:center bottom;
      transition:
        transform .18s ease,
        filter .18s ease;
      filter:${
        highlighted
          ? "drop-shadow(0 12px 18px rgba(15,23,42,.28))"
          : "none"
      };
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
              max-width:210px;
              margin-top:6px;
              padding:8px 11px;
              overflow:hidden;
              border:1px solid #e4e4e7;
              border-radius:11px;
              background:#ffffff;
              box-shadow:0 10px 24px rgba(15,23,42,.18);
              color:#18181b;
              font-size:11px;
              font-weight:900;
              text-overflow:ellipsis;
              white-space:nowrap;
            ">
              ${escapeHtml(
                apartment.name
              )}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function userMarkerHtml() {
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
      box-shadow:
        0 0 0 8px rgba(37,99,235,.16),
        0 8px 20px rgba(37,99,235,.25);
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

function displayDistance(
  distanceKm?: number
) {
  if (
    distanceKm === undefined ||
    !Number.isFinite(distanceKm)
  ) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(
      distanceKm * 1000
    )}m`;
  }

  return distanceKm < 10
    ? `${distanceKm.toFixed(1)}km`
    : `${Math.round(distanceKm)}km`;
}

export default function SearchMapPanel({
  apartments,
  activeApartment,
  selectedApartment,
  userLocation,
  distanceBySlug,
  onHover,
  onSelect,
  onViewportChange,
}: {
  apartments: Apartment[];
  activeApartment: Apartment | null;
  selectedApartment: Apartment | null;
  userLocation: UserLocation | null;
  distanceBySlug: Record<
    string,
    number
  >;
  onHover: (
    slug: string | null
  ) => void;
  onSelect: (slug: string) => void;
  onViewportChange: (
    slugs: string[] | null
  ) => void;
}) {
  const mapElementRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef = useRef<any>(null);

  const markerEntriesRef = useRef<
    Map<string, MarkerEntry>
  >(new Map());

  const clusterMarkersRef =
    useRef<any[]>([]);

  const hoverTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const userMarkerRef =
    useRef<any>(null);

  const idleListenerRef =
    useRef<any>(null);

  const previousActiveSlugRef =
    useRef<string | null>(null);

  const animationTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const [scriptReady, setScriptReady] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [currentZoom, setCurrentZoom] =
    useState(7);

  const [mapError, setMapError] =
    useState("");

  const [
    locatedApartments,
    setLocatedApartments,
  ] = useState<LocatedApartment[]>(
    []
  );

  const [isLocating, setIsLocating] =
    useState(false);

  const clientId =
    process.env
      .NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ??
    "";

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
      !window.naver?.maps
    ) {
      return;
    }

    let cancelled = false;
    let retryCount = 0;

    let timer:
      | ReturnType<
          typeof setTimeout
        >
      | null = null;

    const createMap = () => {
      if (
        cancelled ||
        !mapElementRef.current
      ) {
        return;
      }

      const element =
        mapElementRef.current;

      const rect =
        element.getBoundingClientRect();

      if (
        (rect.width < 10 ||
          rect.height < 10) &&
        retryCount < 40
      ) {
        retryCount += 1;

        timer = setTimeout(
          createMap,
          100
        );

        return;
      }

      if (!mapRef.current) {
        mapRef.current =
          new window.naver.maps.Map(
            element,
            {
              center:
                new window.naver.maps.LatLng(
                  DEFAULT_CENTER.latitude,
                  DEFAULT_CENTER.longitude
                ),

              zoom: 7,
              minZoom: 6,
              maxZoom: 19,

              zoomControl: true,

              zoomControlOptions: {
                position:
                  window.naver.maps
                    .Position.TOP_RIGHT,
              },

              mapTypeControl: false,
              scaleControl: false,
              logoControl: true,
              mapDataControl: false,
            }
          );
      }

      const map = mapRef.current;

      map.setSize(
        new window.naver.maps.Size(
          Math.max(
            1,
            Math.round(rect.width)
          ),
          Math.max(
            1,
            Math.round(rect.height)
          )
        )
      );

      window.naver.maps.Event.trigger(
        map,
        "resize"
      );

      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }

        window.naver.maps.Event.trigger(
          map,
          "resize"
        );

        setCurrentZoom(
          map.getZoom()
        );

        setMapReady(true);
      });
    };

    requestAnimationFrame(createMap);

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [scriptReady]);

  useEffect(() => {
    if (!scriptReady) {
      return;
    }

    let cancelled = false;

    async function locate() {
      setIsLocating(true);

      const result =
        await Promise.all(
          apartments.map(
            async (apartment) => {
              const saved =
                coordinatesOf(
                  apartment
                );

              if (saved) {
                return {
                  ...apartment,
                  ...saved,
                } satisfies LocatedApartment;
              }

              const address =
                apartment.region?.trim();

              if (!address) {
                return null;
              }

              const geocoded =
                await geocodeWithFallback(
                  address
                );

              if (!geocoded) {
                return null;
              }

              return {
                ...apartment,
                ...geocoded,
              } satisfies LocatedApartment;
            }
          )
        );

      if (!cancelled) {
        setLocatedApartments(
          spreadOverlappingMarkers(
            result.filter(
              (
                apartment
              ): apartment is LocatedApartment =>
                apartment !== null
            )
          )
        );

        setIsLocating(false);
      }
    }

    locate();

    return () => {
      cancelled = true;
    };
  }, [
    apartmentSignature,
    apartments,
    scriptReady,
  ]);

  const updateViewport =
    useCallback(() => {
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
          .map(
            (apartment) =>
              apartment.slug
          )
      );
    }, [
      locatedApartments,
      onViewportChange,
    ]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps
    ) {
      return;
    }

    markerEntriesRef.current.forEach(
      (entry) => {
        entry.listeners.forEach(
          (listener) =>
            window.naver.maps.Event.removeListener(
              listener
            )
        );

        entry.marker.setMap(null);
      }
    );

    markerEntriesRef.current.clear();

    clusterMarkersRef.current.forEach(
      (entry) => {
        entry.listeners.forEach(
          (listener: any) =>
            window.naver.maps.Event.removeListener(
              listener
            )
        );

        entry.marker.setMap(null);
      }
    );

    clusterMarkersRef.current = [];

    const groups =
      buildClusters(
        locatedApartments,
        currentZoom
      );

    groups.forEach((group) => {
      if (
        group.apartments.length > 1
      ) {
        const marker =
          new window.naver.maps.Marker(
            {
              position:
                new window.naver.maps.LatLng(
                  group.latitude,
                  group.longitude
                ),

              map,

              title:
                `${group.apartments.length}개 단지`,

              icon: {
                content:
                  clusterHtml(
                    group.apartments.length
                  ),

                anchor:
                  new window.naver.maps.Point(
                    25,
                    25
                  ),
              },

              zIndex: 120,
            }
          );

        const listeners = [
          window.naver.maps.Event.addListener(
            marker,
            "click",
            () => {
              onHover(null);

              map.morph(
                new window.naver.maps.LatLng(
                  group.latitude,
                  group.longitude
                ),
                Math.min(
                  currentZoom + 2,
                  14
                )
              );
            }
          ),
        ];

        clusterMarkersRef.current.push(
          {
            marker,
            listeners,
          }
        );

        return;
      }

      const apartment =
        group.apartments[0];

      const isSelected =
        selectedApartment?.slug ===
        apartment.slug;

      const marker =
        new window.naver.maps.Marker(
          {
            position:
              new window.naver.maps.LatLng(
                apartment.latitude,
                apartment.longitude
              ),

            map,
            title: apartment.name,

            icon: {
              content: markerHtml(
                apartment,
                isSelected
              ),

              anchor:
                new window.naver.maps.Point(
                  isSelected
                    ? 48
                    : 34,
                  isSelected
                    ? 75
                    : 46
                ),
            },

            zIndex:
              isSelected
                ? 300
                : 100,
          }
        );

      const listeners = [
        window.naver.maps.Event.addListener(
          marker,
          "mouseover",
          () => {
            if (
              hoverTimerRef.current
            ) {
              clearTimeout(
                hoverTimerRef.current
              );
            }

            hoverTimerRef.current =
              setTimeout(() => {
                onHover(
                  apartment.slug
                );

                hoverTimerRef.current =
                  null;
              }, 90);
          }
        ),

        window.naver.maps.Event.addListener(
          marker,
          "mouseout",
          () => {
            if (
              hoverTimerRef.current
            ) {
              clearTimeout(
                hoverTimerRef.current
              );

              hoverTimerRef.current =
                null;
            }

            onHover(null);
          }
        ),

        window.naver.maps.Event.addListener(
          marker,
          "click",
          () =>
            onSelect(
              apartment.slug
            )
        ),
      ];

      markerEntriesRef.current.set(
        apartment.slug,
        {
          marker,
          apartment,
          listeners,
        }
      );
    });

    if (
      idleListenerRef.current
    ) {
      window.naver.maps.Event.removeListener(
        idleListenerRef.current
      );
    }

    idleListenerRef.current =
      window.naver.maps.Event.addListener(
        map,
        "idle",
        () => {
          setCurrentZoom(
            map.getZoom()
          );

          updateViewport();
        }
      );

    updateViewport();

    return () => {
      if (
        idleListenerRef.current
      ) {
        window.naver.maps.Event.removeListener(
          idleListenerRef.current
        );

        idleListenerRef.current =
          null;
      }
    };
  }, [
    currentZoom,
    locatedApartments,
    mapReady,
    onHover,
    onSelect,
    selectedApartment,
    updateViewport,
  ]);

  const activeSlug =
    activeApartment?.slug ??
    selectedApartment?.slug ??
    null;

  useEffect(() => {
    if (!window.naver?.maps) {
      return;
    }

    const previousSlug =
      previousActiveSlugRef.current;

    if (
      previousSlug &&
      previousSlug !== activeSlug
    ) {
      const previous =
        markerEntriesRef.current.get(
          previousSlug
        );

      if (previous) {
        previous.marker.setIcon({
          content: markerHtml(
            previous.apartment,
            false
          ),

          anchor:
            new window.naver.maps.Point(
              34,
              46
            ),
        });

        previous.marker.setZIndex(
          100
        );

        previous.marker.setAnimation?.(
          null
        );
      }
    }

    if (activeSlug) {
      const active =
        markerEntriesRef.current.get(
          activeSlug
        );

      if (active) {
        active.marker.setIcon({
          content: markerHtml(
            active.apartment,
            true
          ),

          anchor:
            new window.naver.maps.Point(
              48,
              75
            ),
        });

        active.marker.setZIndex(
          300
        );
      }
    }

    previousActiveSlugRef.current =
      activeSlug;
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

    /*
     * 사용자가 목록이나 마커에서 단지를 선택한 상태라면
     * 전체 핀 범위로 지도를 다시 축소하지 않습니다.
     *
     * 전체 필터에서 단지를 선택했을 때 확대된 직후
     * fitBounds가 다시 실행되던 문제를 방지합니다.
     */
    if (selectedApartment) {
      return;
    }

    if (
      locatedApartments.length === 1
    ) {
      const apartment =
        locatedApartments[0];

      map.morph(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        ),
        SELECTED_ZOOM
      );

      return;
    }

    const bounds =
      new window.naver.maps.LatLngBounds();

    locatedApartments.forEach(
      (apartment) => {
        bounds.extend(
          new window.naver.maps.LatLng(
            apartment.latitude,
            apartment.longitude
          )
        );
      }
    );

    map.fitBounds(bounds, {
      top: 70,
      right: 70,
      bottom: 70,
      left: 70,
    });
  }, [
    apartmentSignature,
    locatedApartments,
    mapReady,
    selectedApartment,
  ]);

  /*
   * 목록 또는 마커에서 단지를 선택하면:
   *
   * 1. 해당 좌표로 부드럽게 이동
   * 2. 확대 레벨 16 적용
   * 3. 선택 마커 강조
   * 4. 짧은 바운스 애니메이션
   * 5. 우측 하단 정보카드 표시
   */
  useEffect(() => {
    const map = mapRef.current;

    if (
      !selectedApartment ||
      !mapReady ||
      !map ||
      !window.naver?.maps
    ) {
      return;
    }

    const entry =
      markerEntriesRef.current.get(
        selectedApartment.slug
      );

    /*
     * 마커 생성이 아직 완료되지 않은 순간에도
     * 저장된 위도·경도를 이용해 먼저 지도 이동을 실행합니다.
     */
    const savedCoordinate =
      coordinatesOf(
        selectedApartment
      );

    const position =
      entry?.marker.getPosition() ??
      (savedCoordinate
        ? new window.naver.maps.LatLng(
            savedCoordinate.latitude,
            savedCoordinate.longitude
          )
        : null);

    if (!position) {
      return;
    }

    /*
     * 현재 지도 확대 상태와 관계없이 선택 단지는
     * 항상 지정한 확대 단계로 이동합니다.
     */
    map.morph(
      position,
      SELECTED_ZOOM
    );

    if (!entry) {
      return;
    }

    if (
      animationTimerRef.current
    ) {
      clearTimeout(
        animationTimerRef.current
      );
    }

    const bounceAnimation =
      window.naver.maps.Animation
        ?.BOUNCE;

    if (
      bounceAnimation &&
      typeof entry.marker
        .setAnimation === "function"
    ) {
      entry.marker.setAnimation(
        bounceAnimation
      );

      animationTimerRef.current =
        setTimeout(() => {
          entry.marker.setAnimation(
            null
          );

          animationTimerRef.current =
            null;
        }, 750);
    }

    entry.marker.setIcon({
      content: markerHtml(
        entry.apartment,
        true
      ),

      anchor:
        new window.naver.maps.Point(
          48,
          75
        ),
    });

    entry.marker.setZIndex(300);
  }, [
    mapReady,
    selectedApartment,
  ]);

  useEffect(() => {
    return () => {
      if (
        animationTimerRef.current
      ) {
        clearTimeout(
          animationTimerRef.current
        );
      }

      if (
        hoverTimerRef.current
      ) {
        clearTimeout(
          hoverTimerRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps
    ) {
      return;
    }

    if (!userLocation) {
      userMarkerRef.current?.setMap(
        null
      );

      userMarkerRef.current = null;

      return;
    }

    const position =
      new window.naver.maps.LatLng(
        userLocation.latitude,
        userLocation.longitude
      );

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(
        position
      );

      userMarkerRef.current.setMap(
        map
      );
    } else {
      userMarkerRef.current =
        new window.naver.maps.Marker(
          {
            position,
            map,
            title: "현재 위치",

            icon: {
              content:
                userMarkerHtml(),

              anchor:
                new window.naver.maps.Point(
                  12,
                  12
                ),
            },

            zIndex: 500,
          }
        );
    }

    map.morph(position, 13);
  }, [
    mapReady,
    userLocation,
  ]);

  useEffect(() => {
    if (
      !mapReady ||
      !mapElementRef.current
    ) {
      return;
    }

    const element =
      mapElementRef.current;

    const map = mapRef.current;

    const resizeMap = () => {
      if (
        !map ||
        !window.naver?.maps
      ) {
        return;
      }

      const rect =
        element.getBoundingClientRect();

      if (
        rect.width < 10 ||
        rect.height < 10
      ) {
        return;
      }

      map.setSize(
        new window.naver.maps.Size(
          Math.round(rect.width),
          Math.round(rect.height)
        )
      );

      window.naver.maps.Event.trigger(
        map,
        "resize"
      );
    };

    const observer =
      new ResizeObserver(
        resizeMap
      );

    observer.observe(element);

    window.addEventListener(
      "resize",
      resizeMap
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "resize",
        resizeMap
      );
    };
  }, [mapReady]);

  const fitAll = () => {
    const map = mapRef.current;

    if (
      !map ||
      !window.naver?.maps ||
      locatedApartments.length === 0
    ) {
      return;
    }

    if (
      locatedApartments.length === 1
    ) {
      const apartment =
        locatedApartments[0];

      map.morph(
        new window.naver.maps.LatLng(
          apartment.latitude,
          apartment.longitude
        ),
        SELECTED_ZOOM
      );

      return;
    }

    const bounds =
      new window.naver.maps.LatLngBounds();

    locatedApartments.forEach(
      (apartment) => {
        bounds.extend(
          new window.naver.maps.LatLng(
            apartment.latitude,
            apartment.longitude
          )
        );
      }
    );

    map.fitBounds(bounds, {
      top: 70,
      right: 70,
      bottom: 70,
      left: 70,
    });
  };

  const floatingApartment =
    activeApartment ??
    selectedApartment;

  const floatingImage =
    heroImage(floatingApartment);

  const floatingStatus =
    floatingApartment
      ? statusInfo(
          floatingApartment
        )
      : null;

  const floatingDistance =
    floatingApartment
      ? displayDistance(
          distanceBySlug[
            floatingApartment.slug
          ]
        )
      : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:sticky lg:top-4 lg:rounded-3xl">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
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
            onClick={fitAll}
            className="cursor-pointer rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            전체 핀 보기
          </button>

          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
            핀{" "}
            {locatedApartments.length}개
          </span>
        </div>
      </div>

      <div className="relative h-[42vh] min-h-[320px] max-h-[460px] overflow-hidden lg:h-[calc(100vh-190px)] lg:min-h-[680px] lg:max-h-none">
        <div
          ref={mapElementRef}
          className="absolute inset-0 bg-[#eaf5f8]"
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        {floatingApartment &&
          floatingStatus && (
            <div className="absolute bottom-5 right-5 z-30 hidden w-[330px] overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl md:block">
              <div className="flex gap-3 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                  {floatingImage ? (
                    <Image
                      src={
                        floatingImage
                      }
                      alt={
                        floatingApartment.name
                      }
                      fill
                      quality={68}
                      sizes="96px"
                      className="object-cover"
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
                        backgroundColor:
                          floatingStatus.light,

                        color:
                          floatingStatus.text,
                      }}
                      className="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                    >
                      {
                        floatingStatus.label
                      }
                    </span>

                    {floatingDistance && (
                      <span className="text-[11px] font-bold text-blue-600">
                        {
                          floatingDistance
                        }
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 line-clamp-2 break-keep text-base font-black leading-6">
                    {
                      floatingApartment.name
                    }
                  </h3>

                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {
                      floatingApartment.region
                    }
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-100 px-4 py-3">
                <p className="line-clamp-2 text-xs font-bold text-zinc-700">
                  {floatingApartment.condition ||
                    "조건 확인 필요"}
                </p>

                <Link
                  href={`/apartments/${floatingApartment.slug}`}
                  className="mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  상세정보 확인 →
                </Link>
              </div>
            </div>
          )}

        {(mapError ||
          !scriptReady) && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/95 p-8 text-center">
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

        {scriptReady &&
          !mapReady &&
          !mapError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-sm font-semibold text-zinc-500">
              지도 화면을 준비하고
              있습니다.
            </div>
          )}

        {scriptReady &&
          mapReady &&
          isLocating && (
            <div className="absolute left-5 top-5 z-20 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 text-sm font-semibold shadow-lg">
              단지 위치를 불러오는
              중입니다.
            </div>
          )}
      </div>
    </section>
  );
}
