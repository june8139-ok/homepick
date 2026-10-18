"use client";

import { useEffect, useRef, useState } from "react";

// Analytics never contain names, telephone numbers, messages or inquiry IDs.
export function trackInquiryEvent(event: string, apartmentSlug: string, placement: string) {
  if (typeof window === "undefined") return;
  const detail = { event, apartment_slug: apartmentSlug, placement };
  try {
    window.dispatchEvent(new CustomEvent("jibnun:inquiry", { detail }));
    const analyticsWindow = window as Window & { dataLayer?: { push: (value: unknown) => unknown } };
    analyticsWindow.dataLayer?.push(detail);
  } catch {
    // Analytics must never block an inquiry or navigation.
  }
}

export const KAKAO_CONSULT_URL = "https://pf.kakao.com/_RxfsxnX/chat";
export const NAVER_TALK_URL = "https://talk.naver.com/profile/wettd18/form/3";

export function ChatConsultLinks({ apartmentSlug, placement, kakaoUrl = KAKAO_CONSULT_URL }: {
  apartmentSlug: string;
  placement: string;
  kakaoUrl?: string;
}) {
  const classes = "flex min-h-12 items-center justify-center rounded-xl px-3 py-3 text-center text-sm font-bold transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";
  return <div className="grid grid-cols-2 gap-2.5">
    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer"
      onClick={() => trackInquiryEvent("kakao_click", apartmentSlug, placement)}
      className={`${classes} bg-[#FEE500] text-zinc-900`}>카카오톡 상담</a>
    <a href={NAVER_TALK_URL} target="_blank" rel="noopener noreferrer"
      onClick={() => trackInquiryEvent("naver_talk_click", apartmentSlug, placement)}
      className={`${classes} bg-[#03C75A] text-white`}>네이버 톡톡</a>
  </div>;
}

function ChatPicker({ apartmentSlug, placement }: { apartmentSlug: string; placement: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <>
    <button type="button" aria-haspopup="dialog" onClick={() => {
      trackInquiryEvent("chat_picker_open", apartmentSlug, placement);
      setOpen(true);
    }} className="flex min-h-12 items-center justify-center rounded-xl border border-[#FEE500] bg-[#FEE500] px-3 py-3 text-center text-sm font-extrabold text-zinc-800 transition hover:border-[#FADA0A] hover:bg-[#FADA0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
      <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.3 4.7 6.7l-1 3.4 4-2.4 2.3.2c5.5 0 10-3.5 10-7.9S17.5 3 12 3Z" /></svg>
      채팅상담
    </button>
    <dialog ref={dialogRef} aria-label="채팅 상담 선택" onClose={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }}
      onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-3xl border-0 bg-white p-5 text-zinc-900 shadow-xl backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-3xl sm:p-6"
      style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">편한 채팅으로 문의해 주세요</h2>
        <button type="button" aria-label="채팅 선택 닫기" onClick={() => setOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">×</button>
      </div>
      <p className="mb-5 mt-2 text-sm leading-6 text-zinc-500">관심 있는 단지명을 알려주시면 상담을 도와드립니다.</p>
      <ChatConsultLinks apartmentSlug={apartmentSlug} placement={`${placement}_picker`} />
    </dialog>
  </>;
}

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
    <a href="#inquiry" onClick={(event) => {
      trackInquiryEvent("inquiry_click", apartmentSlug, placement);
      const target = document.getElementById("inquiry");
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      target.focus({ preventScroll: true });
      window.history.replaceState(null, "", "#inquiry");
    }} className="flex min-h-12 items-center justify-center rounded-xl bg-[#0F766E] px-3 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-[#115E59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
      {isMobile ? inquiryLabel : (inquiryLabel === "상담신청" ? "잔여세대·최신조건 상담받기" : inquiryLabel)}
    </a>
    <ChatPicker apartmentSlug={apartmentSlug} placement={placement} />
  </div>;

  if (isMobile) return <nav aria-label="모바일 상담 바로가기" className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white p-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] md:hidden" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
    <div className="mx-auto max-w-6xl">{buttons}</div>
  </nav>;
  return <div className="mt-4 border-t border-zinc-100 pt-4">{buttons}<p className="mt-2 text-xs leading-5 text-zinc-500">이름과 연락처를 남기면 안내해드립니다. 방문 일정은 상담 후 결정하세요.</p></div>;
}
