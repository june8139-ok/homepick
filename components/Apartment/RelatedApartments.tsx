"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type PointerEvent,
} from "react";

import type { Apartment } from "../../types/apartment";

type Props = {
  apartment: Apartment;
  relatedApartments: Apartment[];
};

function getStatusStyle(status?: string) {
  if (
    status?.includes("청약") ||
    status === "당첨자발표" ||
    status === "계약중"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (status?.includes("선착순")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status?.includes("분양중")) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    status?.includes("마감") ||
    status?.includes("종료")
  ) {
    return "bg-zinc-100 text-zinc-600";
  }

  return "bg-zinc-100 text-zinc-700";
}

function getHeroImage(
  apartment: Apartment
) {
  const hero = apartment.images?.hero;

  if (
    !hero ||
    hero.trim() === "" ||
    hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return (
      apartment.images?.gallery?.find(
        (image) =>
          Boolean(image) &&
          !image.includes(
            "/images/apartments/default/main.jpg"
          )
      ) ?? null
    );
  }

  return hero;
}

function getPriceText(
  apartment: Apartment
) {
  return (
    apartment.priceDetail?.salePrice ||
    apartment.price ||
    "분양가 확인 중"
  );
}

function getContractText(
  apartment: Apartment
) {
  return (
    apartment.priceDetail?.contractPrice ||
    apartment.condition ||
    "계약조건 확인 중"
  );
}

function getRegionText(
  apartment: Apartment
) {
  return (
    apartment.cityName ||
    apartment.city ||
    apartment.region ||
    "지역 정보 확인 중"
  );
}

