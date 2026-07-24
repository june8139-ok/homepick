"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  buildApartment,
} from "../../lib/buildApartment";

import {
  geocodeAddress,
} from "../../lib/naverGeocode";

import {
  validateApartment,
} from "../../lib/validateApartment";

import {
  useAdmin,
} from "./AdminContext";

import type {
  ApartmentPriceInfo,
  ListingStage,
} from "../../types/apartment";

function getListingStageLabel(
  listingStage: ListingStage
) {
  switch (listingStage) {
    case "subscription":
      return "청약";

    case "firstCome":
      return "선착순";

    case "completed":
      return "노출 종료";

    case "existing":
      return "기존 아파트";

    default:
      return "청약";
  }
}

function getResolvedStatus(
  listingStage: ListingStage
) {
  switch (listingStage) {
    case "subscription":
      return "청약중";

    case "firstCome":
      return "선착순 분양";

    case "completed":
      return "노출 종료";

    case "existing":
      return "기존 아파트";

    default:
      return "등록예정";
  }
}

function hasPriceInformation(
  priceInfo: ApartmentPriceInfo
) {
  return (
    priceInfo.units.length > 0 ||
    typeof priceInfo.minimumPrice ===
      "number" ||
    typeof priceInfo.maximumPrice ===
      "number" ||
    typeof priceInfo.averagePricePerPyeong ===
      "number"
  );
}

interface RegisterButtonProps {
  mode?: "create" | "edit";
}

