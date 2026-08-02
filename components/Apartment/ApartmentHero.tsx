import Image from "next/image";

import type {
  Apartment,
} from "../../types/apartment";

import {
  getMoveInText,
  getRepresentativePrice,
} from "../../lib/apartmentDisplay";

import FavoriteButton from "./FavoriteButton";
import ApartmentDataTrust from "./ApartmentDataTrust";

type ListingStage =
  | "subscription"
  | "firstCome"
  | "completed"
  | "existing";

type SubscriptionScheduleLike = {
  announcementDate?: string | null;
  winnerDate?: string | null;
};

type ProjectInfoLike = {
  totalHouseholds?: string;
  saleHouseholds?: string;
  parking?: string;
  moveInDate?: string;
};

type ApartmentLike = {
  slug: string;
  name: string;

  region?: string;
  status?: string;
  price?: string;
  condition?: string;

  listingStage?: ListingStage;

  source?:
    | "manual"
    | "applyhome";

  isAutoCreated?: boolean;
  manualOverride?: boolean;
  syncStatus?: string;
  lastSyncedAt?: string | null;

  priceInfo?: {
    updatedAt?: string | null;
  };

  totalSupply?:
    | number
    | null;

  subscription?:
    SubscriptionScheduleLike;

  projectInfo?:
    ProjectInfoLike;

  images?: {
    hero?:
      | string
      | null;

    location?: string[];

    floorPlans?: {
      name: string;
      url: string;
    }[];

    community?: string[];
    gallery?: string[];
  };
};

type Props = {
  apartment: ApartmentLike;
};

function getValidImageUrl(
  url?: string | null
) {
  if (!url?.trim()) {
    return null;
  }

  if (
    url.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return null;
  }

  return url;
}

function isSubscriptionApartment(
  apartment: ApartmentLike
) {
  if (
    apartment.listingStage
  ) {
    return (
      apartment.listingStage ===
      "subscription"
    );
  }

  const statuses = [
    "청약예정",
    "특별공급",
    "1순위",
    "2순위",
    "청약중",
    "당첨자 발표 예정",
    "당첨자 발표",
    "당첨자발표",
    "계약 예정",
    "계약중",
    "청약마감",
  ];

  return (
    apartment.source ===
      "applyhome" ||
    apartment.isAutoCreated ===
      true ||
    statuses.includes(
      apartment.status ?? ""
    )
  );
}

function isFirstComeApartment(
  apartment: ApartmentLike
) {
  if (
    apartment.listingStage
  ) {
    return (
      apartment.listingStage ===
      "firstCome"
    );
  }

  const status =
    apartment.status?.trim() ??
    "";

  const condition =
    apartment.condition?.trim() ??
    "";

  return (
    status.includes("선착순") ||
    status.includes("분양중") ||
    condition.includes(
      "동호지정"
    ) ||
    condition.includes(
      "잔여세대"
    ) ||
    condition.includes(
      "회사보유분"
    )
  );
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "확인 중";
  }

  return value
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .replace(
      /^(\d{4})-(\d{2})-(\d{2})$/,
      "$1.$2.$3"
    );
}

function getSubscriptionDescription(
  status?: string
) {
  switch (status) {
    case "청약예정":
      return "청약 접수를 앞두고 있는 단지입니다.";

    case "특별공급":
    case "1순위":
    case "2순위":
    case "청약중":
      return "현재 청약 접수가 진행 중인 단지입니다.";

    case "당첨자 발표 예정":
      return "청약 접수가 끝나 당첨자 발표를 기다리는 단계입니다.";

    case "당첨자 발표":
    case "당첨자발표":
      return "당첨자 발표와 서류 일정을 확인할 단계입니다.";

    case "계약 예정":
      return "당첨자 계약 시작을 앞두고 있는 단계입니다.";

    case "계약중":
      return "당첨자 계약 일정이 진행 중입니다.";

    case "청약마감":
      return "청약과 계약 일정이 종료된 단지입니다.";

    default:
      return "청약 일정과 공급정보를 확인해보세요.";
  }
}

function getSaleBadges(
  apartment: ApartmentLike
) {
  const badges: string[] = [];

  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    badges.push("선착순 분양");
  }

  if (
    apartment.condition?.includes(
      "500만원"
    )
  ) {
    badges.push(
      "계약금 500만원"
    );
  }

  if (
    apartment.condition?.includes(
      "무이자"
    )
  ) {
    badges.push(
      "중도금 무이자"
    );
  }

  if (
    apartment.condition?.includes(
      "발코니"
    )
  ) {
    badges.push(
      "발코니 혜택"
    );
  }

  if (
    apartment.condition?.includes(
      "축하금"
    ) ||
    apartment.condition?.includes(
      "페이백"
    )
  ) {
    badges.push("계약 혜택");
  }

  return [
    ...new Set(badges),
  ].slice(0, 4);
}

