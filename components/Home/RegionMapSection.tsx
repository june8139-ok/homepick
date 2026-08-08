"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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


const NEW_WINDOW_DAYS = 7;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function getKstDayNumber(
  value: string | Date
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.floor(
    (date.getTime() + KST_OFFSET_MS) /
      DAY_MS
  );
}

function isRecentRegistration(
  apartment: Apartment
) {
  if (!apartment.createdAt) {
    return false;
  }

  const createdDay =
    getKstDayNumber(
      apartment.createdAt
    );

  const today =
    getKstDayNumber(new Date());

  if (
    createdDay === null ||
    today === null
  ) {
    return false;
  }

  const dayDiff =
    today - createdDay;

  return (
    dayDiff >= 0 &&
    dayDiff < NEW_WINDOW_DAYS
  );
}

function getCreatedTime(
  apartment: Apartment
) {
  if (!apartment.createdAt) {
    return 0;
  }

  const time = new Date(
    apartment.createdAt
  ).getTime();

  return Number.isFinite(time)
    ? time
    : 0;
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

  const visibleApartments =
    useMemo(
      () =>
        getHomeVisibleApartments(
          apartments
        ),
      [apartments]
    );

  const recentApartments =
    useMemo(
      () =>
        visibleApartments.filter(
          isRecentRegistration
        ),
      [visibleApartments]
    );

  const regions =
    useMemo<RegionItem[]>(() => {
      const accumulator =
        new Map<
          string,
          Apartment[]
        >();

      recentApartments.forEach(
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
            ].sort((a, b) => {
              const createdDiff =
                getCreatedTime(b) -
                getCreatedTime(a);

              if (createdDiff !== 0) {
                return createdDiff;
              }

              return (
                getStatusPriority(b) -
                getStatusPriority(a)
              );
            });

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
    }, [recentApartments]);

  const [
    selectedCity,
    setSelectedCity,
  ] = useState("");

  const mobileCardRefs =
    useRef<
      Map<string, HTMLDivElement>
    >(new Map());

  const mobileCardScrollerRef =
    useRef<HTMLDivElement | null>(
      null
    );

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

  useEffect(() => {
    const city =
      selectedRegion?.city;

    const scroller =
      mobileCardScrollerRef.current;

    if (
      !city ||
      !scroller
    ) {
      return;
    }

    const card =
      mobileCardRefs.current.get(
        city
      );

    if (!card) {
      return;
    }

    /*
     * scrollIntoView는 지도가 늦게 로드될 때
     * 홈페이지 전체를 지역지도 위치까지 세로로 이동시킬 수 있습니다.
     * 모바일 카드 컨테이너의 가로 위치만 이동합니다.
     */
    const targetLeft =
      card.offsetLeft -
      (scroller.clientWidth -
        card.offsetWidth) /
        2;

    scroller.scrollTo({
      left: Math.max(
        0,
        targetLeft
      ),
      behavior: "smooth",
    });
  }, [selectedRegion?.city]);

  if (
    regions.length === 0
  ) {
    return (
      <section className="relative isolate mt-6 overflow-hidden rounded-[30px] border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fcfa_62%,#fbfdff_100%)] p-5 shadow-[0_20px_55px_rgba(15,118,110,0.07)] sm:p-7 lg:p-9">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#0F766E]">
              집눈 신규 분양지도
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
              신규 등록 지역
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              최근 7일 동안 새로 등록된 분양정보가 없습니다.
            </p>
          </div>

          <Link
            href="/region"
            className="inline-flex min-h-10 shrink-0 self-start items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 lg:self-auto"
          >
            전체 지역 보기 →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate mt-6 overflow-hidden rounded-[30px] border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fcfa_62%,#fbfdff_100%)] p-4 shadow-[0_20px_55px_rgba(15,118,110,0.07)] sm:p-7 lg:p-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-100/55 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-[18%] h-64 w-64 rounded-full bg-sky-100/45 blur-3xl"
      />
      <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] text-[#0F766E]">
            집눈 신규 분양지도
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#111827] sm:text-3xl">
            신규 등록 지역
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            최근 7일 동안 새로 등록된 단지가 있는 지역만
            표시합니다. 숫자를 누르면 신규 단지를 확인할 수 있습니다.
          </p>
        </div>

        <Link
          href="/region"
          className="
            inline-flex min-h-10 shrink-0 self-start
            cursor-pointer items-center
            lg:self-auto
            justify-center rounded-xl
            border border-emerald-200
            bg-white/90 px-4 py-2
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
        </Link>
      </div>

      <div className="relative z-10 mx-auto mt-5 grid w-full max-w-[1220px] gap-5 xl:grid-cols-[minmax(0,760px)_430px] xl:items-stretch xl:justify-center">
        <div className="relative isolate flex min-w-0 justify-center overflow-hidden rounded-[28px] border border-emerald-100/90 bg-white/75 shadow-[0_18px_45px_rgba(15,118,110,0.06)] [contain:paint]">
          <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-full border border-emerald-200 bg-white/92 px-3.5 py-2 shadow-sm backdrop-blur">
            <p className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-emerald-500"
              />
              {selectedRegion?.cityName}
              <span className="font-bold text-zinc-500">
                NEW {selectedRegion?.count ?? 0}
              </span>
            </p>
          </div>

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
            hidden min-h-[560px] h-full
            min-w-0 animate-[fadeIn_220ms_ease-out]
            flex-col overflow-hidden xl:flex
            rounded-[28px] border border-emerald-100 bg-white/95
            shadow-[0_20px_48px_rgba(15,118,110,0.09)]
          "
        >
          <Link
            href={
              selectedApartment
                ? `/apartments/${selectedApartment.slug}`
                : `/region/${encodeURIComponent(
                    selectedRegion?.city ?? ""
                  )}`
            }
            className="
              group relative block
              h-[225px] w-full
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
                loading="lazy"
                quality={68}
                sizes="410px"
                className="
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />
            ) : (
              <div className="relative flex h-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#dff7ec_0%,#effcf7_50%,#edf7ff_100%)]">
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/70 blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(to_top,rgba(15,118,110,0.10),transparent)]"
                />

                <div className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-4xl shadow-sm">
                    🏢
                  </div>
                  <p className="mt-3 text-xs font-extrabold text-emerald-700/70">
                    {selectedRegion?.cityName} 대표 단지
                  </p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-extrabold text-emerald-700 shadow-sm backdrop-blur">
                신규 등록 지역
              </span>

              <p className="mt-2 text-3xl font-black text-white">
                {
                  selectedRegion
                    ?.cityName
                }
              </p>
            </div>
          </Link>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-400">
                  최근 7일 신규 등록
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

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                7일 롤링
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

            <Link
              href={
                selectedApartment
                  ? `/apartments/${selectedApartment.slug}`
                  : `/region/${encodeURIComponent(
                      selectedRegion?.city ?? ""
                    )}`
              }
              className="
                group mt-5 w-full
                cursor-pointer rounded-2xl
                border border-emerald-100
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
            </Link>

            <Link
              href={`/region/${encodeURIComponent(
                selectedRegion?.city ?? ""
              )}`}
              className="
                mt-auto inline-flex min-h-12
                w-full cursor-pointer
                items-center justify-center
                rounded-2xl bg-[linear-gradient(90deg,#0F766E_0%,#0D9488_100%)]
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
            </Link>
          </div>
        </aside>
      </div>

      {/* 모바일·태블릿 지역 요약 카드 슬라이드 */}
      <div className="mt-4 xl:hidden">
        <div
          ref={mobileCardScrollerRef}
          className="-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-5 sm:px-5"
        >
          <div className="flex w-max gap-3">
            {regions.map(
              (region) => {
                const selected =
                  region.city ===
                  selectedRegion?.city;

                const representative =
                  region.representativeApartment;

                return (
                  <div
                    key={region.city}
                    ref={(element) => {
                      if (element) {
                        mobileCardRefs.current.set(
                          region.city,
                          element
                        );
                      } else {
                        mobileCardRefs.current.delete(
                          region.city
                        );
                      }
                    }}
                    className={[
                      "w-[82vw] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,118,110,0.06)] transition-all sm:w-[360px]",
                      selected
                        ? "border-emerald-300 ring-2 ring-emerald-100"
                        : "border-emerald-100",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCity(
                          region.city
                        )
                      }
                      className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-zinc-400">
                            선택 지역
                          </p>

                          <h3 className="mt-1 text-xl font-black text-[#111827]">
                            {region.cityName}
                          </h3>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                          NEW {region.count}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <MobileCountBox
                          label="분양"
                          count={
                            region.saleCount
                          }
                          accent="amber"
                        />

                        <MobileCountBox
                          label="청약"
                          count={
                            region.subscriptionCount
                          }
                          accent="blue"
                        />

                        <MobileCountBox
                          label="선착순"
                          count={
                            region.firstComeCount
                          }
                          accent="emerald"
                        />
                      </div>

                      <div className="mt-3 rounded-xl bg-[#F8FAF7] px-3 py-2.5">
                        <p className="text-[10px] font-bold text-zinc-400">
                          대표 단지
                        </p>

                        <p className="mt-1 line-clamp-1 text-sm font-black text-[#111827]">
                          {representative?.name ||
                            "등록 준비 중"}
                        </p>
                      </div>
                    </button>

                    <Link
                      href={`/region/${encodeURIComponent(
                        region.city
                      )}`}
                      className="mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-[#0F766E] px-4 text-xs font-extrabold text-white transition hover:bg-emerald-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      {region.cityName} 지역 보기 →
                    </Link>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <p className="mt-1 text-center text-[10px] leading-5 text-zinc-400">
          지도 숫자를 누르거나 카드를 좌우로 밀어 신규 등록 지역을 확인하세요.
        </p>
      </div>
    </section>
  );
}

function MobileCountBox({
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
    amber:
      "bg-amber-50 text-amber-800",
    blue:
      "bg-blue-50 text-blue-800",
    emerald:
      "bg-emerald-50 text-emerald-800",
  }[accent];

  return (
    <div
      className={[
        "rounded-xl px-2 py-2.5 text-center",
        style,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold opacity-75">
        {label}
      </p>

      <p className="mt-0.5 text-lg font-black">
        {count}
      </p>
    </div>
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