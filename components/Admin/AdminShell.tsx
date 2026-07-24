"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "../../lib/supabase/browser";

const navigationItems = [
  {
    href: "/admin",
    label: "대시보드",
  },
  {
    href: "/admin/apartments",
    label: "단지관리",
  },
  {
    href: "/admin/create",
    label: "신규등록",
  },
  {
    href: "/admin/briefings",
    label: "분양 브리핑",
  },
];

function isActivePath(
  pathname: string,
  href: string
) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href ||
    pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  async function handleLogout() {
    const confirmed = window.confirm(
      "관리자 계정에서 로그아웃할까요?"
    );

    if (!confirmed) {
      return;
    }

    setLoggingOut(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.signOut();

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
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/admin"
              className="group flex shrink-0 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-black text-white transition group-hover:-translate-y-0.5 group-hover:bg-emerald-600">
                HP
              </span>

              <div className="hidden sm:block">
                <p className="font-black text-zinc-900">
                  HomePick Admin
                </p>

                <p className="text-xs text-zinc-400">
                  분양 운영 관리
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navigationItems.map((item) => {
                const active = isActivePath(
                  pathname,
                  item.href
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-zinc-500 hover:-translate-y-0.5 hover:bg-zinc-100 hover:text-zinc-900",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              target="_blank"
              className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              홈페이지
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="cursor-pointer rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:cursor-wait disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              {loggingOut
                ? "로그아웃 중..."
                : "로그아웃"}
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (previous) => !previous
              )
            }
            aria-expanded={mobileMenuOpen}
            aria-label="관리자 메뉴 열기"
            className="cursor-pointer rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 md:hidden"
          >
            {mobileMenuOpen ? "닫기" : "메뉴"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-100 bg-white px-4 py-4 md:hidden">
            <nav className="mx-auto grid max-w-7xl gap-2">
              {navigationItems.map((item) => {
                const active = isActivePath(
                  pathname,
                  item.href
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className={[
                      "cursor-pointer rounded-xl px-4 py-3 text-sm font-bold transition",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/"
                target="_blank"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="cursor-pointer rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                홈페이지 보기
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="cursor-pointer rounded-xl bg-zinc-900 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {loggingOut
                  ? "로그아웃 중..."
                  : "로그아웃"}
              </button>
            </nav>
          </div>
        )}
      </header>

      {children}
    </div>
  );
}