function getSubscriptionBadge(
  status?: string
) {
  switch (status) {
    case "청약예정":
      return "청약 예정";

    case "특별공급":
      return "특별공급";

    case "1순위":
      return "1순위 청약";

    case "2순위":
      return "2순위 청약";

    case "청약중":
      return "청약 진행 중";

    case "당첨자 발표 예정":
      return "당첨자 발표 예정";

    case "당첨자 발표":
    case "당첨자발표":
      return "당첨자 발표";

    case "계약 예정":
      return "계약 예정";

    case "계약중":
      return "계약 진행 중";

    case "청약마감":
      return "청약 마감";

    default:
      return (
        status ||
        "청약 정보"
      );
  }
}

function getSaleStatusLabel(
  apartment: ApartmentLike
) {
  if (
    isFirstComeApartment(
      apartment
    )
  ) {
    return "선착순 분양";
  }

  if (
    apartment.listingStage ===
    "completed"
  ) {
    return "노출 종료";
  }

  if (
    apartment.listingStage ===
    "existing"
  ) {
    return "기존 아파트";
  }

  return (
    apartment.status ||
    "분양 정보"
  );
}

function ImagePlaceholder({
  label,
}: {
  label: string;
}) {
  return (
    <div className="relative flex h-full min-h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 text-center sm:min-h-[360px] sm:rounded-3xl">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-100/60 blur-2xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-sky-100/70 blur-2xl"
      />

      <div className="relative z-10 flex max-w-sm flex-col items-center">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24">
          <Image
            src="/icon-512.png"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="96px"
            className="object-contain"
          />
        </div>

        <p className="mt-4 break-keep text-base font-black text-[#132238] sm:text-lg">
          {label}
        </p>

        <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
          등록된 대표 이미지가 준비되면 자동으로 표시됩니다.
        </p>
      </div>
    </div>
  );
}

