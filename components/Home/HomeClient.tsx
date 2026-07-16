"use client";

import Link from "next/link";
import {
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type { Apartment } from "../../types/apartment";

import {
  getHomeVisibleApartments,
  getSubscriptionSortDate,
  getVisibleSubscriptions,
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

import SearchHero from "./SearchHero";
import RegionMapSection from "./RegionMapSection";

const regionNames = [
  "서울",
  "경기",
  "인천",
  "대전",
  "세종",
  "충남",
  "충북",
  "부산",
  "대구",
  "울산",
  "경남",
  "경북",
  "광주",
  "전남",
  "전북",
  "강원",
  "제주",
];

type MapRegion = {
  city: string;
  cityName: string;
  count: number;
  saleCount: number;
  subscriptionCount: number;
  firstComeCount: number;
  representativeApartment: string;
};

function getHeroImage(
  apartment: Apartment
) {
  const hero = apartment.images?.hero;

  if (Array.isArray(hero)) {
    return hero[0] ?? "";
  }

  return typeof hero === "string"
    ? hero
    : "";
}

function isManualApartment(
  apartment: Apartment
) {
  return (
    apartment.source !== "applyhome" &&
    apartment.isAutoCreated !== true
  );
}

export default function HomeClient({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router = useRouter();

  const visibleApartments = useMemo(
    () =>
      getHomeVisibleApartments(
        apartments
      ),
    [apartments]
  );

  /*
   * 홈에 노출할 수 있는 전체 청약.
   * 숫자 카드에서는 전체 개수를 사용하고,
   * 대시보드에는 앞의 3개만 표시한다.
   */
  const allSubscriptions = useMemo(
    () =>
      getVisibleSubscriptions(
        apartments
      ).sort(
        (a, b) =>
          getSubscriptionSortDate(a) -
          getSubscriptionSortDate(b)
      ),
    [apartments]
  );

  const subscriptions = useMemo(
    () => allSubscriptions.slice(0, 3),
    [allSubscriptions]
  );

  const manualApartments = useMemo(
    () =>
      visibleApartments.filter(
        (apartment) =>
          !isSubscriptionApartment(
            apartment
          ) &&
          isManualApartment(apartment)
      ),
    [visibleApartments]
  );

  const allFirstComeApartments =
    useMemo(
      () =>
        manualApartments.filter(
          isFirstComeApartment
        ),
      [manualApartments]
    );

  const firstComeApartments = useMemo(
    () =>
      allFirstComeApartments.slice(0, 3),
    [allFirstComeApartments]
  );

  const recentApartments = useMemo(
    () => manualApartments.slice(0, 4),
    [manualApartments]
  );

  const mapRegions =
    useMemo<MapRegion[]>(() => {
      const accumulator: Record<
        string,
        MapRegion
      > = {};

      visibleApartments.forEach(
        (apartment) => {
          if (!apartment.city) {
            return;
          }

          if (
            !accumulator[apartment.city]
          ) {
            accumulator[apartment.city] =
              {
                city: apartment.city,

                cityName:
                  apartment.cityName ||
                  apartment.city,

                count: 0,
                saleCount: 0,
                subscriptionCount: 0,
                firstComeCount: 0,

                representativeApartment:
                  apartment.name,
              };
          }

          const region =
            accumulator[apartment.city];

          region.count += 1;

          if (
            isSubscriptionApartment(
              apartment
            )
          ) {
            region.subscriptionCount += 1;
          } else if (
            isFirstComeApartment(
              apartment
            )
          ) {
            region.firstComeCount += 1;
          } else {
            region.saleCount += 1;
          }
        }
      );

      return Object.values(
        accumulator
      ).sort((a, b) => b.count - a.count);
    }, [visibleApartments]);

  const openApartment = (
    slug: string
  ) => {
    router.push(`/apartments/${slug}`);
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-5 text-[#111827]">
      <section className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <SearchHero
          apartments={visibleApartments}
        />

        {/* 핵심 현황 */}
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="진행 중 청약"
            value={allSubscriptions.length}
            icon="▣"
            accent="blue"
            onClick={() =>
              router.push(
                "/search?q=청약"
              )
            }
          />

          <SummaryCard
            label="선착순 분양"
            value={
              allFirstComeApartments.length
            }
            icon="⌂"
            accent="emerald"
            onClick={() =>
              router.push(
                "/search?q=선착순"
              )
            }
          />

          <SummaryCard
            label="최근 등록"
            value={recentApartments.length}
            icon="+"
            accent="amber"
            onClick={() =>
              router.push("/search")
            }
          />
        </section>

        {/* 청약·선착순·최근 등록 */}
        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_0.78fr]">
          <DashboardPanel
            title="진행 중 청약"
            href="/search?q=청약"
          >
            {subscriptions.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {subscriptions.map(
                  (apartment) => (
                    <CompactApartmentCard
                      key={apartment.slug}
                      apartment={apartment}
                      type="subscription"
                      onClick={() =>
                        openApartment(
                          apartment.slug
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyMessage text="현재 진행 중인 청약이 없습니다." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="선착순 분양"
            href="/search?q=선착순"
          >
            {firstComeApartments.length >
            0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {firstComeApartments.map(
                  (apartment) => (
                    <CompactApartmentCard
                      key={apartment.slug}
                      apartment={apartment}
                      type="sale"
                      onClick={() =>
                        openApartment(
                          apartment.slug
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyMessage text="현재 확인된 선착순 단지가 없습니다." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="최근 등록"
            href="/search"
          >
            {recentApartments.length > 0 ? (
              <div className="grid gap-1">
                {recentApartments.map(
                  (apartment) => (
                    <RecentApartmentRow
                      key={apartment.slug}
                      apartment={apartment}
                      onClick={() =>
                        openApartment(
                          apartment.slug
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyMessage text="최근 등록 단지가 없습니다." />
            )}
          </DashboardPanel>
        </section>

        {/* 대한민국 부동산지도 */}
        <RegionMapSection
          apartments={visibleApartments}
        />

        {/* 지역 바로가기 */}
        <section className="mt-4 rounded-3xl border border-zinc-200 bg-white px-5 py-5 shadow-sm sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="shrink-0">
              <h2 className="text-lg font-black text-[#111827]">
                지역 바로가기
              </h2>
            </div>

            <div className="flex flex-1 flex-wrap gap-2 lg:justify-center">
              {regionNames.map((region) => (
                <Link
                  key={region}
                  href={`/search?q=${encodeURIComponent(
                    region
                  )}`}
                  className="
                    inline-flex min-h-9
                    min-w-[60px]
                    items-center justify-center
                    rounded-full bg-zinc-50
                    px-3 py-2 text-xs
                    font-bold text-zinc-600
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-emerald-50
                    hover:text-emerald-700
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-500
                    focus-visible:ring-offset-2
                  "
                >
                  {region}
                </Link>
              ))}
            </div>

            <Link
              href="/region"
              className="shrink-0 text-sm font-bold text-emerald-700 transition hover:translate-x-0.5"
            >
              전체 지역 보기 →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  icon: string;
  accent:
    | "blue"
    | "emerald"
    | "amber";
  onClick: () => void;
}) {
  const style = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-blue-700",
      border: "hover:border-blue-300",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
      border:
        "hover:border-emerald-300",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-700",
      border: "hover:border-amber-300",
    },
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-h-[84px] w-full cursor-pointer items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-left shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "active:translate-y-0 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        style.border,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black",
          style.icon,
        ].join(" ")}
      >
        {icon}
      </span>

      <div>
        <p className="text-xs font-bold text-zinc-500">
          {label}
        </p>

        <p
          className={[
            "mt-1 text-2xl font-black",
            style.value,
          ].join(" ")}
        >
          {value}

          <span className="ml-1 text-sm font-bold text-zinc-500">
            개 단지
          </span>
        </p>
      </div>

      <span className="ml-auto text-zinc-300 transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}

function DashboardPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-[#111827]">
          {title}
        </h2>

        <Link
          href={href}
          className="shrink-0 text-xs font-bold text-zinc-500 transition-all duration-200 hover:translate-x-0.5 hover:text-emerald-700"
        >
          전체보기 →
        </Link>
      </div>

      {children}
    </section>
  );
}

function CompactApartmentCard({
  apartment,
  type,
  onClick,
}: {
  apartment: Apartment;
  type: "subscription" | "sale";
  onClick: () => void;
}) {
  const image =
    getHeroImage(apartment);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group min-w-0 cursor-pointer
        overflow-hidden rounded-2xl
        border border-zinc-200
        bg-white text-left
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-emerald-300
        hover:shadow-md
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-500
        focus-visible:ring-offset-2
      "
    >
      <div className="relative h-28 overflow-hidden bg-zinc-100">
        {image ? (
          <img
            src={image}
            alt={apartment.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-zinc-400">
            이미지 준비 중
          </div>
        )}

        <span
          className={[
            "absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold shadow-sm",
            type === "subscription"
              ? "bg-blue-600 text-white"
              : "bg-emerald-600 text-white",
          ].join(" ")}
        >
          {apartment.status ||
            (type === "subscription"
              ? "청약"
              : "선착순")}
        </span>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 break-keep text-sm font-extrabold leading-5 text-[#111827]">
          {apartment.name}
        </h3>

        <p className="mt-1 truncate text-[11px] text-zinc-500">
          {apartment.cityName ||
            apartment.region}
        </p>

        <p className="mt-2 truncate text-xs font-bold text-emerald-700">
          {apartment.price ||
            apartment.condition ||
            "상세정보 확인"}
        </p>
      </div>
    </button>
  );
}

function RecentApartmentRow({
  apartment,
  onClick,
}: {
  apartment: Apartment;
  onClick: () => void;
}) {
  const image =
    getHeroImage(apartment);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full
        cursor-pointer items-center
        gap-3 rounded-2xl
        border border-transparent
        p-2 text-left
        transition-all duration-200
        hover:border-emerald-200
        hover:bg-emerald-50/50
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-500
        focus-visible:ring-offset-2
      "
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        {image ? (
          <img
            src={image}
            alt={apartment.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
            이미지
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-[#111827] transition-colors group-hover:text-emerald-700">
          {apartment.name}
        </p>

        <p className="mt-1 truncate text-xs text-zinc-500">
          {apartment.cityName ||
            apartment.region}
        </p>

        <p className="mt-1 truncate text-xs font-bold text-zinc-700">
          {apartment.price ||
            apartment.condition ||
            "정보 확인"}
        </p>
      </div>
    </button>
  );
}

function EmptyMessage({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-zinc-50 px-4 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}