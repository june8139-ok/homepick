"use client";

import {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  geoMercator,
  geoPath,
} from "d3-geo";

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

type RenderedFeature = {
  key: string;
  regionName: string;
  region?: RegionMapItem;
  count: number;
  path: string;
  centroid: [
    number,
    number,
  ];
};

const nameMap: Record<
  string,
  string
> = {
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
  "Chungcheongbuk-do":
    "충북",
  Chungnam: "충남",
  "Chungcheongnam-do":
    "충남",
  Jeonbuk: "전북",
  "Jeollabuk-do": "전북",
  "Jeonbuk State": "전북",
  Jeonnam: "전남",
  "Jeollanam-do": "전남",
  Gyeongbuk: "경북",
  "Gyeongsangbuk-do":
    "경북",
  Gyeongnam: "경남",
  "Gyeongsangnam-do":
    "경남",
  Jeju: "제주",
  "Jeju-do": "제주",
};

const badgeOffset: Record<
  string,
  {
    x: number;
    y: number;
  }
> = {
  서울: { x: -18, y: -4 },
  인천: { x: -42, y: 18 },
  경기: { x: 24, y: 18 },
  강원: { x: 8, y: 8 },
  충북: { x: 16, y: 10 },
  충남: { x: -20, y: 14 },
  세종: { x: 16, y: -6 },
  대전: { x: 20, y: 20 },
  전북: { x: -8, y: 14 },
  전남: { x: -8, y: 18 },
  광주: { x: -18, y: 18 },
  경북: { x: 20, y: 10 },
  대구: { x: 34, y: 14 },
  경남: { x: 6, y: 18 },
  울산: { x: 34, y: -8 },
  부산: { x: 30, y: 26 },
  제주: { x: 18, y: 8 },
};

const labelOffset: Record<
  string,
  {
    x: number;
    y: number;
  }
> = {
  서울: { x: -28, y: -30 },
  인천: { x: -50, y: -10 },
  경기: { x: 30, y: -22 },
  강원: { x: 18, y: -10 },
  충북: { x: 2, y: -26 },
  충남: { x: -34, y: -12 },
  세종: { x: 22, y: -30 },
  대전: { x: 10, y: -14 },
  전북: { x: -18, y: -10 },
  전남: { x: -18, y: 2 },
  광주: { x: -22, y: -10 },
  경북: { x: 28, y: -18 },
  대구: { x: 42, y: -12 },
  경남: { x: 10, y: 48 },
  울산: { x: 44, y: -30 },
  부산: { x: 34, y: 52 },
  제주: { x: 0, y: -22 },
};

function normalizeRegionName(
  name?: string
) {
  if (!name) {
    return "";
  }

  const cleaned =
    name.trim();

  return (
    nameMap[cleaned] ??
    cleaned
  );
}

function getRegionFill(
  count: number,
  selected: boolean
) {
  if (selected) {
    return "#c9f3df";
  }

  if (count >= 10) {
    return "#5fd1a0";
  }

  if (count >= 5) {
    return "#9ae4c4";
  }

  if (count >= 1) {
    return "#dff7ec";
  }

  return "#fbfaf6";
}

