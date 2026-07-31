"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { parseSubscriptionDate } from "../../../lib/subscriptionVisibility";

type ListingStage =
  | "subscription"
  | "firstCome"
  | "completed"
  | "existing";

type AdminTask =
  | "transition"
  | "pending"
  | "image"
  | "location"
  | null;

type AdminApartmentRow = {
  id: string;
  slug: string;
  name: string;

  brand: string | null;
  builder: string | null;

  city: string | null;
  district: string | null;
  region: string | null;

  status: string | null;

  hero_image: string | null;

  latitude?: number | null;
  longitude?: number | null;

  is_published: boolean | null;

  created_at?: string | null;
  updated_at?: string | null;

  data: {
    name?: string;
    status?: string;

    condition?: string;
    price?: string;
    cityName?: string;

    latitude?: number | null;
    longitude?: number | null;

    listingStage?: ListingStage;

    images?: {
      hero?: string | string[] | null;
      location?: string[];
      floorPlans?: Array<{
        name: string;
        url: string;
      }>;
      community?: string[];
      gallery?: string[];
    };

    subscription?: {
      contractEndDate?: string | null;
      winnerDate?: string | null;
    };

    conditionHistory?: Array<{
      date: string;
      title: string;
      description: string;
    }>;

    [key: string]: unknown;
  } | null;
};

type StageFilter =
  | "all"
  | "subscription"
  | "firstCome"
  | "completed"
  | "existing";

type SortOption =
  | "updated"
  | "name"
  | "published";

const ONE_DAY_MS =
  24 * 60 * 60 * 1000;

function getAdminTask(
  value: string | null
): AdminTask {
  if (
    value === "transition" ||
    value === "pending" ||
    value === "image" ||
    value === "location"
  ) {
    return value;
  }

  return null;
}

function getHeroImage(
  apartment: AdminApartmentRow
) {
  const hero =
    apartment.data?.images?.hero;

  if (Array.isArray(hero)) {
    return hero[0] ?? "";
  }

  if (typeof hero === "string") {
    return hero;
  }

  return apartment.hero_image ?? "";
}

function hasHeroImage(
  apartment: AdminApartmentRow
) {
  return Boolean(
    getHeroImage(apartment)
  );
}

function hasLocation(
  apartment: AdminApartmentRow
) {
  const latitude =
    apartment.latitude ??
    apartment.data?.latitude;

  const longitude =
    apartment.longitude ??
    apartment.data?.longitude;

  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude !== 0 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude !== 0
  );
}

function getCondition(
  apartment: AdminApartmentRow
) {
  return (
    apartment.data?.condition ||
    apartment.data?.price ||
    "계약조건 정보 없음"
  );
}

function getListingStage(
  apartment: AdminApartmentRow
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
    apartment.status
      ?.trim()
      .toLowerCase() ?? "";

  const condition =
    apartment.data?.condition
      ?.trim()
      .toLowerCase() ?? "";

  if (
    status.includes("종료") ||
    status.includes("분양완료")
  ) {
    return "completed";
  }

  if (
    status.includes("선착순") ||
    status.includes("분양중") ||
    condition.includes("동호지정") ||
    condition.includes("잔여세대") ||
    condition.includes("회사보유분")
  ) {
    return "firstCome";
  }

  if (
    status.includes("청약") ||
    status.includes("접수") ||
    status.includes("특별공급") ||
    status.includes("1순위") ||
    status.includes("2순위") ||
    status.includes("당첨") ||
    status.includes("계약중")
  ) {
    return "subscription";
  }

  return "existing";
}

function getContractEndDate(
  apartment: AdminApartmentRow
) {
  return parseSubscriptionDate(
    apartment.data?.subscription
      ?.contractEndDate
  );
}

function getElapsedDays(
  date: Date,
  referenceDate = new Date()
) {
  const referenceStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return Math.floor(
    (referenceStart.getTime() -
      targetStart.getTime()) /
      ONE_DAY_MS
  );
}

