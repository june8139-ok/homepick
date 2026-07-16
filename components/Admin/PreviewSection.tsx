"use client";

import { calculateScore } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

function getGrade(score: number) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  return "C";
}

function getConditionText(evaluation: ReturnType<typeof useAdmin>["evaluation"]) {
  const conditions = [];

  if (evaluation.contractType === "fixed-500") conditions.push("계약금 500만원");
  if (evaluation.contractType === "fixed-1000") conditions.push("계약금 1,000만원");
  if (evaluation.contractType === "ratio-5") conditions.push("계약금 5%");
  if (evaluation.contractType === "ratio-10") conditions.push("계약금 10%");

  if (evaluation.middlePaymentType === "free") conditions.push("중도금 무이자");
  if (evaluation.middlePaymentType === "partial-free") conditions.push("일부 무이자");
  if (evaluation.middlePaymentType === "interest-deferred") conditions.push("이자후불제");
  if (evaluation.middlePaymentType === "self") conditions.push("중도금 자납");

  if (evaluation.optionBenefitType === "balcony-free") {
    conditions.push("발코니 확장 무상");
  }

  if (evaluation.optionBenefitType === "balcony-and-options-free") {
    conditions.push("풀옵션 무상");
  }

  if (evaluation.optionBenefitType === "paid") {
    conditions.push("발코니 유상");
  }

  if (evaluation.cashBenefitType === "small") conditions.push("소액 혜택");
  if (evaluation.cashBenefitType === "over-1000") conditions.push("1,000만원 이상 혜택");
  if (evaluation.cashBenefitType === "over-2000") conditions.push("2,000만원 이상 혜택");

  if (evaluation.balanceSupport === "yes") {
    conditions.push("잔금유예/입주지원");
  }

  return conditions.join(" · ");
}

export default function PreviewSection() {
  const { basicInfo, evaluation, images } = useAdmin();

  const score = calculateScore(evaluation);
  const conditionText = getConditionText(evaluation);
  const heroImage = images.hero[0];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">PREVIEW</p>
      <h2 className="mt-2 text-2xl font-bold">노출 미리보기</h2>

      <article className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {heroImage ? (
          <img
            src={heroImage}
            alt={basicInfo.name || "대표 이미지"}
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 items-center justify-center bg-zinc-100 text-sm text-zinc-400">
            대표 이미지 미리보기
          </div>
        )}

        <div className="p-5">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-white">
              등록예정
            </span>

            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600">
              {getGrade(score.total)}
            </span>

            {basicInfo.cityName && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600">
                {basicInfo.cityName}
              </span>
            )}
          </div>

          <h3 className="mt-4 text-xl font-bold">
            {basicInfo.name || "단지명을 입력하세요"}
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            {basicInfo.region || basicInfo.cityName || "지역 정보를 입력하세요"}
          </p>

          <p className="mt-3 text-sm font-semibold text-zinc-900">
            {basicInfo.salePrice || "분양가를 입력하세요"}
          </p>

          <p className="mt-2 text-sm font-medium text-zinc-700">
            {conditionText || "계약조건을 선택하세요"}
          </p>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-xs text-zinc-500">AI 분석점수</p>
              <p className="text-3xl font-bold">{score.total}점</p>
            </div>

            <span className="text-sm font-medium text-zinc-500">
              상세보기 →
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}