"use client";

import Image from "next/image";

import { useAdmin } from "./AdminContext";

function getConditionText(
  evaluation: ReturnType<
    typeof useAdmin
  >["evaluation"]
) {
  const conditions: string[] = [];

  if (
    evaluation.contractType ===
    "fixed-500"
  ) {
    conditions.push(
      "계약금 500만원"
    );
  }

  if (
    evaluation.contractType ===
    "fixed-1000"
  ) {
    conditions.push(
      "계약금 1,000만원"
    );
  }

  if (
    evaluation.contractType ===
    "ratio-5"
  ) {
    conditions.push(
      "계약금 5%"
    );
  }

  if (
    evaluation.contractType ===
    "ratio-10"
  ) {
    conditions.push(
      "계약금 10%"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "free"
  ) {
    conditions.push(
      "중도금 무이자"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "partial-free"
  ) {
    conditions.push(
      "일부 무이자"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "interest-deferred"
  ) {
    conditions.push(
      "이자후불제"
    );
  }

  if (
    evaluation.middlePaymentType ===
    "self"
  ) {
    conditions.push(
      "중도금 자납"
    );
  }

  if (
    evaluation.optionBenefitType ===
    "balcony-free"
  ) {
    conditions.push(
      "발코니 확장 무상"
    );
  }

  if (
    evaluation.optionBenefitType ===
    "balcony-and-options-free"
  ) {
    conditions.push(
      "풀옵션 무상"
    );
  }

  if (
    evaluation.optionBenefitType ===
    "paid"
  ) {
    conditions.push(
      "발코니 확장 유상"
    );
  }

  if (
    evaluation.cashBenefitType ===
    "small"
  ) {
    conditions.push(
      "소액 혜택"
    );
  }

  if (
    evaluation.cashBenefitType ===
    "over-1000"
  ) {
    conditions.push(
      "1,000만원 이상 혜택"
    );
  }

  if (
    evaluation.cashBenefitType ===
    "over-2000"
  ) {
    conditions.push(
      "2,000만원 이상 혜택"
    );
  }

  if (
    evaluation.balanceSupport ===
    "yes"
  ) {
    conditions.push(
      "잔금유예 / 입주지원"
    );
  }

  return conditions.join(
    " · "
  );
}

function getListingStageLabel(
  listingStage:
    | "subscription"
    | "firstCome"
    | "completed"
    | "existing"
) {
  switch (
    listingStage
  ) {
    case "subscription":
      return "청약";

    case "firstCome":
      return "선착순";

    case "completed":
      return "노출 종료";

    case "existing":
      return "기존 아파트";

    default:
      return "분양";
  }
}

function getListingStageClassName(
  listingStage:
    | "subscription"
    | "firstCome"
    | "completed"
    | "existing"
) {
  switch (
    listingStage
  ) {
    case "subscription":
      return "bg-blue-50 text-blue-700";

    case "firstCome":
      return "bg-emerald-50 text-emerald-700";

    case "completed":
      return "bg-zinc-100 text-zinc-500";

    case "existing":
      return "bg-violet-50 text-violet-700";

    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

export default function PreviewSection() {
  const {
    basicInfo,
    evaluation,
    images,
    listingStage,
  } = useAdmin();

  const conditionText =
    getConditionText(
      evaluation
    );

  const heroImage =
    images.hero[0];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-extrabold text-emerald-600">
        LIVE PREVIEW
      </p>

      <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
        실제 노출 미리보기
      </h2>

      <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
        입력한 정보가 사용자 화면에
        어떻게 표시되는지 확인합니다.
      </p>

      <article className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {heroImage ? (
          <div className="relative h-40 w-full">
            <Image
              src={heroImage}
              alt={
                basicInfo.name ||
                "대표 이미지"
              }
              fill
              quality={72}
              sizes="(max-width: 639px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-400">
            대표 이미지 미리보기
          </div>
        )}

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={[
                "rounded-full px-3 py-1 font-bold",
                getListingStageClassName(
                  listingStage
                ),
              ].join(" ")}
            >
              {getListingStageLabel(
                listingStage
              )}
            </span>

            {basicInfo.cityName && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-600">
                {basicInfo.cityName}
              </span>
            )}

            {basicInfo.usage && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-600">
                {basicInfo.usage}
              </span>
            )}
          </div>

          <h3 className="mt-4 break-keep text-xl font-black leading-7 text-[#132238]">
            {basicInfo.name ||
              "단지명을 입력하세요"}
          </h3>

          <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
            {basicInfo.region ||
              basicInfo.cityName ||
              "지역 정보를 입력하세요"}
          </p>

          <div className="mt-5 grid gap-3">
            <PreviewRow
              label="분양가"
              value={
                basicInfo.salePrice ||
                "분양가를 입력하세요"
              }
              emphasized
            />

            <PreviewRow
              label="계약조건"
              value={
                conditionText ||
                "계약조건을 선택하세요"
              }
            />

            <PreviewRow
              label="세대수"
              value={
                basicInfo.totalHouseholds ||
                "세대수 정보 없음"
              }
            />

            <PreviewRow
              label="입주 예정"
              value={
                basicInfo.moveInDate ||
                "입주 예정일 정보 없음"
              }
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-xs font-semibold text-zinc-400">
              사용자 화면 미리보기
            </span>

            <span className="text-sm font-bold text-emerald-700">
              상세보기 →
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}

function PreviewRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-zinc-50 px-3 py-3">
      <span className="shrink-0 text-xs font-semibold text-zinc-500">
        {label}
      </span>

      <span
        className={[
          "break-keep text-right text-sm",
          emphasized
            ? "font-black text-[#132238]"
            : "font-semibold text-zinc-700",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
