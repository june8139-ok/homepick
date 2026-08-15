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
      setShouldLoad(true);
      return;
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
           * 홈 초기 Lighthouse 측정 구간에
           * 지도 + d3-geo 청크가 너무 일찍
           * 들어오지 않도록 기존에 가깝게 유지합니다.
           * 400px 정도만 미리 준비해 실제 스크롤
           * 직전에는 로딩을 시작합니다.
           */
          rootMargin:
            "400px 0px",
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
