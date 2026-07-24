"use client";

import {
  useEffect,
  useRef,
  useState,
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
  onOpen: (slug: string) => void;
};

function getHeroImage(
  apartment: Apartment
) {
  const hero =
    apartment.images?.hero;

  if (Array.isArray(hero)) {
    return (
      hero.find(
        (image) =>
          typeof image === "string" &&
          image.trim() &&
          !image.includes(
            "/images/apartments/default/main.jpg"
          )
      ) ?? ""
    );
  }

  if (
    typeof hero === "string" &&
    hero.trim() &&
    !hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        Boolean(image) &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
}

function getStatusInfo(
  apartment: Apartment
) {
  if (
    isSubscriptionApartment(
      apartment
    )
  ) {
    return {
      label:
        apartment.status ||
        "청약",

      className:
        "bg-blue-600 text-white",
    };
  }

  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return {
      label: "선착순",

      className:
        "bg-emerald-600 text-white",
    };
  }

  return {
    label:
      apartment.status ||
      "분양중",

    className:
      "bg-amber-500 text-white",
  };
}

function formatDistance(
  distance?: number
) {
  if (
    distance === undefined ||
    !Number.isFinite(distance)
  ) {
    return "";
  }

  if (distance < 1) {
    return `${Math.round(
      distance * 1000
    )}m`;
  }

  return distance < 10
    ? `${distance.toFixed(1)}km`
    : `${Math.round(
        distance
      )}km`;
}

