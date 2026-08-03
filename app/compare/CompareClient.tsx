"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import type { Apartment } from "../../types/apartment";

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
  const eok = Math.floor(
    amount / 10000
  );
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

function getStructuredSalePrice(
  apartment: Apartment
) {
  const units =
    apartment.priceInfo?.units ??
    [];

  const minimums =
    units
      .flatMap((unit) => [
        unit.minPrice,
        ...(unit.types ?? []).map(
          (type) =>
            type.minPrice
        ),
      ])
      .filter(validPrice);

  if (minimums.length > 0) {
    return `최저 ${formatPrice(
      Math.min(...minimums)
    )}부터`;
  }

  const maximums =
    units
      .flatMap((unit) => [
        unit.maxPrice,
        ...(unit.types ?? []).map(
          (type) =>
            type.maxPrice
        ),
      ])
      .filter(validPrice);

  if (maximums.length > 0) {
    return `최고 ${formatPrice(
      Math.max(...maximums)
    )}`;
  }

  return "";
}

function formatMoveInDate(
  value: unknown
) {
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
  const hero = apartment.images?.hero;

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

function getSalePrice(
  apartment: Apartment
) {
  const manualSalePrice =
    apartment.priceDetail
      ?.salePrice?.trim();

  if (manualSalePrice) {
    return manualSalePrice;
  }

  const legacyManualPrice =
    apartment.price?.trim();

  if (legacyManualPrice) {
    return legacyManualPrice;
  }

  return (
    getStructuredSalePrice(
      apartment
    ) ||
    "분양가 확인 중"
  );
}

function getContractPrice(
  apartment: Apartment
) {
  return textOrFallback(
    apartment.priceDetail?.contractPrice,
    "정보 확인 중"
  );
}

function getMoveInDate(
  apartment: Apartment
) {
  return formatMoveInDate(
    apartment.projectInfo
      ?.moveInDate
  );
}

function getTotalHouseholds(
  apartment: Apartment
) {
  if (
    apartment.projectInfo?.totalHouseholds
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
    apartment.projectInfo?.saleHouseholds
  ) {
    return apartment.projectInfo
      .saleHouseholds;
  }

  if (
    apartment.source === "applyhome" &&
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
      ?.map((option) => option.trim())
      .filter(Boolean) ?? [];

  if (options.length > 0) {
    return options;
  }

  if (apartment.condition?.trim()) {
    return [apartment.condition.trim()];
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
          "completed"
        ? "노출 종료"
        : rawStatus;

  const isFirstCome =
    apartment.listingStage ===
      "firstCome" ||
    status.includes("선착순");

  const isCompleted =
    apartment.listingStage ===
      "completed" ||
    status.includes("마감") ||
    status.includes("종료");

  const style = isCompleted
    ? "bg-zinc-100 text-zinc-500"
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
    getConditionItems(apartment);

  if (items.length === 0) {
    return (
      <span className="text-zinc-400">
        정보 확인 중
      </span>
    );
  }

  return (
    <ul className="space-y-1.5 sm:space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex min-w-0 gap-1.5 leading-5 sm:gap-2 sm:leading-6"
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:mt-2" />

          <span className="min-w-0 break-words">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CompactSummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-zinc-50 px-2 py-2.5 sm:rounded-2xl sm:px-4 sm:py-4">
      <p className="text-[9px] font-bold text-zinc-400 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 break-words text-[11px] font-black leading-4 text-[#132238] sm:mt-2 sm:text-base sm:leading-6">
        {value}
      </p>
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
      .map((slug) => slug.trim())
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

  const sections: CompareSection[] = [
    {
      id: "price",
      title: "분양가·계약조건",
      description:
        "초기 필요자금과 핵심 계약조건을 비교합니다.",
      rows: [
        {
          label: "분양가",
          render: getSalePrice,
        },
        {
          label: "평당가",
          render: (apartment) =>
            textOrFallback(
              apartment.priceDetail
                ?.pricePerPyeong
            ),
        },
        {
          label: "계약금",
          render: getContractPrice,
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
          render: getTotalHouseholds,
        },
        {
          label: "일반분양",
          render: getSaleHouseholds,
        },
        {
          label: "입주 예정",
          render: getMoveInDate,
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
        </header>

        {/* 모바일에서도 두 카드를 나란히 표시 */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-9 sm:gap-5">
          {selectedApartments.map(
            (apartment) => {
              const image =
                getHeroImage(
                  apartment
                );

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

                    {/* 모바일에서는 세로, 태블릿 이상에서는 3칸 */}
                    <div className="mt-2.5 grid gap-1.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                      <CompactSummaryItem
                        label="분양가"
                        value={getSalePrice(
                          apartment
                        )}
                      />

                      <CompactSummaryItem
                        label="계약금"
                        value={getContractPrice(
                          apartment
                        )}
                      />

                      <CompactSummaryItem
                        label="입주 예정"
                        value={getMoveInDate(
                          apartment
                        )}
                      />
                    </div>

                    {/* 긴 계약조건은 모바일 카드에서는 숨김 */}
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
          {sections.map((section) => (
            <section
              key={section.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm sm:rounded-3xl"
            >
              <div className="border-b border-zinc-200 px-3 py-3.5 sm:px-6 sm:py-5">
                <h2 className="text-base font-black text-[#132238] sm:text-xl">
                  {section.title}
                </h2>

                <p className="mt-0.5 text-[10px] leading-4 text-zinc-500 sm:mt-1 sm:text-sm sm:leading-6">
                  {section.description}
                </p>
              </div>

              {/* 모바일에서도 항목 + 단지 2개를 동시에 표시 */}
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
                          {apartment.name}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {section.rows.map(
                  (row, rowIndex) => (
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
                        (apartment) => (
                          <div
                            key={`${section.id}-${row.label}-${apartment.slug}`}
                            className="min-w-0 break-words border-r border-zinc-100 px-2 py-3 text-[10px] font-semibold leading-5 text-zinc-700 last:border-r-0 sm:px-5 sm:py-5 sm:text-sm sm:leading-7"
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
          ))}
        </div>

        <p className="mt-5 px-3 text-center text-[10px] leading-5 text-zinc-400 sm:mt-7 sm:text-xs sm:leading-6">
          분양가와 계약조건은 사업주체 및
          관계 기관의 사정에 따라 변경될 수
          있습니다.
        </p>
      </section>
    </main>
  );
}
