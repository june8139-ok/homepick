"use client";

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
