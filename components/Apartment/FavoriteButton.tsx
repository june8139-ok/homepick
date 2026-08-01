"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  isFavoriteApartment,
  toggleFavoriteApartment,
} from "../../lib/favorites";

export default function FavoriteButton({
  slug,
  apartmentName,
}: {
  slug: string;
  apartmentName: string;
}) {
  const [
    isFavorite,
    setIsFavorite,
  ] = useState(false);

  useEffect(() => {
    setIsFavorite(
      isFavoriteApartment(slug)
    );
  }, [slug]);

  const handleToggle = () => {
    const next =
      toggleFavoriteApartment(
        slug
      );

    setIsFavorite(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `${apartmentName} 관심단지 해제`
          : `${apartmentName} 관심단지 저장`
      }
      title={
        isFavorite
          ? "관심단지 해제"
          : "관심단지 저장"
      }
      className={[
        "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border text-xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        isFavorite
          ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "border-zinc-200 bg-white text-zinc-400 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600",
      ].join(" ")}
    >
      <span aria-hidden="true">
        {isFavorite
          ? "♥"
          : "♡"}
      </span>
    </button>
  );
}
