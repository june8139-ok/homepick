"use client";

import { useState } from "react";

import {
  calculateScore,
} from "../../data/scoring";

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
  supabase,
} from "../../lib/supabase";

import {
  useAdmin,
} from "./AdminContext";

function getGrade(score: number) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";

  return "정보확인";
}

interface RegisterButtonProps {
  mode?: "create" | "edit";
}

export default function RegisterButton({
  mode = "create",
}: RegisterButtonProps) {
  const {
    basicInfo,
    setBasicInfo,

    locationInfo,

    evaluation,
    images,

    editingSlug,

    setIsDirty,
  } = useAdmin();

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const score =
    calculateScore(evaluation);

  const handleRegister =
    async () => {
      if (isSaving) return;

      setIsSaving(true);

      try {
        let resolvedBasicInfo =
          basicInfo;

        if (
          !basicInfo.latitude ||
          !basicInfo.longitude
        ) {
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

        const apartmentData =
          buildApartment(
            resolvedBasicInfo,
            evaluation,
            locationInfo
          );

        const finalApartmentData = {
          ...apartmentData,

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

        if (!validation.isValid) {
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

          score_total:
            finalApartmentData
              .score.total,

          grade:
            getGrade(
              finalApartmentData
                .score.total
            ),

          hero_image:
            finalApartmentData
              .images.hero,

          latitude:
            finalApartmentData.latitude,

          longitude:
            finalApartmentData.longitude,

          is_published: false,

          data:
            finalApartmentData,
        };

        const query =
          mode === "edit" &&
          editingSlug
            ? supabase
                .from("apartments")
                .update(payload)
                .eq(
                  "slug",
                  editingSlug
                )
            : supabase
                .from("apartments")
                .insert(payload);

        const { error } =
          await query;

        if (error) {
          console.error(
            "Supabase 저장 오류:",
            error
          );

          alert(
            `저장 중 오류가 발생했습니다.\n\n${error.message}`
          );

          return;
        }

        setIsDirty(false);

        alert(
          mode === "create"
            ? "신규 단지 정보와 지도 위치가 저장되었습니다."
            : "수정한 단지 정보가 저장되었습니다."
        );
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

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-extrabold text-emerald-600">
        SAVE APARTMENT
      </p>

      <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
        {mode === "create"
          ? "단지 등록하기"
          : "수정 내용 저장하기"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        사업지 주소와 입력한 정보를
        확인한 뒤 Supabase에 저장합니다.
      </p>

      <div className="mt-5 rounded-2xl bg-[#F8FAF7] p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-zinc-500">
            내부 분석점수
          </span>

          <strong className="text-xl text-[#132238]">
            {score.total}점
          </strong>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-zinc-200 pt-3">
          <span className="text-sm text-zinc-500">
            지도 위치
          </span>

          <strong
            className={
              basicInfo.latitude !==
                null &&
              basicInfo.longitude !==
                null
                ? "text-emerald-600"
                : "text-amber-600"
            }
          >
            {basicInfo.latitude !==
              null &&
            basicInfo.longitude !==
              null
              ? "확인 완료"
              : "저장 시 자동 확인"}
          </strong>
        </div>
      </div>

      <button
        type="button"
        disabled={isSaving}
        onClick={handleRegister}
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