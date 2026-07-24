import Link from "next/link";

import {
  requireAdmin,
} from "../../../lib/requireAdmin";

import type {
  BriefingRow,
} from "../../../types/briefing";

import BriefingActions from "../../../components/Admin/BriefingActions";

function formatDate(
  value: string | null
) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default async function AdminBriefingsPage() {
  const {
    supabase,
  } = await requireAdmin();

  const {
    data,
    error,
  } = await supabase
    .from("briefings")
    .select("*")
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      error.message
    );
  }

  const briefings =
    (data ??
      []) as BriefingRow[];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-emerald-600">
            BRIEFING MANAGEMENT
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#132238]">
            분양 브리핑 관리
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            작성한 브리핑을 수정하고
            공개 상태를 관리합니다.
          </p>
        </div>

        <Link
          href="/admin/briefings/new"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[#132238] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md"
        >
          + 새 브리핑 작성
        </Link>
      </div>

      {briefings.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1fr)_150px_130px_190px] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-extrabold text-zinc-500 md:grid">
            <span>브리핑</span>
            <span>상태</span>
            <span>수정일</span>
            <span>관리</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {briefings.map(
              (briefing) => (
                <article
                  key={
                    briefing.id
                  }
                  className="grid gap-4 px-4 py-4 transition hover:bg-zinc-50 sm:px-5 md:grid-cols-[minmax(0,1fr)_150px_130px_190px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">
                        {
                          briefing.category
                        }
                      </span>

                      {briefing.region && (
                        <span className="text-[10px] font-semibold text-zinc-400">
                          {
                            briefing.region
                          }
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 truncate text-base font-black text-[#132238]">
                      {
                        briefing.title
                      }
                    </h2>

                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                      {
                        briefing.summary
                      }
                    </p>
                  </div>

                  <div>
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                        briefing.is_published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600",
                      ].join(
                        " "
                      )}
                    >
                      {briefing.is_published
                        ? "공개"
                        : "임시저장"}
                    </span>
                  </div>

                  <time className="text-xs text-zinc-400">
                    {formatDate(
                      briefing.updated_at
                    )}
                  </time>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/briefings/${briefing.id}/edit`}
                      className="inline-flex items-center rounded-lg bg-[#132238] px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
                    >
                      수정
                    </Link>

                    {briefing.is_published && (
                      <Link
                        href={`/briefing/${briefing.slug}`}
                        target="_blank"
                        className="inline-flex items-center rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        보기
                      </Link>
                    )}

                    <BriefingActions
                      id={
                        briefing.id
                      }
                      isPublished={
                        briefing.is_published
                      }
                    />
                  </div>
                </article>
              )
            )}
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="text-xl font-black">
            작성된 브리핑이 없습니다.
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            첫 분양 브리핑을 작성해보세요.
          </p>
        </section>
      )}
    </main>
  );
}