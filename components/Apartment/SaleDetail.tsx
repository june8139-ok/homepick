import type {
  Apartment,
  LocationInfo,
} from "../../types/apartment";

import PriceConditionCard from "./PriceConditionCard";
import ConditionHistory from "./ConditionHistory";
import ApartmentImageSections from "./ApartmentImageSections";
import ReservationCard from "./ReservationCard";

type ConditionHistoryData = {
  apartmentSlug: string;

  items?: {
    date: string;
    title: string;
    description: string;
  }[];
};

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
    icon: "bg-emerald-100 text-emerald-700",
    border: "hover:border-emerald-300",
    title: "text-emerald-700",
    check: "text-emerald-600",
  },

  blue: {
    icon: "bg-blue-100 text-blue-700",
    border: "hover:border-blue-300",
    title: "text-blue-700",
    check: "text-blue-600",
  },

  amber: {
    icon: "bg-amber-100 text-amber-700",
    border: "hover:border-amber-300",
    title: "text-amber-700",
    check: "text-amber-600",
  },

  rose: {
    icon: "bg-rose-100 text-rose-700",
    border: "hover:border-rose-300",
    title: "text-rose-700",
    check: "text-rose-600",
  },

  violet: {
    icon: "bg-violet-100 text-violet-700",
    border: "hover:border-violet-300",
    title: "text-violet-700",
    check: "text-violet-600",
  },

  zinc: {
    icon: "bg-zinc-100 text-zinc-700",
    border: "hover:border-zinc-400",
    title: "text-zinc-800",
    check: "text-zinc-500",
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

  const info = {
    transport:
      apartment.locationInfo
        ?.transport?.trim() ||
      fallback.transport,

    education:
      apartment.locationInfo
        ?.education?.trim() ||
      fallback.education,

    living:
      apartment.locationInfo
        ?.living?.trim() ||
      fallback.living,

    jobAccess:
      apartment.locationInfo
        ?.jobAccess?.trim() ||
      fallback.jobAccess,

    nature:
      apartment.locationInfo
        ?.nature?.trim() ||
      fallback.nature,

    futureValue:
      apartment.locationInfo
        ?.futureValue?.trim() ||
      fallback.futureValue,

    cautions:
      apartment.locationInfo
        ?.cautions?.trim() ||
      fallback.cautions,
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
        "min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5",
        "transition-all duration-200",
        "sm:rounded-2xl sm:p-5",
        "sm:hover:-translate-y-0.5",
        "sm:hover:border-emerald-300",
        "sm:hover:bg-emerald-50/40",
        "sm:hover:shadow-md",
        wide
          ? "col-span-2 lg:col-span-3"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-sm sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-bold leading-4 text-zinc-500 sm:text-xs">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-extrabold leading-5 text-[#132238] sm:mt-2 sm:text-sm sm:leading-6">
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

  return (
    <article
      className={[
        "min-w-0 rounded-xl border border-zinc-200 bg-white p-3",
        "transition-all duration-200",
        "hover:-translate-y-0.5",
        "hover:shadow-md",
        "sm:rounded-2xl sm:p-5",
        style.border,
        item.wide
          ? "col-span-2 xl:col-span-3"
          : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <span
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base",
            "sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl",
            style.icon,
          ].join(" ")}
        >
          {item.icon}
        </span>

        <h3
          className={[
            "min-w-0 break-keep text-sm font-extrabold sm:text-lg",
            style.title,
          ].join(" ")}
        >
          {item.title}
        </h3>
      </div>

      <div
        className={[
          "mt-3 grid gap-x-4 gap-y-1.5",
          "sm:mt-4 sm:gap-x-6 sm:gap-y-2",
          item.wide &&
          lines.length >= 3
            ? "sm:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-1",
        ].join(" ")}
      >
        {lines.map(
          (line, index) => (
            <div
              key={`${line}-${index}`}
              className="
                flex min-w-0
                items-start gap-1.5
                text-[10px] leading-4
                text-zinc-600
                sm:gap-2 sm:text-sm
                sm:leading-6
              "
            >
              <span
                className={[
                  "mt-0.5 shrink-0 font-extrabold",
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
    </article>
  );
}

export default function SaleDetail({
  apartment,
  conditionHistory,
}: {
  apartment: Apartment;
  conditionHistory?: ConditionHistoryData;
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

  return (
    <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-8">
      <section>
        <SectionHeader
          eyebrow="PRICE & CONTRACT"
          title="가격 및 계약조건"
          description="분양가와 계약금, 중도금, 잔금 및 제공 혜택을 확인하세요."
          accent="emerald"
        />

        <div className="mt-3 sm:mt-5">
          <PriceConditionCard
            apartment={
              apartment as any
            }
          />
        </div>
      </section>

      {conditionHistory && (
        <section>
          <SectionHeader
            eyebrow="CONDITION HISTORY"
            title="계약조건 변경 이력"
            description="계약조건이 언제 어떻게 변경됐는지 확인할 수 있습니다."
            accent="amber"
          />

          <div className="mt-3 sm:mt-5">
            <ConditionHistory
              conditionHistory={
                conditionHistory as any
              }
            />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <SectionHeader
          eyebrow="PROJECT OVERVIEW"
          title="사업개요"
          description="단지 규모와 공급 세대수, 주차 및 입주 정보를 한눈에 정리했습니다."
          accent="zinc"
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:grid-cols-3">
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
            label="입주 예정"
            value={
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

      <ApartmentImageSections
        images={
          apartment.images
        }
        apartmentName={
          apartment.name
        }
      />

      {informationCards.length >
        0 && (
        <section className="rounded-2xl border border-zinc-200 bg-[#F8FAF7] p-4 shadow-sm sm:rounded-3xl sm:p-7">
          <SectionHeader
            eyebrow="LOCATION & LIVING"
            title="입지·생활정보"
            description="교통, 교육, 생활환경과 개발계획을 항목별로 확인해보세요."
            accent="blue"
          />

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4 xl:grid-cols-3">
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
                공급계약서와 실제
                잔여 호실, 적용
                계약조건을 다시
                확인해주세요.
              </p>
            </div>
          </div>
        </div>
      </section>

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
