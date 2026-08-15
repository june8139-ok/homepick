"use client";

import Image from "next/image";
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

import {
  isPublicListing,
} from "../../lib/listingStage";

import SearchHero from "./SearchHero";
import DeferredRegionMapSection from "./DeferredRegionMapSection";
import HomeBriefingSection from "./HomeBriefingSection";

import {
  HOME_RECENT_LIMIT,
  getRecentUpdatedApartments,
} from "../../lib/recentApartments";

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


function formatPriceAmount(
  amountInTenThousands: number
) {
  if (
    !Number.isFinite(
      amountInTenThousands
    ) ||
    amountInTenThousands <= 0
  ) {
    return "";
  }

  const eok = Math.floor(
    amountInTenThousands / 10000
  );

  const remainder =
    amountInTenThousands % 10000;

  if (eok === 0) {
    return `${amountInTenThousands.toLocaleString(
      "ko-KR"
    )}만원`;
  }

  if (remainder === 0) {
    return `${eok.toLocaleString(
      "ko-KR"
    )}억원`;
  }

  return `${eok.toLocaleString(
    "ko-KR"
  )}억 ${remainder.toLocaleString(
    "ko-KR"
  )}만원`;
}

function formatHomePriceText(
  value?: string | null
) {
  if (!value?.trim()) {
    return "";
  }

  return value.replace(
    /(\d{1,3}(?:,\d{3})*|\d+)\s*만원/g,
    (match, amountText: string) => {
      const amount = Number(
        amountText.replace(
          /,/g,
          ""
        )
      );

      return (
        formatPriceAmount(
          amount
        ) || match
      );
    }
  );
}

function getHomePriceText(
  apartment: Apartment,
  fallback: string
) {
  const raw =
    apartment.priceDetail
      ?.salePrice ||
    apartment.price ||
    apartment.condition ||
    fallback;

  return (
    formatHomePriceText(raw) ||
    fallback
  );
}


