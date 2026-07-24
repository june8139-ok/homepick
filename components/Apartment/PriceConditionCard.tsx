import type {
  Apartment,
} from "../../types/apartment";

import UnitPriceCard from "./UnitPriceCard";

type BenefitTone =
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "violet"
  | "zinc";

type BenefitItem = {
  id: string;
  icon: string;
  title: string;
  value: string;
  tone: BenefitTone;
  featured?: boolean;
};

function normalizeText(
  value?: string | null
) {
  return value?.trim() ?? "";
}

function isMeaningfulValue(
  value?: string | null
) {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return false;
  }

  const excludedValues = [
    "확인 필요",
    "정보 없음",
    "없음",
    "-",
  ];

  return !excludedValues.includes(
    normalized
  );
}

function splitConditionText(
  condition?: string
) {
  return normalizeText(condition)
    .split(/[·|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function findCondition(
  conditions: string[],
  keywords: string[]
): string {
  return (
    conditions.find((item) =>
      keywords.some((keyword) =>
        item.includes(keyword)
      )
    ) ?? ""
  );
}

function cleanBenefitValue(
  value: string,
  prefixes: string[]
) {
  let result = value.trim();

  prefixes.forEach((prefix) => {
    if (result.startsWith(prefix)) {
      result = result
        .slice(prefix.length)
        .trim();
    }
  });

  return result || value;
}

function createBenefits(
  apartment: Apartment
): BenefitItem[] {
  const conditionItems =
    splitConditionText(
      apartment.condition
    );

  const benefits: BenefitItem[] =
    [];

  const explicitContract =
    normalizeText(
      apartment.priceDetail
        ?.contractPrice
    );

  const conditionContract =
    findCondition(
      conditionItems,
      [
        "계약금",
        "초기자금",
        "1차 계약",
      ]
    );

  const contractValue =
    isMeaningfulValue(
      explicitContract
    )
      ? explicitContract
      : conditionContract
        ? cleanBenefitValue(
            conditionContract,
            ["계약금"]
          )
        : "";

  if (
    isMeaningfulValue(
      contractValue
    )
  ) {
    benefits.push({
      id: "contract",
      icon: "💰",
      title: "계약금",
      value: contractValue,
      tone: "emerald",
      featured: true,
    });
  }

  const explicitMiddlePayment =
    normalizeText(
      apartment.priceDetail
        ?.middlePayment
    );

  const conditionMiddlePayment =
    findCondition(
      conditionItems,
      [
        "중도금",
        "무이자",
        "이자후불",
        "자납",
      ]
    );

  const middlePaymentValue =
    isMeaningfulValue(
      explicitMiddlePayment
    )
      ? explicitMiddlePayment
      : conditionMiddlePayment
        ? cleanBenefitValue(
            conditionMiddlePayment,
            ["중도금"]
          )
        : "";

  if (
    isMeaningfulValue(
      middlePaymentValue
    )
  ) {
    benefits.push({
      id: "middle-payment",
      icon: "🏦",
      title: "중도금",
      value:
        middlePaymentValue,
      tone: "blue",
      featured:
        middlePaymentValue.includes(
          "무이자"
        ),
    });
  }

  const freeOptionCondition =
    findCondition(
      conditionItems,
      [
        "발코니",
        "풀옵션",
        "옵션 무상",
        "시스템에어컨",
        "무상옵션",
      ]
    );

  const freeOptionFromList =
    apartment.priceDetail
      ?.options?.find(
        (item) =>
          item.includes("무상") ||
          item.includes("무료")
      );

  const freeOptionValue =
    freeOptionCondition ||
    freeOptionFromList ||
    "";

  if (
    isMeaningfulValue(
      freeOptionValue
    )
  ) {
    benefits.push({
      id: "free-option",
      icon: "🎁",
      title: "무상혜택",
      value: freeOptionValue,
      tone: "amber",
      featured: true,
    });
  }

  const cashBenefit =
    findCondition(
      conditionItems,
      [
        "축하금",
        "지원금",
        "페이백",
        "상품권",
        "현금",
        "혜택금",
      ]
    );

  if (
    isMeaningfulValue(
      cashBenefit
    )
  ) {
    benefits.push({
      id: "cash-benefit",
      icon: "⭐",
      title: "특별혜택",
      value: cashBenefit,
      tone: "rose",
      featured: true,
    });
  }

  const explicitBalance =
    normalizeText(
      apartment.priceDetail
        ?.balance
    );

  const conditionBalance =
    findCondition(
      conditionItems,
      [
        "잔금유예",
        "잔금 지원",
        "입주지원",
        "입주 지원",
      ]
    );

  const balanceValue =
    conditionBalance ||
    (explicitBalance.includes(
      "유예"
    ) ||
    explicitBalance.includes(
      "지원"
    )
      ? explicitBalance
      : "");

  if (
    isMeaningfulValue(
      balanceValue
    )
  ) {
    benefits.push({
      id: "balance",
      icon: "🏠",
      title: "잔금·입주지원",
      value: balanceValue,
      tone: "violet",
    });
  }

  const transferBenefit =
    findCondition(
      conditionItems,
      [
        "전매 가능",
        "전매가능",
        "안심전매",
        "전매제한 없음",
      ]
    );

  if (
    isMeaningfulValue(
      transferBenefit
    )
  ) {
    benefits.push({
      id: "transfer",
      icon: "🔄",
      title: "전매조건",
      value: transferBenefit,
      tone: "zinc",
    });
  }

  return benefits;
}

function getSectionHeading(
  apartment: Apartment
) {
  if (
    apartment.listingStage ===
    "firstCome"
  ) {
    return {
      eyebrow:
        "CURRENT BENEFITS",
      title:
        "현재 적용 중인 계약혜택",
      icon: "🔥",
      description:
        "선착순 공급에 현재 적용되는 핵심 조건만 정리했습니다.",
    };
  }

  if (
    apartment.listingStage ===
    "completed"
  ) {
    return {
      eyebrow:
        "LAST CONDITIONS",
      title:
        "최종 확인된 계약조건",
      icon: "📌",
      description:
        "공급 종료 전 마지막으로 확인된 조건입니다.",
    };
  }

  return {
    eyebrow:
      "CONTRACT CONDITIONS",
    title: "청약 계약조건",
    icon: "📋",
    description:
      "계약 전 확인해야 할 주요 납부조건과 혜택입니다.",
  };
}

export default function PriceConditionCard({
  apartment,
}: {
  apartment: Apartment;
}) {
  const benefits =
    createBenefits(apartment);

  const options =
    apartment.priceDetail
      ?.options?.filter(
        (item) =>
          isMeaningfulValue(
            item
          )
      ) ?? [];

  const sectionHeading =
    getSectionHeading(
      apartment
    );

  const showConditionFallback =
    benefits.length === 0 &&
    isMeaningfulValue(
      apartment.condition
    );

  return (
    <div className="mt-6 space-y-6 sm:mt-8">
      <UnitPriceCard
        apartment={apartment}
      />

      {(benefits.length > 0 ||
        showConditionFallback ||
        options.length > 0) && (
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          {apartment.listingStage ===
            "firstCome" && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-100/60 blur-3xl"
            />
          )}

          <div className="relative">
            <p className="text-xs font-extrabold tracking-wide text-emerald-600 sm:text-sm">
              {
                sectionHeading.eyebrow
              }
            </p>

            <div className="mt-1 flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-0.5 text-xl sm:text-2xl"
              >
                {
                  sectionHeading.icon
                }
              </span>

              <div>
                <h2 className="text-xl font-black text-[#132238] sm:text-2xl">
                  {
                    sectionHeading.title
                  }
                </h2>

                <p className="mt-1 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                  {
                    sectionHeading.description
                  }
                </p>
              </div>
            </div>

            {benefits.length >
              0 && (
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 lg:grid-cols-4">
                {benefits.map(
                  (benefit) => (
                    <BenefitCard
                      key={
                        benefit.id
                      }
                      benefit={
                        benefit
                      }
                    />
                  )
                )}
              </div>
            )}

            {showConditionFallback && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 sm:mt-6">
                <p className="text-xs font-bold text-emerald-700">
                  핵심 계약조건
                </p>

                <p className="mt-1 break-keep text-sm font-extrabold leading-6 text-emerald-950">
                  {
                    apartment.condition
                  }
                </p>
              </div>
            )}

            {options.length >
              0 && (
              <div className="mt-6 border-t border-zinc-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-[#132238]">
                    옵션 및 제공 품목
                  </p>

                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-500 sm:text-xs">
                    {
                      options.length
                    }
                    개
                  </span>
                </div>

                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {options.map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-semibold leading-5 text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50/60 sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-emerald-600"
                        >
                          ✓
                        </span>

                        <span>
                          {item}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <p className="mt-5 break-keep text-[10px] leading-5 text-zinc-400 sm:text-xs">
              계약혜택은 적용 세대와
              시점에 따라 달라질 수
              있으므로 상담 시 최신
              조건을 다시 확인해주세요.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function BenefitCard({
  benefit,
}: {
  benefit: BenefitItem;
}) {
  const toneClasses: Record<
    BenefitTone,
    {
      card: string;
      icon: string;
      label: string;
      value: string;
    }
  > = {
    emerald: {
      card:
        "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300 hover:shadow-emerald-100/60",
      icon:
        "bg-emerald-100 text-emerald-700",
      label:
        "text-emerald-700",
      value:
        "text-emerald-950",
    },

    blue: {
      card:
        "border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300 hover:shadow-blue-100/60",
      icon:
        "bg-blue-100 text-blue-700",
      label:
        "text-blue-700",
      value:
        "text-blue-950",
    },

    amber: {
      card:
        "border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-300 hover:shadow-amber-100/60",
      icon:
        "bg-amber-100 text-amber-700",
      label:
        "text-amber-700",
      value:
        "text-amber-950",
    },

    rose: {
      card:
        "border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:border-rose-300 hover:shadow-rose-100/60",
      icon:
        "bg-rose-100 text-rose-700",
      label:
        "text-rose-700",
      value:
        "text-rose-950",
    },

    violet: {
      card:
        "border-violet-200 bg-gradient-to-br from-violet-50 to-white hover:border-violet-300 hover:shadow-violet-100/60",
      icon:
        "bg-violet-100 text-violet-700",
      label:
        "text-violet-700",
      value:
        "text-violet-950",
    },

    zinc: {
      card:
        "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white hover:border-zinc-300 hover:shadow-zinc-100/60",
      icon:
        "bg-zinc-200 text-zinc-700",
      label:
        "text-zinc-600",
      value:
        "text-zinc-950",
    },
  };

  const tone =
    toneClasses[
      benefit.tone
    ];

  return (
    <article
      className={[
        "relative min-h-32 overflow-hidden rounded-2xl border p-3.5",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "sm:min-h-36 sm:p-4",
        tone.card,
      ].join(" ")}
    >
      {benefit.featured && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/85 px-2 py-1 text-[9px] font-black text-rose-500 shadow-sm backdrop-blur sm:text-[10px]">
          HOT
        </span>
      )}

      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-xl text-lg shadow-sm sm:h-10 sm:w-10 sm:text-xl",
          tone.icon,
        ].join(" ")}
      >
        <span aria-hidden="true">
          {benefit.icon}
        </span>
      </div>

      <p
        className={[
          "mt-3 text-[10px] font-extrabold sm:text-xs",
          tone.label,
        ].join(" ")}
      >
        {benefit.title}
      </p>

      <p
        className={[
          "mt-1 break-keep text-sm font-black leading-5 sm:text-base sm:leading-6",
          tone.value,
        ].join(" ")}
      >
        {benefit.value}
      </p>
    </article>
  );
}