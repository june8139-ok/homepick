"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import TodayTasks from "../../components/Admin/TodayTasks";
import ApplyHomeSyncCard from "../../components/Admin/ApplyHomeSyncCard";
import { supabase } from "../../lib/supabase";
import { createClient } from "../../lib/supabase/browser";
import { parseSubscriptionDate } from "../../lib/subscriptionVisibility";

type ListingStage =
  | "subscription"
  | "firstCome"
  | "completed"
  | "existing";

type ApartmentRow = {
  id: string;
  slug: string;
  name: string;
  status: string | null;
  city: string | null;
  region: string | null;
  is_published: boolean | null;

  hero_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  created_at?: string | null;
  updated_at?: string | null;

  data?: {
    listingStage?: ListingStage;
    cityName?: string;
    condition?: string;

    latitude?: number | null;
    longitude?: number | null;

    images?: {
      hero?: string | string[] | null;
    };

    subscription?: {
      contractEndDate?: string | null;
    };
  } | null;
};

function getListingStage(
  apartment: ApartmentRow
): ListingStage {
  const savedStage =
    apartment.data?.listingStage;

  if (
    savedStage === "subscription" ||
    savedStage === "firstCome" ||
    savedStage === "completed" ||
    savedStage === "existing"
  ) {
    return savedStage;
  }

  const status =
    apartment.status?.trim() ?? "";

  if (
    status.includes("청약") ||
    status.includes("접수")
  ) {
    return "subscription";
  }

  if (
    status.includes("선착순") ||
    status.includes("분양중")
  ) {
    return "firstCome";
  }

  if (
    status.includes("종료") ||
    apartment.is_published === false
  ) {
    return "completed";
  }

  return "existing";
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "날짜 정보 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [apartments, setApartments] =
    useState<ApartmentRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchApartments() {
      setLoading(true);

      const { data, error } =
        await supabase
          .from("apartments")
          .select(
            "id, slug, name, status, city, region, is_published, hero_image, latitude, longitude, created_at, updated_at, data"
          )
          .order("updated_at", {
            ascending: false,
          });

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "관리자 대시보드 조회 오류:",
          error
        );

        alert(
          `단지 현황을 불러오지 못했습니다.\n\n${error.message}`
        );

        setApartments([]);
        setLoading(false);
        return;
      }

      setApartments(
        (data ?? []) as ApartmentRow[]
      );

      setLoading(false);
    }

    fetchApartments();

    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const result = {
      total: apartments.length,
      subscription: 0,
      firstCome: 0,
      completed: 0,
    };

    apartments.forEach(
      (apartment) => {
        const stage =
          getListingStage(apartment);

        if (
          stage === "subscription"
        ) {
          result.subscription += 1;
        }

        if (
          stage === "firstCome"
        ) {
          result.firstCome += 1;
        }

        if (
          stage === "completed"
        ) {
          result.completed += 1;
        }
      }
    );

    return result;
  }, [apartments]);

  const todayTaskCounts = useMemo(() => {
    const now = new Date();

    const transitionCount =
      apartments.filter(
        (apartment) => {
          const stage =
            getListingStage(
              apartment
            );

          if (
            stage !== "subscription"
          ) {
            return false;
          }

          const contractEndDate =
            parseSubscriptionDate(
              apartment.data
                ?.subscription
                ?.contractEndDate
            );

          if (!contractEndDate) {
            return false;
          }

          const differenceMs =
            now.getTime() -
            contractEndDate.getTime();

          const elapsedDays =
            Math.floor(
              differenceMs /
                (24 * 60 * 60 * 1000)
            );

          return elapsedDays >= 15;
        }
      ).length;

    const pendingPublishCount =
      apartments.filter(
        (apartment) =>
          apartment.is_published !== true
      ).length;

    const missingImageCount =
      apartments.filter(
        (apartment) => {
          const dataHero =
            apartment.data?.images
              ?.hero;

          const hasDataHero =
            Array.isArray(dataHero)
              ? Boolean(dataHero[0])
              : Boolean(dataHero);

          return (
            !hasDataHero &&
            !apartment.hero_image
          );
        }
      ).length;

    const missingLocationCount =
      apartments.filter(
        (apartment) => {
          const latitude =
            apartment.latitude ??
            apartment.data?.latitude;

          const longitude =
            apartment.longitude ??
            apartment.data?.longitude;

          return (
            latitude === null ||
            latitude === undefined ||
            longitude === null ||
            longitude === undefined
          );
        }
      ).length;

    return {
      transitionCount,
      pendingPublishCount,
      missingImageCount,
      missingLocationCount,
    };
  }, [apartments]);

  const recentApartments = useMemo(
    () => apartments.slice(0, 5),
    [apartments]
  );

  async function handleLogout() {
    const ok = window.confirm(
      "관리자 계정에서 로그아웃할까요?"
    );

    if (!ok) {
      return;
    }

    setLoggingOut(true);

    const authClient =
      createClient();

    const { error } =
      await authClient.auth.signOut();

    if (error) {
      alert(
        `로그아웃하지 못했습니다.\n\n${error.message}`
      );

      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-sm">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                JIBNUN ADMIN
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                관리자 대시보드
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
                등록 단지와 노출 상태를 한눈에 확인하고 관리합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                target="_blank"
                className="cursor-pointer rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                사이트 보기
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="cursor-pointer rounded-xl bg-white px-4 py-3 text-sm font-bold text-zinc-900 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {loggingOut
                  ? "로그아웃 중..."
                  : "로그아웃"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="전체 등록 단지"
            value={counts.total}
            description="Supabase 등록 기준"
            loading={loading}
          />

          <StatCard
            label="청약"
            value={
              counts.subscription
            }
            description="청약 일정 및 접수 단지"
            loading={loading}
          />

          <StatCard
            label="선착순"
            value={counts.firstCome}
            description="현재 선착순 분양 단지"
            loading={loading}
          />

          <StatCard
            label="노출 종료"
            value={counts.completed}
            description="종료 또는 비공개 단지"
            loading={loading}
          />
        </div>

        <TodayTasks
          transitionCount={
            todayTaskCounts.transitionCount
          }
          pendingPublishCount={
            todayTaskCounts.pendingPublishCount
          }
          missingImageCount={
            todayTaskCounts.missingImageCount
          }
          missingLocationCount={
            todayTaskCounts.missingLocationCount
          }
          loading={loading}
        />
        
        <ApplyHomeSyncCard />

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                QUICK MENU
              </p>

              <h2 className="mt-1 text-2xl font-black">
                빠른 관리
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                자주 사용하는 관리자 기능으로 바로 이동합니다.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <QuickLink
                href="/admin/create"
                title="신규 단지 등록"
                description="새로운 분양 단지 추가"
                symbol="+"
                primary
              />

              <QuickLink
                href="/admin/apartments"
                title="단지 관리"
                description="검색·수정·노출 관리"
                symbol="⌂"
              />

              <QuickLink
                href="/admin/inquiries"
                title="문의 관리"
                description="상담 신청 확인"
                symbol="✉"
              />

              <QuickLink
                href="/admin/subscriptions"
                title="청약 관리"
                description="청약 일정 및 자동 연동"
                symbol="✓"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-800">
                준비 중인 메뉴
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                문의 관리와 청약 관리 화면은 다음 단계에서 연결합니다.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  RECENT
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  최근 수정 단지
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  최근 변경된 단지 5개를 표시합니다.
                </p>
              </div>

              <Link
                href="/admin/apartments"
                className="shrink-0 cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                전체 보기
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {loading &&
                Array.from({
                  length: 3,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-2xl bg-zinc-100"
                    />
                  )
                )}

              {!loading &&
                recentApartments.map(
                  (apartment) => {
                    const stage =
                      getListingStage(
                        apartment
                      );

                    return (
                      <article
                        key={apartment.id}
                        className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StageBadge
                              stage={stage}
                            />

                            <span className="text-xs text-zinc-400">
                              {formatDate(
                                apartment.updated_at ??
                                  apartment.created_at
                              )}
                            </span>
                          </div>

                          <h3 className="mt-2 truncate font-bold">
                            {
                              apartment.name
                            }
                          </h3>

                          <p className="mt-1 truncate text-sm text-zinc-500">
                            {apartment.region ||
                              apartment.city ||
                              apartment.data
                                ?.cityName ||
                              "지역 정보 없음"}
                          </p>
                        </div>

                        <Link
                          href={`/admin/apartments/${apartment.slug}`}
                          className="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          수정
                        </Link>
                      </article>
                    );
                  }
                )}

              {!loading &&
                recentApartments.length ===
                  0 && (
                  <div className="rounded-2xl bg-zinc-50 p-8 text-center">
                    <p className="font-bold text-zinc-700">
                      등록된 단지가 없습니다.
                    </p>

                    <Link
                      href="/admin/create"
                      className="mt-3 inline-block font-bold text-emerald-600 hover:underline"
                    >
                      첫 단지 등록하기
                    </Link>
                  </div>
                )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
  loading,
}: {
  label: string;
  value: number;
  description: string;
  loading: boolean;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-bold text-zinc-500">
        {label}
      </p>

      {loading ? (
        <div className="mt-3 h-10 w-20 animate-pulse rounded-xl bg-zinc-100" />
      ) : (
        <p className="mt-2 text-4xl font-black">
          {value}
        </p>
      )}

      <p className="mt-2 text-xs text-zinc-400">
        {description}
      </p>
    </article>
  );
}

function QuickLink({
  href,
  title,
  description,
  symbol,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  symbol: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group cursor-pointer rounded-2xl border p-4 transition",
        "hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500",
        primary
          ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
          : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black",
          primary
            ? "bg-white/15 text-white"
            : "bg-zinc-100 text-zinc-800 group-hover:bg-white",
        ].join(" ")}
      >
        {symbol}
      </span>

      <p className="mt-4 font-black">
        {title}
      </p>

      <p
        className={[
          "mt-1 text-xs",
          primary
            ? "text-emerald-50"
            : "text-zinc-500",
        ].join(" ")}
      >
        {description}
      </p>
    </Link>
  );
}

function StageBadge({
  stage,
}: {
  stage: ListingStage;
}) {
  const styles: Record<
    ListingStage,
    {
      label: string;
      className: string;
    }
  > = {
    subscription: {
      label: "청약",
      className:
        "bg-blue-50 text-blue-700",
    },

    firstCome: {
      label: "선착순",
      className:
        "bg-emerald-50 text-emerald-700",
    },

    completed: {
      label: "노출 종료",
      className:
        "bg-zinc-100 text-zinc-500",
    },

    existing: {
      label: "기타",
      className:
        "bg-amber-50 text-amber-700",
    },
  };

  const current = styles[stage];

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-bold",
        current.className,
      ].join(" ")}
    >
      {current.label}
    </span>
  );
}