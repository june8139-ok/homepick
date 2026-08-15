"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import type {
  Apartment,
  UnitPrice,
} from "../../types/apartment";

type Props = {
  apartments: Apartment[];
};

type CompareRow = {
  label: string;
  render: (apartment: Apartment) => ReactNode;
};

type CompareSection = {
  id: string;
  title: string;
  description: string;
  rows: CompareRow[];
};

type PriceBasis =
  | "84"
  | "near84"
  | "representative"
  | "fallback";

type SmartPrice = {
  basis: PriceBasis;
  area: number | null;
  areaLabel: string;
  minimum: number | null;
  maximum: number | null;
  compareValue: number | null;
  text: string;
  note: string;
  structured: boolean;
};

type ContractInfo = {
  text: string;
  compareAmount: number | null;
  estimated: boolean;
};

function textOrFallback(
  value: unknown,
  fallback = "정보 확인 중"
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const normalized = String(value).trim();

  return normalized || fallback;
}

function validPrice(
  value?: number | null
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function formatPrice(
  value?: number | null
) {
  if (!validPrice(value)) {
    return "";
  }

  const amount = Math.round(value);
  const eok =
    Math.floor(amount / 10000);
  const manwon =
    amount % 10000;

  if (eok === 0) {
    return `${amount.toLocaleString(
      "ko-KR"
    )}만원`;
  }

  if (manwon === 0) {
    return `${eok}억원`;
  }

  return `${eok}억 ${manwon.toLocaleString(
    "ko-KR"
  )}만원`;
}

function formatPriceRange(
  minimum: number | null,
  maximum: number | null
) {
  if (
    validPrice(minimum) &&
    validPrice(maximum)
  ) {
    if (minimum === maximum) {
      return formatPrice(minimum);
    }

    return `${formatPrice(
      minimum
    )} ~ ${formatPrice(
      maximum
    )}`;
  }

  if (validPrice(minimum)) {
    return `${formatPrice(
      minimum
    )}부터`;
  }

  if (validPrice(maximum)) {
    return `최고 ${formatPrice(
      maximum
    )}`;
  }

  return "";
}

function parseArea(
  value: unknown
): number | null {
  const match =
    String(value ?? "")
      .replace(/,/g, "")
      .match(/\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function marketedArea(
  value: number
) {
  return Math.floor(
    value + 0.000001
  );
}

function unitHouseholds(
  unit: UnitPrice
) {
  if (
    typeof unit.households ===
      "number" &&
    Number.isFinite(
      unit.households
    )
  ) {
    return unit.households;
  }

  return (unit.types ?? []).reduce(
    (sum, type) =>
      sum +
      (typeof type.households ===
        "number" &&
      Number.isFinite(
        type.households
      )
        ? type.households
        : 0),
    0
  );
}

function getUnitRange(
  units: UnitPrice[]
) {
  const values: number[] = [];

  units.forEach((unit) => {
    if (validPrice(unit.minPrice)) {
      values.push(unit.minPrice);
    }

    if (validPrice(unit.maxPrice)) {
      values.push(unit.maxPrice);
    }

    unit.types?.forEach((type) => {
      if (validPrice(type.minPrice)) {
        values.push(type.minPrice);
      }

      if (validPrice(type.maxPrice)) {
        values.push(type.maxPrice);
      }
    });
  });

  if (values.length === 0) {
    return {
      minimum: null,
      maximum: null,
    };
  }

  return {
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  };
}

function hasUnitPrice(
  unit: UnitPrice
) {
  const range =
    getUnitRange([unit]);

  return (
    validPrice(range.minimum) ||
    validPrice(range.maximum)
  );
}

function getSmartPrice(
  apartment: Apartment
): SmartPrice {
  const units =
    (apartment.priceInfo?.units ?? [])
      .filter(hasUnitPrice);

  const parsedUnits =
    units
      .map((unit) => ({
        unit,
        area:
          parseArea(unit.area),
      }))
      .filter(
        (
          item
        ): item is {
          unit: UnitPrice;
          area: number;
        } =>
          item.area !== null
      );

  const exact84 =
    parsedUnits.filter(
      ({ area }) =>
        marketedArea(area) === 84
    );

  if (exact84.length > 0) {
    const selectedUnits =
      exact84.map(
        ({ unit }) => unit
      );

    const range =
      getUnitRange(
        selectedUnits
      );

    return {
      basis: "84",
      area: 84,
      areaLabel: "84㎡ 기준",
      minimum:
        range.minimum,
      maximum:
        range.maximum,
      compareValue:
        range.minimum ??
        range.maximum,
      text:
        formatPriceRange(
          range.minimum,
          range.maximum
        ),
      note:
        "전용 84㎡ 우선 비교",
      structured: true,
    };
  }

  const near84 =
    parsedUnits
      .filter(({ area }) => {
        const marketed =
          marketedArea(area);

        return (
          marketed >= 80 &&
          marketed <= 88
        );
      })
      .sort(
        (a, b) =>
          Math.abs(a.area - 84) -
          Math.abs(b.area - 84)
      );

  if (near84.length > 0) {
    const targetArea =
      marketedArea(
        near84[0].area
      );

    const selectedUnits =
      near84
        .filter(
          ({ area }) =>
            marketedArea(area) ===
            targetArea
        )
        .map(
          ({ unit }) => unit
        );

    const range =
      getUnitRange(
        selectedUnits
      );

    return {
      basis: "near84",
      area: targetArea,
      areaLabel:
        `${targetArea}㎡ 기준`,
      minimum:
        range.minimum,
      maximum:
        range.maximum,
      compareValue:
        range.minimum ??
        range.maximum,
      text:
        formatPriceRange(
          range.minimum,
          range.maximum
        ),
      note:
        "84㎡ 미공급 · 가장 가까운 평형",
      structured: true,
    };
  }

  if (parsedUnits.length > 0) {
    const hasHouseholdData =
      parsedUnits.some(
        ({ unit }) =>
          unitHouseholds(unit) > 0
      );

    const representative =
      [...parsedUnits].sort(
        (a, b) => {
          if (hasHouseholdData) {
            const householdGap =
              unitHouseholds(
                b.unit
              ) -
              unitHouseholds(
                a.unit
              );

            if (householdGap !== 0) {
              return householdGap;
            }
          }

          return (
            Math.abs(a.area - 84) -
            Math.abs(b.area - 84)
          );
        }
      )[0];

    const targetArea =
      marketedArea(
        representative.area
      );

    const selectedUnits =
      parsedUnits
        .filter(
          ({ area }) =>
            marketedArea(area) ===
            targetArea
        )
        .map(
          ({ unit }) => unit
        );

    const range =
      getUnitRange(
        selectedUnits
      );

    return {
      basis: "representative",
      area: targetArea,
      areaLabel:
        `${targetArea}㎡ 기준`,
      minimum:
        range.minimum,
      maximum:
        range.maximum,
      compareValue:
        range.minimum ??
        range.maximum,
      text:
        formatPriceRange(
          range.minimum,
          range.maximum
        ),
      note:
        hasHouseholdData
          ? "84㎡ 미공급 · 공급세대가 많은 대표 평형"
          : "84㎡ 미공급 · 대표 평형",
      structured: true,
    };
  }

  const wholeMinimum =
    apartment.priceInfo
      ?.minimumPrice;

  const wholeMaximum =
    apartment.priceInfo
      ?.maximumPrice;

  if (
    validPrice(wholeMinimum) ||
    validPrice(wholeMaximum)
  ) {
    return {
      basis: "fallback",
      area: null,
      areaLabel:
        "전체 가격 기준",
      minimum:
        validPrice(
          wholeMinimum
        )
          ? wholeMinimum
          : null,
      maximum:
        validPrice(
          wholeMaximum
        )
          ? wholeMaximum
          : null,
      compareValue:
        validPrice(
          wholeMinimum
        )
          ? wholeMinimum
          : validPrice(
                wholeMaximum
              )
            ? wholeMaximum
            : null,
      text:
        formatPriceRange(
          validPrice(
            wholeMinimum
          )
            ? wholeMinimum
            : null,
          validPrice(
            wholeMaximum
          )
            ? wholeMaximum
            : null
        ),
      note:
        "평형별 가격 미입력",
      structured: true,
    };
  }

  const manualSalePrice =
    apartment.priceDetail
      ?.salePrice?.trim() ||
    apartment.price?.trim() ||
    "";

  return {
    basis: "fallback",
    area: null,
    areaLabel:
      "표시 문구 기준",
    minimum: null,
    maximum: null,
    compareValue: null,
    text:
      manualSalePrice ||
      "분양가 확인 중",
    note:
      manualSalePrice
        ? "숫자형 평형별 가격 미입력"
        : "가격 정보 확인 중",
    structured: false,
  };
}

function parsePricePerPyeongText(
  value: unknown
) {
  const normalized =
    String(value ?? "")
      .replace(/,/g, "");

  const matches =
    normalized.match(/\d+(?:\.\d+)?/g);

  if (!matches?.length) {
    return null;
  }

  const numbers =
    matches
      .map(Number)
      .filter(
        (number) =>
          Number.isFinite(number) &&
          number > 0
      );

  if (numbers.length === 0) {
    return null;
  }

  return Math.max(...numbers);
}

function getPyeongPrice(
  apartment: Apartment
) {
  const structured =
    apartment.priceInfo
      ?.averagePricePerPyeong;

  if (validPrice(structured)) {
    return {
      value: structured,
      text:
        `평당 약 ${Math.round(
          structured
        ).toLocaleString(
          "ko-KR"
        )}만원`,
    };
  }

  const legacyText =
    apartment.priceDetail
      ?.pricePerPyeong?.trim() ||
    "";

  const parsed =
    parsePricePerPyeongText(
      legacyText
    );

  return {
    value: parsed,
    text:
      legacyText ||
      "정보 확인 중",
  };
}

function resolveContractType(
  apartment: Apartment
) {
  const saved =
    apartment.evaluation
      ?.contractType;

  if (
    saved === "fixed-500" ||
    saved === "fixed-1000" ||
    saved === "ratio-5" ||
    saved === "ratio-10"
  ) {
    return saved;
  }

  const text = [
    apartment.priceDetail
      ?.contractPrice,
    apartment.condition,
    apartment.contractDetails,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/,/g, "")
    .replace(/\s+/g, "");

  if (
    text.includes("500만원") ||
    text.includes("500만")
  ) {
    return "fixed-500";
  }

  if (
    text.includes("1000만원") ||
    text.includes("1000만") ||
    text.includes("천만원")
  ) {
    return "fixed-1000";
  }

  if (text.includes("5%")) {
    return "ratio-5";
  }

  if (text.includes("10%")) {
    return "ratio-10";
  }

  return null;
}

function getContractInfo(
  apartment: Apartment,
  smartPrice: SmartPrice
): ContractInfo {
  const contractType =
    resolveContractType(
      apartment
    );

  if (
    contractType ===
    "fixed-500"
  ) {
    return {
      text: "계약금 500만원",
      compareAmount: 500,
      estimated: false,
    };
  }

  if (
    contractType ===
    "fixed-1000"
  ) {
    return {
      text:
        "계약금 1,000만원",
      compareAmount: 1000,
      estimated: false,
    };
  }

  if (
    contractType ===
      "ratio-5" ||
    contractType ===
      "ratio-10"
  ) {
    const ratio =
      contractType ===
      "ratio-5"
        ? 5
        : 10;

    const estimatedAmount =
      validPrice(
        smartPrice.compareValue
      )
        ? Math.round(
            smartPrice.compareValue *
              (ratio / 100)
          )
        : null;

    return {
      text:
        estimatedAmount !== null
          ? `계약금 ${ratio}% · 약 ${formatPrice(
              estimatedAmount
            )}`
          : `계약금 ${ratio}%`,
      compareAmount:
        estimatedAmount,
      estimated:
        estimatedAmount !== null,
    };
  }

  return {
    text:
      textOrFallback(
        apartment.priceDetail
          ?.contractPrice,
        "정보 확인 중"
      ),
    compareAmount: null,
    estimated: false,
  };
}

function getMoveInDate(
  apartment: Apartment
) {
  const value =
    apartment.projectInfo
      ?.moveInDate;

  const normalized =
    String(value ?? "")
      .replace(/[^\d]/g, "");

  if (normalized.length === 6) {
    const year =
      normalized.slice(0, 4);
    const month =
      Number(
        normalized.slice(4, 6)
      );

    if (
      month >= 1 &&
      month <= 12
    ) {
      return `${year}년 ${month}월`;
    }
  }

  return textOrFallback(
    value,
    "정보 확인 중"
  );
}

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

function getTotalHouseholds(
  apartment: Apartment
) {
  if (
    apartment.projectInfo
      ?.totalHouseholds
  ) {
    return apartment.projectInfo
      .totalHouseholds;
  }

  if (
    typeof apartment.totalSupply ===
      "number" &&
    apartment.totalSupply > 0
  ) {
    return `${apartment.totalSupply.toLocaleString()}세대`;
  }

  return "정보 확인 중";
}

function getSaleHouseholds(
  apartment: Apartment
) {
  if (
    apartment.projectInfo
      ?.saleHouseholds
  ) {
    return apartment.projectInfo
      .saleHouseholds;
  }

  if (
    apartment.source ===
      "applyhome" &&
    typeof apartment.totalSupply ===
      "number" &&
    apartment.totalSupply > 0
  ) {
    return `${apartment.totalSupply.toLocaleString()}세대`;
  }

  return "정보 확인 중";
}

function getConditionItems(
  apartment: Apartment
) {
  const options =
    apartment.priceDetail?.options
      ?.map((option) =>
        option.trim()
      )
      .filter(Boolean) ?? [];

  if (options.length > 0) {
    return options;
  }

  if (
    apartment.condition?.trim()
  ) {
    return [
      apartment.condition.trim(),
    ];
  }

  return [];
}

function StatusBadge({
  apartment,
}: {
  apartment: Apartment;
}) {
  const rawStatus =
    apartment.status?.trim() ||
    "정보 확인 중";

  const status =
    apartment.listingStage ===
    "firstCome"
      ? "선착순 분양"
      : apartment.listingStage ===
          "soldOut"
        ? "100% 분양완료"
        : apartment.listingStage ===
            "completed"
          ? "노출 종료"
          : rawStatus;

  const isSoldOut =
    apartment.listingStage ===
      "soldOut" ||
    status.includes("분양완료");

  const isFirstCome =
    apartment.listingStage ===
      "firstCome" ||
    status.includes("선착순");

  const isCompleted =
    apartment.listingStage ===
      "completed" ||
    status.includes("노출 종료") ||
    status.includes("게시 종료");

  const style = isCompleted
    ? "bg-zinc-100 text-zinc-500"
    : isSoldOut
      ? "bg-amber-50 text-amber-800"
      : isFirstCome
        ? "bg-emerald-50 text-emerald-700"
        : "bg-blue-50 text-blue-700";

  return (
    <span
      className={[
        "inline-flex max-w-full rounded-full px-2 py-1",
        "text-[9px] font-extrabold leading-4 sm:px-3 sm:py-1.5 sm:text-xs",
        style,
      ].join(" ")}
    >
      <span className="truncate">
        {status}
      </span>
    </span>
  );
}

function ConditionList({
  apartment,
}: {
  apartment: Apartment;
}) {
  const items =
    getConditionItems(
      apartment
    );

  if (items.length === 0) {
    return (
      <span className="text-zinc-400">
        정보 확인 중
      </span>
    );
  }

  return (
    <ul className="space-y-1.5 sm:space-y-2">
      {items.map(
        (item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex min-w-0 gap-1.5 leading-5 sm:gap-2 sm:leading-6"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:mt-2" />

            <span className="min-w-0 break-words">
              {item}
            </span>
          </li>
        )
      )}
    </ul>
  );
}

function HighlightValue({
  children,
  highlight = false,
  badge,
  note,
}: {
  children: ReactNode;
  highlight?: boolean;
  badge?: string;
  note?: string;
}) {
  return (
    <div
      className={[
        "min-w-0 rounded-xl px-2 py-2 sm:px-3 sm:py-2.5",
        highlight
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
          : "text-zinc-700",
      ].join(" ")}
    >
      <div
        className={[
          "break-words font-black",
          highlight
            ? "text-emerald-700"
            : "text-[#132238]",
        ].join(" ")}
      >
        {children}
      </div>

      {(badge || note) && (
        <div className="mt-1.5 space-y-1">
          {badge && (
            <span className="inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-extrabold text-white sm:text-[10px]">
              {badge}
            </span>
          )}

          {note && (
            <p className="break-keep text-[9px] font-semibold leading-4 text-zinc-400 sm:text-[11px] sm:leading-5">
              {note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CompactSummaryItem({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "min-w-0 rounded-xl px-2 py-2.5 sm:rounded-2xl sm:px-4 sm:py-4",
        highlight
          ? "bg-emerald-50 ring-1 ring-emerald-100"
          : "bg-zinc-50",
      ].join(" ")}
    >
      <p className="text-[9px] font-bold text-zinc-400 sm:text-xs">
        {label}
      </p>

      <p
        className={[
          "mt-1 break-words text-[11px] font-black leading-4 sm:mt-2 sm:text-base sm:leading-6",
          highlight
            ? "text-emerald-700"
            : "text-[#132238]",
        ].join(" ")}
      >
        {value}
      </p>

      {note && (
        <p className="mt-1 break-keep text-[8px] font-semibold leading-3 text-zinc-400 sm:text-[10px] sm:leading-4">
          {note}
        </p>
      )}
    </div>
  );
}

export default function CompareClient({
  apartments,
}: Props) {
  const searchParams =
    useSearchParams();

  const idsFromQuery =
    searchParams
      .get("ids")
      ?.split(",")
      .map((slug) =>
        slug.trim()
      )
      .filter(Boolean) ?? [];

  const legacyIds = [
    searchParams.get("left"),
    searchParams.get("right"),
  ].filter(
    (slug): slug is string =>
      Boolean(slug)
  );

  const selectedSlugs = [
    ...new Set(
      idsFromQuery.length > 0
        ? idsFromQuery
        : legacyIds
    ),
  ].slice(0, 2);

  const selectedApartments =
    selectedSlugs
      .map((slug) =>
        apartments.find(
          (apartment) =>
            apartment.slug === slug
        )
      )
      .filter(
        (
          apartment
        ): apartment is Apartment =>
          Boolean(apartment)
      );

  if (
    selectedApartments.length < 2
  ) {
    return (
      <main className="min-h-screen bg-zinc-50 px-5 py-16 text-zinc-900">
        <section className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-sm font-extrabold tracking-wide text-emerald-600">
            JIBNUN COMPARE
          </p>

          <h1 className="mt-3 text-2xl font-black sm:text-3xl">
            비교할 단지를 선택해주세요
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-500">
            상세페이지의 ‘현재 단지와 비교’
            버튼을 이용해 두 단지를
            선택해주세요.
          </p>

          <Link
            href="/search"
            className="mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            단지 검색하기
          </Link>
        </section>
      </main>
    );
  }

  const priceBySlug =
    new Map(
      selectedApartments.map(
        (apartment) => [
          apartment.slug,
          getSmartPrice(
            apartment
          ),
        ]
      )
    );

  const pyeongBySlug =
    new Map(
      selectedApartments.map(
        (apartment) => [
          apartment.slug,
          getPyeongPrice(
            apartment
          ),
        ]
      )
    );

  const contractBySlug =
    new Map(
      selectedApartments.map(
        (apartment) => {
          const smartPrice =
            priceBySlug.get(
              apartment.slug
            ) ??
            getSmartPrice(
              apartment
            );

          return [
            apartment.slug,
            getContractInfo(
              apartment,
              smartPrice
            ),
          ];
        }
      )
    );

  const firstPrice =
    priceBySlug.get(
      selectedApartments[0].slug
    );

  const secondPrice =
    priceBySlug.get(
      selectedApartments[1].slug
    );

  const similarArea =
    firstPrice?.area !== null &&
    firstPrice?.area !== undefined &&
    secondPrice?.area !== null &&
    secondPrice?.area !== undefined &&
    Math.abs(
      firstPrice.area -
      secondPrice.area
    ) <= 4;

  const comparableTotalPrice =
    Boolean(
      similarArea &&
      firstPrice?.structured &&
      secondPrice?.structured &&
      validPrice(
        firstPrice.compareValue
      ) &&
      validPrice(
        secondPrice.compareValue
      )
    );

  const priceWinnerSlug =
    comparableTotalPrice &&
    firstPrice &&
    secondPrice &&
    firstPrice.compareValue !==
      secondPrice.compareValue
      ? firstPrice.compareValue! <
        secondPrice.compareValue!
        ? selectedApartments[0].slug
        : selectedApartments[1].slug
      : null;

  const firstPyeong =
    pyeongBySlug.get(
      selectedApartments[0].slug
    );

  const secondPyeong =
    pyeongBySlug.get(
      selectedApartments[1].slug
    );

  const pyeongWinnerSlug =
    validPrice(
      firstPyeong?.value
    ) &&
    validPrice(
      secondPyeong?.value
    ) &&
    firstPyeong.value !==
      secondPyeong.value
      ? firstPyeong.value <
        secondPyeong.value
        ? selectedApartments[0].slug
        : selectedApartments[1].slug
      : null;

  const firstContract =
    contractBySlug.get(
      selectedApartments[0].slug
    );

  const secondContract =
    contractBySlug.get(
      selectedApartments[1].slug
    );

  const contractWinnerSlug =
    validPrice(
      firstContract
        ?.compareAmount
    ) &&
    validPrice(
      secondContract
        ?.compareAmount
    ) &&
    firstContract.compareAmount !==
      secondContract.compareAmount
      ? firstContract.compareAmount <
        secondContract.compareAmount
        ? selectedApartments[0].slug
        : selectedApartments[1].slug
      : null;

  const sections: CompareSection[] = [
    {
      id: "price",
      title: "분양가·계약조건",
      description:
        similarArea
          ? "전용 84㎡를 우선으로 비슷한 면적끼리 총분양가를 비교합니다."
          : "면적 차이가 큰 경우 총분양가 우열은 표시하지 않고 평당가를 함께 확인합니다.",
      rows: [
        {
          label: "비교 기준",
          render: (apartment) => {
            const smart =
              priceBySlug.get(
                apartment.slug
              )!;

            return (
              <HighlightValue
                note={
                  smart.note
                }
              >
                {smart.areaLabel}
              </HighlightValue>
            );
          },
        },
        {
          label: "분양가",
          render: (apartment) => {
            const smart =
              priceBySlug.get(
                apartment.slug
              )!;

            const highlight =
              priceWinnerSlug ===
              apartment.slug;

            return (
              <HighlightValue
                highlight={
                  highlight
                }
                badge={
                  highlight
                    ? "더 낮은 분양가"
                    : undefined
                }
                note={
                  !similarArea &&
                  smart.area !== null
                    ? "면적 차이로 총가격 우열 미표시"
                    : smart.structured
                      ? undefined
                      : "기존 표시 문구"
                }
              >
                {smart.text}
              </HighlightValue>
            );
          },
        },
        {
          label: "평당가",
          render: (apartment) => {
            const info =
              pyeongBySlug.get(
                apartment.slug
              )!;

            const highlight =
              pyeongWinnerSlug ===
              apartment.slug;

            return (
              <HighlightValue
                highlight={
                  highlight
                }
                badge={
                  highlight
                    ? "평당가 낮음"
                    : undefined
                }
              >
                {info.text}
              </HighlightValue>
            );
          },
        },
        {
          label: "계약금",
          render: (apartment) => {
            const info =
              contractBySlug.get(
                apartment.slug
              )!;

            const highlight =
              contractWinnerSlug ===
              apartment.slug;

            return (
              <HighlightValue
                highlight={
                  highlight
                }
                badge={
                  highlight
                    ? "초기 부담 낮음"
                    : undefined
                }
                note={
                  info.estimated
                    ? "선택된 비교 분양가 기준 예상액"
                    : undefined
                }
              >
                {info.text}
              </HighlightValue>
            );
          },
        },
        {
          label: "계약조건·혜택",
          render: (apartment) => (
            <ConditionList
              apartment={apartment}
            />
          ),
        },
      ],
    },
    {
      id: "project",
      title: "사업개요",
      description:
        "단지 규모와 주요 입주 정보를 비교합니다.",
      rows: [
        {
          label: "시공사",
          render: (apartment) =>
            textOrFallback(
              apartment.builder
            ),
        },
        {
          label: "총 세대수",
          render:
            getTotalHouseholds,
        },
        {
          label: "일반분양",
          render:
            getSaleHouseholds,
        },
        {
          label: "입주 예정",
          render:
            getMoveInDate,
        },
        {
          label: "주차대수",
          render: (apartment) =>
            textOrFallback(
              apartment.projectInfo
                ?.parking
            ),
        },
      ],
    },
    {
      id: "location",
      title: "입지·생활환경",
      description:
        "교통, 교육, 생활 인프라와 미래가치를 비교합니다.",
      rows: [
        {
          label: "교통",
          render: (apartment) =>
            textOrFallback(
              apartment.locationInfo
                ?.transport
            ),
        },
        {
          label: "교육",
          render: (apartment) =>
            textOrFallback(
              apartment.locationInfo
                ?.education
            ),
        },
        {
          label: "생활",
          render: (apartment) =>
            textOrFallback(
              apartment.locationInfo
                ?.living
            ),
        },
        {
          label: "미래가치",
          render: (apartment) =>
            textOrFallback(
              apartment.locationInfo
                ?.futureValue
            ),
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-2.5 py-6 text-zinc-900 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-[1420px]">
        <Link
          href="/search"
          className="inline-flex cursor-pointer items-center px-1 text-xs font-semibold text-zinc-500 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:text-sm"
        >
          ← 검색으로 돌아가기
        </Link>

        <header className="mx-auto mt-5 max-w-3xl text-center sm:mt-7">
          <p className="text-[11px] font-extrabold tracking-wide text-emerald-600 sm:text-sm">
            JIBNUN COMPARE
          </p>

          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[#132238] sm:mt-2 sm:text-4xl">
            두 단지를 한눈에 비교해보세요
          </h1>

          <p className="mt-2 text-xs leading-5 text-zinc-500 sm:mt-3 sm:text-base sm:leading-7">
            분양가, 계약조건, 사업개요와
            입지환경을 같은 기준으로
            비교할 수 있습니다.
          </p>

          <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left">
            <p className="text-[10px] font-extrabold text-emerald-800 sm:text-xs">
              집눈 가격 비교 기준
            </p>

            <p className="mt-1 break-keep text-[9px] leading-4 text-emerald-800/75 sm:text-xs sm:leading-5">
              전용 84㎡를 우선 사용하고,
              84㎡ 미공급 단지는 80~88㎡ 중
              가장 가까운 평형을 사용합니다.
              면적 차이가 큰 두 단지는 총분양가
              우열 대신 평당가를 중심으로
              비교합니다.
            </p>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-9 sm:gap-5">
          {selectedApartments.map(
            (apartment) => {
              const image =
                getHeroImage(
                  apartment
                );

              const smartPrice =
                priceBySlug.get(
                  apartment.slug
                )!;

              const contract =
                contractBySlug.get(
                  apartment.slug
                )!;

              return (
                <article
                  key={apartment.slug}
                  className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-3xl"
                >
                  <div className="relative h-28 bg-zinc-100 min-[400px]:h-32 sm:h-72">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${apartment.name} 대표 이미지`}
                        fill
                        quality={72}
                        sizes="(max-width: 639px) 50vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold text-zinc-400 sm:text-sm">
                        대표 이미지 준비 중
                      </div>
                    )}

                    <div className="absolute left-2 top-2 sm:left-4 sm:top-4">
                      <StatusBadge
                        apartment={
                          apartment
                        }
                      />
                    </div>

                    <span className="absolute right-2 top-2 max-w-[44%] truncate rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white backdrop-blur sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
                      {textOrFallback(
                        apartment.cityName,
                        apartment.city
                      )}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-6">
                    <h2 className="line-clamp-2 min-h-10 break-keep text-sm font-black leading-5 text-[#132238] sm:min-h-0 sm:text-2xl sm:leading-9">
                      {apartment.name}
                    </h2>

                    <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-zinc-500 sm:mt-2 sm:line-clamp-2 sm:text-sm sm:leading-6">
                      {textOrFallback(
                        apartment.region,
                        "주소 정보 확인 중"
                      )}
                    </p>

                    <div className="mt-2.5 grid gap-1.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                      <CompactSummaryItem
                        label={
                          smartPrice.areaLabel
                        }
                        value={
                          smartPrice.text
                        }
                        note={
                          smartPrice.note
                        }
                        highlight={
                          priceWinnerSlug ===
                          apartment.slug
                        }
                      />

                      <CompactSummaryItem
                        label="계약금"
                        value={
                          contract.text
                        }
                        highlight={
                          contractWinnerSlug ===
                          apartment.slug
                        }
                      />

                      <CompactSummaryItem
                        label="입주 예정"
                        value={getMoveInDate(
                          apartment
                        )}
                      />
                    </div>

                    <div className="mt-3 hidden rounded-2xl bg-zinc-50 px-4 py-4 sm:block">
                      <p className="text-xs font-bold text-zinc-400">
                        핵심 계약조건
                      </p>

                      <div className="mt-2 text-sm font-bold leading-6 text-[#132238]">
                        <ConditionList
                          apartment={
                            apartment
                          }
                        />
                      </div>
                    </div>

                    <Link
                      href={`/apartments/${apartment.slug}`}
                      className="mt-2.5 inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-2 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:mt-4 sm:min-h-12 sm:rounded-xl sm:px-5 sm:text-sm"
                    >
                      <span className="sm:hidden">
                        상세보기
                      </span>

                      <span className="hidden sm:inline">
                        상세정보 보기 →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            }
          )}
        </div>

        <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
          {sections.map(
            (section) => (
              <section
                key={section.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm sm:rounded-3xl"
              >
                <div className="border-b border-zinc-200 px-3 py-3.5 sm:px-6 sm:py-5">
                  <h2 className="text-base font-black text-[#132238] sm:text-xl">
                    {section.title}
                  </h2>

                  <p className="mt-0.5 text-[10px] leading-4 text-zinc-500 sm:mt-1 sm:text-sm sm:leading-6">
                    {
                      section.description
                    }
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-[76px_minmax(0,1fr)_minmax(0,1fr)] border-b border-zinc-200 bg-zinc-50 min-[400px]:grid-cols-[88px_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="border-r border-zinc-200 px-2 py-2.5 text-[10px] font-black text-zinc-700 sm:px-5 sm:py-4 sm:text-sm">
                      항목
                    </div>

                    {selectedApartments.map(
                      (apartment) => (
                        <div
                          key={`${section.id}-header-${apartment.slug}`}
                          className="min-w-0 border-r border-zinc-200 px-2 py-2.5 text-[10px] font-black leading-4 text-[#132238] last:border-r-0 sm:px-5 sm:py-4 sm:text-sm"
                        >
                          <span className="line-clamp-2">
                            {
                              apartment.name
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {section.rows.map(
                    (
                      row,
                      rowIndex
                    ) => (
                      <div
                        key={row.label}
                        className={[
                          "grid grid-cols-[76px_minmax(0,1fr)_minmax(0,1fr)] min-[400px]:grid-cols-[88px_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]",
                          rowIndex > 0
                            ? "border-t border-zinc-100"
                            : "",
                        ].join(" ")}
                      >
                        <div className="border-r border-zinc-200 bg-zinc-50/70 px-2 py-3 text-[10px] font-black leading-4 text-zinc-700 sm:px-5 sm:py-5 sm:text-sm">
                          {row.label}
                        </div>

                        {selectedApartments.map(
                          (
                            apartment
                          ) => (
                            <div
                              key={`${section.id}-${row.label}-${apartment.slug}`}
                              className="min-w-0 break-words border-r border-zinc-100 px-1 py-1.5 text-[10px] font-semibold leading-5 text-zinc-700 last:border-r-0 sm:px-2 sm:py-2 sm:text-sm sm:leading-7"
                            >
                              {row.render(
                                apartment
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>

        <p className="mt-5 px-3 text-center text-[10px] leading-5 text-zinc-400 sm:mt-7 sm:text-xs sm:leading-6">
          분양가와 계약조건은 사업주체 및
          관계 기관의 사정에 따라 변경될 수
          있습니다. 계약금 비율의 예상 금액은
          비교 기준 분양가를 단순 적용한
          참고값입니다.
        </p>
      </section>
    </main>
  );
}
