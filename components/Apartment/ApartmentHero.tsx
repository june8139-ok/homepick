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

  source?: "manual" | "applyhome";
  isAutoCreated?: boolean;

  totalSupply?: number | null;

  subscription?: SubscriptionScheduleLike;
  projectInfo?: ProjectInfoLike;

  images?: {
    hero?: string | null;
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

function getValidImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.trim() === "") return null;

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
  const subscriptionStatuses = [
    "청약예정",
    "특별공급",
    "1순위",
    "2순위",
    "청약중",
    "당첨자발표",
    "계약중",
    "청약마감",
  ];

  return (
    apartment.source === "applyhome" ||
    apartment.isAutoCreated === true ||
    subscriptionStatuses.includes(
      apartment.status ?? ""
    )
  );
}

function formatDate(value?: string | null) {
  if (!value) return "확인 중";

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

    case "청약중":
      return "현재 청약 접수가 진행 중입니다.";

    case "당첨자발표":
      return "당첨자 발표와 서류 일정을 확인할 단계입니다.";

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
    apartment.status?.includes("선착순")
  ) {
    badges.push("선착순 분양");
  }

  if (
    apartment.condition?.includes("500만원")
  ) {
    badges.push("계약금 500만원");
  }

  if (
    apartment.condition?.includes("무이자")
  ) {
    badges.push("중도금 무이자");
  }

  if (
    apartment.condition?.includes("발코니")
  ) {
    badges.push("발코니 혜택");
  }

  if (
    apartment.condition?.includes("축하금")
  ) {
    badges.push("계약 혜택");
  }

  return [...new Set(badges)].slice(0, 5);
}

function getSubscriptionBadge(
  status?: string
) {
  switch (status) {
    case "청약예정":
      return "청약 예정";

    case "청약중":
      return "청약 진행 중";

    case "당첨자발표":
      return "당첨자 발표";

    case "계약중":
      return "계약 진행 중";

    case "청약마감":
      return "청약 마감";

    default:
      return status || "청약 정보";
  }
}

function ImagePlaceholder({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex h-full min-h-[120px] w-full items-center justify-center rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-100 text-sm font-medium text-zinc-500">
      {label}
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
  accent?: "emerald" | "blue";
}) {
  const accentClass =
    accent === "blue"
      ? "hover:border-blue-300 hover:bg-blue-50/50"
      : "hover:border-emerald-300 hover:bg-emerald-50/50";

  return (
    <article
      className={[
        "rounded-2xl border border-zinc-200 bg-zinc-50 p-4",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        accentClass,
      ].join(" ")}
    >
      <p className="text-xs font-bold text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-keep text-sm font-extrabold leading-6 text-[#132238]">
        {value || "정보 확인 중"}
      </p>
    </article>
  );
}

export default function ApartmentHero({
  apartment,
}: Props) {
  const isSubscription =
    isSubscriptionApartment(apartment);

  const heroImage = getValidImageUrl(
    apartment.images?.hero
  );

  const gallery = (
    apartment.images?.gallery ?? []
  )
    .map(getValidImageUrl)
    .filter(Boolean) as string[];

  const floorPlanNames =
    apartment.images?.floorPlans
      ?.map((item) => item.name)
      .filter(Boolean) ?? [];

  const saleBadges =
    getSaleBadges(apartment);

  const totalSupplyText =
    apartment.totalSupply &&
    apartment.totalSupply > 0
      ? `${apartment.totalSupply.toLocaleString()}세대`
      : apartment.projectInfo?.saleHouseholds ||
        apartment.projectInfo?.totalHouseholds ||
        "정보 확인 중";

  return (
    <section className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      {/* 이미지 영역 */}
      <div>
        {heroImage ? (
          <div className="overflow-hidden rounded-3xl">
            <img
              src={heroImage}
              alt={apartment.name}
              className="h-[360px] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="h-[360px]">
            <ImagePlaceholder label="대표 이미지 준비 중" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-4 gap-3">
          {gallery.length > 0
            ? gallery
                .slice(0, 4)
                .map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-2xl"
                  >
                    <img
                      src={image}
                      alt={`${apartment.name} 이미지 ${
                        index + 1
                      }`}
                      className="h-24 w-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                  </div>
                ))
            : [1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-24"
                  >
                    <ImagePlaceholder
                      label={`이미지 ${item}`}
                    />
                  </div>
                )
              )}
        </div>
      </div>

      {/* 핵심정보 영역 */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm leading-6 text-zinc-500">
          {apartment.region ||
            "지역 정보 준비 중"}
        </p>

        <span
          className={[
            "mt-4 inline-flex rounded-full px-3 py-1 text-sm font-bold text-white",
            isSubscription
              ? "bg-blue-600"
              : "bg-[#132238]",
          ].join(" ")}
        >
          {isSubscription
            ? getSubscriptionBadge(
                apartment.status
              )
            : apartment.status ||
              "등록 예정"}
        </span>

        <h1 className="mt-4 break-keep text-3xl font-extrabold leading-tight text-[#132238]">
          {apartment.name}
        </h1>

        {isSubscription ? (
          <>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              {getSubscriptionDescription(
                apartment.status
              )}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <SummaryInfoCard
                label="공급 세대수"
                value={totalSupplyText}
                accent="blue"
              />

              <SummaryInfoCard
                label="모집공고일"
                value={formatDate(
                  apartment.subscription
                    ?.announcementDate
                )}
                accent="blue"
              />

              <SummaryInfoCard
                label="당첨자 발표"
                value={formatDate(
                  apartment.subscription
                    ?.winnerDate
                )}
                accent="blue"
              />

              <SummaryInfoCard
                label="입주 예정"
                value={
                  apartment.projectInfo
                    ?.moveInDate ||
                  "정보 확인 중"
                }
                accent="blue"
              />
            </div>
          </>
        ) : (
          <>
            {saleBadges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {saleBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-[#F8FAF7] p-5">
              <p className="text-xs font-bold text-zinc-500">
                분양가
              </p>

              <p className="mt-2 text-xl font-extrabold text-[#132238]">
                {apartment.price ||
                  "분양가 확인 중"}
              </p>

              <div className="mt-4 border-t border-zinc-200 pt-4">
                <p className="text-xs font-bold text-zinc-500">
                  핵심 계약조건
                </p>

                <p className="mt-2 text-sm font-bold leading-6 text-zinc-700">
                  {apartment.condition ||
                    "계약조건 확인 중"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryInfoCard
                label="총 세대수"
                value={
                  apartment.projectInfo
                    ?.totalHouseholds ||
                  "정보 확인 중"
                }
              />

              <SummaryInfoCard
                label="입주 예정"
                value={
                  apartment.projectInfo
                    ?.moveInDate ||
                  "정보 확인 중"
                }
              />

              <SummaryInfoCard
                label="주차대수"
                value={
                  apartment.projectInfo
                    ?.parking ||
                  "정보 확인 중"
                }
              />

              <SummaryInfoCard
                label="평형·타입"
                value={
                  floorPlanNames.length > 0
                    ? floorPlanNames.join(", ")
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