function MobileRelatedCard({
  currentApartment,
  apartment,
}: {
  currentApartment: Apartment;
  apartment: Apartment;
}) {
  const image =
    getHeroImage(apartment);

  return (
    <article
      data-related-card
      className="
        w-[82vw] max-w-[330px]
        shrink-0 snap-center
        overflow-hidden rounded-2xl
        border border-zinc-200
        bg-white shadow-sm
      "
    >
      <div className="relative h-32 overflow-hidden bg-zinc-100">
        {image ? (
          <img
            src={image}
            alt={`${apartment.name} 대표 이미지`}
            loading="lazy"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-zinc-400">
            이미지 준비 중
          </div>
        )}

        <span
          className={[
            "absolute left-2 top-2 rounded-full px-2 py-1",
            "text-[10px] font-bold shadow-sm",
            getStatusStyle(
              apartment.status
            ),
          ].join(" ")}
        >
          {apartment.status ||
            "정보 확인 중"}
        </span>

        <span className="absolute right-2 top-2 max-w-[45%] truncate rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
          {getRegionText(apartment)}
        </span>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 break-keep text-sm font-black leading-5 text-[#132238]">
          {apartment.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-[10px] text-zinc-500">
          {apartment.region ||
            "주소 정보 확인 중"}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="min-w-0 rounded-xl bg-zinc-50 px-2.5 py-2">
            <p className="text-[9px] font-bold text-zinc-400">
              분양가
            </p>

            <p className="mt-1 truncate text-xs font-black text-[#132238]">
              {getPriceText(apartment)}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-zinc-50 px-2.5 py-2">
            <p className="text-[9px] font-bold text-zinc-400">
              계약금·조건
            </p>

            <p className="mt-1 line-clamp-1 text-xs font-black text-[#132238]">
              {getContractText(
                apartment
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={`/apartments/${apartment.slug}`}
            className="
              inline-flex min-h-10
              items-center justify-center
              rounded-xl border
              border-zinc-200 bg-white
              px-2 text-[11px] font-bold
              text-zinc-700 transition
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500
            "
          >
            상세보기
          </Link>

          <Link
            href={`/compare?left=${currentApartment.slug}&right=${apartment.slug}`}
            className="
              inline-flex min-h-10
              items-center justify-center
              rounded-xl bg-[#132238]
              px-2 text-[11px] font-bold
              text-white transition
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500
            "
          >
            비교하기
          </Link>
        </div>
      </div>
    </article>
  );
}

function DesktopRelatedCard({
  currentApartment,
  apartment,
}: {
  currentApartment: Apartment;
  apartment: Apartment;
}) {
  const image =
    getHeroImage(apartment);

  return (
    <article
      className="
        group overflow-hidden rounded-2xl
        border border-zinc-200 bg-white
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-emerald-300
        hover:shadow-lg
      "
    >
      <div className="flex min-h-[176px]">
        <div className="h-auto w-44 shrink-0 overflow-hidden bg-zinc-100">
          {image ? (
            <img
              src={image}
              alt={`${apartment.name} 대표 이미지`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm font-medium text-zinc-400">
              이미지 준비 중
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-bold",
                  getStatusStyle(
                    apartment.status
                  ),
                ].join(" ")}
              >
                {apartment.status ||
                  "정보 확인 중"}
              </span>

              {apartment.brand && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  {apartment.brand}
                </span>
              )}
            </div>

            <h3 className="mt-3 break-keep text-xl font-extrabold leading-tight text-[#132238]">
              {apartment.name}
            </h3>

            <p className="mt-2 line-clamp-1 text-sm text-zinc-500">
              {apartment.region ||
                "주소 정보 확인 중"}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F8FAF7] p-3">
                <p className="text-xs font-bold text-zinc-500">
                  분양가
                </p>

                <p className="mt-1 text-sm font-extrabold text-[#132238]">
                  {getPriceText(
                    apartment
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8FAF7] p-3">
                <p className="text-xs font-bold text-zinc-500">
                  핵심 계약조건
                </p>

                <p className="mt-1 line-clamp-2 text-sm font-extrabold leading-6 text-[#132238]">
                  {getContractText(
                    apartment
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Link
              href={`/apartments/${apartment.slug}`}
              className="
                inline-flex min-h-11
                items-center justify-center
                rounded-xl border
                border-zinc-200 bg-white
                px-4 py-2 text-sm
                font-bold text-zinc-700
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:bg-emerald-50
                hover:text-emerald-700
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              상세정보 보기
            </Link>

            <Link
              href={`/compare?left=${currentApartment.slug}&right=${apartment.slug}`}
              className="
                inline-flex min-h-11
                items-center justify-center
                rounded-xl bg-[#132238]
                px-4 py-2 text-sm
                font-bold text-white
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-emerald-600
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
              "
            >
              현재 단지와 비교
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RelatedApartments({
  apartment,
  relatedApartments,
}: Props) {
  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pointerStartX =
    useRef(0);

  const initialScrollLeft =
    useRef(0);

  const movedDistance =
    useRef(0);

  const draggingRef =
    useRef(false);

  const [isDragging, setIsDragging] =
    useState(false);

  if (
    relatedApartments.length === 0
  ) {
    return null;
  }

  const moveCarousel = (
    direction: "prev" | "next"
  ) => {
    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-related-card]"
      );

    const cardWidth =
      firstCard?.offsetWidth ??
      container.clientWidth * 0.82;

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
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    const container =
      scrollRef.current;

    if (!container) {
      return;
    }

    draggingRef.current = true;
    movedDistance.current = 0;

    pointerStartX.current =
      event.clientX;

    initialScrollLeft.current =
      container.scrollLeft;

    setIsDragging(true);

    container.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingRef.current) {
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
      initialScrollLeft.current -
      distance;
  };

  const finishPointer = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    draggingRef.current = false;
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

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white py-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6">
      <div className="flex items-end justify-between gap-3 px-4 sm:px-0">
        <div>
          <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
            REGIONAL COMPARISON
          </p>

          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#132238] sm:text-2xl">
            같은 지역 다른 단지
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">
            {getRegionText(apartment)}에서
            함께 비교해볼 단지입니다.
          </p>
        </div>

        <Link
          href={`/search?q=${encodeURIComponent(
            apartment.cityName ||
              apartment.city ||
              apartment.region ||
              ""
          )}`}
          className="shrink-0 text-xs font-bold text-emerald-700 transition hover:translate-x-0.5 sm:text-sm"
        >
          더 보기 →
        </Link>
      </div>

      {/* 모바일 슬라이더 */}
      <div className="relative mt-4 sm:hidden">
        {relatedApartments.length >
          1 && (
          <>
            <button
              type="button"
              onClick={() =>
                moveCarousel("prev")
              }
              aria-label="이전 단지 보기"
              className="
                absolute left-1 top-1/2 z-20
                flex h-9 w-9
                -translate-y-1/2
                items-center justify-center
                rounded-full border
                border-white/70
                bg-white/95 text-xl
                font-black text-zinc-700
                shadow-lg
              "
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() =>
                moveCarousel("next")
              }
              aria-label="다음 단지 보기"
              className="
                absolute right-1 top-1/2 z-20
                flex h-9 w-9
                -translate-y-1/2
                items-center justify-center
                rounded-full border
                border-white/70
                bg-white/95 text-xl
                font-black text-zinc-700
                shadow-lg
              "
            >
              ›
            </button>
          </>
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
            finishPointer
          }
          onPointerCancel={
            finishPointer
          }
          className={[
            "overflow-x-auto px-8 pb-2",
            "snap-x snap-mandatory scroll-smooth",
            "touch-pan-y select-none overscroll-x-contain",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isDragging
              ? "cursor-grabbing scroll-auto"
              : "cursor-grab",
          ].join(" ")}
        >
          <div className="flex w-max gap-3">
            {relatedApartments.map(
              (item) => (
                <MobileRelatedCard
                  key={item.slug}
                  currentApartment={
                    apartment
                  }
                  apartment={item}
                />
              )
            )}
          </div>
        </div>

        <p className="mt-1 text-center text-[10px] text-zinc-400">
          버튼을 누르거나 좌우로
          밀어서 단지를 확인하세요.
        </p>
      </div>

      {/* 태블릿·PC */}
      <div className="mt-6 hidden gap-4 sm:grid">
        {relatedApartments
          .slice(0, 3)
          .map((item) => (
            <DesktopRelatedCard
              key={item.slug}
              currentApartment={
                apartment
              }
              apartment={item}
            />
          ))}
      </div>
    </section>
  );
}
