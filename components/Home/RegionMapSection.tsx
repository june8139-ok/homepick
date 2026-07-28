"use client";

import Image from "next/image";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type {
  Apartment,
} from "../../types/apartment";

import {
  getApartmentRegionKey,
} from "../../lib/regionUtils";

import {
  getHomeVisibleApartments,
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

import KoreaMap from "../map/KoreaMap";

type RegionItem = {
  city: string;
  cityName: string;

  count: number;
  saleCount: number;
  subscriptionCount: number;
  firstComeCount: number;

  representativeApartment:
    Apartment | null;
};

function getHeroImage(
  apartment?: Apartment | null
) {
  if (!apartment) {
    return "";
  }

  const hero =
    apartment.images?.hero;

  if (
    typeof hero === "string" &&
    hero.trim() &&
    !hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return hero;
  }

  const gallery =
    apartment.images?.gallery ?? [];

  return (
    gallery.find(
      (image) =>
        Boolean(image) &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
}

function getStatusPriority(
  apartment: Apartment
) {
  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return 4;
  }

  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return 3;
  }

  if (
    getHeroImage(apartment)
  ) {
    return 2;
  }

  return 1;
}

function getRepresentativeInfo(
  apartment?: Apartment | null
) {
  if (!apartment) {
    return "등록된 대표 단지가 없습니다.";
  }

  return (
    apartment.condition ||
    apartment.price ||
    apartment.region ||
    "상세정보를 확인해보세요."
  );
}

export default function RegionMapSection({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router =
    useRouter();

  const visibleApartments =
    useMemo(
      () =>
        getHomeVisibleApartments(
          apartments
        ),
      [apartments]
    );

  const regions =
    useMemo<RegionItem[]>(() => {
      const accumulator =
        new Map<
          string,
          Apartment[]
        >();

      visibleApartments.forEach(
        (apartment) => {
          const regionKey =
            getApartmentRegionKey(
              apartment
            );

          if (!regionKey) {
            return;
          }

          const current =
            accumulator.get(
              regionKey
            ) ?? [];

          current.push(apartment);

          accumulator.set(
            regionKey,
            current
          );
        }
      );

      return Array.from(
        accumulator.entries()
      )
        .map(
          ([
            regionKey,
            regionApartments,
          ]): RegionItem => {
            const sortedApartments = [
              ...regionApartments,
            ].sort(
              (a, b) =>
                getStatusPriority(b) -
                getStatusPriority(a)
            );

            const subscriptionCount =
              regionApartments.filter(
                isSubscriptionApartment
              ).length;

            const firstComeCount =
              regionApartments.filter(
                (apartment) =>
                  !isSubscriptionApartment(
                    apartment
                  ) &&
                  isFirstComeApartment(
                    apartment
                  )
              ).length;

            const saleCount =
              regionApartments.filter(
                (apartment) =>
                  !isSubscriptionApartment(
                    apartment
                  ) &&
                  !isFirstComeApartment(
                    apartment
                  )
              ).length;

            return {
              city: regionKey,
              cityName: regionKey,

              count:
                regionApartments.length,

              saleCount,
              subscriptionCount,
              firstComeCount,

              representativeApartment:
                sortedApartments[0] ??
                null,
            };
          }
        )
        .sort((a, b) => {
          if (
            b.count !== a.count
          ) {
            return (
              b.count - a.count
            );
          }

          return a.cityName.localeCompare(
            b.cityName,
            "ko"
          );
        });
    }, [visibleApartments]);

  const [
    selectedCity,
    setSelectedCity,
  ] = useState("");

  const selectedRegion =
    regions.find(
      (region) =>
        region.city ===
        selectedCity
    ) ??
    regions[0] ??
    null;

  const selectedApartment =
    selectedRegion
      ?.representativeApartment ??
    null;

  const selectedImage =
    getHeroImage(
      selectedApartment
    );

  const openSelectedRegion =
    () => {
      if (!selectedRegion) {
        return;
      }

      router.push(
        `/region/${encodeURIComponent(
          selectedRegion.city
        )}`
      );
    };

  const openRepresentativeApartment =
    () => {
      if (!selectedApartment) {
        openSelectedRegion();
        return;
      }

      router.push(
        `/apartments/${selectedApartment.slug}`
      );
    };

  if (
    regions.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#0F766E]">
            집눈 지역지도
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#111827]">
            지역별로 찾아보기
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            지도 위 지역이나 숫자를 누르면
            해당 지역의 분양 현황을 확인할 수
            있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/region")
          }
          className="
            inline-flex min-h-10
            cursor-pointer items-center
            justify-center rounded-xl
            border border-zinc-200
            bg-white px-4 py-2
            text-sm font-bold
            text-zinc-700 shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-emerald-300
            hover:bg-emerald-50
            hover:text-emerald-700
            hover:shadow-md
            active:translate-y-0
            active:scale-[0.98]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
          "
        >
          전체 지역 보기 →
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="flex min-w-0 justify-center">
          <KoreaMap
            regions={regions}
            selectedCity={
              selectedRegion?.city
            }
            onSelect={
              setSelectedCity
            }
          />
        </div>

        <aside
          key={
            selectedRegion?.city
          }
          className="
            hidden min-h-[520px]
            min-w-0 animate-[fadeIn_220ms_ease-out]
            flex-col overflow-hidden xl:flex
            rounded-3xl border
            border-zinc-200 bg-white
            shadow-sm
          "
        >
          <button
            type="button"
            onClick={
              openRepresentativeApartment
            }
            className="
              group relative block
              h-[210px] w-full
              shrink-0 cursor-pointer
              overflow-hidden bg-zinc-100
              text-left
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500
              focus-visible:ring-inset
            "
          >
            {selectedImage ? (
              <Image
                src={
                  selectedImage
                }
                alt={
                  selectedApartment
                    ?.name ||
                  `${selectedRegion?.cityName} 대표 단지`
                }
                fill
                sizes="360px"
                className="
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50">
                <div className="text-center">
                  <span className="text-5xl">
                    🏢
                  </span>

                  <p className="mt-3 text-xs font-bold text-zinc-400">
                    대표 이미지 준비 중
                  </p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-emerald-700 shadow-sm backdrop-blur">
                선택한 지역
              </span>

              <p className="mt-2 text-3xl font-black text-white">
                {
                  selectedRegion
                    ?.cityName
                }
              </p>
            </div>
          </button>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-400">
                  등록된 부동산
                </p>

                <p className="mt-1 text-4xl font-black tracking-tight text-[#111827]">
                  {
                    selectedRegion
                      ?.count ?? 0
                  }
                  <span className="ml-1 text-base font-bold text-zinc-500">
                    개 단지
                  </span>
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                실시간 현황
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <RegionCountBox
                label="분양"
                count={
                  selectedRegion
                    ?.saleCount ?? 0
                }
                accent="amber"
              />

              <RegionCountBox
                label="청약"
                count={
                  selectedRegion
                    ?.subscriptionCount ??
                  0
                }
                accent="blue"
              />

              <RegionCountBox
                label="선착순"
                count={
                  selectedRegion
                    ?.firstComeCount ?? 0
                }
                accent="emerald"
              />
            </div>

            <button
              type="button"
              onClick={
                openRepresentativeApartment
              }
              className="
                group mt-5 w-full
                cursor-pointer rounded-2xl
                border border-zinc-200
                bg-[#F8FAF7] p-4
                text-left transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold text-zinc-400">
                  대표 단지
                </p>

                <span className="text-xs font-bold text-emerald-700 transition-transform group-hover:translate-x-1">
                  상세보기 →
                </span>
              </div>

              <h3 className="mt-2 line-clamp-2 break-keep text-base font-black leading-6 text-[#111827]">
                {
                  selectedApartment
                    ?.name ||
                  "등록 준비 중"
                }
              </h3>

              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                {getRepresentativeInfo(
                  selectedApartment
                )}
              </p>
            </button>

            <button
              type="button"
              onClick={
                openSelectedRegion
              }
              className="
                mt-auto inline-flex min-h-12
                w-full cursor-pointer
                items-center justify-center
                rounded-2xl bg-[#0F766E]
                px-5 py-3 text-sm
                font-extrabold text-white
                shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-emerald-600
                hover:shadow-lg
                active:translate-y-0
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              {
                selectedRegion
                  ?.cityName
              }{" "}
              전체보기
              <span className="ml-2">
                →
              </span>
            </button>
          </div>
        </aside>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:hidden">
        {regions.map(
          (region) => {
            const selected =
              region.city ===
              selectedRegion?.city;

            return (
              <button
                key={
                  region.city
                }
                type="button"
                onClick={() =>
                  setSelectedCity(
                    region.city
                  )
                }
                className={[
                  "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition-all",
                  selected
                    ? "border-[#0F766E] bg-[#0F766E] text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                ].join(" ")}
              >
                {region.cityName}{" "}
                {region.count}
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}

function RegionCountBox({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent:
    | "amber"
    | "blue"
    | "emerald";
}) {
  const style = {
    amber: {
      box: "bg-amber-50",
      label: "text-amber-700",
      value: "text-amber-800",
    },

    blue: {
      box: "bg-blue-50",
      label: "text-blue-700",
      value: "text-blue-800",
    },

    emerald: {
      box: "bg-emerald-50",
      label: "text-emerald-700",
      value: "text-emerald-800",
    },
  }[accent];

  return (
    <div
      className={[
        "rounded-2xl px-2 py-4 text-center",
        style.box,
      ].join(" ")}
    >
      <p
        className={[
          "text-[11px] font-extrabold",
          style.label,
        ].join(" ")}
      >
        {label}
      </p>

      <p
        className={[
          "mt-1 text-2xl font-black",
          style.value,
        ].join(" ")}
      >
        {count}
      </p>
    </div>
  );
}
