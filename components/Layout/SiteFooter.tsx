import Link from "next/link";

function HomePickSymbol({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 29.5L31.5 12L50 29.5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16 29V49H37"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M24 28V43M24 35H35M35 28V43"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      <circle
        cx="44"
        cy="45"
        r="7"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        d="M49 50L55 56"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const footerGroups = [
  {
    title: "부동산정보",
    items: [
      {
        label: "전체 부동산 검색",
        href: "/search",
      },
      {
        label: "선착순 분양",
        href: "/search?q=선착순",
      },
      {
        label: "최근 등록 단지",
        href: "/search",
      },
    ],
  },
  {
    title: "청약정보",
    items: [
      {
        label: "청약 일정",
        href: "/search?q=청약",
      },
      {
        label: "진행 중인 청약",
        href: "/search?q=청약중",
      },
      {
        label: "청약 단지 검색",
        href: "/search?q=청약",
      },
    ],
  },
  {
    title: "지역별 보기",
    items: [
      {
        label: "전국 지역",
        href: "/region",
      },
      {
        label: "지역 분양 현황",
        href: "/region",
      },
      {
        label: "지도에서 찾기",
        href: "/region",
      },
    ],
  },
  {
    title: "서비스",
    items: [
      {
        label: "단지 비교",
        href: "/compare",
      },
      {
        label: "방문예약",
        href: "/search",
      },
      {
        label: "관리자",
        href: "/admin",
      },
    ],
  },
];

const legalLinks = [
  {
    label: "이용약관",
    href: "/terms",
  },
  {
    label: "개인정보처리방침",
    href: "/privacy",
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_2.1fr] lg:items-start lg:gap-12">
          {/* 브랜드 영역 */}
          <div>
            <Link
              href="/"
              aria-label="HomePick 홈으로 이동"
              className="
                group inline-flex items-center gap-2.5
                rounded-lg
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              <HomePickSymbol className="h-11 w-11 text-[#0F766E] transition-transform duration-200 group-hover:-translate-y-0.5" />

              <div>
                <p className="text-2xl font-black tracking-[-0.04em] text-[#0F766E]">
                  HomePick
                </p>

                <p className="text-[9px] font-bold tracking-tight text-zinc-400">
                  전국 부동산 정보 플랫폼
                </p>
              </div>
            </Link>

            <p className="mt-4 text-base font-extrabold leading-6 text-[#111827]">
              전국 부동산을 한눈에.
              <br />
              내 집은 내가{" "}
              <span className="text-emerald-500">
                Pick.
              </span>
            </p>

            <p className="mt-2 max-w-[310px] break-keep text-xs leading-6 text-zinc-500">
              분양, 청약, 선착순 단지와 지역별
              부동산 정보를 쉽고 빠르게 확인하세요.
            </p>

            <Link
              href="/search"
              className="
                mt-4 inline-flex min-h-9
                items-center justify-center
                rounded-lg bg-[#0F766E]
                px-4 py-2 text-xs font-extrabold
                text-white
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-emerald-600
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              전체 부동산 보기 →
            </Link>
          </div>

          {/* 메뉴 링크 */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-extrabold text-[#111827]">
                  {group.title}
                </p>

                <nav className="mt-3 grid gap-2.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="
                        w-fit rounded text-xs
                        font-medium text-zinc-500
                        transition-colors duration-200
                        hover:text-emerald-700
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-emerald-500
                        focus-visible:ring-offset-2
                      "
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 영역 */}
        <div className="mt-7 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {legalLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[11px] font-semibold text-zinc-500 transition-colors hover:text-emerald-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <p className="mt-2 break-keep text-[10px] leading-5 text-zinc-400">
              HomePick의 정보는 참고용이며, 계약 전 모집공고와
              공급계약서를 최종 확인하시기 바랍니다.
            </p>
          </div>

          <p className="shrink-0 text-[11px] font-medium text-zinc-400">
            © {new Date().getFullYear()} HomePick. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}