function getCreatedAtTimestamp(
  apartment: Apartment
) {
  const timestamp = apartment.createdAt
    ? new Date(
        apartment.createdAt
      ).getTime()
    : 0;

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function sortByNewestCreated(
  apartments: Apartment[]
) {
  return [...apartments].sort(
    (first, second) =>
      getCreatedAtTimestamp(second) -
      getCreatedAtTimestamp(first)
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

  const [
    pendingTarget,
    setPendingTarget,
  ] = useState("");

  const navigate = (
    href: string,
    target: string
  ) => {
    if (pendingTarget) {
      return;
    }

    setPendingTarget(target);

    window.dispatchEvent(
      new CustomEvent(
        "jibnun:navigation-start",
        {
          detail: {
            href,
          },
        }
      )
    );

    router.push(href);
  };

  const visibleApartments = useMemo(
    () =>
      getHomeVisibleApartments(
        apartments
      ),
    [apartments]
  );

  /*
   * 홈 검색 자동완성은 홈 카드 노출 기준과 분리합니다.
   *
   * - 청약 일정이 지난 단지도 검색 가능
   * - 100% 분양완료(soldOut)도 검색 가능
   * - 노출 종료(completed)만 검색에서 제외
   *
   * 실제 홈 청약/선착순/최근 업데이트 영역은
   * 기존 visibleApartments 기준을 그대로 사용합니다.
   */
  const searchApartments = useMemo(
    () =>
      apartments.filter(
        (apartment) =>
          isPublicListing(apartment)
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
      sortByNewestCreated(
        allSubscriptions
      ).slice(0, 6),
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
      sortByNewestCreated(
        allFirstComeApartments
      ).slice(0, 6),
    [allFirstComeApartments]
  );

  const allRecentApartments = useMemo(
    () =>
      getRecentUpdatedApartments(
        visibleApartments
      ),
    [visibleApartments]
  );

  const recentApartments = useMemo(
    () =>
      allRecentApartments.slice(
        0,
        HOME_RECENT_LIMIT
      ),
    [allRecentApartments]
  );

  return (
    <main className="min-h-screen bg-white pb-3 text-[#111827] sm:pb-6">
      <SearchHero
        apartments={searchApartments}
      />

      <section className="mx-auto w-full max-w-[1680px] px-3 sm:px-7 lg:px-10">
        {/* 핵심 현황 */}
        <section
          className="
            mt-4 grid grid-cols-3 overflow-hidden
            rounded-2xl
            border border-emerald-200/80
            bg-white
            shadow-[0_12px_30px_rgba(15,118,110,0.065)]
            sm:mt-7 sm:rounded-3xl
          "
        >
          <SummaryCard
            label="진행 중 청약"
            mobileLabel="청약"
            value={
              allSubscriptions.length
            }
            icon="calendar"
            accent="blue"
            pending={
              pendingTarget ===
              "summary:subscription"
            }
            onClick={() =>
              navigate(
                "/subscription",
                "summary:subscription"
              )
            }
          />

          <SummaryCard
            label="선착순 분양"
            mobileLabel="선착순"
            value={
              allFirstComeApartments.length
            }
            icon="home"
            accent="emerald"
            pending={
              pendingTarget ===
              "summary:firstCome"
            }
            onClick={() =>
              navigate(
                "/first-come",
                "summary:firstCome"
              )
            }
          />

          <SummaryCard
            label="최근 업데이트"
            mobileLabel="업데이트"
            value={
              allRecentApartments.length
            }
            icon="refresh"
            accent="amber"
            pending={
              pendingTarget ===
              "summary:recent"
            }
            onClick={() =>
              navigate(
                "/search?recent=1",
                "summary:recent"
              )
            }
          />
        </section>

        {/* 모바일 청약 */}
        <div className="mt-3 sm:hidden">
          <MobileDashboardPanel
            title="진행 중 청약"
            href="/subscription"
          >
            {subscriptions.length >
            0 ? (
              <MobileApartmentCarousel
                apartments={
                  subscriptions
                }
                type="subscription"
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
            href="/first-come"
          >
            {firstComeApartments.length >
            0 ? (
              <MobileApartmentCarousel
                apartments={
                  firstComeApartments
                }
                type="sale"
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
            title="최근 업데이트 단지"
            href="/search?recent=1"
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
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyMessage
                text="최근 업데이트된 단지가 없습니다."
                compact
              />
            )}
          </MobileDashboardPanel>
        </div>

        {/* PC·태블릿 대시보드 */}
        <section className="mt-5 hidden gap-5 rounded-[32px] bg-white p-5 shadow-[0_18px_48px_rgba(15,118,110,0.055)] sm:grid xl:grid-cols-[1fr_1fr_0.78fr] xl:p-6">
          <DashboardPanel
            title="진행 중 청약"
            href="/subscription"
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
            href="/first-come"
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
                      />
                    )
                  )}
              </div>
            ) : (
              <EmptyMessage text="현재 확인된 선착순 단지가 없습니다." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="최근 업데이트 단지"
            href="/search?recent=1"
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
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyMessage text="최근 업데이트된 단지가 없습니다." />
            )}
          </DashboardPanel>
        </section>

        <DeferredRegionMapSection
          apartments={
            visibleApartments
          }
        />

        {/* 지역 바로가기 */}
        <section className="mt-4 rounded-2xl border border-zinc-200/70 bg-white px-4 py-5 shadow-[0_16px_42px_rgba(15,118,110,0.05)] sm:mt-6 sm:rounded-[30px] sm:px-8 sm:py-7">
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
                  href={`/region/${encodeURIComponent(
                    region
                  )}`}
                  className="
                    inline-flex min-h-10
                    cursor-pointer items-center
                    justify-center rounded-xl
                    border border-zinc-200/70
                    bg-zinc-50/80 px-2 py-2
                    text-xs font-bold
                    text-zinc-600
                    transition-all
                    active:scale-[0.97]
                    active:bg-emerald-50
                    active:text-emerald-700
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
                  href={`/region/${encodeURIComponent(
                    region
                  )}`}
                  className="
                    inline-flex min-h-9
                    min-w-[60px]
                    cursor-pointer items-center
                    justify-center rounded-full
                    bg-zinc-50/80 px-3 py-2
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

function SummaryIcon({
  name,
}: {
  name:
    | "calendar"
    | "home"
    | "refresh";
}) {
  if (name === "calendar") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5 sm:h-6 sm:w-6"
      >
        <rect
          x="4"
          y="5.5"
          width="16"
          height="14"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 3.5V7M16 3.5V7M4 9.5H20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 13H11M8 16H14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5 sm:h-6 sm:w-6"
      >
        <path
          d="M3.5 11.2L12 4L20.5 11.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 10.5V19.5H18.5V10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 19.5V14H14.5V19.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5 sm:h-6 sm:w-6"
    >
      <path
        d="M19 8A7 7 0 1 0 20 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19 4V8H15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8V12L15 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryCard({
  label,
  mobileLabel,
  value,
  icon,
  accent,
  onClick,
  pending = false,
}: {
  label: string;
  mobileLabel: string;
  value: number;
  icon:
    | "calendar"
    | "home"
    | "refresh";
  accent:
    | "blue"
    | "emerald"
    | "amber";
  onClick: () => void;
  pending?: boolean;
}) {
  const style = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
      value:
        "text-blue-700",
      border:
        "hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]",
    },

    emerald: {
      icon:
        "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
      value:
        "text-emerald-700",
      border:
        "hover:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.24)]",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
      value:
        "text-amber-700",
      border:
        "hover:shadow-[inset_0_0_0_1px_rgba(245,158,11,0.22)]",
    },
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className={[
        "group relative flex min-w-0 cursor-pointer flex-col items-center justify-center",
        "px-1.5 py-3 text-center",
        "even:border-x even:border-emerald-100/90",
        "transition-all duration-200",
        "hover:bg-emerald-50/45",
        "active:scale-[0.98] active:bg-emerald-100/45",
        "sm:min-h-[92px] sm:flex-row sm:justify-start sm:gap-4 sm:px-6 sm:py-5 sm:text-left",
        "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset",
        pending
          ? "bg-emerald-600 text-white shadow-[0_14px_34px_rgba(5,150,105,0.22)]"
          : style.border,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black",
          "transition-all duration-200 group-hover:-translate-y-0.5",
          "sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl",
          pending
            ? "bg-white/15 text-white"
            : style.icon,
        ].join(" ")}
      >
        <SummaryIcon
          name={icon}
        />
      </span>

      <div className="mt-1 min-w-0 sm:mt-0">
        <p
          className={[
            "text-[10px] font-bold sm:hidden",
            pending
              ? "text-white/80"
              : "text-zinc-500",
          ].join(" ")}
        >
          {pending
            ? "이동 중"
            : mobileLabel}
        </p>

        <p
          className={[
            "hidden text-xs font-bold sm:block",
            pending
              ? "text-white/80"
              : "text-zinc-500",
          ].join(" ")}
        >
          {pending
            ? `${label} 여는 중…`
            : label}
        </p>

        <p
          className={[
            "mt-0.5 text-xl font-black sm:mt-1 sm:text-2xl",
            pending
              ? "text-white"
              : style.value,
          ].join(" ")}
        >
          {value}

          <span
            className={[
              "ml-1 hidden text-sm font-bold sm:inline",
              pending
                ? "text-white/70"
                : "text-zinc-500",
            ].join(" ")}
          >
            개 단지
          </span>
        </p>
      </div>

      <span
        className={[
          "ml-auto hidden text-lg font-black transition-transform duration-200 sm:block",
          pending
            ? "animate-spin text-white"
            : "text-emerald-400 group-hover:translate-x-1 group-hover:text-emerald-600",
        ].join(" ")}
        aria-hidden="true"
      >
        {pending ? "◌" : "→"}
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
    <section className="overflow-hidden rounded-2xl border border-emerald-200/90 bg-white py-3 shadow-[0_12px_30px_rgba(15,118,110,0.07)]">
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
    <section className="min-w-0 px-1 py-1">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-200/70 pb-3">
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
}: {
  apartments: Apartment[];
  type:
    | "subscription"
    | "sale";
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
                <Link
                  data-home-card
                  key={apartment.slug}
                  href={`/apartments/${apartment.slug}`}
                  onClick={(event) => {
                    if (
                      movedDistance.current >
                      6
                    ) {
                      event.preventDefault();

                      movedDistance.current =
                        0;

                      return;
                    }

                    window.dispatchEvent(
                      new CustomEvent(
                        "jibnun:navigation-start",
                        {
                          detail: {
                            href: `/apartments/${apartment.slug}`,
                          },
                        }
                      )
                    );
                  }}
                  className="
                    group w-[72vw]
                    max-w-[280px]
                    shrink-0 snap-center
                    cursor-pointer
                    overflow-hidden rounded-2xl
                    border border-zinc-200
                    bg-white text-left
                    shadow-sm transition
                    active:scale-[0.98]
                    active:border-emerald-400
                    active:bg-emerald-50
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-500
                    focus-visible:ring-offset-2
                  "
                >
                  <div className="relative h-28 overflow-hidden bg-zinc-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={
                          apartment.name
                        }
                        fill
                        quality={72}
                        sizes="(max-width: 639px) 72vw, 280px"
                        draggable={false}
                        className="pointer-events-none object-cover"
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
                      {getHomePriceText(
                        apartment,
                        "상세정보 확인"
                      )}
                    </p>
                  </div>
                </Link>
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
}: {
  apartment: Apartment;
  type:
    | "subscription"
    | "sale";
}) {
  const image =
    getHeroImage(apartment);

  return (
    <Link
      href={`/apartments/${apartment.slug}`}
      className="
        group min-w-0 cursor-pointer
        overflow-hidden rounded-2xl
        border border-zinc-200
        bg-white text-left
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-emerald-300
        hover:shadow-md
        active:scale-[0.98]
        active:border-emerald-400
        active:bg-emerald-50
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-emerald-500
        focus-visible:ring-offset-2
      "
    >
      <div className="relative h-28 overflow-hidden bg-zinc-100">
        {image ? (
          <Image
            src={image}
            alt={apartment.name}
            fill
            quality={72}
            sizes="(max-width: 1279px) 30vw, 240px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
          {getHomePriceText(
            apartment,
            "상세정보 확인"
          )}
        </p>
      </div>
    </Link>
  );
}

function RecentApartmentRow({
  apartment,
  compact = false,
}: {
  apartment: Apartment;
  compact?: boolean;
}) {
  const image =
    getHeroImage(apartment);

  return (
    <Link
      href={`/apartments/${apartment.slug}`}
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
          "relative shrink-0 overflow-hidden bg-zinc-100",
          compact
            ? "h-14 w-14 rounded-xl"
            : "h-16 w-16 rounded-xl",
        ].join(" ")}
      >
        {image ? (
          <Image
            src={image}
            alt={apartment.name}
            fill
            quality={68}
            sizes={
              compact
                ? "56px"
                : "64px"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          {getHomePriceText(
            apartment,
            "정보 확인"
          )}
        </p>
      </div>

      {compact && (
        <span className="shrink-0 text-xs font-bold text-emerald-700">
          →
        </span>
      )}
    </Link>
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
