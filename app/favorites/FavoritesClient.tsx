"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import type {
  Apartment,
} from "../../types/apartment";

import {
  getFavoriteApartmentSlugs,
  removeFavoriteApartment,
} from "../../lib/favorites";

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

export default function FavoritesClient({
  apartments,
}: {
  apartments: Apartment[];
}) {
  const router =
    useRouter();

  const [
    favoriteSlugs,
    setFavoriteSlugs,
  ] = useState<string[]>([]);

  const [
    selectedSlugs,
    setSelectedSlugs,
  ] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteSlugs(
      getFavoriteApartmentSlugs()
    );
  }, []);

  const favoriteApartments =
    useMemo(
      () =>
        favoriteSlugs
          .map((slug) =>
            apartments.find(
              (apartment) =>
                apartment.slug ===
                slug
            )
          )
          .filter(
            (
              apartment
            ): apartment is Apartment =>
              Boolean(apartment)
          ),
      [
        apartments,
        favoriteSlugs,
      ]
    );

  const handleRemove = (
    slug: string
  ) => {
    removeFavoriteApartment(
      slug
    );

    setFavoriteSlugs(
      getFavoriteApartmentSlugs()
    );

    setSelectedSlugs(
      (current) =>
        current.filter(
          (item) =>
            item !== slug
        )
    );
  };

  const toggleSelected = (
    slug: string
  ) => {
    setSelectedSlugs(
      (current) => {
        if (
          current.includes(
            slug
          )
        ) {
          return current.filter(
            (item) =>
              item !== slug
          );
        }

        if (
          current.length >= 2
        ) {
          return [
            current[1],
            slug,
          ];
        }

        return [
          ...current,
          slug,
        ];
      }
    );
  };

  const compareSelected = () => {
    if (
      selectedSlugs.length !==
      2
    ) {
      return;
    }

    router.push(
      `/compare?ids=${encodeURIComponent(
        selectedSlugs.join(
          ","
        )
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-7 text-zinc-900 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
          FAVORITE APARTMENTS
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#132238] sm:text-4xl">
          관심단지
        </h1>

        <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
          저장한 단지를 다시 확인하고,
          최대 두 곳을 선택해 바로
          비교할 수 있습니다.
        </p>

        {favoriteApartments.length ===
        0 ? (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-lg font-black text-[#132238]">
              저장한 관심단지가 없습니다.
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              단지 상세페이지의
              하트 버튼을 눌러
              관심단지를 저장해보세요.
            </p>

            <Link
              href="/search"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#132238] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              분양 단지 찾아보기
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteApartments.map(
                (apartment) => {
                  const image =
                    getHeroImage(
                      apartment
                    );

                  const selected =
                    selectedSlugs.includes(
                      apartment.slug
                    );

                  return (
                    <article
                      key={
                        apartment.slug
                      }
                      className={[
                        "overflow-hidden rounded-2xl border bg-white shadow-sm transition sm:rounded-3xl",
                        selected
                          ? "border-emerald-400 ring-2 ring-emerald-100"
                          : "border-zinc-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md",
                      ].join(" ")}
                    >
                      <Link
                        href={`/apartments/${apartment.slug}`}
                        className="relative block h-44 overflow-hidden bg-zinc-100"
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={`${apartment.name} 대표 이미지`}
                            fill
                            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-400">
                            이미지 준비 중
                          </div>
                        )}
                      </Link>

                      <div className="p-4 sm:p-5">
                        <h2 className="line-clamp-2 break-keep text-lg font-black text-[#132238]">
                          {apartment.name}
                        </h2>

                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                          {apartment.region ||
                            "주소 정보 확인 중"}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-zinc-50 p-3">
                            <p className="text-[10px] font-bold text-zinc-500">
                              분양가
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs font-black text-[#132238]">
                              {apartment.priceDetail
                                ?.salePrice ||
                                apartment.price ||
                                "확인 중"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-zinc-50 p-3">
                            <p className="text-[10px] font-bold text-zinc-500">
                              계약조건
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs font-black text-[#132238]">
                              {apartment.condition ||
                                "확인 중"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleSelected(
                                apartment.slug
                              )
                            }
                            className={[
                              "min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-bold transition",
                              selected
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                            ].join(" ")}
                          >
                            {selected
                              ? "비교 선택됨"
                              : "비교 선택"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                apartment.slug
                              )
                            }
                            className="min-h-11 cursor-pointer rounded-xl border border-rose-200 bg-white px-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                          >
                            관심 해제
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            <div className="sticky bottom-4 z-30 mt-6 rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex sm:items-center sm:justify-between sm:rounded-3xl">
              <div>
                <p className="text-sm font-black text-[#132238]">
                  비교할 단지
                  {" "}
                  {selectedSlugs.length}/2
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  두 단지를 선택하면
                  비교페이지로 이동할 수 있습니다.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  selectedSlugs.length !==
                  2
                }
                onClick={
                  compareSelected
                }
                className="mt-3 min-h-12 w-full cursor-pointer rounded-xl bg-[#132238] px-5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:w-auto"
              >
                선택한 두 단지 비교
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