function KoreaMap({
  regions,
  selectedCity,
  onSelect,
}: {
  regions: RegionMapItem[];
  selectedCity?: string;
  onSelect: (
    city: string
  ) => void;
}) {
  const [
    geoJson,
    setGeoJson,
  ] =
    useState<GeoJson | null>(
      null
    );

  const [
    loadError,
    setLoadError,
  ] =
    useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadMap() {
      try {
        const response =
          await fetch(
            "/maps/korea-provinces.json",
            {
              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            `지도 데이터 오류: ${response.status}`
          );
        }

        const data =
          (await response.json()) as GeoJson;

        setGeoJson(data);
      } catch (error) {
        if (
          (error as Error)
            .name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "지도 데이터 로드 실패:",
          error
        );

        setLoadError(true);
      }
    }

    loadMap();

    return () =>
      controller.abort();
  }, []);

  const regionMap =
    useMemo(() => {
      return regions.reduce<
        Record<
          string,
          RegionMapItem
        >
      >(
        (
          accumulator,
          item
        ) => {
          if (item.city) {
            accumulator[
              item.city
            ] = item;
          }

          if (item.cityName) {
            accumulator[
              item.cityName
            ] = item;
          }

          return accumulator;
        },
        {}
      );
    }, [regions]);

  const projection =
    useMemo(() => {
      if (!geoJson) {
        return null;
      }

      return geoMercator().fitExtent(
        [
          [72, 112],
          [508, 590],
        ],
        geoJson as never
      );
    }, [geoJson]);

  const pathGenerator =
    useMemo(() => {
      if (!projection) {
        return null;
      }

      return geoPath().projection(
        projection
      );
    }, [projection]);

  const renderedFeatures =
    useMemo<
      RenderedFeature[]
    >(() => {
      if (
        !geoJson ||
        !pathGenerator
      ) {
        return [];
      }

      return geoJson.features.map(
        (feature, index) => {
          const rawName =
            feature.properties
              .NAME_1 ??
            feature.properties.name ??
            feature.properties
              .NL_NAME_1 ??
            "";

          const regionName =
            normalizeRegionName(
              rawName
            );

          const region =
            regionMap[
              regionName
            ];

          return {
            key: `${regionName}-${index}`,
            regionName,
            region,
            count:
              region?.count ?? 0,
            path:
              pathGenerator(
                feature as never
              ) ?? "",
            centroid:
              pathGenerator.centroid(
                feature as never
              ) as [
                number,
                number,
              ],
          };
        }
      );
    }, [
      geoJson,
      pathGenerator,
      regionMap,
    ]);

  if (loadError) {
    return (
      <div className="flex aspect-[580/640] w-full max-w-[620px] items-center justify-center rounded-3xl bg-sky-50 px-6 text-center text-sm text-zinc-500">
        지도를 불러오지
        못했습니다.
        <br />
        public/maps/korea-provinces.json
        파일을 확인해주세요.
      </div>
    );
  }

  if (
    !geoJson ||
    !pathGenerator
  ) {
    return (
      <div className="flex aspect-[580/640] w-full max-w-[620px] items-center justify-center rounded-3xl bg-sky-50 text-sm text-zinc-500">
        대한민국 분양지도를
        불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="relative aspect-[580/640] w-full max-w-[620px] select-none overflow-hidden rounded-3xl border border-[#d7eaf0] bg-[#eaf5f8] touch-pan-y">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.95),_transparent_60%)]" />

      <div className="pointer-events-none absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <p className="text-[10px] font-semibold tracking-wide text-zinc-500 sm:text-xs">
          집눈 지역지도
        </p>

        <h3 className="mt-1 text-lg font-extrabold text-zinc-900 sm:text-2xl">
          대한민국 분양지도
        </h3>

        <p className="mt-1 text-[10px] text-zinc-500 sm:mt-2 sm:text-sm">
          숫자를 눌러 지역을
          선택하세요.
        </p>
      </div>

      <svg
        viewBox="0 0 580 640"
        role="img"
        aria-label="대한민국 분양지도"
        className="absolute inset-0 h-full w-full"
      >
        {/* 1. 지도 도형을 먼저 전부 그립니다. */}
        {renderedFeatures.map((item) => {
          const selected =
            selectedCity === item.region?.city ||
            selectedCity === item.regionName;

          const selectRegion = () => {
            if (item.region) {
              onSelect(item.region.city);
            }
          };

          return (
            <path
              key={`path-${item.key}`}
              d={item.path}
              fill={getRegionFill(
                item.count,
                selected
              )}
              stroke={
                selected
                  ? "#2fa879"
                  : "#d6dfdc"
              }
              strokeWidth={
                selected ? 2 : 1
              }
              vectorEffect="non-scaling-stroke"
              onClick={selectRegion}
              className={
                item.region
                  ? "cursor-pointer transition-colors duration-150 hover:fill-[#bdebd6]"
                  : "cursor-default"
              }
            />
          );
        })}

        {/* 2. 지역명은 도형 위에 표시합니다. */}
        {renderedFeatures.map((item) => {
          const [
            baseX,
            baseY,
          ] = item.centroid;

          const label =
            labelOffset[
              item.regionName
            ] ?? {
              x: 0,
              y:
                item.count > 0
                  ? -22
                  : 4,
            };

          return (
            <text
              key={`label-${item.key}`}
              x={
                baseX +
                label.x
              }
              y={
                baseY +
                label.y
              }
              textAnchor="middle"
              className="pointer-events-none select-none fill-zinc-700 text-[12px] font-bold"
            >
              {item.regionName}
            </text>
          );
        })}

        {/* 3. 숫자 버튼은 항상 맨 마지막에 그려 어떤 지역 도형에도 가려지지 않게 합니다. */}
        {renderedFeatures.map((item) => {
          if (item.count <= 0) {
            return null;
          }

          const [
            baseX,
            baseY,
          ] = item.centroid;

          const badge =
            badgeOffset[
              item.regionName
            ] ?? {
              x: 0,
              y: 4,
            };

          const cx =
            baseX + badge.x;

          const cy =
            baseY + badge.y;

          const selected =
            selectedCity === item.region?.city ||
            selectedCity === item.regionName;

          const selectRegion = () => {
            if (item.region) {
              onSelect(item.region.city);
            }
          };

          return (
            <g
              key={`badge-${item.key}`}
              role="button"
              tabIndex={0}
              aria-label={`${item.regionName} 분양 단지 ${item.count}개 보기`}
              onClick={selectRegion}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  selectRegion();
                }
              }}
              className="cursor-pointer outline-none"
            >
              {selected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={29}
                  fill="none"
                  stroke="#59c79b"
                  strokeWidth={2}
                  opacity={0.35}
                  className="animate-pulse"
                />
              )}

              <circle
                cx={cx}
                cy={cy}
                r={
                  item.count >= 10
                    ? 21
                    : 18
                }
                fill={
                  selected
                    ? "#238b68"
                    : "#00a97a"
                }
                stroke="#ffffff"
                strokeWidth={3}
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-md transition-colors duration-150 hover:fill-[#238b68]"
              />

              <text
                x={cx}
                y={cy + 6}
                textAnchor="middle"
                className="pointer-events-none select-none fill-white text-[16px] font-extrabold"
              >
                {item.count}
              </text>
            </g>
          );
        })}

      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex flex-wrap gap-1.5 text-[9px] sm:bottom-5 sm:left-6 sm:right-6 sm:gap-2 sm:text-xs">
        <span className="rounded-full border border-green-200 bg-white px-2.5 py-1.5 font-bold text-green-700 shadow-sm sm:px-3 sm:py-2">
          등록 지역
        </span>

        <span className="rounded-full border border-zinc-200 bg-white/90 px-2.5 py-1.5 text-zinc-500 shadow-sm sm:px-3 sm:py-2">
          준비중 지역
        </span>

        <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1.5 font-bold text-green-700 shadow-sm sm:px-3 sm:py-2">
          숫자를 눌러 선택
        </span>
      </div>
    </div>
  );
}

export default memo(
  KoreaMap
);