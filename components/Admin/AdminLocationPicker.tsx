"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    naver?: any;
    __homepickAdminNaverMapPromise?: Promise<void>;
  }
}

type Props = {
  latitude: number | null;
  longitude: number | null;
  apartmentName?: string;

  onLocationChange: (
    latitude: number,
    longitude: number
  ) => void;

  onReset?: () => void;
};

const DEFAULT_MAP_CENTER = {
  latitude: 36.5,
  longitude: 127.8,
};

const LOCATION_ZOOM = 17;

/**
 * 관리자 지도에서만 사용하는 독립 로더입니다.
 *
 * 검색페이지에서 네이버 지도 스크립트가 이미 로드된 경우
 * 다시 불러오지 않고 기존 스크립트를 그대로 사용합니다.
 */
function loadAdminNaverMapScript(
  clientId: string
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (
    window.__homepickAdminNaverMapPromise
  ) {
    return window.__homepickAdminNaverMapPromise;
  }

  window.__homepickAdminNaverMapPromise =
    new Promise<void>(
      (resolve, reject) => {
        const existingScript =
          document.querySelector<HTMLScriptElement>(
            'script[data-homepick-naver-map="true"]'
          );

        if (existingScript) {
          if (window.naver?.maps) {
            resolve();
            return;
          }

          existingScript.addEventListener(
            "load",
            () => resolve(),
            {
              once: true,
            }
          );

          existingScript.addEventListener(
            "error",
            () => {
              reject(
                new Error(
                  "네이버 지도 스크립트 로드에 실패했습니다."
                )
              );
            },
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

        script.dataset.homepickNaverMap =
          "true";

        script.async = true;

        script.src =
          "https://oapi.map.naver.com/openapi/v3/maps.js" +
          `?ncpKeyId=${encodeURIComponent(
            clientId
          )}` +
          "&submodules=geocoder";

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          reject(
            new Error(
              "네이버 지도 스크립트 로드에 실패했습니다."
            )
          );
        };

        document.head.appendChild(
          script
        );
      }
    );

  return window.__homepickAdminNaverMapPromise;
}

export default function AdminLocationPicker({
  latitude,
  longitude,
  apartmentName = "",
  onLocationChange,
  onReset,
}: Props) {
  const mapElementRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const mapClickListenerRef =
    useRef<any>(null);

  const markerDragListenerRef =
    useRef<any>(null);

  /*
   * 부모 콜백이 렌더링마다 새로 생성돼도
   * 지도 이벤트를 계속 재등록하지 않도록 ref에 보관합니다.
   */
  const onLocationChangeRef =
    useRef(onLocationChange);

  const [scriptReady, setScriptReady] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [mapError, setMapError] =
    useState("");

  const clientId =
    process.env
      .NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ??
    "";

  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  useEffect(() => {
    onLocationChangeRef.current =
      onLocationChange;
  }, [onLocationChange]);

  /*
   * 네이버 지도 SDK 로드
   */
  useEffect(() => {
    if (!clientId) {
      setMapError(
        ".env.local에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 없습니다."
      );

      return;
    }

    let cancelled = false;

    loadAdminNaverMapScript(clientId)
      .then(() => {
        if (cancelled) {
          return;
        }

        setScriptReady(true);
        setMapError("");
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setMapError(
          error instanceof Error
            ? error.message
            : "네이버 지도를 불러오지 못했습니다."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  /*
   * 관리자용 작은 지도 생성
   */
  useEffect(() => {
    if (
      !scriptReady ||
      !window.naver?.maps ||
      !mapElementRef.current
    ) {
      return;
    }

    let cancelled = false;
    let retryCount = 0;

    let timer:
      | ReturnType<typeof setTimeout>
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
        retryCount < 30
      ) {
        retryCount += 1;

        timer = setTimeout(
          createMap,
          100
        );

        return;
      }

      if (!mapRef.current) {
        const initialPosition =
          new window.naver.maps.LatLng(
            hasCoordinates
              ? latitude
              : DEFAULT_MAP_CENTER.latitude,

            hasCoordinates
              ? longitude
              : DEFAULT_MAP_CENTER.longitude
          );

        mapRef.current =
          new window.naver.maps.Map(
            element,
            {
              center: initialPosition,

              zoom: hasCoordinates
                ? LOCATION_ZOOM
                : 7,

              minZoom: 6,
              maxZoom: 20,

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

      setMapReady(true);
    };

    requestAnimationFrame(createMap);

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [scriptReady]);

  /*
   * 지도 클릭 시 좌표 선택
   */
  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps
    ) {
      return;
    }

    if (
      mapClickListenerRef.current
    ) {
      window.naver.maps.Event.removeListener(
        mapClickListenerRef.current
      );
    }

    mapClickListenerRef.current =
      window.naver.maps.Event.addListener(
        map,
        "click",
        (event: any) => {
          const nextLatitude =
            Number(event.coord.lat());

          const nextLongitude =
            Number(event.coord.lng());

          onLocationChangeRef.current(
            nextLatitude,
            nextLongitude
          );
        }
      );

    return () => {
      if (
        mapClickListenerRef.current
      ) {
        window.naver.maps.Event.removeListener(
          mapClickListenerRef.current
        );

        mapClickListenerRef.current =
          null;
      }
    };
  }, [mapReady]);

  /*
   * 좌표가 변경되면 마커와 지도 중심 이동
   */
  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !window.naver?.maps
    ) {
      return;
    }

    if (!hasCoordinates) {
      markerRef.current?.setMap(null);
      markerRef.current = null;

      map.setCenter(
        new window.naver.maps.LatLng(
          DEFAULT_MAP_CENTER.latitude,
          DEFAULT_MAP_CENTER.longitude
        )
      );

      map.setZoom(7);

      return;
    }

    const position =
      new window.naver.maps.LatLng(
        latitude,
        longitude
      );

    if (markerRef.current) {
      markerRef.current.setPosition(
        position
      );

      markerRef.current.setMap(map);
      markerRef.current.setTitle?.(
        apartmentName ||
          "선택한 사업지 위치"
      );
    } else {
      markerRef.current =
        new window.naver.maps.Marker({
          position,
          map,

          title:
            apartmentName ||
            "선택한 사업지 위치",

          draggable: true,

          animation:
            window.naver.maps.Animation
              ?.DROP,
        });

      markerDragListenerRef.current =
        window.naver.maps.Event.addListener(
          markerRef.current,
          "dragend",
          () => {
            const markerPosition =
              markerRef.current?.getPosition();

            if (!markerPosition) {
              return;
            }

            onLocationChangeRef.current(
              Number(
                markerPosition.lat()
              ),
              Number(
                markerPosition.lng()
              )
            );
          }
        );
    }

    map.morph(
      position,
      Math.max(
        map.getZoom?.() ?? 0,
        LOCATION_ZOOM
      )
    );
  }, [
    apartmentName,
    hasCoordinates,
    latitude,
    longitude,
    mapReady,
  ]);

  /*
   * 관리자 입력 패널 크기가 바뀌어도
   * 지도가 잘리지 않게 크기를 다시 계산합니다.
   */
  useEffect(() => {
    if (
      !mapReady ||
      !mapElementRef.current
    ) {
      return;
    }

    const element =
      mapElementRef.current;

    const resizeMap = () => {
      const map = mapRef.current;

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

  /*
   * 컴포넌트 제거 시 지도 이벤트 정리
   */
  useEffect(() => {
    return () => {
      if (!window.naver?.maps) {
        return;
      }

      if (
        mapClickListenerRef.current
      ) {
        window.naver.maps.Event.removeListener(
          mapClickListenerRef.current
        );
      }

      if (
        markerDragListenerRef.current
      ) {
        window.naver.maps.Event.removeListener(
          markerDragListenerRef.current
        );
      }
    };
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-900">
            사업지 위치 확인
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            주소로 찾은 위치를 확인하고,
            필요하면 지도나 핀을 움직여
            보정하세요.
          </p>
        </div>

        {hasCoordinates && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            위치 초기화
          </button>
        )}
      </div>

      <div className="relative h-[240px] overflow-hidden bg-[#eaf5f8] sm:h-[260px]">
        <div
          ref={mapElementRef}
          className="absolute inset-0"
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        {(mapError ||
          !scriptReady) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 p-5 text-center">
            <div>
              <p className="font-bold text-zinc-900">
                네이버 지도 연결 확인
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {mapError ||
                  "네이버 지도 스크립트를 불러오는 중입니다."}
              </p>
            </div>
          </div>
        )}

        {scriptReady &&
          !mapReady &&
          !mapError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-sm font-semibold text-zinc-500">
              지도 화면을 준비하고 있습니다.
            </div>
          )}

        {mapReady &&
          !hasCoordinates && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 text-xs font-semibold leading-5 text-zinc-600 shadow-md">
              주소로 위치를 찾거나
              지도에서 위치를 선택하세요.
            </div>
          )}
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-zinc-500">
          지도를 클릭하거나 마커를
          드래그하면 좌표가 자동으로
          변경됩니다.
        </p>

        <p className="shrink-0 font-mono text-xs font-bold text-zinc-700">
          {hasCoordinates
            ? `${latitude.toFixed(
                6
              )}, ${longitude.toFixed(
                6
              )}`
            : "위치 미등록"}
        </p>
      </div>
    </div>
  );
}