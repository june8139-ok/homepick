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

function getCategoryClass(
  category: string
) {
  if (
    category === "청약 일정"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    category === "선착순 소식"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    category ===
    "계약조건 변경"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-violet-50 text-violet-700";
}

export default function BriefingCard({
  briefing,
}: {
  briefing: Briefing;
}) {
  return (
    <article
      className="
        group min-w-0 overflow-hidden
        rounded-2xl border
        border-zinc-200 bg-white
        shadow-sm transition-all
        duration-200
        hover:-translate-y-1
        hover:border-emerald-300
        hover:shadow-lg
        focus-within:ring-2
        focus-within:ring-emerald-500
        focus-within:ring-offset-2
        sm:rounded-3xl
      "
    >
      <Link
        href={`/briefing/${briefing.slug}`}
        className="block h-full outline-none"
      >
        <div className="relative h-36 overflow-hidden bg-zinc-100 sm:h-44">
          {briefing.thumbnailUrl ? (
            <Image
              src={
                briefing.thumbnailUrl
              }
              alt={`${briefing.title} 대표 이미지`}
              fill
              sizes="(max-width: 640px) 82vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50">
              <div className="text-center">
                <p className="text-3xl">
                  📰
                </p>

                <p className="mt-2 text-[10px] font-bold text-zinc-400 sm:text-xs">
                  홈픽 브리핑
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[10px] font-extrabold sm:text-xs",
                getCategoryClass(
                  briefing.category
                ),
              ].join(" ")}
            >
              {briefing.category}
            </span>

            {briefing.region && (
              <span className="text-[10px] font-semibold text-zinc-400 sm:text-xs">
                {briefing.region}
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 min-h-12 break-keep text-base font-black leading-6 text-[#132238] transition-colors group-hover:text-emerald-700 sm:text-lg sm:leading-7">
            {briefing.title}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-10 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
            {briefing.summary}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <time className="text-[10px] font-medium text-zinc-400 sm:text-xs">
              {formatDate(
                briefing.publishedAt ||
                  briefing.createdAt
              )}
            </time>

            <span className="shrink-0 text-xs font-black text-emerald-700 transition-transform group-hover:translate-x-1 sm:text-sm">
              읽어보기 →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}