export default function RegisterButton({
  mode = "create",
}: RegisterButtonProps) {
  const router =
    useRouter();

  const {
    basicInfo,
    setBasicInfo,

    priceInfo,

    locationInfo,

    evaluation,
    images,

    listingStage,
    editingSlug,

    setIsDirty,
  } = useAdmin();

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const handleRegister =
    async () => {
      if (isSaving) {
        return;
      }

      setIsSaving(true);

      try {
        let resolvedBasicInfo =
          basicInfo;

        const needsLocation =
          basicInfo.latitude ===
            null ||
          basicInfo.longitude ===
            null;

        if (needsLocation) {
          if (
            !basicInfo.region.trim()
          ) {
            alert(
              "사업지 주소를 먼저 입력해주세요."
            );

            return;
          }

          const coordinates =
            await geocodeAddress(
              basicInfo.region
            );

          resolvedBasicInfo = {
            ...basicInfo,

            latitude:
              coordinates.latitude,

            longitude:
              coordinates.longitude,
          };

          setBasicInfo(
            resolvedBasicInfo
          );
        }

        /*
         * 기본정보, 계약조건, 입지,
         * 구조화된 평형별 분양가를
         * 최종 단지 데이터로 만듭니다.
         */
        const apartmentData =
          buildApartment(
            resolvedBasicInfo,
            evaluation,
            locationInfo,
            priceInfo
          );

        /*
         * 수정할 때는 기존 slug를 유지합니다.
         * 단지명을 바꿔도 상세 URL과
         * 브리핑 연결이 끊어지지 않습니다.
         */
        const preservedSlug =
          mode === "edit" &&
          editingSlug
            ? editingSlug
            : apartmentData.slug;

        const resolvedStatus =
          getResolvedStatus(
            listingStage
          );

        const finalApartmentData = {
          ...apartmentData,

          slug:
            preservedSlug,

          listingStage,

          status:
            resolvedStatus,

          images: {
            hero:
              images.hero[0] ??
              null,

            location:
              images.location,

            floorPlans:
              images.floorPlans,

            community:
              images.community,

            gallery:
              images.gallery,
          },
        };

        const validation =
          validateApartment(
            finalApartmentData
          );

        if (
          !validation.isValid
        ) {
          alert(
            `입력값을 확인해주세요.\n\n${validation.errors.join(
              "\n"
            )}`
          );

          return;
        }

        const payload = {
          slug:
            finalApartmentData.slug,

          name:
            finalApartmentData.name,

          brand:
            finalApartmentData.brand,

          builder:
            finalApartmentData.builder,

          city:
            finalApartmentData.city,

          district:
            finalApartmentData.district,

          region:
            finalApartmentData.region,

          status:
            finalApartmentData.status,

          type:
            finalApartmentData.type,

          hero_image:
            finalApartmentData
              .images.hero,

          latitude:
            finalApartmentData.latitude,

          longitude:
            finalApartmentData.longitude,

          data:
            finalApartmentData,
        };

        const response =
          await fetch(
            "/api/admin/apartments/save",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  mode,
                  editingSlug,
                  payload,
                }),
            }
          );

        const result =
          (await response.json()) as {
            message?: string;

            apartment?: {
              slug?: string;
              status?: string;

              data?: {
                listingStage?: ListingStage;
                priceInfo?: ApartmentPriceInfo;
              };
            };
          };

        if (!response.ok) {
          throw new Error(
            result.message ||
              "저장 중 오류가 발생했습니다."
          );
        }

        /*
         * 선택한 노출 상태가 실제 DB에
         * 저장되었는지 확인합니다.
         */
        const savedStage =
          result.apartment
            ?.data
            ?.listingStage;

        if (
          savedStage !==
          listingStage
        ) {
          throw new Error(
            "선택한 노출 단계가 DB에 정상적으로 저장되지 않았습니다."
          );
        }

        /*
         * 평형별 가격을 입력했다면
         * 저장 결과에도 priceInfo가 있어야 합니다.
         */
        if (
          hasPriceInformation(
            priceInfo
          ) &&
          !result.apartment
            ?.data
            ?.priceInfo
        ) {
          throw new Error(
            "분양가 정보가 DB에 정상적으로 저장되지 않았습니다."
          );
        }

        setIsDirty(false);

        alert(
          mode === "create"
            ? `신규 단지가 등록되었습니다.\n\n노출 상태: ${getListingStageLabel(
                listingStage
              )}`
            : `수정한 단지 정보가 저장되었습니다.\n\n노출 상태: ${getListingStageLabel(
                listingStage
              )}`
        );

        if (mode === "create") {
          router.push(
            "/admin/apartments"
          );

          router.refresh();

          return;
        }

        /*
         * 수정한 서버 데이터를 다시 불러옵니다.
         */
        router.refresh();
      } catch (error) {
        console.error(
          "단지 저장 오류:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "저장 중 오류가 발생했습니다."
        );
      } finally {
        setIsSaving(false);
      }
    };

  const unitCount =
    priceInfo.units.length;

  const hasLocation =
    basicInfo.latitude !==
      null &&
    basicInfo.longitude !==
      null;

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-extrabold text-emerald-600">
        SAVE APARTMENT
      </p>

      <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
        {mode === "create"
          ? "단지 등록하기"
          : "수정 내용 저장하기"}
      </h2>

      <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
        입력한 단지 정보와 평형별
        분양가, 계약조건, 이미지 및
        지도 위치를 관리자 API를
        통해 안전하게 저장합니다.
      </p>

      <div className="mt-5 divide-y divide-zinc-200 rounded-2xl bg-[#F8FAF7] px-4">
        <StatusRow
          label="단지 노출 상태"
        >
          <strong
            className={[
              "rounded-full px-3 py-1 text-sm",
              listingStage ===
              "subscription"
                ? "bg-blue-100 text-blue-700"
                : listingStage ===
                    "firstCome"
                  ? "bg-emerald-100 text-emerald-700"
                  : listingStage ===
                      "completed"
                    ? "bg-zinc-200 text-zinc-600"
                    : "bg-violet-100 text-violet-700",
            ].join(" ")}
          >
            {getListingStageLabel(
              listingStage
            )}
          </strong>
        </StatusRow>

        <StatusRow label="지도 위치">
          <strong
            className={
              hasLocation
                ? "text-emerald-600"
                : "text-amber-600"
            }
          >
            {hasLocation
              ? "확인 완료"
              : "저장 시 자동 확인"}
          </strong>
        </StatusRow>

        <StatusRow label="평형별 분양가">
          <strong
            className={
              unitCount > 0
                ? "text-emerald-600"
                : "text-zinc-500"
            }
          >
            {unitCount > 0
              ? `${unitCount}개 평형 입력`
              : "대표 가격만 사용"}
          </strong>
        </StatusRow>

        <StatusRow label="등록 이미지">
          <strong className="text-[#132238]">
            {images.hero.length +
              images.location.length +
              images.floorPlans.length +
              images.community.length +
              images.gallery.length}
            장
          </strong>
        </StatusRow>
      </div>

      <button
        type="button"
        disabled={isSaving}
        onClick={
          handleRegister
        }
        className="
          mt-5 w-full cursor-pointer
          rounded-2xl bg-[#132238]
          px-6 py-4 font-bold text-white
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-emerald-600
          hover:shadow-lg
          active:translate-y-0
          active:scale-[0.99]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-emerald-500
          focus-visible:ring-offset-2
          disabled:cursor-wait
          disabled:opacity-60
        "
      >
        {isSaving
          ? "주소 확인 및 저장 중..."
          : mode === "create"
            ? "Supabase에 등록하기"
            : "수정 내용 저장하기"}
      </button>
    </section>
  );
}

function StatusRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-3">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      {children}
    </div>
  );
}