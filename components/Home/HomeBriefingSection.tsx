import Link from "next/link";

import type {
  Briefing,
} from "../../types/briefing";

import BriefingCard from "./BriefingCard";

export default function HomeBriefingSection({
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
    <section className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white px-3 py-4 shadow-sm sm:mt-4 sm:rounded-3xl sm:px-7 sm:py-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-wide text-emerald-600 sm:text-sm">
            JIBNUN BRIEFING
          </p>

          <h2 className="mt-1 break-keep text-xl font-black tracking-tight text-[#132238] sm:text-2xl">
            최신 분양 브리핑
          </h2>

          <p className="mt-1 max-w-2xl break-keep text-xs leading-5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">
            청약 일정과 선착순 분양,
            계약조건 변경과 지역별
            분양시장 소식을 확인하세요.
          </p>
        </div>

        <Link
          href="/briefing"
          className="
            shrink-0 rounded-lg
            text-xs font-bold
            text-emerald-700
            transition-all duration-200
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

      {/* 모바일: 가로 스크롤 */}
      <div className="mt-4 overflow-x-auto pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-3">
          {briefings.map(
            (briefing) => (
              <div
                key={
                  briefing.id
                }
                className="w-[82vw] max-w-[330px] shrink-0 snap-center"
              >
                <BriefingCard
                  briefing={
                    briefing
                  }
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* 태블릿·PC */}
      <div className="mt-5 hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-3">
        {briefings.map(
          (briefing) => (
            <BriefingCard
              key={
                briefing.id
              }
              briefing={
                briefing
              }
            />
          )
        )}
      </div>
    </section>
  );
}