function isTransitionCandidate(
  apartment: AdminApartmentRow,
  referenceDate = new Date()
) {
  if (
    getListingStage(apartment) !==
    "subscription"
  ) {
    return false;
  }

  const contractEndDate =
    getContractEndDate(apartment);

  if (!contractEndDate) {
    return false;
  }

  return (
    getElapsedDays(
      contractEndDate,
      referenceDate
    ) >= 15
  );
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
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
}

function formatParsedDate(
  value: Date | null
) {
  if (!value) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(value);
}

function getTaskInformation(
  task: AdminTask
) {
  switch (task) {
    case "transition":
      return {
        eyebrow: "TRANSITION TASK",
        title: "선착순 전환 확인",
        description:
          "청약 계약 종료 후 15일 이상 지난 단지만 표시합니다.",
        className:
          "border-blue-200 bg-blue-50 text-blue-900",
      };

    case "pending":
      return {
        eyebrow: "PUBLISH TASK",
        title: "게시 대기 단지",
        description:
          "등록되었지만 홈페이지에 아직 게시되지 않은 단지만 표시합니다.",
        className:
          "border-amber-200 bg-amber-50 text-amber-900",
      };

    case "image":
      return {
        eyebrow: "IMAGE TASK",
        title: "대표 이미지 없는 단지",
        description:
          "홈과 검색 카드에 사용할 대표 이미지가 없는 단지만 표시합니다.",
        className:
          "border-rose-200 bg-rose-50 text-rose-900",
      };

    case "location":
      return {
        eyebrow: "LOCATION TASK",
        title: "지도 위치 미확인 단지",
        description:
          "위도 또는 경도가 정상적으로 저장되지 않은 단지만 표시합니다.",
        className:
          "border-zinc-300 bg-zinc-100 text-zinc-900",
      };

    default:
      return null;
  }
}

function AdminApartmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const task = getAdminTask(
    searchParams.get("task")
  );

  const [keyword, setKeyword] =
    useState("");

  const [
    stageFilter,
    setStageFilter,
  ] =
    useState<StageFilter>("all");

  const [sort, setSort] =
    useState<SortOption>("updated");

  const [
    apartments,
    setApartments,
  ] =
    useState<AdminApartmentRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<string | null>(null);

  const [
    publishingId,
    setPublishingId,
  ] =
    useState<string | null>(null);

  const [
    transitioningId,
    setTransitioningId,
  ] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchApartments() {
      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/admin/apartments/list",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const result =
          (await response.json()) as {
            message?: string;
            apartments?: AdminApartmentRow[];
          };

        if (!mounted) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              "단지 목록을 불러오지 못했습니다."
          );
        }

        setApartments(
          result.apartments ?? []
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error(
          "관리자 단지 목록 조회 오류:",
          error
        );

        alert(
          `단지 목록을 불러오지 못했습니다.\n\n${
            error instanceof Error
              ? error.message
              : "알 수 없는 오류"
          }`
        );

        setApartments([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchApartments();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    /*
     * 대시보드 작업 카드에서 들어오면
     * 일반 상태 필터가 결과를 가리지 않도록
     * 전체 상태로 초기화합니다.
     */
    if (task) {
      setStageFilter("all");
    }
  }, [task]);

  const handleTogglePublished =
    async (
      apartment: AdminApartmentRow
    ) => {
      const nextPublished =
        !apartment.is_published;

      setPublishingId(apartment.id);

      const response =
        await fetch(
          "/api/admin/apartments/action",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                action:
                  "togglePublished",
                apartmentId:
                  apartment.id,
                isPublished:
                  nextPublished,
              }),
          }
        );

      const result =
        (await response.json()) as {
          message?: string;
        };

      if (!response.ok) {
        console.error(
          "게시상태 변경 오류:",
          result.message
        );

        alert(
          `게시상태 변경 중 오류가 발생했습니다.

${
            result.message ??
            "알 수 없는 오류"
          }`
        );

        setPublishingId(null);
        return;
      }

      setApartments((previous) =>
        previous.map((item) =>
          item.id === apartment.id
            ? {
                ...item,
                is_published:
                  nextPublished,
              }
            : item
        )
      );

      setPublishingId(null);
    };

  const handleTransition =
    async (
      apartment: AdminApartmentRow
    ) => {
      if (
        !isTransitionCandidate(
          apartment
        )
      ) {
        alert(
          "현재 선착순 전환 대상이 아닙니다."
        );
        return;
      }

      const contractEndDate =
        getContractEndDate(apartment);

      const elapsedDays =
        contractEndDate
          ? getElapsedDays(
              contractEndDate
            )
          : 0;

      const confirmed =
        window.confirm(
          `"${apartment.name}" 단지를 선착순 분양으로 전환할까요?\n\n계약 종료 후 ${elapsedDays}일이 지났습니다.\n\n변경하면 홈·검색·상세페이지가 선착순 기준으로 표시됩니다.`
        );

      if (!confirmed) {
        return;
      }

      setTransitioningId(
        apartment.id
      );

      const currentData =
        apartment.data ?? {};

      const previousHistory =
        Array.isArray(
          currentData.conditionHistory
        )
          ? currentData.conditionHistory
          : [];

      const today = new Date();

      const historyItem = {
        date: [
          today.getFullYear(),
          String(
            today.getMonth() + 1
          ).padStart(2, "0"),
          String(
            today.getDate()
          ).padStart(2, "0"),
        ].join("-"),
        title:
          "청약에서 선착순으로 변경",
        description:
          "관리자 확인을 통해 단지 노출 단계가 청약에서 선착순 분양으로 변경되었습니다.",
      };

      const nextData = {
        ...currentData,
        listingStage:
          "firstCome" as const,
        conditionHistory: [
          historyItem,
          ...previousHistory,
        ],
      };

      const response =
        await fetch(
          "/api/admin/apartments/action",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                action:
                  "transitionToFirstCome",
                apartmentId:
                  apartment.id,
                data:
                  nextData,
              }),
          }
        );

      const result =
        (await response.json()) as {
          message?: string;
        };

      if (!response.ok) {
        console.error(
          "선착순 전환 오류:",
          result.message
        );

        alert(
          `선착순 전환 중 오류가 발생했습니다.

${
            result.message ??
            "알 수 없는 오류"
          }`
        );

        setTransitioningId(null);
        return;
      }

      setApartments((previous) =>
        previous.map((item) =>
          item.id === apartment.id
            ? {
                ...item,
                data: nextData,
              }
            : item
        )
      );

      setTransitioningId(null);

      alert(
        `"${apartment.name}" 단지가 선착순 분양으로 전환되었습니다.`
      );

      router.refresh();
    };

  const handleDelete =
    async (
      apartment: AdminApartmentRow
    ) => {
      const confirmed =
        window.confirm(
          `"${apartment.name}" 단지를 정말 삭제할까요?\n\n삭제하면 복구하기 어렵습니다.`
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(apartment.id);

      const response =
        await fetch(
          "/api/admin/apartments/delete",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                apartmentId:
                  apartment.id,
              }),
          }
        );

      const result =
        (await response.json()) as {
          message?: string;
          deletionType?:
            | "hard"
            | "excluded";
        };

      if (!response.ok) {
        console.error(
          "단지 삭제 오류:",
          result.message
        );

        alert(
          `삭제 중 오류가 발생했습니다.

${
            result.message ??
            "알 수 없는 오류"
          }`
        );

        setDeletingId(null);
        return;
      }

      setApartments((previous) =>
        previous.filter(
          (item) =>
            item.id !== apartment.id
        )
      );

      setDeletingId(null);

      alert(
        result.deletionType ===
          "excluded"
          ? "자동수집 제외 처리되었습니다."
          : "삭제되었습니다."
      );
    };

  const taskCounts = useMemo(() => {
    return {
      transition:
        apartments.filter(
          (apartment) =>
            isTransitionCandidate(
              apartment
            )
        ).length,

      pending:
        apartments.filter(
          (apartment) =>
            apartment.is_published !==
            true
        ).length,

      image:
        apartments.filter(
          (apartment) =>
            !hasHeroImage(apartment)
        ).length,

      location:
        apartments.filter(
          (apartment) =>
            !hasLocation(apartment)
        ).length,
    };
  }, [apartments]);

  const counts = useMemo(() => {
    const result = {
      all: apartments.length,
      subscription: 0,
      firstCome: 0,
      completed: 0,
      existing: 0,
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

        if (
          stage === "existing"
        ) {
          result.existing += 1;
        }
      }
    );

    return result;
  }, [apartments]);

  const filteredApartments =
    useMemo(() => {
      const query = keyword
        .trim()
        .toLowerCase();

      const result =
        apartments.filter(
          (apartment) => {
            const stage =
              getListingStage(
                apartment
              );

            const matchesKeyword =
              !query ||
              apartment.name
                ?.toLowerCase()
                .includes(query) ||
              apartment.region
                ?.toLowerCase()
                .includes(query) ||
              apartment.city
                ?.toLowerCase()
                .includes(query) ||
              apartment.district
                ?.toLowerCase()
                .includes(query) ||
              apartment.status
                ?.toLowerCase()
                .includes(query) ||
              apartment.brand
                ?.toLowerCase()
                .includes(query) ||
              apartment.builder
                ?.toLowerCase()
                .includes(query);

            const matchesStage =
              stageFilter === "all" ||
              stage === stageFilter;

            let matchesTask = true;

            if (
              task === "transition"
            ) {
              matchesTask =
                isTransitionCandidate(
                  apartment
                );
            }

            if (task === "pending") {
              matchesTask =
                apartment.is_published !==
                true;
            }

            if (task === "image") {
              matchesTask =
                !hasHeroImage(
                  apartment
                );
            }

            if (
              task === "location"
            ) {
              matchesTask =
                !hasLocation(
                  apartment
                );
            }

            return (
              matchesKeyword &&
              matchesStage &&
              matchesTask
            );
          }
        );

      if (sort === "name") {
        return [...result].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
              "ko"
            )
        );
      }

      if (
        sort === "published"
      ) {
        return [...result].sort(
          (a, b) =>
            Number(
              Boolean(
                b.is_published
              )
            ) -
            Number(
              Boolean(
                a.is_published
              )
            )
        );
      }

      return [...result].sort(
        (a, b) => {
          const first =
            new Date(
              a.updated_at ??
                a.created_at ??
                0
            ).getTime();

          const second =
            new Date(
              b.updated_at ??
                b.created_at ??
                0
            ).getTime();

          return second - first;
        }
      );
    }, [
      apartments,
      keyword,
      sort,
      stageFilter,
      task,
    ]);

  const taskInformation =
    getTaskInformation(task);

  const currentTaskCount =
    task === "transition"
      ? taskCounts.transition
      : task === "pending"
        ? taskCounts.pending
        : task === "image"
          ? taskCounts.image
          : task === "location"
            ? taskCounts.location
            : 0;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-zinc-900 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-emerald-400">
            JIBNUN ADMIN
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            단지 관리
          </h1>

          <p className="mt-4 text-sm leading-6 text-zinc-300 sm:text-base">
            등록된 단지를 검색하고 수정하거나 노출 상태를 관리합니다.
          </p>
        </div>

        {taskInformation && (
          <section
            className={[
              "mt-6 rounded-3xl border p-5 shadow-sm sm:p-6",
              taskInformation.className,
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black tracking-wide opacity-70">
                  {
                    taskInformation.eyebrow
                  }
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {
                    taskInformation.title
                  }
                </h2>

                <p className="mt-2 text-sm leading-6 opacity-75">
                  {
                    taskInformation.description
                  }
                </p>
              </div>

              <div className="flex items-center gap-3">
                <strong className="text-3xl font-black">
                  {currentTaskCount}
                  <span className="ml-1 text-sm">
                    건
                  </span>
                </strong>

                <Link
                  href="/admin/apartments"
                  className="rounded-xl border border-current/20 bg-white/70 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-current"
                >
                  전체 단지 보기
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="전체"
            value={counts.all}
          />

          <SummaryCard
            label="청약"
            value={
              counts.subscription
            }
          />

          <SummaryCard
            label="선착순"
            value={counts.firstCome}
          />

          <SummaryCard
            label="노출 종료"
            value={counts.completed}
          />
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/create"
                className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                + 신규 단지 등록
              </Link>

              <Link
                href="/admin"
                className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
              >
                대시보드
              </Link>

              <Link
                href="/"
                target="_blank"
                className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                홈페이지 보기
              </Link>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={keyword}
                onChange={(event) =>
                  setKeyword(
                    event.target.value
                  )
                }
                placeholder="단지명, 지역, 브랜드, 시공사 검색"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:w-80"
              />

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortOption
                  )
                }
                className="h-12 cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="updated">
                  최근 수정순
                </option>

                <option value="name">
                  이름순
                </option>

                <option value="published">
                  게시중 우선
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
            <FilterButton
              active={
                stageFilter === "all"
              }
              onClick={() =>
                setStageFilter("all")
              }
            >
              전체 {counts.all}
            </FilterButton>

            <FilterButton
              active={
                stageFilter ===
                "subscription"
              }
              onClick={() =>
                setStageFilter(
                  "subscription"
                )
              }
            >
              청약{" "}
              {counts.subscription}
            </FilterButton>

            <FilterButton
              active={
                stageFilter ===
                "firstCome"
              }
              onClick={() =>
                setStageFilter(
                  "firstCome"
                )
              }
            >
              선착순{" "}
              {counts.firstCome}
            </FilterButton>

            <FilterButton
              active={
                stageFilter ===
                "completed"
              }
              onClick={() =>
                setStageFilter(
                  "completed"
                )
              }
            >
              노출 종료{" "}
              {counts.completed}
            </FilterButton>

            <FilterButton
              active={
                stageFilter ===
                "existing"
              }
              onClick={() =>
                setStageFilter(
                  "existing"
                )
              }
            >
              기타{" "}
              {counts.existing}
            </FilterButton>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-zinc-500">
          <span>
            {loading
              ? "단지를 불러오는 중입니다."
              : `검색 결과 ${filteredApartments.length}개`}
          </span>

          {task && (
            <Link
              href="/admin/apartments"
              className="font-bold text-emerald-700 hover:underline"
            >
              작업 필터 해제
            </Link>
          )}
        </div>

        <div className="mt-4 grid gap-4">
          {loading &&
            Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-3xl bg-zinc-200"
              />
            ))}

          {!loading &&
            filteredApartments.map(
              (apartment) => {
                const heroImage =
                  getHeroImage(
                    apartment
                  );

                const stage =
                  getListingStage(
                    apartment
                  );

                const contractEndDate =
                  getContractEndDate(
                    apartment
                  );

                const elapsedDays =
                  contractEndDate
                    ? getElapsedDays(
                        contractEndDate
                      )
                    : null;

                const isDeleting =
                  deletingId ===
                  apartment.id;

                const isPublishing =
                  publishingId ===
                  apartment.id;

                const isTransitioning =
                  transitioningId ===
                  apartment.id;

                const transitionCandidate =
                  isTransitionCandidate(
                    apartment
                  );

                return (
                  <article
                    key={apartment.id}
                    className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                        {heroImage ? (
                          <img
                            src={heroImage}
                            alt={
                              apartment.name
                            }
                            className="h-36 w-full rounded-2xl object-cover sm:h-28 sm:w-36"
                          />
                        ) : (
                          <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-xs font-bold text-rose-500 sm:h-28 sm:w-36">
                            대표 이미지 없음
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StageBadge
                              stage={stage}
                            />

                            <PublishedBadge
                              published={Boolean(
                                apartment.is_published
                              )}
                            />

                            {!hasLocation(
                              apartment
                            ) && (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
                                위치 미확인
                              </span>
                            )}

                            {transitionCandidate && (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                                전환 확인 필요
                              </span>
                            )}
                          </div>

                          <h2 className="mt-3 truncate text-xl font-black sm:text-2xl">
                            {
                              apartment.name
                            }
                          </h2>

                          <p className="mt-2 truncate text-sm text-zinc-500">
                            📍{" "}
                            {apartment.region ||
                              apartment.city ||
                              apartment.data
                                ?.cityName ||
                              "지역 정보 없음"}
                          </p>

                          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-zinc-800">
                            {getCondition(
                              apartment
                            )}
                          </p>

                          {transitionCandidate &&
                            contractEndDate &&
                            elapsedDays !==
                              null && (
                              <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold leading-5 text-blue-700">
                                계약 종료{" "}
                                {formatParsedDate(
                                  contractEndDate
                                )}{" "}
                                · 종료 후{" "}
                                {elapsedDays}일
                                경과
                              </div>
                            )}

                          <p className="mt-2 text-xs text-zinc-400">
                            최근 수정{" "}
                            {formatDate(
                              apartment.updated_at ??
                                apartment.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-sm lg:justify-end">
                        {transitionCandidate && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransition(
                                apartment
                              )
                            }
                            disabled={
                              isTransitioning
                            }
                            className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {isTransitioning
                              ? "전환 중..."
                              : "선착순으로 전환"}
                          </button>
                        )}

                        <Link
                          href={`/admin/apartments/${apartment.slug}`}
                          className="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                          수정
                        </Link>

                        <Link
                          href={`/apartments/${apartment.slug}`}
                          target="_blank"
                          className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                          사이트 보기
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleTogglePublished(
                              apartment
                            )
                          }
                          disabled={
                            isPublishing
                          }
                          className={[
                            "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition",
                            "disabled:cursor-wait disabled:opacity-50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            apartment.is_published
                              ? "border border-amber-200 text-amber-700 hover:-translate-y-0.5 hover:bg-amber-50 focus:ring-amber-400"
                              : "bg-emerald-600 text-white hover:-translate-y-0.5 hover:bg-emerald-700 focus:ring-emerald-500",
                          ].join(" ")}
                        >
                          {isPublishing
                            ? "변경 중..."
                            : apartment.is_published
                              ? "숨기기"
                              : "게시하기"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              apartment
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="cursor-pointer rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                        >
                          {isDeleting
                            ? "삭제 중..."
                            : "삭제"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}

          {!loading &&
            filteredApartments.length ===
              0 && (
              <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center">
                <p className="text-lg font-black text-zinc-700">
                  처리할 단지가 없습니다.
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  현재 선택한 검색어 또는
                  작업 조건에 해당하는 단지가
                  없습니다.
                </p>

                {task && (
                  <Link
                    href="/admin/apartments"
                    className="mt-5 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
                  >
                    전체 단지 보기
                  </Link>
                )}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "cursor-pointer rounded-full border px-4 py-2 text-sm font-bold transition",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
        active
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
          : "border-zinc-200 bg-white text-zinc-600 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
      ].join(" ")}
    >
      {children}
    </button>
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

function PublishedBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-bold",
        published
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {published
        ? "게시중"
        : "숨김"}
    </span>
  );
}

function AdminApartmentsPageFallback() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="h-44 animate-pulse rounded-3xl bg-zinc-200" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-zinc-200"
            />
          ))}
        </div>

        <div className="mt-6 h-32 animate-pulse rounded-3xl bg-zinc-200" />

        <div className="mt-5 grid gap-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-3xl bg-zinc-200"
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function AdminApartmentsPage() {
  return (
    <Suspense
      fallback={
        <AdminApartmentsPageFallback />
      }
    >
      <AdminApartmentsPageContent />
    </Suspense>
  );
}

