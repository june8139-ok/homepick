"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

import type { Apartment } from "../../../types/apartment";

import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../../lib/subscriptionVisibility";

import {
  getKeyBenefits,
  getMoveInText,
  getRepresentativePrice,
} from "../../../lib/apartmentDisplay";

type Props = {
  apartments: Apartment[];
  selectedSlug: string | null;
  distanceBySlug: Record<string, number>;
  onSelect: (slug: string) => void;
};

function getHeroImage(apartment: Apartment) {
  const hero = apartment.images?.hero;

  if (Array.isArray(hero)) {
    return (
      hero.find(
        (image) =>
          typeof image === "string" &&
          image.trim() &&
          !image.includes("/images/apartments/default/main.jpg")
      ) ?? ""
    );
  }

  if (
    typeof hero === "string" &&
    hero.trim() &&
    !hero.includes("/images/apartments/default/main.jpg")
  ) {
    return hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        Boolean(image) &&
        !image.includes("/images/apartments/default/main.jpg")
    ) ?? ""
  );
}

function getStatusInfo(apartment: Apartment) {
  if (isSubscriptionApartment(apartment)) {
    return {
      label: apartment.status || "청약",
      className: "bg-blue-600 text-white",
    };
  }

  if (isFirstComeApartment(apartment)) {
    return {
      label: "선착순",
      className: "bg-emerald-700 text-white",
    };
  }

  return {
    label: apartment.status || "분양중",
    className: "bg-amber-500 text-zinc-950",
  };
}

function formatDistance(distance?: number) {
  if (distance === undefined || !Number.isFinite(distance)) {
    return "";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }

  return distance < 10
    ? `${distance.toFixed(1)}km`
    : `${Math.round(distance)}km`;
}

