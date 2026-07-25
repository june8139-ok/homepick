"use client";

import Link from "next/link";
import { useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const menuItems = [
  {
    label: "분양정보",
    href: "/search",
    query: "",
  },
  {
    label: "청약일정",
    href: "/search?q=청약",
    query: "청약",
  },
  {
    label: "선착순",
    href: "/search?q=선착순",
    query: "선착순",
  },
  {
    label: "지역별 보기",
    href: "/region",
    query: "",
  },
  {
    label: "비교하기",
    href: "/compare",
    query: "",
  },
];

function HomePickSymbol({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 72 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 28.5L31.5 8L54.5 28.5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M12 26.5V51H42"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M22 27V45"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M37 27V45"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M22 36H37"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle
        cx="50"
        cy="46"
        r="10"
        stroke="currentColor"
        strokeWidth="4.5"
      />

      <path
        d="M57.5 53.5L66 62"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      <path
        d="M47 40.5V51.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M47 41H51C53.2 41 54.5 42.2 54.5 44.2C54.5 46.2 53.2 47.4 51 47.4H47"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const currentQuery =
    searchParams.get("q") ?? "";

  const handleSearch = () => {
    const keyword =
      searchKeyword.trim();

    if (!keyword) {
      return;
    }

    setIsMenuOpen(false);

    router.push(
      `/search?q=${encodeURIComponent(
        keyword
      )}`
    );
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const isMenuActive = (
    item: (typeof menuItems)[number]
  ) => {
    if (
      item.href.startsWith(
        "/search"
      )
    ) {
      if (pathname !== "/search") {
        return false;
      }

      if (!item.query) {
        return ![
          "청약",
          "선착순",
        ].includes(currentQuery);
      }

      return (
        currentQuery ===
        item.query
      );
    }

    if (item.href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      item.href
    );
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-[72px] sm:px-6">
        {/* 로고 */}
        <Link
          href="/"
          onClick={() =>
            setIsMenuOpen(false)
          }
          className="
            group flex shrink-0
            items-center gap-2
            rounded-xl
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
            sm:gap-2.5
          "
          aria-label="홈픽 홈페이지로 이동"
        >
          <HomePickSymbol className="h-9 w-10 text-[#0F766E] transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-10 sm:w-11" />

          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-black tracking-[-0.04em] text-[#0F766E] sm:text-[22px]">
                홈픽
              </p>

              <p className="hidden text-xs font-extrabold tracking-tight text-zinc-400 sm:block">
                HomePick
              </p>
            </div>

            <p className="hidden text-[10px] font-semibold tracking-tight text-zinc-400 xl:block">
              전국 분양 아파트 플랫폼
            </p>
          </div>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav
          aria-label="주요 메뉴"
          className="hidden items-center gap-1 lg:flex"
        >
          {menuItems.map(
            (item) => {
              const active =
                isMenuActive(item);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
                    "hover:bg-emerald-50 hover:text-emerald-700",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-zinc-700",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            }
          )}
        </nav>

        {/* 데스크톱 검색 */}
        <div className="hidden items-center md:flex">
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400"
            >
              ⌕
            </span>

            <input
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(
                  event.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="단지명, 지역명 검색"
              aria-label="단지명 또는 지역명 검색"
              className="
                h-10 w-[210px]
                rounded-full border
                border-zinc-200
                bg-zinc-50 pl-10 pr-12
                text-sm font-medium
                text-[#111827]
                outline-none
                transition-all duration-200
                placeholder:text-zinc-400
                hover:border-emerald-300
                hover:bg-white
                focus:w-[250px]
                focus:border-emerald-500
                focus:bg-white
                focus:ring-4
                focus:ring-emerald-500/10
                xl:w-[220px]
                xl:focus:w-[270px]
              "
            />

            <button
              type="button"
              onClick={handleSearch}
              aria-label="검색 실행"
              className="
                absolute right-1.5 top-1/2
                flex h-7 w-7
                -translate-y-1/2
                cursor-pointer items-center
                justify-center rounded-full
                bg-[#0F766E]
                text-xs font-bold text-white
                transition-all duration-200
                hover:bg-emerald-600
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              →
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          onClick={() =>
            setIsMenuOpen(
              (current) =>
                !current
            )
          }
          aria-expanded={
            isMenuOpen
          }
          aria-controls="mobile-navigation"
          aria-label={
            isMenuOpen
              ? "메뉴 닫기"
              : "메뉴 열기"
          }
          className="
            flex h-10 w-10
            cursor-pointer items-center
            justify-center rounded-xl
            border border-zinc-200
            bg-white text-xl
            text-[#132238]
            transition-all duration-200
            hover:border-emerald-300
            hover:bg-emerald-50
            hover:text-emerald-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
            lg:hidden
          "
        >
          {isMenuOpen
            ? "×"
            : "☰"}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-zinc-100 bg-white shadow-xl lg:hidden"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
            {/* 모바일 검색 */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                ⌕
              </span>

              <input
                value={
                  searchKeyword
                }
                onChange={(
                  event
                ) =>
                  setSearchKeyword(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
                placeholder="단지명, 지역명 검색"
                aria-label="모바일 단지 검색"
                className="
                  h-12 w-full
                  rounded-2xl border
                  border-zinc-200
                  bg-zinc-50 pl-11 pr-14
                  text-sm font-medium
                  outline-none
                  transition-all duration-200
                  placeholder:text-zinc-400
                  focus:border-emerald-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-emerald-500/10
                "
              />

              <button
                type="button"
                onClick={
                  handleSearch
                }
                aria-label="모바일 검색 실행"
                className="
                  absolute right-2 top-1/2
                  flex h-8 w-8
                  -translate-y-1/2
                  items-center justify-center
                  rounded-xl bg-[#0F766E]
                  text-sm font-bold text-white
                  transition
                  hover:bg-emerald-600
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                "
              >
                →
              </button>
            </div>

            {/* 모바일 메뉴 */}
            <nav
              aria-label="모바일 주요 메뉴"
              className="mt-4 grid grid-cols-2 gap-2"
            >
              {menuItems.map(
                (item) => {
                  const active =
                    isMenuActive(
                      item
                    );

                  return (
                    <Link
                      key={
                        item.label
                      }
                      href={
                        item.href
                      }
                      onClick={() =>
                        setIsMenuOpen(
                          false
                        )
                      }
                      className={[
                        "flex min-h-12 items-center justify-center rounded-2xl border px-3 py-3 text-sm font-bold transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                        active
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-zinc-200 bg-white text-[#132238] hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                      ].join(
                        " "
                      )}
                    >
                      {
                        item.label
                      }
                    </Link>
                  );
                }
              )}
            </nav>

            <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs font-black text-[#0F766E]">
                홈픽 HomePick
              </p>

              <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                전국 분양 아파트와 청약·선착순 정보를 검색하고 비교하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}