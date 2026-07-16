"use client";

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { geoMercator, geoPath } from "d3-geo";

export type RegionMapItem = {
  city: string;
  cityName: string;
  count: number;
};

type GeoFeature = {
  type: "Feature";
  properties: {
    NAME_1?: string;
    name?: string;
    NL_NAME_1?: string;
  };
  geometry: unknown;
};

type GeoJson = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

type MapView = {
  x: number;
  y: number;
  scale: number;
};

type RenderedFeature = {
  key: string;
  regionName: string;
  region?: RegionMapItem;
  count: number;
  path: string;
  centroid: [number, number];
};

const MIN_SCALE = 0.85;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.12;

const nameMap: Record<string, string> = {
  Seoul: "서울",
  Busan: "부산",
  Daegu: "대구",
  Incheon: "인천",
  Gwangju: "광주",
  Daejeon: "대전",
  Ulsan: "울산",
  Sejong: "세종",

  Gyeonggi: "경기",
  "Gyeonggi-do": "경기",

  Gangwon: "강원",
  "Gangwon-do": "강원",

  Chungbuk: "충북",
  "Chungcheongbuk-do": "충북",

  Chungnam: "충남",
  "Chungcheongnam-do": "충남",

  Jeonbuk: "전북",
  "Jeollabuk-do": "전북",
  "Jeonbuk State": "전북",

  Jeonnam: "전남",
  "Jeollanam-do": "전남",

  Gyeongbuk: "경북",
  "Gyeongsangbuk-do": "경북",

  Gyeongnam: "경남",
  "Gyeongsangnam-do": "경남",

  Jeju: "제주",
  "Jeju-do": "제주",
};

function normalizeRegionName(name?: string) {
  if (!name) return "";

  const cleaned = name.trim();

  return nameMap[cleaned] ?? cleaned;
}

function getRegionFill(count: number, selected: boolean) {
  if (selected) return "#c9f3df";
  if (count >= 10) return "#5fd1a0";
  if (count >= 5) return "#9ae4c4";
  if (count >= 1) return "#dff7ec";

  return "#fbfaf6";
}

