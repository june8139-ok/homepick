import type {
  ComponentProps,
} from "react";

import type {
  Apartment,
  ApartmentConditionHistoryItem,
  LocationInfo,
} from "../../types/apartment";

import PriceConditionCard from "./PriceConditionCard";
import ConditionHistory from "./ConditionHistory";
import ApartmentImageSections from "./ApartmentImageSections";
import ReservationCard from "./ReservationCard";

import {
  getMoveInText,
} from "../../lib/apartmentDisplay";

type InformationCardItem = {
  icon: string;
  title: string;
  description: string;
  accent:
    | "emerald"
    | "blue"
    | "amber"
    | "rose"
    | "violet"
    | "zinc";
  wide?: boolean;
};

const CARD_ACCENT_CLASS = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
    title: "text-[#132238]",
    check: "text-emerald-600",
  },

  blue: {
    icon: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
    title: "text-[#132238]",
    check: "text-emerald-600",
  },

  amber: {
    icon: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
    title: "text-[#132238]",
    check: "text-emerald-600",
  },

  rose: {
    icon: "bg-rose-50 text-rose-700",
    border: "hover:border-rose-300",
    title: "text-rose-700",
    check: "text-rose-600",
  },

  violet: {
    icon: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
    title: "text-[#132238]",
    check: "text-emerald-600",
  },

  zinc: {
    icon: "bg-emerald-50 text-emerald-700",
    border: "hover:border-emerald-300",
    title: "text-[#132238]",
    check: "text-emerald-600",
  },
} as const;



function joinMatchingTexts(
  items: string[],
  keywords: string[],
  limit = 2
) {
  return items
    .filter((item) =>
      keywords.some((keyword) =>
        item
          .toLowerCase()
          .includes(
            keyword.toLowerCase()
          )
      )
    )
    .slice(0, limit)
    .join("\n");
}

function getFallbackLocationInfo(
  apartment: Apartment
): Required<LocationInfo> {
  const pros =
    apartment.pros ?? [];

  const cons =
    apartment.cons ?? [];

  return {
    transport:
      joinMatchingTexts(pros, [
        "교통",
        "역",
        "철도",
        "지하철",
        "ic",
        "고속도로",
        "도로",
        "순환로",
        "버스",
      ]),

    education:
      joinMatchingTexts(pros, [
        "교육",
        "학교",
        "학군",
        "초등",
        "중학교",
        "고등",
        "학원",
      ]),

    living:
      joinMatchingTexts(pros, [
        "마트",
        "백화점",
        "병원",
        "상권",
        "생활",
        "편의",
        "커뮤니티",
      ]),

    jobAccess:
      joinMatchingTexts(pros, [
        "직주",
        "산업",
        "기업",
        "업무",
        "출퇴근",
        "하이닉스",
        "삼성",
      ]),

    nature:
      joinMatchingTexts(pros, [
        "공원",
        "호수",
        "산책",
        "녹지",
        "자연",
        "하천",
      ]),

    futureValue:
      joinMatchingTexts(pros, [
        "개발",
        "호재",
        "예정",
        "미래",
        "도시개발",
        "산업단지",
        "역세권",
        "광역",
      ]),

    cautions:
      cons
        .slice(0, 2)
        .join("\n"),
  };
}

function getInformationCards(
  apartment: Apartment
): InformationCardItem[] {
  const fallback =
    getFallbackLocationInfo(
      apartment
    );

  const locationInfo =
    apartment.locationInfo;

  const hasManualLocationInfo =
    Object.values(
      locationInfo ?? {}
    ).some((value) =>
      Boolean(
        typeof value === "string" &&
        value.trim()
      )
    );

  const info = {
    transport:
      hasManualLocationInfo
        ? locationInfo?.transport?.trim() ??
          ""
        : fallback.transport,

    education:
      hasManualLocationInfo
        ? locationInfo?.education?.trim() ??
          ""
        : fallback.education,

    living:
      hasManualLocationInfo
        ? locationInfo?.living?.trim() ??
          ""
        : fallback.living,

    jobAccess:
      hasManualLocationInfo
        ? locationInfo?.jobAccess?.trim() ??
          ""
        : fallback.jobAccess,

    nature:
      hasManualLocationInfo
        ? locationInfo?.nature?.trim() ??
          ""
        : fallback.nature,

    futureValue:
      hasManualLocationInfo
        ? locationInfo?.futureValue?.trim() ??
          ""
        : fallback.futureValue,

    cautions:
      hasManualLocationInfo
        ? locationInfo?.cautions?.trim() ??
          ""
        : fallback.cautions,
  };

  const cards: InformationCardItem[] =
    [
      {
        icon: "🚉",
        title: "교통",
        description:
          info.transport,
        accent: "blue",
      },
      {
        icon: "🏫",
        title: "교육",
        description:
          info.education,
        accent: "emerald",
      },
      {
        icon: "🛒",
        title: "생활환경",
        description:
          info.living,
        accent: "amber",
      },
      {
        icon: "🏢",
        title: "직주근접",
        description:
          info.jobAccess,
        accent: "violet",
      },
      {
        icon: "🌳",
        title: "자연환경",
        description:
          info.nature,
        accent: "emerald",
      },
      {
        icon: "📈",
        title: "미래가치",
        description:
          info.futureValue,
        accent: "blue",
      },
      {
        icon: "⚠️",
        title: "체크할 점",
        description:
          info.cautions,
        accent: "rose",
        wide: true,
      },
    ];

  return cards.filter(
    (item) =>
      item.description
        .trim()
        .length > 0
  );
}

