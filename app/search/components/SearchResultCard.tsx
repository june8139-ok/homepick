import Image from "next/image";
import Link from "next/link";
import {
  forwardRef,
  type MouseEvent,
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
  isApplyHomeUnverified,
} from "../../../lib/apartmentDisplay";

function heroImage(apartment: Apartment) {
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

  if (typeof hero === "string" && hero.trim()) {
    return hero.includes("/images/apartments/default/main.jpg")
      ? ""
      : hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        image &&
        !image.includes("/images/apartments/default/main.jpg")
    ) ?? ""
  );
}

function statusInfo(apartment: Apartment) {
  if (isSubscriptionApartment(apartment)) {
    return {
      label: apartment.status || "청약",
      className: "bg-blue-600 text-white",
    };
  }

  if (isFirstComeApartment(apartment)) {
    return {
      label: "선착순",
      className: "bg-emerald-600 text-white",
    };
  }

  return {
    label: apartment.status || "분양중",
    className: "bg-amber-500 text-zinc-950",
  };
}

function distanceText(distanceKm?: number | null) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return distanceKm < 10
    ? `${distanceKm.toFixed(1)}km`
    : `${Math.round(distanceKm)}km`;
}

type Props = {
  apartment: Apartment;
  selected: boolean;
  hovered: boolean;
  distanceKm?: number | null;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
};

const SearchResultCard = forwardRef<HTMLElement, Props>(
  function SearchResultCard(
    {
      apartment,
      selected,
      hovered,
      distanceKm,
      onHover,
      onLeave,
      onSelect,
    },
    ref
  ) {
    const image = heroImage(apartment);
    const status = statusInfo(apartment);
    const distance = distanceText(distanceKm);
    const active = selected || hovered;
    const representativePrice = getRepresentativePrice(apartment);
    const moveInText = getMoveInText(apartment);
    const benefits =
      getKeyBenefits(
        apartment,
        2
      );

    const showApplyHomeNotice =
      isApplyHomeUnverified(
        apartment
      );

    const handleSelect = (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onSelect();
    };

    return (
      <article
        ref={ref}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onSelect}
        className={[
          "group cursor-pointer overflow-hidden rounded-3xl border bg-white shadow-sm",
          "transition-all duration-200",
          active
            ? "border-emerald-400 shadow-lg ring-2 ring-emerald-100"
            : "border-zinc-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md",
        ].join(" ")}
      >
        <div className="relative aspect-[16/7] min-h-[138px] max-h-[168px] overflow-hidden bg-zinc-100">
          {image ? (
            <Image
              src={image}
              alt={`${apartment.name} 대표 이미지`}
              fill
              sizes="(max-width: 1023px) 100vw, 470px"
              quality={74}
              className={[
                "object-cover transition-transform duration-500",
                active ? "scale-[1.03]" : "group-hover:scale-[1.03]",
              ].join(" ")}
            />
          ) : (
            <div className="flex h-full min-h-[138px] items-center justify-center px-4 text-center text-sm font-medium text-zinc-500">
              이미지 준비 중
            </div>
          )}

          <span
            className={[
              "absolute left-3 top-3 rounded-full px-3 py-1",
              "text-xs font-bold shadow-sm",
              status.className,
            ].join(" ")}
          >
            {status.label}
          </span>

          {distance && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-blue-700 shadow-sm">
              내 위치에서 {distance}
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs font-bold text-emerald-700">
              {apartment.cityName || apartment.city || "지역 확인 중"}
            </p>

            {moveInText && (
              <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-700">
                {moveInText}
              </span>
            )}
          </div>

          <h3 className="mt-1 line-clamp-1 break-keep text-lg font-black leading-7 text-zinc-950">
            {apartment.name}
          </h3>

          <p className="mt-0.5 truncate text-xs text-zinc-600">
            {apartment.region || "주소 확인 중"}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-800">
                {representativePrice.label}
              </p>
              <p className="mt-0.5 truncate text-base font-black text-zinc-950">
                {representativePrice.text}
              </p>
            </div>

            {benefits.length > 0 ? (
              <div className="flex max-w-[48%] flex-wrap justify-end gap-1">
                {benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="max-w-full truncate rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-bold text-emerald-800"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            ) : showApplyHomeNotice ? (
              <span className="max-w-[48%] rounded-full border border-blue-200 bg-white px-2 py-1 text-right text-[10px] font-bold leading-4 text-blue-700">
                계약조건 모집공고 확인
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSelect}
              aria-label={`${apartment.name} 지도에서 보기`}
              className={[
                "inline-flex min-h-10 items-center justify-center rounded-xl",
                "border border-emerald-200 bg-white px-3 text-xs font-extrabold text-emerald-800",
                "transition hover:border-emerald-400 hover:bg-emerald-50",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                selected ? "border-emerald-500 bg-emerald-50" : "",
              ].join(" ")}
            >
              지도에서 보기
            </button>

            <Link
              href={`/apartments/${apartment.slug}`}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className={[
                "inline-flex min-h-10 items-center justify-center rounded-xl",
                "bg-zinc-900 px-3 text-xs font-extrabold text-white",
                "transition hover:bg-emerald-700",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              ].join(" ")}
            >
              상세보기 →
            </Link>
          </div>
        </div>
      </article>
    );
  }
);

SearchResultCard.displayName = "SearchResultCard";

export default SearchResultCard;