function SummaryInfoCard({
  label,
  value,
  accent = "emerald",
}: {
  label: string;
  value: string;
  accent?:
    | "emerald"
    | "blue";
}) {
  const accentClass =
    accent === "blue"
      ? "sm:hover:border-blue-300 sm:hover:bg-blue-50/50"
      : "sm:hover:border-emerald-300 sm:hover:bg-emerald-50/50";

  return (
    <article
      className={[
        "min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3",
        "transition-all duration-200 sm:rounded-2xl sm:p-4",
        "sm:hover:-translate-y-0.5 sm:hover:shadow-md",
        accentClass,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
        {label}
      </p>

      <p className="mt-1.5 break-keep text-xs font-extrabold leading-5 text-[#132238] sm:mt-2 sm:text-sm sm:leading-6">
        {value ||
          "정보 확인 중"}
      </p>
    </article>
  );
}

export default function ApartmentHero({
  apartment,
}: Props) {
  const isSubscription =
    isSubscriptionApartment(
      apartment
    );

  const isFirstCome =
    isFirstComeApartment(
      apartment
    );

  const heroImage =
    getValidImageUrl(
      apartment.images?.hero
    );

  const floorPlanNames =
    apartment.images
      ?.floorPlans
      ?.map((item) =>
        item.name?.trim()
      )
      .filter(
        (
          name
        ): name is string =>
          Boolean(name)
      ) ?? [];

  const saleBadges =
    getSaleBadges(apartment);

  const totalSupplyText =
    apartment.totalSupply &&
    apartment.totalSupply > 0
      ? `${apartment.totalSupply.toLocaleString()}세대`
      : apartment.projectInfo
          ?.saleHouseholds ||
        apartment.projectInfo
          ?.totalHouseholds ||
        "정보 확인 중";

  const displayApartment =
    apartment as unknown as Apartment;

  const representativePrice =
    getRepresentativePrice(
      displayApartment
    );

  const moveInText =
    getMoveInText(
      displayApartment
    );

  const moveInCompleted =
    moveInText.includes(
      "입주 완료"
    );

  const moveInDateText =
    moveInText
      .replace(
        /\s입주\s(?:예정|완료)$/,
        ""
      ) ||
    apartment.projectInfo
      ?.moveInDate ||
    "정보 확인 중";

  const moveInLabel =
    moveInCompleted
      ? "입주 완료"
      : "입주 예정";

  return (
    <section className="mt-4 grid gap-3 sm:mt-5 sm:gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="min-w-0">
        {heroImage ? (
          <div className="group relative h-[230px] overflow-hidden rounded-2xl bg-zinc-100 shadow-sm min-[420px]:h-[270px] sm:h-[360px] sm:rounded-3xl lg:h-full lg:min-h-[470px]">
            {/* PC 여백은 저용량 최적화 이미지를 흐린 배경으로 채웁니다.
                CSS background-image를 쓰지 않아 원본 파일의 중복 다운로드를 줄입니다. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden overflow-hidden lg:block"
            >
              <Image
                src={heroImage}
                alt=""
                fill
                quality={28}
                sizes="64vw"
                className="scale-110 object-cover blur-2xl opacity-45"
              />
            </div>

            <div className="pointer-events-none absolute inset-0 hidden bg-white/30 lg:block" />

            <Image
              src={heroImage}
              alt={`${apartment.name} 대표 이미지`}
              fill
              priority
              fetchPriority="high"
              quality={74}
              sizes="
                (max-width: 1023px) 100vw,
                64vw
              "
              className="relative z-[1] object-cover object-center transition-transform duration-500 lg:object-contain sm:group-hover:scale-[1.02]"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/45 to-transparent sm:h-28" />

            <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur sm:bottom-5 sm:left-5 sm:px-3 sm:py-1.5 sm:text-xs">
              {isSubscription
                ? `${apartment.name} 청약`
                : isFirstCome
                  ? `${apartment.name} 선착순 분양`
                  : `${apartment.name} 대표 이미지`}
            </div>
          </div>
        ) : (
          <div className="h-[230px] min-[420px]:h-[270px] sm:h-[360px] lg:h-full lg:min-h-[470px]">
            <ImagePlaceholder
              label={`${apartment.name} 대표 이미지 준비 중`}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold text-white sm:px-3 sm:text-sm",
              isSubscription
                ? "bg-blue-600"
                : isFirstCome
                  ? "bg-emerald-600"
                  : apartment.listingStage ===
                      "completed"
                    ? "bg-zinc-500"
                    : "bg-[#132238]",
            ].join(" ")}
          >
            {isSubscription
              ? getSubscriptionBadge(
                  apartment.status
                )
              : getSaleStatusLabel(
                  apartment
                )}
          </span>

          <p className="min-w-0 truncate text-xs leading-5 text-zinc-500 sm:hidden">
            {apartment.region ||
              "지역 정보 준비 중"}
          </p>
        </div>

        <p className="mt-3 hidden break-keep text-sm leading-6 text-zinc-500 sm:block">
          {apartment.region ||
            "지역 정보 준비 중"}
        </p>

        <div className="mt-3 flex items-start justify-between gap-3 sm:mt-4">
          <h1 className="min-w-0 break-keep text-[25px] font-black leading-[1.25] tracking-[-0.035em] text-[#132238] sm:text-3xl">
            {apartment.name}
          </h1>

          <FavoriteButton
            slug={apartment.slug}
            apartmentName={
              apartment.name
            }
          />
        </div>

        <ApartmentDataTrust
          apartment={
            displayApartment
          }
        />

        {isSubscription ? (
          <>
            <p className="mt-3 text-xs leading-5 text-zinc-600 sm:mt-4 sm:text-sm sm:leading-6">
              {getSubscriptionDescription(
                apartment.status
              )}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
              <SummaryInfoCard
                label="공급 세대수"
                value={
                  totalSupplyText
                }
                accent="blue"
              />

              <SummaryInfoCard
                label="모집공고일"
                value={formatDate(
                  apartment
                    .subscription
                    ?.announcementDate
                )}
                accent="blue"
              />

              <SummaryInfoCard
                label="당첨자 발표"
                value={formatDate(
                  apartment
                    .subscription
                    ?.winnerDate
                )}
                accent="blue"
              />

              <SummaryInfoCard
                label={
                  moveInLabel
                }
                value={
                  moveInDateText
                }
                accent="blue"
              />
            </div>
          </>
        ) : (
          <>
            {saleBadges.length >
              0 && (
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0">
                {saleBadges.map(
                  (badge) => (
                    <span
                      key={badge}
                      className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 sm:px-3 sm:text-xs"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            )}

            <div className="mt-4 rounded-xl bg-[#F8FAF7] p-4 sm:mt-5 sm:rounded-2xl sm:p-5">
              <div className="grid gap-3 min-[420px]:grid-cols-[0.72fr_1.28fr] min-[420px]:items-start">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
                    {
                      representativePrice.label
                    }
                  </p>

                  <p className="mt-1.5 break-keep text-lg font-black text-[#132238] sm:mt-2 sm:text-xl">
                    {
                      representativePrice.text
                    }
                  </p>
                </div>

                <div className="border-t border-zinc-200 pt-3 min-[420px]:border-l min-[420px]:border-t-0 min-[420px]:pl-4 min-[420px]:pt-0">
                  <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
                    핵심 계약조건
                  </p>

                  <p className="mt-1.5 break-keep text-xs font-bold leading-5 text-zinc-700 sm:mt-2 sm:text-sm sm:leading-6">
                    {apartment.condition ||
                      "계약조건 확인 중"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
              <SummaryInfoCard
                label="총 세대수"
                value={
                  apartment
                    .projectInfo
                    ?.totalHouseholds ||
                  totalSupplyText
                }
              />

              <SummaryInfoCard
                label={
                  moveInLabel
                }
                value={
                  moveInDateText
                }
              />

              <SummaryInfoCard
                label="주차대수"
                value={
                  apartment
                    .projectInfo
                    ?.parking ||
                  "정보 확인 중"
                }
              />

              <SummaryInfoCard
                label="평형·타입"
                value={
                  floorPlanNames.length >
                  0
                    ? floorPlanNames.join(
                        ", "
                      )
                    : "정보 확인 중"
                }
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
