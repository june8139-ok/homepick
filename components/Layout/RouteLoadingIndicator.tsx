"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

const MAX_LOADING_TIME = 8000;

function normalizeUrl(
  value: string,
) {
  const url = new URL(
    value,
    window.location.href,
  );

  /*
   * 주소 끝의 불필요한 슬래시 차이도
   * 같은 페이지로 판단합니다.
   */
  const pathname =
    url.pathname.length > 1
      ? url.pathname.replace(
          /\/+$/,
          "",
        )
      : url.pathname;

  return `${pathname}${url.search}${url.hash}`;
}

function currentUrl() {
  return normalizeUrl(
    window.location.href,
  );
}

export default function RouteLoadingIndicator() {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const loadingTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const clearLoadingTimer =
    useCallback(() => {
      if (
        loadingTimerRef.current
      ) {
        clearTimeout(
          loadingTimerRef.current,
        );

        loadingTimerRef.current =
          null;
      }
    }, []);

  const stopLoading =
    useCallback(() => {
      clearLoadingTimer();
      setLoading(false);
    }, [clearLoadingTimer]);

  const startLoading =
    useCallback(
      (
        destination?: string,
      ) => {
        /*
         * 이동할 주소가 현재 주소와 같다면
         * 로딩 표시를 시작하지 않습니다.
         */
        if (
          destination &&
          normalizeUrl(
            destination,
          ) === currentUrl()
        ) {
          stopLoading();
          return;
        }

        clearLoadingTimer();
        setLoading(true);

        /*
         * 라우터가 완료 신호를 놓치더라도
         * 무한 로딩으로 남지 않도록 합니다.
         */
        loadingTimerRef.current =
          setTimeout(() => {
            setLoading(false);

            loadingTimerRef.current =
              null;
          }, MAX_LOADING_TIME);
      },
      [
        clearLoadingTimer,
        stopLoading,
      ],
    );

  useEffect(() => {
    const handleNavigationStart = (
      event: Event,
    ) => {
      const customEvent =
        event as CustomEvent<{
          href?: string;
        }>;

      startLoading(
        customEvent.detail?.href,
      );
    };

    const handleDocumentClick = (
      event: MouseEvent,
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
          "a[href]",
        );

      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute(
          "download",
        )
      ) {
        return;
      }

      const url = new URL(
        anchor.href,
        window.location.href,
      );

      if (
        url.origin !==
        window.location.origin
      ) {
        return;
      }

      /*
       * 현재 주소와 완전히 같은 메뉴를 누르면
       * 로딩 표시를 시작하지 않습니다.
       */
      if (
        normalizeUrl(url.href) ===
        currentUrl()
      ) {
        stopLoading();
        return;
      }

      startLoading(url.href);
    };

    const handlePageShow = () => {
      stopLoading();
    };

    window.addEventListener(
      "jibnun:navigation-start",
      handleNavigationStart,
    );

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    document.addEventListener(
      "click",
      handleDocumentClick,
      true,
    );

    return () => {
      clearLoadingTimer();

      window.removeEventListener(
        "jibnun:navigation-start",
        handleNavigationStart,
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      document.removeEventListener(
        "click",
        handleDocumentClick,
        true,
      );
    };
  }, [
    clearLoadingTimer,
    startLoading,
    stopLoading,
  ]);

  /*
   * 경로 또는 검색 파라미터가 변경되면
   * 페이지 이동이 끝난 것으로 판단합니다.
   */
  useEffect(() => {
    const frame =
      requestAnimationFrame(
        stopLoading,
      );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    pathname,
    searchParams,
    stopLoading,
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