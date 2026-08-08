import Image from "next/image";
import Link from "next/link";

import type {
  Apartment,
} from "../../types/apartment";

import {
  formatSubscriptionDate,
  isFirstComeApartment,
  isSubscriptionApartment,
} from "../../lib/subscriptionVisibility";

function getHeroImage(
  apartment: Apartment
) {
  const hero =
    apartment.images?.hero;

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

function getPriceText(
  apartment: Apartment
) {
  return (
    apartment.priceDetail
      ?.salePrice ||
    apartment.price ||
    "분양가 확인 중"
  );
}

function getScheduleText(
  apartment: Apartment
) {
  const schedule =
    apartment.subscription;

  const first =
    formatSubscriptionDate(
      schedule?.firstPriorityStartDate
    );

  const special =
    formatSubscriptionDate(
      schedule?.specialSupplyStartDate
    );

  const winner =
    formatSubscriptionDate(
      schedule?.winnerDate
    );

  const contract =
    formatSubscriptionDate(
      schedule?.contractStartDate
    );

  if (first) {
    return `1순위 ${first}`;
  }

  if (special) {
    return `특별공급 ${special}`;
  }

  if (winner) {
    return `당첨자발표 ${winner}`;
  }

  if (contract) {
    return `계약 ${contract}`;
  }

  return "";
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
      "bg-amber-500 text-zinc-950",
  };
}

export default function ListingHubCard({
  apartment,
  priority = false,
}: {
  apartment: Apartment;
  priority?: boolean;
}) {
  const image =
    getHeroImage(apartment);

  const status =
    getStatusInfo(apartment);

  const scheduleText =
    getScheduleText(apartment);

  const priceText =
    getPriceText(apartment);

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:rounded-3xl">
      <Link
        href={`/apartments/${apartment.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
          {image ? (
            <Image
              src={image}
              alt={`${apartment.name} 대표 이미지`}
              fill
              priority={priority}
              fetchPriority={
                priority
                  ? "high"
                  : "auto"
              }
              quality={74}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-zinc-400">
              대표 이미지 준비 중
            </div>
          )}

          <span
            className={[
              "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm",
              status.className,
            ].join(" ")}
          >
            {status.label}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <p className="truncate text-xs font-extrabold text-emerald-700">
            {apartment.cityName ||
              apartment.city ||
              "지역 확인 중"}
          </p>

          <h2 className="mt-1 line-clamp-2 break-keep text-lg font-black leading-7 text-[#132238] sm:text-xl">
            {apartment.name}
          </h2>

          <p className="mt-1 truncate text-xs text-zinc-500">
            {apartment.region ||
              apartment.districtName ||
              "주소 확인 중"}
          </p>

          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
            <p className="text-[10px] font-bold text-emerald-800">
              분양가
            </p>

            <p className="mt-0.5 truncate text-base font-black text-zinc-950">
              {priceText}
            </p>
          </div>

          {scheduleText && (
            <p className="mt-3 text-xs font-bold text-blue-700">
              {scheduleText}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="truncate text-xs font-semibold text-zinc-500">
              {apartment.condition ||
                "상세 조건 확인"}
            </span>

            <span className="shrink-0 text-sm font-black text-emerald-700 transition-transform group-hover:translate-x-1">
              상세보기 →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}