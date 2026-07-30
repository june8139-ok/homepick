import Image from "next/image";
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
} from "../../../lib/apartmentDisplay";

function heroImage(
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
    hero.trim()
  ) {
    return hero.includes(
      "/images/apartments/default/main.jpg"
    )
      ? ""
      : hero;
  }

  return (
    apartment.images?.gallery?.find(
      (image) =>
        image &&
        !image.includes(
          "/images/apartments/default/main.jpg"
        )
    ) ?? ""
  );
}

function statusInfo(
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

function distanceText(
  distanceKm?: number | null
) {
  if (
    distanceKm == null ||
    !Number.isFinite(distanceKm)
  ) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(
      distanceKm * 1000
    )}m`;
  }

  return distanceKm < 10
    ? `${distanceKm.toFixed(1)}km`
    : `${Math.round(
        distanceKm
      )}km`;
}

type Props = {
  apartment: Apartment;
  selected: boolean;
  hovered: boolean;
  distanceKm?: number | null;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
  onOpen: () => void;
};

const SearchResultCard =
  forwardRef<
    HTMLElement,
    Props
  >(
    function SearchResultCard(
      {
        apartment,
        selected,
        hovered,
        distanceKm,
        onHover,
        onLeave,
        onSelect,
        onOpen,
      },
      ref
    ) {
      const image =
        heroImage(apartment);

      const status =
        statusInfo(apartment);

      const distance =
        distanceText(distanceKm);

      const active =
        selected || hovered;

      const representativePrice =
        getRepresentativePrice(
          apartment
        );

      const moveInText =
        getMoveInText(apartment);

      const benefits =
        getKeyBenefits(
          apartment,
          2
        );

      const handleOpen = (
        event: MouseEvent<HTMLButtonElement>
      ) => {
        event.stopPropagation();
        onOpen();
      };

      const handleSelectButton = (
        event: MouseEvent<HTMLButtonElement>
      ) => {
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
          <div className="grid sm:grid-cols-[160px_minmax(0,1fr)]">
            <div className="relative min-h-[190px] overflow-hidden bg-zinc-100">
              {image ? (
                <Image
                  src={image}
                  alt={`${apartment.name} 대표 이미지`}
                  fill
                  sizes="(max-width: 639px) 100vw, 160px"
                  quality={72}
                  className={[
                    "object-cover transition-transform duration-500",
                    active
                      ? "scale-105"
                      : "group-hover:scale-105",
                  ].join(" ")}
                />
              ) : (
                <div className="flex h-full min-h-[190px] items-center justify-center px-3 text-center text-sm text-zinc-400">
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
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#0F766E] shadow-sm">
                  내 위치에서{" "}
                  {distance}
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate text-xs font-semibold text-emerald-600">
                  {apartment.cityName ||
                    apartment.city ||
                    "지역 확인 중"}
                </p>

                {moveInText && (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">
                    {moveInText}
                  </span>
                )}
              </div>

              <h3 className="mt-1 line-clamp-2 break-keep text-xl font-black leading-7 text-zinc-900">
                {apartment.name}
              </h3>

              <p className="mt-1 truncate text-sm text-zinc-500">
                {apartment.region ||
                  "주소 확인 중"}
              </p>

              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] font-bold text-emerald-700">
                  {
                    representativePrice.label
                  }
                </p>

                <p className="mt-1 truncate text-lg font-black text-zinc-900">
                  {
                    representativePrice.text
                  }
                </p>
              </div>

              <div className="mt-3">
                <p className="text-[11px] font-semibold text-zinc-400">
                  핵심 혜택
                </p>

                {benefits.length >
                0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {benefits.map(
                      (
                        benefit
                      ) => (
                        <span
                          key={
                            benefit
                          }
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
                        >
                          {
                            benefit
                          }
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-1 line-clamp-2 break-keep text-xs font-semibold leading-5 text-zinc-500">
                    {apartment.condition ||
                      "계약조건 확인 필요"}
                  </p>
                )}
              </div>

              <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={
                    handleSelectButton
                  }
                  aria-label={`${apartment.name} 지도에서 보기`}
                  className={[
                    "inline-flex min-h-9 cursor-pointer items-center justify-center",
                    "rounded-full border border-emerald-200 bg-white px-4 py-2",
                    "text-xs font-bold text-emerald-700 transition-all",
                    "hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                    selected
                      ? "border-emerald-500 bg-emerald-50"
                      : "",
                  ].join(" ")}
                >
                  지도에서 보기
                </button>

                <button
                  type="button"
                  onClick={
                    handleOpen
                  }
                  className={[
                    "inline-flex min-h-9 cursor-pointer items-center justify-center",
                    "rounded-full bg-zinc-900 px-4 py-2",
                    "text-xs font-bold text-white transition-all",
                    "hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                    "active:translate-y-0",
                  ].join(" ")}
                >
                  상세보기 →
                </button>
              </div>
            </div>
          </div>
        </article>
      );
    }
  );

SearchResultCard.displayName =
  "SearchResultCard";

export default SearchResultCard;