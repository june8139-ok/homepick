"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Apartment } from "../../types/apartment";
import { getListingStage } from "../../lib/listingStage";
function photo(a: Apartment) {
  return (
    [a.images.hero, ...a.images.gallery].find(
      (x) => x && !x.includes("/default/"),
    ) || ""
  );
}
export default function FeaturedSlider({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const slides = apartments
    .filter((a) => getListingStage(a) === "firstCome" && photo(a))
    .sort(
      (a, b) =>
        (Date.parse(b.createdAt || "") || 0) -
          (Date.parse(a.createdAt || "") || 0) || a.slug.localeCompare(b.slug),
    )
    .slice(0, 4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || interacting || reduced || slides.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, interacting, reduced, slides.length]);
  const go = (next: number) => {
    setPaused(true);
    setIndex((next + slides.length) % slides.length);
  };
  const active = Math.min(index, Math.max(0, slides.length - 1));
  if (!slides.length)
    return (
      <section className="featured-empty">
        <p>집눈 분양정보</p>
        <h2>관심 있는 집을, 더 선명하게</h2>
        <Link href="/search">지도에서 단지 찾기 →</Link>
      </section>
    );
  return (
    <section
      className="featured-slider"
      aria-roledescription="슬라이드"
      aria-label="새로 등록된 선착순 단지"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setInteracting(false);
      }}
    >
      <div
        ref={track}
        className="featured-track"
        style={{ transform: `translateX(-${active * 100}%)` }}
        onTouchStart={(e) => {
          start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          if (!start.current) return;
          const dx = e.changedTouches[0].clientX - start.current.x;
          const dy = e.changedTouches[0].clientY - start.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
            go(active + (dx < 0 ? 1 : -1));
          start.current = null;
        }}
      >
        {slides.map((a, i) => (
          <article
            key={a.slug}
            className="featured-slide"
            aria-hidden={i !== active}
            inert={i !== active}
            aria-label={`${i + 1} / ${slides.length}`}
          >
            <Image
              src={photo(a)}
              alt={`${a.name} 대표 이미지`}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={80}
              className="object-cover"
            />
            <div className="featured-shade" />
            <div className="featured-copy">
              <p className="featured-eyebrow">새로 만나는 선착순 분양</p>
              <h2>{a.name}</h2>
              <p>{a.cityName || a.region}</p>
              {a.condition && (
                <p className="featured-condition">{a.condition}</p>
              )}
              <Link
                href={`/apartments/${encodeURIComponent(a.slug)}`}
                tabIndex={i === active ? 0 : -1}
              >
                단지 살펴보기 <span>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="featured-controls">
        <button
          type="button"
          aria-label="이전 단지"
          onClick={() => go(active - 1)}
        >
          ←
        </button>
        <span aria-live={paused ? "polite" : "off"}>
          {active + 1} / {slides.length}
        </span>
        <button
          type="button"
          aria-label="다음 단지"
          onClick={() => go(active + 1)}
        >
          →
        </button>
        <button
          type="button"
          aria-label={
            paused || reduced ? "자동 전환 시작" : "자동 전환 일시정지"
          }
          onClick={() => {
            if (paused || reduced) {
              setPaused(false);
              setReduced(false);
            } else {
              setPaused(true);
            }
          }}
        >
          {paused || reduced ? "▶" : "Ⅱ"}
        </button>
      </div>
    </section>
  );
}
