import Image from "next/image";
import Link from "next/link";

function JibnunSymbol({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/jibnun-logo-symbol.png"
      alt=""
      aria-hidden="true"
      width={72}
      height={64}
      className={className}
    />
  );
}

const serviceLinks = [
  {
    label: "분양정보",
    href: "/search",
  },
  {
    label: "청약일정",
    href: "/search?q=청약",
  },
  {
    label: "선착순 분양",
    href: "/search?q=선착순",
  },
  {
    label: "지역별 보기",
    href: "/region",
  },
  {
    label: "단지 비교",
    href: "/compare",
  },
];

const popularRegions = [
  "대전",
  "청주",
  "천안",
  "평택",
  "대구",
  "울산",
  "부산",
  "양주",
];

const legalLinks = [
  {
    label:
      "개인정보처리방침",
    href: "/privacy",
    emphasized: true,
  },
  {
    label:
      "이용약관",
    href: "/terms",
    emphasized: false,
  },
];

export default function SiteFooter() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[1.05fr_0.7fr_1.35fr] md:items-start md:gap-8 lg:gap-10">
          {/* 브랜드 소개 */}
          <section>
            <Link
              href="/"
              aria-label="집눈 홈페이지로 이동"
              className="
                group inline-flex items-center gap-2.5 rounded-lg
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              <JibnunSymbol className="h-10 w-11 transition-transform duration-200 group-hover:-translate-y-0.5" />

              <div className="min-w-0">
                <p className="text-xl font-black tracking-[-0.045em] text-[#0F766E]">
                  집눈
                </p>

                <p className="text-[9px] font-bold tracking-tight text-zinc-500">
                  전국 부동산을 한눈에
                </p>
              </div>
            </Link>

            <p className="mt-3 max-w-[470px] break-keep text-[11px] leading-5 text-zinc-500 sm:text-xs sm:leading-6">
              집눈은 전국 분양
              아파트와 청약 일정,
              선착순 분양 단지의
              분양가, 계약조건과
              입지 정보를 검색하고
              비교할 수 있는 부동산
              플랫폼입니다.
            </p>
          </section>

          {/* 주요 서비스 */}
          <section>
            <h2 className="text-sm font-extrabold text-[#111827]">
              주요 서비스
            </h2>

            <nav
              aria-label="푸터 주요 서비스"
              className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2"
            >
              {serviceLinks.map(
                (item) => (
                  <Link
                    key={
                      item.label
                    }
                    href={
                      item.href
                    }
                    className="
                      w-fit rounded text-xs font-medium text-zinc-500
                      transition-all duration-200
                      hover:translate-x-0.5
                      hover:text-emerald-700
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-emerald-500
                      focus-visible:ring-offset-2
                    "
                  >
                    {
                      item.label
                    }
                  </Link>
                )
              )}
            </nav>
          </section>

          {/* 인기 지역 */}
          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold text-[#111827]">
                인기 지역 분양정보
              </h2>

              <Link
                href="/region"
                className="
                  shrink-0 rounded text-[11px] font-bold text-emerald-700
                  transition hover:translate-x-0.5
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                "
              >
                전체 지역 →
              </Link>
            </div>

            <nav
              aria-label="인기 지역 분양정보"
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
            >
              {popularRegions.map(
                (region) => (
                  <Link
                    key={
                      region
                    }
                    href={`/region/${encodeURIComponent(
                      region
                    )}`}
                    className="
                      inline-flex min-h-9 items-center justify-center
                      rounded-lg border border-zinc-200 bg-zinc-50
                      px-2.5 py-2 text-[11px] font-bold text-zinc-600
                      transition-all duration-200
                      active:scale-[0.97]
                      active:border-emerald-300
                      active:bg-emerald-50
                      active:text-emerald-700
                      hover:-translate-y-0.5
                      hover:border-emerald-300
                      hover:bg-emerald-50
                      hover:text-emerald-700
                      hover:shadow-sm
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-emerald-500
                      focus-visible:ring-offset-2
                    "
                  >
                    {region} 분양
                  </Link>
                )
              )}
            </nav>
          </section>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 border-t border-zinc-100 pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <nav
                aria-label="약관 및 정책"
                className="flex flex-wrap items-center gap-x-4 gap-y-2"
              >
                {legalLinks.map(
                  (item) => (
                    <Link
                      key={
                        item.label
                      }
                      href={
                        item.href
                      }
                      className={[
                        "rounded text-[11px] transition-colors",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-emerald-500",
                        "focus-visible:ring-offset-2",
                        item.emphasized
                          ? "font-extrabold text-zinc-700 hover:text-emerald-700"
                          : "font-semibold text-zinc-500 hover:text-emerald-700",
                      ].join(
                        " "
                      )}
                    >
                      {
                        item.label
                      }
                    </Link>
                  )
                )}

                <a
                  href="mailto:june8139@gmail.com"
                  className="
                    rounded text-[11px] font-semibold text-zinc-500
                    transition-colors hover:text-emerald-700
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-500
                    focus-visible:ring-offset-2
                  "
                >
                  문의하기
                </a>
              </nav>

              <p className="mt-2 text-[10px] leading-5 text-zinc-400">
                운영자 옥광준 · 문의
                {" "}
                june8139@gmail.com
              </p>

              <p className="mt-1 max-w-4xl break-keep text-[10px] leading-5 text-zinc-400">
                집눈에서 제공하는
                분양가, 계약조건,
                청약일정 및 단지
                정보는 참고용입니다.
                계약 또는 청약 전
                모집공고문, 공급계약서와
                사업주체의 최신 안내를
                반드시 확인해주세요.
              </p>
            </div>

            <p className="shrink-0 text-[10px] font-medium text-zinc-400 sm:text-[11px]">
              © {currentYear} 집눈.
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}