export default function MobileSearchCarousel({
  apartments,
  selectedSlug,
  distanceBySlug,
  onSelect,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const pointerStartX = useRef(0);
  const scrollStartLeft = useRef(0);
  const movedDistance = useRef(0);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    const card = cardRefs.current.get(selectedSlug);
    const container = scrollRef.current;

    if (!card || !container) {
      return;
    }

    const targetLeft =
      card.offsetLeft -
      (container.clientWidth - card.offsetWidth) / 2;

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [selectedSlug]);

  const moveCarousel = (direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>(
      "[data-carousel-card]"
    );

    const cardWidth =
      firstCard?.offsetWidth ?? container.clientWidth * 0.84;

    container.scrollBy({
      left:
        direction === "next"
          ? cardWidth + 12
          : -(cardWidth + 12),
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const container = scrollRef.current;
    if (!container) return;

    dragging.current = true;
    movedDistance.current = 0;
    pointerStartX.current = event.clientX;
    scrollStartLeft.current = container.scrollLeft;
    setIsDragging(true);
    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || event.pointerType !== "mouse") return;

    const container = scrollRef.current;
    if (!container) return;

    const distance = event.clientX - pointerStartX.current;
    movedDistance.current = Math.max(
      movedDistance.current,
      Math.abs(distance)
    );
    container.scrollLeft = scrollStartLeft.current - distance;
  };

  const finishDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    dragging.current = false;
    setIsDragging(false);

    const container = scrollRef.current;
    if (container?.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
  };

  if (apartments.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-center">
        <h3 className="text-base font-bold">현재 지도 안에 단지가 없습니다.</h3>
        <p className="mt-2 text-xs leading-5 text-zinc-600">
          지도를 이동하거나 필터를 초기화해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-2 w-full min-w-0 overflow-hidden">
      {apartments.length > 1 && (
        <button
          type="button"
          onClick={() => moveCarousel("prev")}
          aria-label="이전 단지 보기"
          className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-xl font-bold text-zinc-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-emerald-700 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        onPointerLeave={(event) => {
          if (dragging.current) finishDragging(event);
        }}
        className={[
          "w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2",
          "snap-x snap-mandatory scroll-smooth touch-auto select-none",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing scroll-auto" : "cursor-grab",
        ].join(" ")}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex w-max min-w-full gap-3 px-8">
          {apartments.map((apartment) => {
            const image = getHeroImage(apartment);
            const status = getStatusInfo(apartment);
            const distance = formatDistance(
              distanceBySlug[apartment.slug]
            );
            const selected = selectedSlug === apartment.slug;
            const representativePrice = getRepresentativePrice(apartment);
            const moveInText = getMoveInText(apartment);
            const benefits = getKeyBenefits(apartment, 2);

            const handleCardClick = () => {
              if (movedDistance.current > 6) {
                movedDistance.current = 0;
                return;
              }
              onSelect(apartment.slug);
            };

            const handleSelectButton = (
              event: MouseEvent<HTMLButtonElement>
            ) => {
              event.stopPropagation();
              onSelect(apartment.slug);
            };

            return (
              <article
                ref={(element) => {
                  if (element) {
                    cardRefs.current.set(apartment.slug, element);
                  } else {
                    cardRefs.current.delete(apartment.slug);
                  }
                }}
                data-carousel-card
                key={apartment.slug}
                onClick={handleCardClick}
                className={[
                  "w-[82vw] max-w-[360px] shrink-0 snap-center",
                  "cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm",
                  "transition-all duration-200",
                  selected
                    ? "border-emerald-500 shadow-lg ring-2 ring-emerald-100"
                    : "border-zinc-200",
                ].join(" ")}
              >
                <div>
                  <div className="relative aspect-[16/8] min-h-[150px] overflow-hidden bg-zinc-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${apartment.name} 대표 이미지`}
                        fill
                        sizes="(max-width: 639px) 82vw, 360px"
                        quality={72}
                        draggable={false}
                        className="pointer-events-none object-contain"
                      />
                    ) : (
                      <div className="flex h-full min-h-[150px] items-center justify-center px-3 text-center text-xs font-medium text-zinc-600">
                        이미지 준비 중
                      </div>
                    )}

                    <span
                      className={[
                        "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm",
                        status.className,
                      ].join(" ")}
                    >
                      {status.label}
                    </span>

                    {distance && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-blue-700 shadow-sm">
                        내 위치에서 {distance}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[11px] font-bold text-emerald-700">
                        {apartment.cityName || apartment.city || "지역 확인 중"}
                      </p>

                      {moveInText && (
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-700">
                          {moveInText}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 line-clamp-1 break-keep text-base font-black leading-6 text-zinc-950">
                      {apartment.name}
                    </h3>

                    <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                      {apartment.region || "주소 확인 중"}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-emerald-800">
                          {representativePrice.label}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-black text-zinc-950">
                          {representativePrice.text}
                        </p>
                      </div>

                      {benefits.length > 0 && (
                        <div className="flex max-w-[48%] flex-wrap justify-end gap-1">
                          {benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="max-w-full truncate rounded-full border border-emerald-200 bg-white px-2 py-1 text-[9px] font-bold text-emerald-800"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {benefits.length === 0 && (
                      <p className="mt-2 line-clamp-1 text-[11px] font-semibold text-zinc-600">
                        {apartment.condition || "계약조건 확인 필요"}
                      </p>
                    )}

                    {!moveInText && (
                      <p className="mt-2 text-[10px] font-medium text-zinc-600">
                        입주 일정 확인 중
                      </p>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleSelectButton}
                        aria-label={`${apartment.name} 지도에서 보기`}
                        aria-pressed={selected}
                        className={[
                          "inline-flex min-h-11 items-center justify-center rounded-xl border px-2 text-[11px] font-extrabold transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                          selected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                            : "border-zinc-300 bg-white text-zinc-800 hover:border-emerald-400 hover:bg-emerald-50",
                        ].join(" ")}
                      >
                        지도에서 보기
                      </button>

                      <Link
                        href={`/apartments/${apartment.slug}`}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-2 text-[11px] font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                      >
                        상세보기 →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {apartments.length > 1 && (
        <button
          type="button"
          onClick={() => moveCarousel("next")}
          aria-label="다음 단지 보기"
          className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-xl font-bold text-zinc-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-emerald-700 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ›
        </button>
      )}

      <p className="mt-2 pb-1 text-center text-[11px] font-medium text-zinc-600">
        버튼을 누르거나 좌우로 밀어서 단지를 확인하세요.
      </p>
    </div>
  );
}