export default function MobileSearchCarousel({
  apartments,
  selectedSlug,
  distanceBySlug,
  onSelect,
  onOpen,
}: Props) {
  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const cardRefs =
    useRef<
      Map<string, HTMLElement>
    >(new Map());

  const pointerStartX =
    useRef(0);

  const scrollStartLeft =
    useRef(0);

  const movedDistance =
    useRef(0);

  const dragging =
    useRef(false);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    requestAnimationFrame(
      () => {
        cardRefs.current
          .get(selectedSlug)
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "nearest",

            inline:
              "center",
          });
      }
    );
  }, [selectedSlug]);

  const moveCarousel = (
    direction:
      | "prev"
      | "next"
  ) => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-carousel-card]"
      );

    const cardWidth =
      firstCard?.offsetWidth ??
      container.clientWidth *
        0.84;

    const gap = 12;

    container.scrollBy({
      left:
        direction === "next"
          ? cardWidth + gap
          : -(cardWidth + gap),

      behavior: "smooth",
    });
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      event.pointerType !==
        "mouse" ||
      event.button !== 0
    ) {
      return;
    }

    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    dragging.current = true;
    movedDistance.current = 0;

    pointerStartX.current =
      event.clientX;

    scrollStartLeft.current =
      container.scrollLeft;

    setIsDragging(true);

    container.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      !dragging.current ||
      event.pointerType !==
        "mouse"
    ) {
      return;
    }

    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const distance =
      event.clientX -
      pointerStartX.current;

    movedDistance.current =
      Math.max(
        movedDistance.current,
        Math.abs(distance)
      );

    container.scrollLeft =
      scrollStartLeft.current -
      distance;
  };

  const finishDragging = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      event.pointerType !==
      "mouse"
    ) {
      return;
    }

    dragging.current = false;
    setIsDragging(false);

    const container =
      scrollRef.current;

    if (
      container?.hasPointerCapture(
        event.pointerId
      )
    ) {
      container.releasePointerCapture(
        event.pointerId
      );
    }
  };

  if (
    apartments.length === 0
  ) {
    return (
      <div className="mt-3 rounded-2xl border border-zinc-200 bg-white px-5 py-8 text-center">
        <h3 className="text-base font-bold">
          현재 지도 안에 단지가
          없습니다.
        </h3>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          지도를 이동하거나 필터를
          초기화해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-3">
      {apartments.length >
        1 && (
        <button
          type="button"
          onClick={() =>
            moveCarousel("prev")
          }
          aria-label="이전 단지 보기"
          className={[
            "absolute left-1 top-1/2 z-20",
            "flex h-10 w-10 -translate-y-1/2",
            "cursor-pointer items-center justify-center",
            "rounded-full border border-white/70",
            "bg-white/95 text-xl font-bold text-zinc-700",
            "shadow-lg backdrop-blur transition-all duration-200",
            "hover:scale-105 hover:bg-emerald-600 hover:text-white",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-emerald-500",
          ].join(" ")}
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          finishDragging
        }
        onPointerCancel={
          finishDragging
        }
        onPointerLeave={(
          event
        ) => {
          if (
            dragging.current
          ) {
            finishDragging(
              event
            );
          }
        }}
        className={[
          "-mx-3 overflow-x-auto px-3 pb-3",
          "snap-x snap-mandatory scroll-smooth",
          "touch-pan-y select-none",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          isDragging
            ? "cursor-grabbing scroll-auto"
            : "cursor-grab",
        ].join(" ")}
      >
        <div className="flex w-max gap-3 px-7">
          {apartments.map(
            (apartment) => {
              const image =
                getHeroImage(
                  apartment
                );

              const status =
                getStatusInfo(
                  apartment
                );

              const distance =
                formatDistance(
                  distanceBySlug[
                    apartment.slug
                  ]
                );

              const selected =
                selectedSlug ===
                apartment.slug;

              const representativePrice =
                getRepresentativePrice(
                  apartment
                );

              const moveInText =
                getMoveInText(
                  apartment
                );

              const benefits =
                getKeyBenefits(
                  apartment,
                  2
                );

              return (
                <article
                  ref={(element) => {
                    if (element) {
                      cardRefs.current.set(
                        apartment.slug,
                        element
                      );
                    } else {
                      cardRefs.current.delete(
                        apartment.slug
                      );
                    }
                  }}
                  data-carousel-card
                  key={
                    apartment.slug
                  }
                  role="button"
                  tabIndex={0}
                  aria-pressed={
                    selected
                  }
                  aria-label={`${apartment.name} 지도에서 보기`}
                  onClick={() => {
                    if (
                      movedDistance.current >
                      6
                    ) {
                      movedDistance.current =
                        0;

                      return;
                    }

                    onSelect(
                      apartment.slug
                    );
                  }}
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();

                      onSelect(
                        apartment.slug
                      );
                    }
                  }}
                  className={[
                    "w-[84vw] max-w-[370px] shrink-0 snap-center",
                    "overflow-hidden rounded-2xl border bg-white shadow-sm",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                    selected
                      ? "border-emerald-400 shadow-lg ring-2 ring-emerald-100"
                      : "border-zinc-200",
                  ].join(" ")}
                >
                  <div className="grid grid-cols-[112px_minmax(0,1fr)]">
                    <div className="relative min-h-[178px] overflow-hidden bg-zinc-100">
                      {image ? (
                        <img
                          src={
                            image
                          }
                          alt={`${apartment.name} 대표 이미지`}
                          loading="lazy"
                          draggable={
                            false
                          }
                          className="pointer-events-none h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-400">
                          이미지 준비 중
                        </div>
                      )}

                      <span
                        className={[
                          "absolute left-2 top-2 rounded-full px-2 py-1",
                          "text-[10px] font-bold shadow-sm",
                          status.className,
                        ].join(" ")}
                      >
                        {
                          status.label
                        }
                      </span>

                      {distance && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-extrabold text-blue-600 shadow-sm">
                          {distance}
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-[10px] font-bold text-emerald-600">
                          {apartment.cityName ||
                            apartment.city ||
                            "지역 확인 중"}
                        </p>

                        {moveInText && (
                          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-bold text-zinc-600">
                            {moveInText}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 line-clamp-2 break-keep text-sm font-black leading-5">
                        {
                          apartment.name
                        }
                      </h3>

                      <p className="mt-1 truncate text-[10px] text-zinc-500">
                        {apartment.region ||
                          "주소 확인 중"}
                      </p>

                      <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                        <p className="text-[9px] font-bold text-emerald-700">
                          {
                            representativePrice.label
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs font-black text-zinc-900">
                          {
                            representativePrice.text
                          }
                        </p>
                      </div>

                      <div className="mt-2">
                        {benefits.length >
                        0 ? (
                          <div className="flex flex-wrap gap-1">
                            {benefits.map(
                              (
                                benefit
                              ) => (
                                <span
                                  key={
                                    benefit
                                  }
                                  className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700"
                                >
                                  {
                                    benefit
                                  }
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="line-clamp-1 text-[10px] font-semibold text-zinc-500">
                            {apartment.condition ||
                              "계약조건 확인 필요"}
                          </p>
                        )}
                      </div>

                      {!moveInText && (
                        <p className="mt-2 text-[9px] font-medium text-zinc-400">
                          입주 일정 확인 중
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          onOpen(
                            apartment.slug
                          );
                        }}
                        className={[
                          "mt-auto cursor-pointer pt-2 text-right",
                          "text-[10px] font-black text-emerald-700 transition",
                          "hover:text-emerald-900",
                          "focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-emerald-500",
                        ].join(" ")}
                      >
                        상세보기 →
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>

      {apartments.length >
        1 && (
        <button
          type="button"
          onClick={() =>
            moveCarousel("next")
          }
          aria-label="다음 단지 보기"
          className={[
            "absolute right-1 top-1/2 z-20",
            "flex h-10 w-10 -translate-y-1/2",
            "cursor-pointer items-center justify-center",
            "rounded-full border border-white/70",
            "bg-white/95 text-xl font-bold text-zinc-700",
            "shadow-lg backdrop-blur transition-all duration-200",
            "hover:scale-105 hover:bg-emerald-600 hover:text-white",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-emerald-500",
          ].join(" ")}
        >
          ›
        </button>
      )}

      <p className="mt-1 text-center text-[10px] text-zinc-400">
        버튼을 누르거나 좌우로
        밀어서 단지를 확인하세요.
      </p>
    </div>
  );
}