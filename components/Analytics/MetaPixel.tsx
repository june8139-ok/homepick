"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PIXEL_SCRIPT_URL =
  "https://connect.facebook.net/en_US/fbevents.js";

type InquiryAnalyticsDetail = {
  event?: string;
  apartment_slug?: string;
};

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

let lastPageViewPath: string | null = null;
let lastViewContentSlug: string | null = null;
let lastLeadKey: string | null = null;
let lastLeadAt = 0;

function isValidPixelId(value: string) {
  return /^\d+$/.test(value);
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }

  return pathname || "/";
}

function isTrackingExcluded(pathname: string) {
  const path = normalizePathname(pathname);

  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/login" ||
    path.startsWith("/login/")
  );
}

function getApartmentSlug(pathname: string) {
  const segments = normalizePathname(pathname)
    .split("/")
    .filter(Boolean);

  if (segments[0] !== "apartments" || !segments[1]) {
    return null;
  }

  try {
    return decodeURIComponent(segments[1]);
  } catch {
    return segments[1];
  }
}

function trackFbq(...args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch {
    // 픽셀 오류가 사이트 기능에 영향을 주지 않도록 처리
  }
}

function trackCurrentRoute(pathname: string) {
  if (
    isTrackingExcluded(pathname) ||
    typeof window.fbq !== "function"
  ) {
    return;
  }

  const path = normalizePathname(pathname);

  // 페이지 방문 추적
  if (lastPageViewPath !== path) {
    lastPageViewPath = path;

    trackFbq("track", "PageView");
  }

  // 아파트 상세페이지 조회 추적
  const slug = getApartmentSlug(path);

  if (!slug) {
    lastViewContentSlug = null;
    return;
  }

  if (lastViewContentSlug === slug) {
    return;
  }

  lastViewContentSlug = slug;

  trackFbq("track", "ViewContent", {
    content_ids: [slug],
    content_name: slug,
    content_type: "product",
  });
}

export default function MetaPixel() {
  const pathname = usePathname();

  const pixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

  const validPixelId = isValidPixelId(pixelId);

  const excluded = isTrackingExcluded(pathname);

  // 페이지 이동 추적
  useEffect(() => {
    if (!validPixelId || excluded) {
      return;
    }

    trackCurrentRoute(pathname);
  }, [pathname, validPixelId, excluded]);

  // 상담 신청 성공 추적
  useEffect(() => {
    if (!validPixelId || excluded) {
      return;
    }

    const handleInquiry = (event: Event) => {
      const detail = (
        event as CustomEvent<InquiryAnalyticsDetail>
      ).detail;

      if (detail?.event !== "inquiry_success") {
        return;
      }

      const slug = String(
        detail.apartment_slug ?? ""
      ).trim();

      const leadKey =
        slug || normalizePathname(pathname);

      const now = Date.now();

      // 동일 이벤트의 짧은 시간 내 중복 방지
      if (
        lastLeadKey === leadKey &&
        now - lastLeadAt < 2000
      ) {
        return;
      }

      // 픽셀이 초기화되지 않았다면 전송하지 않음
      if (typeof window.fbq !== "function") {
        return;
      }

      lastLeadKey = leadKey;
      lastLeadAt = now;

      trackFbq(
        "track",
        "Lead",
        slug
          ? {
              content_ids: [slug],
              content_name: slug,
              content_type: "product",
            }
          : {
              content_type: "product",
            }
      );
    };

    window.addEventListener(
      "jibnun:inquiry",
      handleInquiry
    );

    return () => {
      window.removeEventListener(
        "jibnun:inquiry",
        handleInquiry
      );
    };
  }, [pathname, validPixelId, excluded]);

  if (!validPixelId || excluded) {
    return null;
  }

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'${PIXEL_SCRIPT_URL}');

fbq('init', '${pixelId}');
`,
      }}
      onReady={() => {
        trackCurrentRoute(window.location.pathname);
      }}
    />
  );
}