function getJibnunSummary(
  apartment: Apartment
) {
  if (apartment.jibnunSummary?.trim()) {
    return apartment.jibnunSummary.trim();
  }

  if (
    apartment.aiReview
      .summary?.trim()
  ) {
    return apartment.aiReview
      .summary;
  }

  const locationInfo =
    apartment.locationInfo;

  const candidates = [
    apartment.condition,
    locationInfo?.transport,
    locationInfo?.education,
    locationInfo?.living,
    locationInfo?.futureValue,
  ].filter(
    (
      value
    ): value is string =>
      Boolean(value?.trim())
  );

  if (
    candidates.length === 0
  ) {
    return "분양가와 계약조건, 입지 및 생활환경을 함께 비교해볼 수 있는 단지입니다.";
  }

  return candidates
    .slice(0, 2)
    .join(" ");
}

function splitInformationLines(
  description: string
) {
  return description
    .split(/\n|·|•/)
    .map((line) =>
      line
        .replace(
          /^[✔✓\-\s]+/,
          ""
        )
        .trim()
    )
    .filter(Boolean);
}

function ProjectGlyph({
  label,
}: {
  label: string;
}) {
  const common =
    "h-5 w-5 stroke-current sm:h-6 sm:w-6";

  if (label.includes("주소")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.2" strokeWidth="1.8" />
      </svg>
    );
  }

  if (label.includes("세대")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M4 20V8l8-4 8 4v12M8 20v-7h8v7M8 9h.01M12 9h.01M16 9h.01" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (label.includes("평형") || label.includes("타입")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.8" />
        <path d="M12 4v16M4 12h16" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (label.includes("주차")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="3" strokeWidth="1.8" />
        <path d="M9 17V7h4.2a3.2 3.2 0 0 1 0 6.4H9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (label.includes("입주")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3M8 17h3" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (label.includes("시공") || label.includes("사업주체")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M5 20V7h6v13M11 11h8v9M8 10h.01M8 13h.01M8 16h.01M15 14h.01M15 17h.01" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
      <path d="m4 11 8-7 8 7v9H4v-9Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryGlyph({
  title,
}: {
  title: string;
}) {
  const common =
    "h-5 w-5 stroke-current sm:h-6 sm:w-6";

  if (title === "교통") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <rect x="5" y="3" width="14" height="15" rx="4" strokeWidth="1.8" />
        <path d="M8 8h8M8 13h8M8 21l2-3M16 18l2 3" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (title === "교육") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="m3 9 9-5 9 5-9 5-9-5Z" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 12v4.5c2.8 2 7.2 2 10 0V12M21 9v6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title === "생활환경") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M6 8h12l-1 12H7L6 8Z" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 9V7a3 3 0 0 1 6 0v2" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (title === "자연환경") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M12 21v-8M12 13c-5 0-7-3.2-7-7 4.5 0 7 2.4 7 7ZM12 13c5 0 7-3.2 7-7-4.5 0-7 2.4-7 7Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title === "직주근접") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M4 20V8h7v12M11 12h9v8M7 11h.01M7 14h.01M7 17h.01M15 15h.01M15 18h.01" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
      <path d="M4 18 9 13l3 3 7-8M15 8h4v4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getInformationVisual(
  title: string
) {
  const visualMap: Record<string, string> = {
    교통: "/images/jibnun/location/transport.svg",
    교육: "/images/jibnun/location/education.svg",
    생활환경: "/images/jibnun/location/living.svg",
    자연환경: "/images/jibnun/location/nature.svg",
    직주근접: "/images/jibnun/location/work.svg",
    미래가치: "/images/jibnun/location/future.svg",
  };

  return visualMap[title] ?? "";
}

