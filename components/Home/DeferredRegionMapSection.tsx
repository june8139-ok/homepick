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

    /*
     * 아주 오래된 브라우저에서 IntersectionObserver가
     * 없을 경우 Effect 본문에서 직접 setState하지 않고
     * animation frame으로 넘겨 React lint 경고를 피합니다.
     */
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
          /*
           * 데스크톱은 홈 콘텐츠 높이가 짧아 지도 섹션이
           * 초기 화면과 가까워집니다. 미리보기 여백을 두면
           * Lighthouse 초기 측정 중 d3-geo 청크까지 불러와
           * TBT가 튈 수 있으므로 실제 뷰포트 진입 시점에만
           * 로드합니다.
           */
          rootMargin: "0px",
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
