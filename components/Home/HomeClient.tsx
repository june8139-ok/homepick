"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import type { Apartment } from "../../types/apartment";
import type { Briefing } from "../../types/briefing";

import {
  getHomeVisibleApartments,
  getSubscriptionSortDate,
  getVisibleSubscriptions,
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

import SearchHero from "./SearchHero";
import DeferredRegionMapSection from "./DeferredRegionMapSection";
import HomeBriefingSection from "./HomeBriefingSection";

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

function getHeroImage(
  apartment: Apartment
) {
  const hero = apartment.images?.hero;

  if (
    typeof hero === "string" &&
    hero.trim() &&
    !hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        Boolean(image) &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
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
  briefings,
}: {
  apartments: Apartment[];
  briefings: Briefing[];
}) {
  const router = useRouter();

  const visibleApartments = useMemo(
    () =>
      getHomeVisibleApartments(
        apartments
      ),
    [apartments]
  );

  const allSubscriptions = useMemo(
    () =>
      getVisibleSubscriptions(
        apartments
      ).sort(
        (first, second) =>
          getSubscriptionSortDate(first) -
          getSubscriptionSortDate(second)
      ),
    [apartments]
  );

  const subscriptions = useMemo(
    () =>
      allSubscriptions.slice(0, 6),
    [allSubscriptions]
  );

  const nonSubscriptionApartments =
    useMemo(
      () =>
        visibleApartments.filter(
          (apartment) =>
            !isSubscriptionApartment(
              apartment
            )
        ),
      [visibleApartments]
    );

  const allFirstComeApartments =
    useMemo(
      () =>
        nonSubscriptionApartments.filter(
          isFirstComeApartment
        ),
      [nonSubscriptionApartments]
    );

  const firstComeApartments = useMemo(
    () =>
      allFirstComeApartments.slice(
        0,
        6
      ),
    [allFirstComeApartments]
  );

  const recentApartments = useMemo(
    () =>
      nonSubscriptionApartments
        .filter(isManualApartment)
        .slice(0, 4),
    [nonSubscriptionApartments]
  );

  const openApartment = (
    slug: string
  ) => {
    router.push(
      `/apartments/${slug}`
    );
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] py-3 text-[#111827] sm:py-5">
      <section className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 lg:px-8">
        <SearchHero
          apartments={visibleApartments}
        />

        {/* 핵심 현황 */}
        <section className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
          <SummaryCard
            label="진행 중 청약"
            mobileLabel="청약"
            value={
              allSubscriptions.length
            }
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
            mobileLabel="선착순"
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
            mobileLabel="최근등록"
            value={
              recentApartments.length
            }
            icon="+"
            accent="amber"
            onClick={() =>
              router.push("/search")
            }
          />
        </section>

        {/* 모바일 청약 */}
        <div className="mt-3 sm:hidden">
          <MobileDashboardPanel
            title="진행 중 청약"
            href="/search?q=청약"
          >
            {subscriptions.length >
            0 ? (
              <MobileApartmentCarousel
                apartments={
                  subscriptions
                }
                type="subscription"
                onOpen={
                  openApartment
                }
              />
            ) : (
              <EmptyMessage
                text="현재 진행 중인 청약이 없습니다."
                compact
              />
            )}
          </MobileDashboardPanel>
        </div>

        {/* 모바일 선착순 */}
        <div className="mt-3 sm:hidden">
          <MobileDashboardPanel
            title="선착순 분양"
            href="/search?q=선착순"
          >
            {firstComeApartments.length >
            0 ? (
              <MobileApartmentCarousel
                apartments={
                  firstComeApartments
                }
                type="sale"
                onOpen={
                  openApartment
                }
              />
            ) : (
              <EmptyMessage
                text="현재 확인된 선착순 단지가 없습니다."
                compact
              />
            )}
          </MobileDashboardPanel>
        </div>

        {/* 모바일 최근 등록 */}
        <div className="mt-3 sm:hidden">
          <MobileDashboardPanel
            title="최근 등록"
            href="/search"
          >
            {recentApartments.length >
            0 ? (
              <div className="grid gap-1">
                {recentApartments.map(
                  (apartment) => (
                    <RecentApartmentRow
                      key={
                        apartment.slug
                      }
                      apartment={
                        apartment
                      }
                      compact
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
              <EmptyMessage
                text="최근 등록 단지가 없습니다."
                compact
              />
            )}
          </MobileDashboardPanel>
        </div>

        {/* PC·태블릿 대시보드 */}
        <section className="mt-4 hidden gap-4 sm:grid xl:grid-cols-[1fr_1fr_0.78fr]">
          <DashboardPanel
            title="진행 중 청약"
            href="/search?q=청약"
          >
            {subscriptions.length >
            0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {subscriptions
                  .slice(0, 3)
                  .map(
                    (apartment) => (
                      <CompactApartmentCard
                        key={
                          apartment.slug
                        }
                        apartment={
                          apartment
                        }
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
                {firstComeApartments
                  .slice(0, 3)
                  .map(
                    (apartment) => (
                      <CompactApartmentCard
                        key={
                          apartment.slug
                        }
                        apartment={
                          apartment
                        }
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
            {recentApartments.length >
            0 ? (
              <div className="grid gap-1">
                {recentApartments.map(
                  (apartment) => (
                    <RecentApartmentRow
                      key={
                        apartment.slug
                      }
                      apartment={
                        apartment
                      }
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

        <DeferredRegionMapSection
          apartments={
            visibleApartments
          }
        />

        {/* 지역 바로가기 */}
        <section className="relative z-20 mt-3 rounded-2xl border border-zinc-200 bg-white px-3 py-4 shadow-sm sm:mt-4 sm:rounded-3xl sm:px-7 sm:py-5">
          <div className="flex items-center justify-between gap-3 sm:block lg:flex lg:items-center">
            <h2 className="text-base font-black text-[#111827] sm:text-lg">
              지역 바로가기
            </h2>

            <Link
              href="/region"
              className="shrink-0 text-xs font-bold text-emerald-700 transition hover:translate-x-0.5 sm:text-sm"
            >
              전체보기 →
            </Link>
          </div>

          {/* 모바일 3열 */}
          <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
            {regionNames.map(
              (region) => (
                <Link
                  key={region}
                  href={`/search?q=${encodeURIComponent(
                    region
                  )}`}
                  className="
                    inline-flex min-h-10
                    cursor-pointer items-center
                    justify-center rounded-xl
                    border border-zinc-100
                    bg-zinc-50 px-2 py-2
                    text-xs font-bold
                    text-zinc-600
                    transition-all
                    active:scale-[0.98]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-500
                  "
                >
                  {region}
                </Link>
              )
            )}
          </div>

          {/* PC·태블릿 */}
          <div className="mt-3 hidden flex-wrap gap-2 sm:flex lg:justify-center">
            {regionNames.map(
              (region) => (
                <Link
                  key={region}
                  href={`/search?q=${encodeURIComponent(
                    region
                  )}`}
                  className="
                    inline-flex min-h-9
                    min-w-[60px]
                    cursor-pointer items-center
                    justify-center rounded-full
                    bg-zinc-50 px-3 py-2
                    text-xs font-bold
                    text-zinc-600
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
              )
            )}
          </div>
        </section>

        <HomeBriefingSection
          briefings={briefings}
        />
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  mobileLabel,
  value,
  icon,
  accent,
  onClick,
}: {
  label: string;
  mobileLabel: string;
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
      icon:
        "bg-blue-50 text-blue-600",
      value:
        "text-blue-700",
      border:
        "hover:border-blue-300",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-700",
      border:
        "hover:border-emerald-300",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
      border:
        "hover:border-amber-300",
    },
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-1.5 py-3 text-center shadow-sm",
        "transition-all duration-200 active:scale-[0.98]",
        "sm:min-h-[84px] sm:flex-row sm:justify-start sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-left",
        "sm:hover:-translate-y-0.5 sm:hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        style.border,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl",
          style.icon,
        ].join(" ")}
      >
        {icon}
      </span>

      <div className="mt-1 min-w-0 sm:mt-0">
        <p className="text-[10px] font-bold text-zinc-500 sm:hidden">
          {mobileLabel}
        </p>

        <p className="hidden text-xs font-bold text-zinc-500 sm:block">
          {label}
        </p>

        <p
          className={[
            "mt-0.5 text-xl font-black sm:mt-1 sm:text-2xl",
            style.value,
          ].join(" ")}
        >
          {value}

          <span className="ml-1 hidden text-sm font-bold text-zinc-500 sm:inline">
            개 단지
          </span>
        </p>
      </div>

      <span className="ml-auto hidden text-zinc-300 transition-transform duration-200 group-hover:translate-x-1 sm:block">
        →
      </span>
    </button>
  );
}

function MobileDashboardPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-3">
        <h2 className="text-base font-black text-[#111827]">
          {title}
        </h2>

        <Link
          href={href}
          className="text-xs font-bold text-emerald-700"
        >
          전체보기 →
        </Link>
      </div>

      <div className="mt-3">
        {children}
      </div>
    </section>
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

function MobileApartmentCarousel({
  apartments,
  type,
  onOpen,
}: {
  apartments: Apartment[];
  type:
    | "subscription"
    | "sale";
  onOpen: (slug: string) => void;
}) {
  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pointerStartX =
    useRef(0);

  const initialScrollLeft =
    useRef(0);

  const isPointerDragging =
    useRef(false);

  const movedDistance =
    useRef(0);

  const [dragging, setDragging] =
    useState(false);

  const move = (
    direction: "prev" | "next"
  ) => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const card =
      container.querySelector<HTMLElement>(
        "[data-home-card]"
      );

    const amount =
      (card?.offsetWidth ??
        container.clientWidth * 0.78) +
      12;

    container.scrollBy({
      left:
        direction === "next"
          ? amount
          : -amount,

      behavior: "smooth",
    });
  };

  const onPointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0
    ) {
      return;
    }

    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    isPointerDragging.current =
      true;

    movedDistance.current = 0;

    pointerStartX.current =
      event.clientX;

    initialScrollLeft.current =
      container.scrollLeft;

    setDragging(true);

    container.setPointerCapture(
      event.pointerId
    );
  };

  const onPointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      !isPointerDragging.current ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const distance =
      event.clientX -
      pointerStartX.current;

    movedDistance.current =
      Math.max(
        movedDistance.current,
        Math.abs(distance)
      );

    container.scrollLeft =
      initialScrollLeft.current -
      distance;
  };

  const finishPointer = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      event.pointerType !== "mouse"
    ) {
      return;
    }

    isPointerDragging.current =
      false;

    setDragging(false);

    const container =
      scrollRef.current;

    if (
      container?.hasPointerCapture(
        event.pointerId
      )
    ) {
      container.releasePointerCapture(
        event.pointerId
      );
    }
  };

  return (
    <div className="relative">
      {apartments.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              move("prev")
            }
            aria-label="이전 단지 보기"
            className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-xl font-black text-zinc-700 shadow-lg"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              move("next")
            }
            aria-label="다음 단지 보기"
            className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-xl font-black text-zinc-700 shadow-lg"
          >
            ›
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        onPointerDown={
          onPointerDown
        }
        onPointerMove={
          onPointerMove
        }
        onPointerUp={
          finishPointer
        }
        onPointerCancel={
          finishPointer
        }
        className={[
          "overflow-x-auto px-8 pb-2",
          "snap-x snap-mandatory scroll-smooth",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          dragging
            ? "cursor-grabbing scroll-auto"
            : "cursor-grab",
        ].join(" ")}
      >
        <div className="flex w-max gap-3">
          {apartments.map(
            (apartment) => {
              const image =
                getHeroImage(
                  apartment
                );

              return (
                <button
                  data-home-card
                  key={apartment.slug}
                  type="button"
                  onClick={() => {
                    if (
                      movedDistance.current >
                      6
                    ) {
                      movedDistance.current =
                        0;

                      return;
                    }

                    onOpen(
                      apartment.slug
                    );
                  }}
                  className="
                    group w-[72vw]
                    max-w-[280px]
                    shrink-0 snap-center
                    overflow-hidden rounded-2xl
                    border border-zinc-200
                    bg-white text-left
                    shadow-sm transition
                    active:scale-[0.99]
                  "
                >
                  <div className="relative h-28 overflow-hidden bg-zinc-100">
                    {image ? (
                      <img
                        src={image}
                        alt={
                          apartment.name
                        }
                        loading="lazy"
                        draggable={false}
                        className="pointer-events-none h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        이미지 준비 중
                      </div>
                    )}

                    <span
                      className={[
                        "absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold shadow-sm",
                        type ===
                        "subscription"
                          ? "bg-blue-600 text-white"
                          : "bg-emerald-600 text-white",
                      ].join(" ")}
                    >
                      {type ===
                      "subscription"
                        ? apartment.status ||
                          "청약"
                        : "선착순"}
                    </span>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] font-bold text-emerald-600">
                      {apartment.cityName ||
                        apartment.city}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-10 break-keep text-sm font-black leading-5">
                      {apartment.name}
                    </h3>

                    <p className="mt-2 truncate text-xs font-bold text-emerald-700">
                      {apartment
                        .priceDetail
                        ?.salePrice ||
                        apartment.price ||
                        apartment.condition ||
                        "상세정보 확인"}
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      <p className="px-4 text-center text-[10px] text-zinc-400">
        버튼을 누르거나 좌우로
        밀어서 확인하세요.
      </p>
    </div>
  );
}

function CompactApartmentCard({
  apartment,
  type,
  onClick,
}: {
  apartment: Apartment;
  type:
    | "subscription"
    | "sale";
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
            loading="lazy"
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
            type ===
            "subscription"
              ? "bg-blue-600 text-white"
              : "bg-emerald-600 text-white",
          ].join(" ")}
        >
          {type ===
          "subscription"
            ? apartment.status ||
              "청약"
            : "선착순"}
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
          {apartment.priceDetail
            ?.salePrice ||
            apartment.price ||
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
  compact = false,
}: {
  apartment: Apartment;
  onClick: () => void;
  compact?: boolean;
}) {
  const image =
    getHeroImage(apartment);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full cursor-pointer items-center text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        compact
          ? "gap-2 rounded-xl px-3 py-2"
          : "gap-3 rounded-2xl border border-transparent p-2 hover:border-emerald-200 hover:bg-emerald-50/50 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div
        className={[
          "shrink-0 overflow-hidden bg-zinc-100",
          compact
            ? "h-14 w-14 rounded-xl"
            : "h-16 w-16 rounded-xl",
        ].join(" ")}
      >
        {image ? (
          <img
            src={image}
            alt={apartment.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
            이미지
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-[#111827] transition-colors group-hover:text-emerald-700">
          {apartment.name}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-zinc-500 sm:mt-1 sm:text-xs">
          {apartment.cityName ||
            apartment.region}
        </p>

        <p className="mt-0.5 truncate text-[11px] font-bold text-zinc-700 sm:mt-1 sm:text-xs">
          {apartment.priceDetail
            ?.salePrice ||
            apartment.price ||
            apartment.condition ||
            "정보 확인"}
        </p>
      </div>

      {compact && (
        <span className="shrink-0 text-xs font-bold text-emerald-700">
          →
        </span>
      )}
    </button>
  );
}

function EmptyMessage({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center bg-zinc-50 px-4 text-center text-zinc-500",
        compact
          ? "mx-3 min-h-[100px] rounded-xl text-xs"
          : "min-h-[180px] rounded-2xl text-sm",
      ].join(" ")}
    >
      {text}
    </div>
  );
}