function ProjectInfoCard({
  icon,
  label,
  value,
  wide = false,
}: {
  icon: string;
  label: string;
  value?: string;
  wide?: boolean;
}) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <article
      className={[
        "group min-w-0 bg-white px-4 py-4 sm:px-5 sm:py-5",
        "transition-colors duration-200 hover:bg-emerald-50/35",
        wide
          ? "col-span-2 lg:col-span-3"
          : "",
      ].join(" ")}
    >
      <span className="sr-only" aria-hidden="true">
        {icon}
      </span>

      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 sm:h-11 sm:w-11">
          <ProjectGlyph label={label} />
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-tight text-zinc-400 sm:text-xs">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-black leading-5 text-[#132238] sm:text-[15px] sm:leading-6">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function InformationCard({
  item,
}: {
  item: InformationCardItem;
}) {
  const style =
    CARD_ACCENT_CLASS[
      item.accent
    ];

  const lines =
    splitInformationLines(
      item.description
    );

  if (item.wide) {
    return (
      <article className="col-span-full overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:rounded-3xl">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current" aria-hidden="true">
                <path d="M12 4 3.8 19h16.4L12 4Z" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M12 9v4M12 16h.01" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>

            <div>
              <p className="text-[10px] font-black tracking-[0.16em] text-rose-500">
                CHECK POINT
              </p>
              <h3 className="mt-0.5 text-base font-black text-[#132238]">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map(
              (line, index) => (
                <div
                  key={`${line}-${index}`}
                  className="flex min-w-0 items-start gap-2 border-l-2 border-rose-100 pl-3 text-xs leading-5 text-zinc-600 sm:text-sm sm:leading-6"
                >
                  <span className="mt-0.5 shrink-0 font-black text-rose-500">
                    ✓
                  </span>
                  <span className="break-keep">
                    {line}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </article>
    );
  }

  const visual =
    getInformationVisual(
      item.title
    );

  return (
    <article
      className={[
        "group flex min-w-0 h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "sm:rounded-3xl",
        style.border,
      ].join(" ")}
    >
      <div className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="flex items-center gap-3">
          <span className="sr-only" aria-hidden="true">
            {item.icon}
          </span>

          <span
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-emerald-100",
              style.icon,
            ].join(" ")}
          >
            <CategoryGlyph
              title={item.title}
            />
          </span>

          <div className="min-w-0">
            <h3
              className={[
                "break-keep text-base font-black sm:text-lg",
                style.title,
              ].join(" ")}
            >
              {item.title}
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {lines.map(
            (line, index) => (
              <div
                key={`${line}-${index}`}
                className="flex min-w-0 items-start gap-2 text-xs leading-5 text-zinc-600 sm:text-sm sm:leading-6"
              >
                <span
                  className={[
                    "mt-0.5 shrink-0 font-black",
                    style.check,
                  ].join(" ")}
                >
                  ✓
                </span>

                <span className="min-w-0 break-keep">
                  {line}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {visual && (
        <div
          aria-hidden="true"
          className="mt-auto h-[76px] w-full shrink-0 border-t border-zinc-100 bg-cover bg-center sm:h-[92px] lg:h-[96px]"
          style={{
            backgroundImage:
              `url("${visual}")`,
          }}
        />
      )}
    </article>
  );
}



export default function SaleDetail({
  apartment,
  conditionHistory,
}: {
  apartment: Apartment;
  conditionHistory?: ApartmentConditionHistoryItem[];
}) {
  const informationCards =
    getInformationCards(
      apartment
    );

  const summary =
    getJibnunSummary(
      apartment
    );

  const floorPlans =
    apartment.images
      ?.floorPlans ?? [];

  const floorPlanNames =
    floorPlans
      .map(
        (item) =>
          item.name?.trim()
      )
      .filter(
        (
          name
        ): name is string =>
          Boolean(name)
      );

  const floorPlanText =
    floorPlanNames.length > 0
      ? floorPlanNames.join(", ")
      : undefined;

  const moveInText =
    getMoveInText(
      apartment
    );

  const isSoldOut =
    apartment.listingStage ===
    "soldOut";

  return (
    <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-8">
      {isSoldOut && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <p className="text-xs font-extrabold text-amber-700 sm:text-sm">
            100% 분양완료
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#132238] sm:text-2xl">
            분양이 완료된 단지입니다
          </h2>

          <p className="mt-2 break-keep text-xs leading-6 text-amber-950/80 sm:text-sm sm:leading-7">
            현재 신규 계약 및 방문예약은 진행하지 않습니다. 아래 분양가·계약조건·평면·입지 정보는 분양 당시 기준의 참고자료로 확인해주세요.
          </p>
        </section>
      )}

      <section
        id="price"
        className="scroll-mt-24"
      >
        <SectionHeader
          eyebrow="PRICE & CONTRACT"
          title="가격 및 계약조건"
          description={
            isSoldOut
              ? "분양 당시 분양가와 계약조건을 참고용으로 확인하세요."
              : "분양가와 계약금, 중도금, 잔금 및 제공 혜택을 확인하세요."
          }
          accent="emerald"
        />

        <div className="mt-3 sm:mt-5">
          <PriceConditionCard
            apartment={
              apartment as ComponentProps<
                typeof PriceConditionCard
              >["apartment"]
            }
          />

          {apartment.source === "applyhome" && (
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2.5 text-[10px] leading-5 text-blue-800 sm:text-xs sm:leading-6">
              {isSoldOut
                ? "청약홈 공개자료를 기준으로 보관한 정보입니다. 타입별 최고 공급금액 중심으로 제공될 수 있으며 실제 분양 당시 동·호수별 금액과 차이가 있을 수 있습니다."
                : "청약홈 공개자료는 타입별 최고 공급금액을 중심으로 제공될 수 있습니다. 실제 계약 가능한 동·호수별 공급금액은 최신 안내를 확인해주세요."}
            </p>
          )}

          {apartment.contractDetails?.trim() && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-amber-300 bg-white shadow-sm sm:mt-5 sm:rounded-3xl">
              <div className="flex items-center gap-3 border-b border-amber-100 bg-[linear-gradient(90deg,#fff8e7_0%,#ffffff_100%)] px-4 py-3.5 sm:px-5 sm:py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 stroke-current"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3v18M7 7.5C7 5.6 8.7 4.5 12 4.5s5 1.1 5 3-1.7 3-5 3-5 1.1-5 3 1.7 3 5 3 5 1.1 5 3"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-amber-600 sm:text-xs">
                    CONTRACT BENEFITS
                  </p>

                  <h3 className="mt-0.5 text-base font-black text-[#132238] sm:text-lg">
                    계약조건·혜택 상세
                  </h3>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-5 sm:py-5">
                <div className="space-y-2.5">
                  {apartment.contractDetails
                    .split(/\n|•|·/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, index) => (
                      <div
                        key={`${line}-${index}`}
                        className="flex items-start gap-2.5 rounded-xl bg-amber-50/60 px-3 py-2.5 text-xs font-bold leading-6 text-[#3B2A0B] sm:px-4 sm:py-3 sm:text-sm sm:leading-7"
                      >
                        <span className="mt-0.5 shrink-0 text-amber-600">
                          ✓
                        </span>
                        <span className="break-keep">
                          {line}
                        </span>
                      </div>
                    ))}
                </div>

                <p className="mt-3 text-[10px] leading-5 text-zinc-400 sm:text-xs sm:leading-6">
                  적용 세대와 시점에 따라 조건이 달라질 수 있으므로 계약 전 최신 조건을 다시 확인해주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {conditionHistory &&
        conditionHistory.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="CONDITION HISTORY"
            title="계약조건 변경 이력"
            description="계약조건이 언제 어떻게 변경됐는지 확인할 수 있습니다."
            accent="amber"
          />

          <div className="mt-3 sm:mt-5">
            <ConditionHistory
              items={
                conditionHistory
              }
            />
          </div>
        </section>
      )}

      <section
        id="overview"
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-7"
      >
        <SectionHeader
          eyebrow="PROJECT OVERVIEW"
          title="사업개요"
          description="단지 규모와 공급 세대수, 주차 및 입주 정보를 한눈에 정리했습니다."
          accent="emerald"
        />

        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:mt-6 lg:grid-cols-3 [&>*]:border-b [&>*]:border-zinc-100 [&>*:not(:nth-child(2n))]:border-r lg:[&>*:not(:nth-child(2n))]:border-r-0 lg:[&>*:not(:nth-child(3n))]:border-r">
          <ProjectInfoCard
            icon="📍"
            label="사업지 주소"
            value={
              apartment.region
            }
            wide
          />

          <ProjectInfoCard
            icon="🏘️"
            label="총 세대수"
            value={
              apartment
                .projectInfo
                ?.totalHouseholds
            }
          />

          <ProjectInfoCard
            icon="🔑"
            label="일반분양 세대수"
            value={
              apartment
                .projectInfo
                ?.saleHouseholds
            }
          />

          <ProjectInfoCard
            icon="📐"
            label="평형·타입"
            value={
              floorPlanText
            }
          />

          <ProjectInfoCard
            icon="🚗"
            label="주차대수"
            value={
              apartment
                .projectInfo
                ?.parking
            }
          />

          <ProjectInfoCard
            icon="🏗️"
            label="사업 규모"
            value={
              apartment
                .projectInfo
                ?.scale
            }
          />

          <ProjectInfoCard
            icon="🏠"
            label="용도"
            value={
              apartment
                .projectInfo
                ?.usage ||
              apartment.type
            }
          />

          <ProjectInfoCard
            icon="📅"
            label={
              moveInText.includes(
                "입주 완료"
              )
                ? "입주 완료"
                : "입주 예정"
            }
            value={
              moveInText
                .replace(
                  /\s입주\s(?:예정|완료)$/,
                  ""
                ) ||
              apartment
                .projectInfo
                ?.moveInDate
            }
          />

          <ProjectInfoCard
            icon="🏢"
            label="시공사"
            value={
              apartment.builder
            }
          />

          <ProjectInfoCard
            icon="📋"
            label="사업주체"
            value={
              apartment
                .projectInfo
                ?.developer
            }
          />
        </div>
      </section>

      <section
        id="images"
        className="scroll-mt-24"
      >
        <ApartmentImageSections
          images={
            apartment.images
          }
          apartmentName={
            apartment.name
          }
        />
      </section>

      {informationCards.length >
        0 && (
        <section
          id="location"
          className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,#f9fcfb_0%,#ffffff_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-7"
        >
          <SectionHeader
            eyebrow="LOCATION & LIVING"
            title="입지·생활정보"
            description="교통, 교육, 생활환경과 개발계획을 항목별로 확인해보세요."
            accent="blue"
          />

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 lg:grid-cols-4">
            {informationCards.map(
              (item) => (
                <InformationCard
                  key={
                    item.title
                  }
                  item={item}
                />
              )
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
              집눈 한눈 정리
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#132238] sm:text-2xl">
              집눈 한눈 정리
            </h2>

            <p className="mt-2 break-keep text-sm font-semibold leading-6 text-zinc-700 sm:mt-4 sm:text-base sm:leading-8">
              {summary}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-3 sm:rounded-2xl sm:px-5 sm:py-4 lg:max-w-xs">
            <span
              aria-hidden="true"
              className="shrink-0 text-sm font-black text-emerald-700"
            >
              ✓
            </span>

            <div>
              <p className="text-[10px] font-bold text-emerald-700 sm:text-xs">
                계약 전 확인
              </p>

              <p className="mt-1 text-[10px] leading-5 text-emerald-900/70 sm:text-xs sm:leading-6">
                {isSoldOut
                  ? "분양 당시 기준 정보이므로 현재 시점의 거래 조건과 다를 수 있습니다."
                  : "공급계약서와 실제 잔여 호실, 적용 계약조건을 다시 확인해주세요."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!isSoldOut && (
        <section
          id="inquiry"
          className="scroll-mt-24"
        >
          <ReservationCard
            apartmentSlug={
              apartment.slug
            }
            apartmentName={
              apartment.name
            }
            mode="sale"
            kakaoUrl="https://pf.kakao.com/_RxfsxnX/chat"
            floorPlanNames={
              floorPlanNames
            }
          />
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent:
    | "emerald"
    | "blue"
    | "amber"
    | "zinc";
}) {
  const accentClass = {
    emerald:
      "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    zinc: "text-zinc-500",
  }[accent];

  return (
    <header>
      <p
        className={[
          "text-xs font-extrabold sm:text-sm",
          accentClass,
        ].join(" ")}
      >
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#132238] sm:text-2xl">
        {title}
      </h2>

      <p className="mt-1 break-keep text-xs leading-5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">
        {description}
      </p>
    </header>
  );
}