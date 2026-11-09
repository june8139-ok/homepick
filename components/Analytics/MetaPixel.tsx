"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_STORAGE_KEY = "jibnun:meta-pixel-consent";
const PIXEL_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

type StoredConsent = "granted" | "denied";
type ConsentStatus = "loading" | "unset" | StoredConsent;

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
  const segments = normalizePathname(pathname).split("/").filter(Boolean);
  if (segments[0] !== "apartments" || !segments[1]) {
    return null;
  }
  try {
    return decodeURIComponent(segments[1]);
  } catch {
    return segments[1];
  }
}

function readConsent(): StoredConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "granted" || value === "denied") {
      return value;
    }
  } catch {
    return null;
  }
  return null;
}

function writeConsent(value: StoredConsent) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage can be blocked; tracking still follows in-memory consent.
  }
}

function trackFbq(...args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch {
    // Tracking must never affect page rendering or form submission.
  }
}

function trackCurrentRoute(pathname: string) {
  if (isTrackingExcluded(pathname) || typeof window.fbq !== "function") {
    return;
  }

  const path = normalizePathname(pathname);

  if (lastPageViewPath !== path) {
    lastPageViewPath = path;
    trackFbq("track", "PageView");
  }

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

function MetaPixelConsentBar({
  onChoice,
}: {
  onChoice: (value: StoredConsent) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-zinc-600">
          광고 성과 측정을 위해 Meta 픽셀을 사용합니다. 동의 전에는
          실행되지 않으며,{" "}
          <a href="/privacy" className="font-semibold text-zinc-800 underline-offset-2 hover:underline">
            개인정보처리방침
          </a>
          에서 자세한 내용을 확인할 수 있습니다.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onChoice("denied")}
            className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            거부
          </button>
          <button
            type="button"
            onClick={() => onChoice("granted")}
            className="min-h-11 rounded-xl bg-[#0F766E] px-4 text-sm font-extrabold text-white transition hover:bg-[#115E59]"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MetaPixel() {
  const pathname = usePathname();
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  const [consent, setConsent] = useState<ConsentStatus>("loading");

  useEffect(() => {
    setConsent(readConsent() ?? "unset");
  }, []);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    trackCurrentRoute(pathname);
  }, [consent, pathname]);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    const handleInquiry = (event: Event) => {
      const detail = (event as CustomEvent<InquiryAnalyticsDetail>).detail;
      if (detail?.event !== "inquiry_success") {
        return;
      }

      if (isTrackingExcluded(pathname)) {
        return;
      }

      const slug = String(detail.apartment_slug ?? "").trim();
      const leadKey = slug || normalizePathname(pathname);
      const now = Date.now();
      if (lastLeadKey === leadKey && now - lastLeadAt < 2000) {
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
          : { content_type: "product" },
      );
    };

    window.addEventListener("jibnun:inquiry", handleInquiry);
    return () => {
      window.removeEventListener("jibnun:inquiry", handleInquiry);
    };
  }, [consent, pathname]);

  if (!isValidPixelId(pixelId)) {
    return null;
  }

  const excluded = isTrackingExcluded(pathname);
  const showConsentBar = !excluded && consent === "unset";
  const loadPixel = !excluded && consent === "granted";

  function handleConsent(value: StoredConsent) {
    writeConsent(value);
    setConsent(value);
  }

  return (
    <>
      {loadPixel ? (
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
      ) : null}

      {showConsentBar ? <MetaPixelConsentBar onChoice={handleConsent} /> : null}
    </>
  );
}
