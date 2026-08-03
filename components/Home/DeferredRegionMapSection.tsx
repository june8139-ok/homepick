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
      className="mt-6 overflow-hidden rounded-[30px] bg-[#EEF5F1]/72 p-4 shadow-[0_18px_48px_rgba(24,39,32,0.045)] sm:p-7"
    >
      <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />

      <div className="mt-3 h-8 w-52 animate-pulse rounded-lg bg-zinc-200" />

      <div className="mt-2 h-5 w-full max-w-md animate-pulse rounded bg-zinc-100" />

      <div className="mt-5 min-h-[500px] animate-pulse rounded-3xl bg-zinc-100 sm:min-h-[620px] xl:min-h-[660px]" />
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
      const fallbackTimer =
        setTimeout(
          () => {
            setShouldLoad(true);
          },
          0
        );

      return () => {
        clearTimeout(
          fallbackTimer
        );
      };
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
          rootMargin:
            "0px 0px",
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
