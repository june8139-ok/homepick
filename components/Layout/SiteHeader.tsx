"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  {
    label: "분양정보",
    href: "/search",
  },
  {
    label: "청약일정",
    href: "/search?q=청약",
  },
  {
    label: "선착순",
    href: "/search?q=선착순",
  },
  {
    label: "지역별 보기",
    href: "/region",
  },
  {
    label: "비교하기",
    href: "/compare",
  },
];

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
        d="M24 28V43"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      <path
        d="M24 35H35"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      <path
        d="M35 28V43"
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

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const handleSearch = () => {
    const keyword = searchKeyword.trim();

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

  return (
    <header className="sticky top-0 z-[100] border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-6">
        {/* 로고 */}
        <Link
          href="/"
          onClick={() =>
            setIsMenuOpen(false)
          }
          className="
            group flex shrink-0
            items-center gap-2.5
            rounded-xl
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
          "
          aria-label="HomePick 홈으로 이동"
        >
          <HomePickSymbol className="h-10 w-10 text-[#0F766E] transition-transform duration-200 group-hover:-translate-y-0.5" />

          <div>
            <p className="text-[22px] font-black tracking-tight text-[#0F766E]">
              HomePick
            </p>

            <p className="hidden text-[10px] font-semibold tracking-tight text-zinc-400 xl:block">
              전국 부동산을 한눈에
            </p>
          </div>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden items-center gap-1 lg:flex">
          {menuItems.map((item) => {
            const active =
              item.href === "/search"
                ? pathname === "/search"
                : pathname.startsWith(
                    item.href.split("?")[0]
                  );

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
          })}
        </nav>

        {/* 우측 검색 */}
        <div className="hidden items-center gap-3 md:flex">
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
              className="
                h-10 w-[220px]
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
                focus:w-[260px]
                focus:border-emerald-500
                focus:bg-white
                focus:ring-4
                focus:ring-emerald-500/10
              "
            />

            <button
              type="button"
              onClick={handleSearch}
              aria-label="검색"
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

        {/* 모바일 메뉴 */}
        <button
          type="button"
          onClick={() =>
            setIsMenuOpen(
              (current) => !current
            )
          }
          aria-expanded={isMenuOpen}
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
          {isMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {isMenuOpen && (
        <div className="border-t border-zinc-100 bg-white px-5 py-5 shadow-xl lg:hidden">
          <div
            className="
              mx-auto
              flex
              min-h-[74px]
              w-full
              max-w-[1600px]
              items-center
              justify-between
              gap-6
              px-4
              sm:px-6
              lg:px-8
            "
           >
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
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
                className="
                  h-12 w-full rounded-2xl
                  border border-zinc-200
                  bg-zinc-50 pl-11 pr-4
                  text-sm font-medium
                  outline-none
                  transition-all duration-200
                  focus:border-emerald-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-emerald-500/10
                "
              />
            </div>

            <nav className="mt-4 grid grid-cols-2 gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="
                    flex min-h-12 items-center
                    justify-center rounded-2xl
                    border border-zinc-200
                    bg-white px-3 py-3
                    text-sm font-bold
                    text-[#132238]
                    transition-all duration-200
                    hover:border-emerald-300
                    hover:bg-emerald-50
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
        </div>
      )}
    </header>
  );
}