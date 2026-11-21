"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export default function HomeCardRail({
  children,
  className,
  label,
  count,
}: {
  children: ReactNode;
  className: string;
  label: string;
  count: number;
}) {
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      setEdges({
        previous: element.scrollLeft > 1,
        next: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [count]);

  function move(direction: -1 | 1) {
    const element = rail.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * element.clientWidth, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <>
      <div id={id} ref={rail} aria-label={label} role="region" className={`home-card-rail ${className}`}>
        {children}
      </div>
      {count > 2 && (
        <div className="home-card-rail-controls" data-desktop-overflow={count > 4}>
          <button type="button" aria-controls={id} aria-label={`${label} 이전 카드`} aria-disabled={!edges.previous} onClick={() => edges.previous && move(-1)}>
            ‹
          </button>
          <button type="button" aria-controls={id} aria-label={`${label} 다음 카드`} aria-disabled={!edges.next} onClick={() => edges.next && move(1)}>
            ›
          </button>
        </div>
      )}
    </>
  );
}
