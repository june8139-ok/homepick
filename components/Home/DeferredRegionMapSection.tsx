"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Apartment,
} from "../../types/apartment";

const RegionMapSection =
  dynamic(
    () =>
      import(
        "./RegionMapSection"
      ),
    {
      ssr: false,

      loading: () => (
        <RegionMapFallback />
      ),
    }
  );

function RegionMapFallback() {
  return (
    <section
      aria-hidden="true"
      className="mt-6 overflow-hidden rounded-[30px] border border-zinc-200/70 bg-white p-4 shadow-[0_18px_48px_rgba(15,118,110,0.05)] sm:p-7"
    >
      <div className="h-4 w-28 rounded bg-zinc-200" />
      <div className="mt-3 h-8 w-52 rounded-lg bg-zinc-200" />
      <div className="mt-2 h-5 w-full max-w-md rounded bg-zinc-100" />
      <div className="mt-5 min-h-[500px] rounded-3xl bg-zinc-100 sm:min-h-[620px] xl:min-h-[660px]" />
    </section>
  );
}

export default function DeferredRegionMapSection({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    shouldLoad,
    setShouldLoad,
  ] = useState(false);

  useEffect(() => {
    const element =
      rootRef.current;

    if (
      !element ||
      shouldLoad
    ) {
      return;
    }

    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      const frame =
        requestAnimationFrame(
          () => {
            setShouldLoad(true);
          }
        );

      return () =>
        cancelAnimationFrame(
          frame
        );
    }

    /*
     * 모바일은 홈 세로 길이가 길어서 0px 진입 로딩이면
     * 실제 화면에 들어온 뒤에야 청크를 가져오기 시작해
     * 지도 영역이 비어 보일 수 있습니다.
     *
     * 모바일/태블릿은 700px 전에 준비하고,
     * 데스크톱은 Lighthouse TBT 보호를 위해 0px 유지합니다.
     */
    const isDesktop =
      window.matchMedia(
        "(min-width: 1024px)"
      ).matches;

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting
            )
          ) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        {
          rootMargin:
            isDesktop
              ? "0px"
              : "700px 0px",
          threshold: 0.01,
        }
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef}>
      {shouldLoad ? (
        <RegionMapSection
          apartments={
            apartments
          }
        />
      ) : (
        <RegionMapFallback />
      )}
    </div>
  );
}
