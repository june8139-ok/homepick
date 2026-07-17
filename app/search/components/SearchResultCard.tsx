import { forwardRef, type KeyboardEvent, type MouseEvent } from "react";

import type { Apartment } from "../../../types/apartment";
import {
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../../lib/subscriptionVisibility";

function heroImage(apartment: Apartment) {
  const hero = apartment.images?.hero;
  if (Array.isArray(hero)) return hero[0] ?? "";
  if (typeof hero === "string") {
    return hero.includes("/images/apartments/default/main.jpg") ? "" : hero;
  }
  return apartment.images?.gallery?.find(
    (image) => image && !image.includes("/images/apartments/default/main.jpg")
  ) ?? "";
}

function statusInfo(apartment: Apartment) {
  if (isSubscriptionApartment(apartment)) {
    return { label: apartment.status || "청약", className: "bg-blue-600 text-white" };
  }
  if (isFirstComeApartment(apartment)) {
    return { label: "선착순", className: "bg-emerald-600 text-white" };
  }
  return { label: apartment.status || "분양중", className: "bg-amber-500 text-white" };
}

function distanceText(distanceKm?: number | null) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return distanceKm < 10 ? `${distanceKm.toFixed(1)}km` : `${Math.round(distanceKm)}km`;
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

const SearchResultCard = forwardRef<HTMLElement, Props>(function SearchResultCard(
  { apartment, selected, hovered, distanceKm, onHover, onLeave, onSelect, onOpen },
  ref
) {
  const image = heroImage(apartment);
  const status = statusInfo(apartment);
  const distance = distanceText(distanceKm);
  const active = selected || hovered;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOpen();
  };

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={[
        "group cursor-pointer overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200",
        active
          ? "border-emerald-400 shadow-lg ring-2 ring-emerald-100"
          : "border-zinc-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md",
      ].join(" ")}
    >
      <div className="grid sm:grid-cols-[160px_1fr]">
        <div className="relative min-h-[180px] overflow-hidden bg-zinc-100">
          {image ? (
            <img
              src={image}
              alt={apartment.name}
              className={[
                "h-full w-full object-cover transition-transform duration-500",
                active ? "scale-105" : "group-hover:scale-105",
              ].join(" ")}
            />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-zinc-400">
              이미지 준비 중
            </div>
          )}

          <span className={[
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm",
            status.className,
          ].join(" ")}>
            {status.label}
          </span>

          {distance && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#0F766E] shadow-sm">
              내 위치에서 {distance}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col p-5">
          <p className="text-xs font-semibold text-emerald-600">
            {apartment.cityName || apartment.city}
          </p>
          <h3 className="mt-1 line-clamp-2 break-keep text-xl font-black leading-7">
            {apartment.name}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-500">{apartment.region}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
              <p className="text-zinc-400">분양가</p>
              <p className="mt-1 truncate font-bold text-zinc-800">{apartment.price || "문의"}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
              <p className="text-zinc-400">유형</p>
              <p className="mt-1 truncate font-bold text-zinc-800">{apartment.type || "아파트"}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-3">
            <p className="text-[11px] font-semibold text-emerald-700">핵심 계약조건</p>
            <p className="mt-1 line-clamp-2 break-keep text-sm font-bold leading-5 text-zinc-800">
              {apartment.condition || "조건 확인 필요"}
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-4">
            <button
              type="button"
              onClick={handleOpen}
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600"
            >
              상세보기 →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

SearchResultCard.displayName = "SearchResultCard";
export default SearchResultCard;