function KoreaMap({
  regions,
  selectedCity,
  onSelect,
}: {
  regions: RegionMapItem[];
  selectedCity?: string;
  onSelect: (city: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const transformGroupRef = useRef<SVGGElement | null>(null);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipNameRef = useRef<HTMLParagraphElement | null>(null);
  const tooltipCountRef = useRef<HTMLParagraphElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const viewRef = useRef<MapView>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    viewX: 0,
    viewY: 0,
  });

  const [geoJson, setGeoJson] = useState<GeoJson | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMap() {
      try {
        const response = await fetch("/maps/korea-provinces.json", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`지도 데이터 오류: ${response.status}`);
        }

        const data = (await response.json()) as GeoJson;
        setGeoJson(data);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        console.error("지도 데이터 로드 실패:", error);
        setLoadError(true);
      }
    }

    loadMap();

    return () => controller.abort();
  }, []);

  const regionMap = useMemo(() => {
    return regions.reduce<Record<string, RegionMapItem>>((acc, item) => {
      if (item.city) acc[item.city] = item;
      if (item.cityName) acc[item.cityName] = item;

      return acc;
    }, {});
  }, [regions]);

  const projection = useMemo(() => {
    if (!geoJson) return null;

    return geoMercator().fitSize([580, 640], geoJson as never);
  }, [geoJson]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;

    return geoPath().projection(projection);
  }, [projection]);

  const renderedFeatures = useMemo<RenderedFeature[]>(() => {
    if (!geoJson || !pathGenerator) return [];

    return geoJson.features.map((feature, index) => {
      const rawName =
        feature.properties.NAME_1 ??
        feature.properties.name ??
        feature.properties.NL_NAME_1 ??
        "";

      const regionName = normalizeRegionName(rawName);
      const region = regionMap[regionName];
      const count = region?.count ?? 0;

      return {
        key: `${regionName}-${index}`,
        regionName,
        region,
        count,
        path: pathGenerator(feature as never) ?? "",
        centroid: pathGenerator.centroid(feature as never) as [
          number,
          number,
        ],
      };
    });
  }, [geoJson, pathGenerator, regionMap]);

  const applyTransform = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const group = transformGroupRef.current;

      if (!group) return;

      const { x, y, scale } = viewRef.current;

      group.setAttribute(
        "transform",
        `translate(${x} ${y}) scale(${scale})`
      );

      animationFrameRef.current = null;
    });
  };

  const changeScale = (nextScale: number) => {
    viewRef.current.scale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, nextScale)
    );

    applyTransform();
  };

  const zoomIn = () => {
    changeScale(viewRef.current.scale + ZOOM_STEP);
  };

  const zoomOut = () => {
    changeScale(viewRef.current.scale - ZOOM_STEP);
  };

  const resetMap = () => {
    viewRef.current = {
      x: 0,
      y: 0,
      scale: 1,
    };

    applyTransform();
  };

  const selectRegion = (region?: RegionMapItem) => {
    if (!region) return;

    dragRef.current.active = false;
    dragRef.current.moved = false;
    onSelect(region.city);
  };

  useEffect(() => {
    const element = mapRef.current;

    if (!element || !geoJson) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const oldScale = viewRef.current.scale;
      const direction = event.deltaY < 0 ? 1 : -1;

      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, oldScale + direction * ZOOM_STEP)
      );

      if (nextScale === oldScale) return;

      const bounds = element.getBoundingClientRect();
      const screenX = event.clientX - bounds.left;
      const screenY = event.clientY - bounds.top;

      const svgX = (screenX / bounds.width) * 580;
      const svgY = (screenY / bounds.height) * 640;

      const ratio = nextScale / oldScale;

      viewRef.current.x =
        svgX - (svgX - viewRef.current.x) * ratio;

      viewRef.current.y =
        svgY - (svgY - viewRef.current.y) * ratio;

      viewRef.current.scale = nextScale;

      applyTransform();
    };

    element.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      element.removeEventListener("wheel", handleWheel);

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [geoJson]);

  const showTooltip = (regionName: string, count: number) => {
    const tooltip = tooltipRef.current;
    const tooltipName = tooltipNameRef.current;
    const tooltipCount = tooltipCountRef.current;

    if (!tooltip || !tooltipName || !tooltipCount) return;

    tooltipName.textContent = regionName;
    tooltipCount.textContent =
      count > 0 ? `분양 단지 ${count}개` : "등록 준비 중";

    tooltip.classList.remove("opacity-0", "translate-y-2");
    tooltip.classList.add("opacity-100", "translate-y-0");
  };

  const hideTooltip = () => {
    const tooltip = tooltipRef.current;

    if (!tooltip) return;

    tooltip.classList.remove("opacity-100", "translate-y-0");
    tooltip.classList.add("opacity-0", "translate-y-2");
  };

  if (loadError) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-3xl bg-sky-50 px-6 text-center text-sm text-zinc-500">
        지도를 불러오지 못했습니다.
        <br />
        public/maps/korea-provinces.json 파일을 확인해주세요.
      </div>
    );
  }

  if (!geoJson || !pathGenerator) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-3xl bg-sky-50 text-sm text-zinc-500">
        대한민국 분양지도를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="relative h-[520px] touch-none select-none overflow-hidden overscroll-contain rounded-3xl border border-[#d7eaf0] bg-[#eaf5f8]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.95),_transparent_60%)]" />

      <div className="pointer-events-none absolute left-6 top-6 z-20">
        <p className="text-xs font-semibold tracking-wide text-zinc-500">
          HOMEPICK MAP
        </p>

        <h3 className="mt-1 text-2xl font-extrabold text-zinc-900">
          대한민국 분양지도
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          지역 또는 숫자를 눌러 분양 단지를 확인하세요.
        </p>
      </div>

      <div className="absolute right-5 top-5 z-30 flex gap-2">
        <button
          type="button"
          onClick={zoomOut}
          aria-label="지도 축소"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg font-bold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          −
        </button>

        <button
          type="button"
          onClick={resetMap}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          초기화
        </button>

        <button
          type="button"
          onClick={zoomIn}
          aria-label="지도 확대"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg font-bold text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          +
        </button>
      </div>

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute bottom-20 right-6 z-30 translate-y-2 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 opacity-0 shadow-xl transition-all duration-150"
      >
        <p ref={tooltipNameRef} className="text-base font-bold" />

        <p
          ref={tooltipCountRef}
          className="mt-1 text-sm text-zinc-500"
        />
      </div>

      <svg
        viewBox="0 0 580 640"
        role="img"
        aria-label="대한민국 분양지도"
        className="absolute bottom-[-38px] left-1/2 h-[650px] w-[590px] -translate-x-1/2 cursor-grab active:cursor-grabbing"
        onPointerDown={(event) => {
          dragRef.current = {
            active: true,
            moved: false,
            startX: event.clientX,
            startY: event.clientY,
            viewX: viewRef.current.x,
            viewY: viewRef.current.y,
          };

          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current.active) return;

          const dx = event.clientX - dragRef.current.startX;
          const dy = event.clientY - dragRef.current.startY;

          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            dragRef.current.moved = true;
          }

          const svgBounds = event.currentTarget.getBoundingClientRect();

          const adjustedX = dx * (580 / svgBounds.width);
          const adjustedY = dy * (640 / svgBounds.height);

          viewRef.current.x = dragRef.current.viewX + adjustedX;
          viewRef.current.y = dragRef.current.viewY + adjustedY;

          applyTransform();
        }}
        onPointerUp={(event) => {
          dragRef.current.active = false;

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          dragRef.current.active = false;
        }}
        onPointerLeave={() => {
          if (!dragRef.current.active) {
            hideTooltip();
          }
        }}
      >
        <g ref={transformGroupRef}>
          {renderedFeatures.map((item) => {
            const [cx, cy] = item.centroid;

            const selected =
              selectedCity === item.region?.city ||
              selectedCity === item.regionName;

            const handleRegionSelect = () => {
              selectRegion(item.region);
            };

            return (
              <g key={item.key}>
                <path
                  d={item.path}
                  fill={getRegionFill(item.count, selected)}
                  stroke={selected ? "#2fa879" : "#d6dfdc"}
                  strokeWidth={selected ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                  onPointerEnter={() =>
                    showTooltip(item.regionName, item.count)
                  }
                  onPointerLeave={hideTooltip}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (!item.region) return;

                    if (dragRef.current.moved) {
                      dragRef.current.moved = false;
                      return;
                    }

                    handleRegionSelect();
                  }}
                  className={
                    item.region
                      ? "cursor-pointer transition-colors duration-150 hover:fill-[#bdebd6]"
                      : "cursor-default transition-colors duration-150 hover:fill-zinc-100"
                  }
                />

                <text
                  x={cx}
                  y={item.count > 0 ? cy - 22 : cy + 4}
                  textAnchor="middle"
                  className="pointer-events-none select-none fill-zinc-700 text-[12px] font-bold"
                >
                  {item.regionName}
                </text>

                {item.count > 0 && (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.regionName} 분양 단지 ${item.count}개 보기`}
                    onPointerEnter={() =>
                      showTooltip(item.regionName, item.count)
                    }
                    onPointerLeave={hideTooltip}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      dragRef.current.active = false;
                      dragRef.current.moved = false;
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      handleRegionSelect();
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key !== "Enter" &&
                        event.key !== " "
                      ) {
                        return;
                      }

                      event.preventDefault();
                      event.stopPropagation();

                      handleRegionSelect();
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {selected && (
                      <circle
                        cx={cx}
                        cy={cy + 4}
                        r={28}
                        fill="none"
                        stroke="#59c79b"
                        strokeWidth={2}
                        opacity={0.35}
                        className="animate-pulse"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy + 4}
                      r={item.count >= 10 ? 21 : 18}
                      fill={selected ? "#238b68" : "#36a97d"}
                      stroke="#ffffff"
                      strokeWidth={3}
                      vectorEffect="non-scaling-stroke"
                      className="drop-shadow-md transition-colors duration-150 hover:fill-[#238b68]"
                    />

                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      className="pointer-events-none select-none fill-white text-[16px] font-extrabold"
                    >
                      {item.count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-5 left-6 right-6 z-20 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-green-200 bg-white px-3 py-2 font-bold text-green-700 shadow-sm">
          등록 지역
        </span>

        <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-2 text-zinc-500 shadow-sm">
          준비중 지역
        </span>

        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-2 font-bold text-green-700 shadow-sm">
          숫자를 눌러 지역 선택
        </span>
      </div>
    </div>
  );
}

export default memo(KoreaMap);