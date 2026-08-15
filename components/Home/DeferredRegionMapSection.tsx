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

    let idleTimer:
      | number
      | null = null;

    let observer:
      | IntersectionObserver
      | null = null;

    const load = () => {
      setShouldLoad(true);

      observer?.disconnect();

      if (
        idleTimer !== null
      ) {
        window.clearTimeout(
          idleTimer
        );
      }
    };

    /*
     * 기존에는 섹션이 화면 250px 앞까지 왔을 때
     * 지도 컴포넌트 다운로드 + 마운트가 동시에 시작되어
     * 스크롤 중 미세한 끊김이 생길 수 있었습니다.
     *
     * 충분히 앞(약 1,200px)에서 미리 로드해
     * 실제 화면에 보일 때는 렌더링이 끝난 상태에
     * 가깝게 만듭니다.
     */
    if (
      "IntersectionObserver" in
      window
    ) {
      observer =
        new IntersectionObserver(
          (entries) => {
            if (
              entries.some(
                (entry) =>
                  entry.isIntersecting
              )
            ) {
              load();
            }
          },
          {
            rootMargin:
              "1200px 0px",
          }
        );

      observer.observe(
        element
      );
    } else {
      idleTimer =
        setTimeout(
          load,
          300
        ) as unknown as number;
    }

    /*
     * 사용자가 아주 천천히 스크롤하거나
     * 화면 높이가 큰 환경에서도,
     * 첫 화면 렌더링이 안정된 뒤에는
     * 지도 영역을 미리 준비합니다.
     */
    idleTimer =
      setTimeout(
        load,
        1200
      ) as unknown as number;

    return () => {
      observer?.disconnect();

      if (
        idleTimer !== null
      ) {
        window.clearTimeout(
          idleTimer
        );
      }
    };
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
