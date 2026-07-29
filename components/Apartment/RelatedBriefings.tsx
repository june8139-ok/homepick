import Image from "next/image";
import Link from "next/link";

import type {
  Briefing,
} from "../../types/briefing";

function formatDate(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date(value));
}

export default function RelatedBriefings({
  briefings,
}: {
  briefings: Briefing[];
}) {
  if (
    briefings.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
            RELATED BRIEFINGS
          </p>

          <h2 className="mt-1 text-xl font-black text-[#132238] sm:text-2xl">
            이 단지 관련 집눈 브리핑
          </h2>

          <p className="mt-2 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
            계약조건 변경과 청약 일정,
            최신 분양 소식을 확인하세요.
          </p>
        </div>

        <Link
          href="/briefing"
          className="
            shrink-0 rounded-lg
            text-xs font-bold
            text-emerald-700
            transition
            hover:translate-x-0.5
            hover:text-emerald-600
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
            sm:text-sm
          "
        >
          전체보기 →
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {briefings.map(
          (briefing) => (
            <article
              key={
                briefing.id
              }
              className="
                group min-w-0 overflow-hidden
                rounded-2xl border
                border-zinc-200 bg-white
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:shadow-md
                focus-within:ring-2
                focus-within:ring-emerald-500
                focus-within:ring-offset-2
              "
            >
              <Link
                href={`/briefing/${briefing.slug}`}
                className="block h-full outline-none"
              >
                {briefing.thumbnailUrl && (
                  <div className="relative h-36 overflow-hidden bg-zinc-100">
                    <Image
                      src={
                        briefing.thumbnailUrl
                      }
                      alt={`${briefing.title} 대표 이미지`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                      {briefing.category}
                    </span>

                    {briefing.region && (
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {briefing.region}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-2 break-keep text-base font-black leading-6 text-[#132238] transition-colors group-hover:text-emerald-700">
                    {briefing.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 break-keep text-xs leading-5 text-zinc-500">
                    {briefing.summary}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <time className="text-[10px] font-medium text-zinc-400">
                      {formatDate(
                        briefing.publishedAt ||
                          briefing.createdAt
                      )}
                    </time>

                    <span className="shrink-0 text-xs font-black text-emerald-700 transition-transform group-hover:translate-x-1">
                      읽어보기 →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          )
        )}
      </div>
    </section>
  );
}