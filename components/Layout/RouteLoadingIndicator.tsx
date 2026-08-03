"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

export default function RouteLoadingIndicator() {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {
    const start = () => {
      setLoading(true);
    };

    const handleDocumentClick = (
      event: MouseEvent
    ) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target as HTMLElement | null;

      const anchor =
        target?.closest<HTMLAnchorElement>(
          "a[href]"
        );

      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(
        anchor.href,
        window.location.href
      );

      if (
        url.origin !==
          window.location.origin ||
        url.href ===
          window.location.href
      ) {
        return;
      }

      setLoading(true);
    };

    window.addEventListener(
      "jibnun:navigation-start",
      start
    );

    document.addEventListener(
      "click",
      handleDocumentClick,
      true
    );

    return () => {
      window.removeEventListener(
        "jibnun:navigation-start",
        start
      );

      document.removeEventListener(
        "click",
        handleDocumentClick,
        true
      );
    };
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [
    pathname,
    searchParams,
  ]);

  if (!loading) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-emerald-100"
      >
        <div className="h-full w-1/2 animate-[jibnun-route-progress_1s_ease-in-out_infinite] bg-[#0F8F88]" />
      </div>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[9998] -translate-x-1/2 rounded-full bg-[#0F766E] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_12px_32px_rgba(15,118,110,0.28)]"
      >
        페이지 이동 중…
      </div>

      <style jsx global>{`
        @keyframes jibnun-route-progress {
          0% {
            transform: translateX(-110%);
          }

          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </>
  );
}
