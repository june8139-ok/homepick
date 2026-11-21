"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";

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
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [edges, setEdges] = useState({ previous: false, next: false });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      const previous = element.scrollLeft > 1;
      const next = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      setEdges((current) => current.previous === previous && current.next === next ? current : { previous, next });
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

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (event.pointerType !== "mouse" || event.button !== 0 ||
        (event.target instanceof Element && event.target.closest("button"))) return;
    const element = event.currentTarget;
    if (element.scrollWidth <= element.clientWidth + 1) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: element.scrollLeft, moved: false };
  }

  function dragCards(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    if (event.buttons !== 1) {
      finishDrag(event);
      return;
    }
    const distance = event.clientX - gesture.x;
    if (!gesture.moved && Math.abs(distance) < 6) return;

    const element = event.currentTarget;
    if (!gesture.moved) {
      gesture.moved = true;
      suppressClick.current = true;
      element.dataset.dragging = "true";
      element.setPointerCapture(event.pointerId);
    }
    element.scrollLeft = gesture.left - distance;
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
  }

  return (
    <>
      <div
        id={id}
        ref={rail}
        aria-label={label}
        role="region"
        className={`home-card-rail ${className}`}
        onPointerDown={beginDrag}
        onPointerMove={dragCards}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onPointerLeave={(event) => { if (!drag.current?.moved) finishDrag(event); }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (!suppressClick.current || event.detail === 0) return;
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
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
