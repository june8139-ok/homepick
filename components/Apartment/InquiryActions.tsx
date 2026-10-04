"use client";

import { useEffect, useState } from "react";

// No names, telephone numbers or messages are sent to analytics.
export function trackInquiryEvent(event: string, apartmentSlug: string, placement: string) {
  if (typeof window === "undefined") return;
  const detail = { event, apartment_slug: apartmentSlug, placement };
  try {
    window.dispatchEvent(new CustomEvent("jibnun:inquiry", { detail }));
    const analyticsWindow = window as Window & { dataLayer?: { push: (value: unknown) => unknown } };
    analyticsWindow.dataLayer?.push(detail);
  } catch {
    // Analytics must never block an inquiry or a navigation.
  }
}

export const KAKAO_CONSULT_URL = "https://pf.kakao.com/_RxfsxnX/chat";

type Props = {
  apartmentSlug: string;
  placement?: "hero" | "mobile";
  inquiryLabel?: string;
};

export default function InquiryActions({ apartmentSlug, placement = "hero", inquiryLabel = "상담신청" }: Props) {
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (placement !== "mobile") return;
    const update = () => {
      const active = document.activeElement;
      setEditing(active instanceof HTMLElement &&
        (Boolean(active.closest("form")) || active.isContentEditable));
    };
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, [placement]);

  const isMobile = placement === "mobile";
  if (isMobile && editing) return null;

  const buttons = <div className="grid grid-cols-2 gap-2.5">
    <a href="#inquiry"
      onClick={(event) => {
        trackInquiryEvent("inquiry_click", apartmentSlug, placement);
        const target = document.getElementById("inquiry");
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        target.focus({ preventScroll: true });
        window.history.replaceState(null, "", "#inquiry");
      }}
      className="flex min-h-12 items-center justify-center rounded-xl bg-[#0F766E] px-3 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-[#115E59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
      {isMobile ? inquiryLabel : (inquiryLabel === "상담신청" ? "잔여세대·최신조건 상담받기" : inquiryLabel)}
    </a>
    <a href={KAKAO_CONSULT_URL} target="_blank" rel="noopener noreferrer"
      onClick={() => trackInquiryEvent("kakao_click", apartmentSlug, placement)}
      className="flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center text-sm font-extrabold text-zinc-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
      <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.3 4.7 6.7l-1 3.4 4-2.4 2.3.2c5.5 0 10-3.5 10-7.9S17.5 3 12 3Z" /></svg>
      카톡상담
    </a>
  </div>;

  if (isMobile) return <nav aria-label="모바일 상담 바로가기" className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] md:hidden" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
    <div className="mx-auto max-w-6xl">{buttons}</div>
  </nav>;
  return <div className="mt-4 border-t border-zinc-100 pt-4">{buttons}<p className="mt-2 text-xs leading-5 text-zinc-500">이름과 연락처를 남기면 안내해드립니다. 방문 일정은 상담 후 결정하세요.</p></div>;
}
