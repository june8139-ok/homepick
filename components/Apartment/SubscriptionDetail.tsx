import SubscriptionAlertForm from "./SubscriptionAlertForm";
import UnitPriceCard from "./UnitPriceCard";
import ApartmentImageSections from "./ApartmentImageSections";
import {
  getMoveInText,
} from "../../lib/apartmentDisplay";

import type {
  Apartment,
  SubscriptionSchedule,
} from "../../types/apartment";

type ApplyHomeData = Record<
  string,
  unknown
>;

const APPLYHOME_MAIN_URL =
  "https://www.applyhome.co.kr";

function getText(
  data: ApplyHomeData | undefined,
  key: string
) {
  const value = data?.[key];

  return value === null ||
    value === undefined ||
    value === ""
    ? ""
    : String(value).trim();
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "일정 확인 중";
  }

  const parts = value
    .replace(/\./g, "-")
    .replace(/\//g, "-")
    .split("-");

  return parts.length === 3
    ? `${parts[0]}.${parts[1]}.${parts[2]}`
    : value;
}

function formatPeriod(
  start?: string | null,
  end?: string | null
) {
  if (!start && !end) {
    return "일정 확인 중";
  }

  if (
    start &&
    end &&
    start !== end
  ) {
    return `${formatDate(
      start
    )} ~ ${formatDate(end)}`;
  }

  return formatDate(
    start ?? end
  );
}

function timeline(
  schedule?: SubscriptionSchedule
) {
  return [
    {
      label: "모집공고",
      value: formatDate(
        schedule?.announcementDate
      ),
    },
    {
      label: "특별공급",
      value: formatPeriod(
        schedule?.specialSupplyStartDate,
        schedule?.specialSupplyEndDate
      ),
    },
    {
      label: "1순위",
      value: formatPeriod(
        schedule?.firstPriorityStartDate,
        schedule?.firstPriorityEndDate
      ),
    },
    {
      label: "2순위",
      value: formatPeriod(
        schedule?.secondPriorityStartDate,
        schedule?.secondPriorityEndDate
      ),
    },
    {
      label: "당첨자 발표",
      value: formatDate(
        schedule?.winnerDate
      ),
    },
    {
      label: "계약기간",
      value: formatPeriod(
        schedule?.contractStartDate,
        schedule?.contractEndDate
      ),
    },
  ];
}

function statusDescription(
  status: string
) {
  if (status === "청약예정") {
    return "청약 접수를 앞두고 있는 단지입니다. 모집공고와 접수 일정을 확인해보세요.";
  }

  if (
    [
      "특별공급",
      "1순위",
      "2순위",
      "청약중",
    ].includes(status)
  ) {
    return "현재 청약 접수가 진행 중인 단지입니다.";
  }

  if (
    status ===
      "당첨자 발표 예정"
  ) {
    return "청약 접수가 끝나 당첨자 발표를 기다리는 단계입니다.";
  }

  if (
    status ===
      "당첨자 발표" ||
    status ===
      "당첨자발표"
  ) {
    return "당첨자 발표와 서류 제출 일정을 확인할 단계입니다.";
  }

  if (
    status ===
      "계약 예정"
  ) {
    return "당첨자 계약 시작을 앞두고 있는 단계입니다.";
  }

  if (status === "계약중") {
    return "당첨자 계약 일정이 진행 중입니다.";
  }

  if (
    status === "청약마감"
  ) {
    return "청약 접수가 종료된 단지입니다.";
  }

  return "청약 일정과 모집공고를 확인해보세요.";
}

function applyButtonText(
  status: string
) {
  if (status === "청약예정") {
    return "청약홈에서 일정 확인 ↗";
  }

  if (
    [
      "특별공급",
      "1순위",
      "2순위",
      "청약중",
    ].includes(status)
  ) {
    return "청약홈에서 청약하기 ↗";
  }

  if (
    [
      "당첨자 발표 예정",
      "당첨자 발표",
      "당첨자발표",
      "계약 예정",
      "계약중",
      "청약마감",
    ].includes(status)
  ) {
    return "청약 접수 종료";
  }

  return "청약홈으로 이동 ↗";
}

function InfoItem({
  label,
  value,
  wide = false,
}: {
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
        "min-w-0 rounded-xl border border-zinc-100 bg-zinc-50 p-3",
        "transition-all duration-200",
        "sm:rounded-2xl sm:p-4",
        "sm:hover:-translate-y-0.5",
        "sm:hover:border-emerald-200",
        "sm:hover:bg-emerald-50/40",
        "sm:hover:shadow-sm",
        wide
          ? "col-span-2"
          : "",
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold leading-4 text-zinc-500 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-extrabold leading-5 text-zinc-900 sm:mt-2 sm:text-sm sm:leading-6">
        {value}
      </p>
    </article>
  );
}

function ScheduleCard({
  index,
  label,
  value,
}: {
  index: number;
  label: string;
  value: string;
}) {
  return (
    <article
      className="
        min-w-0 rounded-xl
        border border-zinc-200
        bg-zinc-50 p-3
        transition-all duration-200
        sm:rounded-2xl sm:p-5
        sm:hover:-translate-y-0.5
        sm:hover:border-emerald-300
        sm:hover:bg-emerald-50/50
        sm:hover:shadow-sm
      "
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white sm:h-8 sm:w-8 sm:text-xs">
          {index + 1}
        </span>

        <p className="truncate text-xs font-extrabold text-zinc-900 sm:text-base">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-[11px] font-semibold leading-5 text-zinc-700 sm:mt-4 sm:text-sm sm:leading-6">
        {value}
      </p>
    </article>
  );
}

export default function SubscriptionDetail({
  apartment,
}: {
  apartment: Apartment;
}) {
  const applyHome =
    apartment.applyHome as
      | ApplyHomeData
      | undefined;

  const schedule =
    apartment.subscription;

  const items =
    timeline(schedule);

  const totalSupply =
    apartment.totalSupply ??
    Number(
      getText(
        applyHome,
        "TOT_SUPLY_HSHLDCO"
      )
    );

  const developer =
    apartment.projectInfo
      ?.developer ||
    getText(
      applyHome,
      "BSNS_MBY_NM"
    );

  const builder =
    apartment.builder ||
    getText(
      applyHome,
      "CNSTRCT_ENTRPS_NM"
    );

  const moveInDate =
    getMoveInText({
      ...apartment,

      projectInfo: {
        ...apartment.projectInfo,

        moveInDate:
          apartment.projectInfo
            ?.moveInDate ||
          getText(
            applyHome,
            "MVN_PREARNGE_YM"
          ),
      },
    });

  const housingType =
    getText(
      applyHome,
      "HOUSE_DTL_SECD_NM"
    ) || apartment.type;

  const noticeUrl =
    schedule?.noticeUrl ||
    apartment.applyHomeUrl ||
    getText(
      applyHome,
      "PBLANC_URL"
    );

  const applyUrl =
    schedule?.applyUrl ||
    schedule?.applyHomeUrl ||
    APPLYHOME_MAIN_URL;

  const applyClosed = [
    "당첨자 발표 예정",
    "당첨자 발표",
    "당첨자발표",
    "계약 예정",
    "계약중",
    "청약마감",
  ].includes(
    apartment.status
  );

  const hasDetailImages = Boolean(
    apartment.images?.location
      ?.length ||
      apartment.images?.floorPlans
        ?.length ||
      apartment.images?.community
        ?.length ||
      apartment.images?.gallery?.length
  );

  return (
    <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
      {/* 현재 청약 상태 */}
      <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-700 sm:text-sm">
              SUBSCRIPTION STATUS
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-zinc-900 sm:mt-2 sm:text-2xl">
              {apartment.status}
            </h2>

            <p className="mt-2 break-keep text-xs leading-5 text-zinc-600 sm:text-sm sm:leading-6">
              {statusDescription(
                apartment.status
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[320px] sm:gap-3">
            <InfoItem
              label="공급 세대수"
              value={
                Number.isFinite(
                  totalSupply
                ) &&
                totalSupply > 0
                  ? `${totalSupply.toLocaleString()}세대`
                  : "정보 확인 중"
              }
            />

            <InfoItem
              label="당첨자 발표"
              value={formatDate(
                schedule?.winnerDate
              )}
            />
          </div>
        </div>
      </section>

      {/* 청약 일정 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <p className="text-xs font-bold text-emerald-700 sm:text-sm">
          SUBSCRIPTION SCHEDULE
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-zinc-900 sm:text-2xl">
          청약 일정
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">
          모집공고부터 계약기간까지 주요 일정을 확인하세요.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:grid-cols-3">
          {items.map(
            (item, index) => (
              <ScheduleCard
                key={item.label}
                index={index}
                label={item.label}
                value={item.value}
              />
            )
          )}
        </div>
      </section>

      {/* 평형별 분양가 */}
      <UnitPriceCard
        apartment={apartment}
        title="평형별 분양가"
      />

      {/* 사업개요 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <p className="text-xs font-bold text-zinc-500 sm:text-sm">
          PROJECT OVERVIEW
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-zinc-900 sm:text-2xl">
          사업개요
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:grid-cols-3">
          <InfoItem
            label="사업지 주소"
            value={apartment.region}
            wide
          />

          <InfoItem
            label="주택 구분"
            value={housingType}
          />

          <InfoItem
            label="시공사"
            value={builder}
          />

          <InfoItem
            label="사업주체"
            value={developer}
          />

          <InfoItem
            label={
              moveInDate.includes(
                "입주 완료"
              )
                ? "입주 완료"
                : "입주 예정"
            }
            value={
              moveInDate
                .replace(
                  /\s입주\s(?:예정|완료)$/,
                  ""
                ) ||
              "정보 확인 중"
            }
          />

        </div>
      </section>

      {/* 단지 사진·평면도 */}
      {hasDetailImages && (
        <section>
          <header>
            <p className="text-xs font-extrabold text-zinc-500 sm:text-sm">
              PHOTO &amp; FLOOR PLAN
            </p>

            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#132238] sm:text-2xl">
              단지 사진·평면정보
            </h2>

            <p className="mt-1 text-xs leading-5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">
              입지환경과 평면도, 커뮤니티 이미지를 확인하세요.
            </p>
          </header>

          <ApartmentImageSections
            images={apartment.images}
            apartmentName={
              apartment.name
            }
          />
        </section>
      )}

      {/* 청약 상담·알림 */}
      <SubscriptionAlertForm
        apartmentSlug={
          apartment.slug
        }
        apartmentName={
          apartment.name
        }
        leadType={
          apartment.leadType ??
          "schedule"
        }
      />

      {/* 청약홈 연결 */}
      <section className="rounded-2xl bg-zinc-900 p-4 text-white shadow-sm sm:rounded-3xl sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-300 sm:text-sm">
              APPLYHOME
            </p>

            <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
              모집공고와 청약 신청
            </h2>

            <p className="mt-2 break-keep text-xs leading-5 text-zinc-300 sm:max-w-2xl sm:text-sm sm:leading-6">
              모집공고 확인과 실제 청약 신청은 청약홈에서 진행됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:min-w-[430px]">
            {noticeUrl ? (
              <a
                href={noticeUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex min-h-11
                  cursor-pointer items-center
                  justify-center rounded-xl
                  border border-zinc-600
                  bg-zinc-800 px-3 py-3
                  text-center text-xs
                  font-extrabold text-white
                  transition
                  hover:-translate-y-0.5
                  hover:border-zinc-400
                  hover:bg-zinc-700
                  hover:shadow-md
                  focus:outline-none
                  focus:ring-2
                  focus:ring-zinc-400
                  focus:ring-offset-2
                  focus:ring-offset-zinc-900
                  sm:min-h-12
                  sm:rounded-2xl
                  sm:px-5 sm:text-sm
                "
              >
                모집공고 보기 ↗
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-800 px-3 py-3 text-center text-xs font-bold text-zinc-400 sm:min-h-12 sm:rounded-2xl sm:px-5 sm:text-sm">
                모집공고 준비 중
              </span>
            )}

            {applyClosed ? (
              <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-700 px-3 py-3 text-center text-xs font-extrabold text-zinc-300 sm:min-h-12 sm:rounded-2xl sm:px-5 sm:text-sm">
                {applyButtonText(
                  apartment.status
                )}
              </span>
            ) : (
              <a
                href={applyUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex min-h-11
                  cursor-pointer items-center
                  justify-center rounded-xl
                  bg-emerald-600 px-3 py-3
                  text-center text-xs
                  font-extrabold text-white
                  shadow-sm transition
                  hover:-translate-y-0.5
                  hover:bg-emerald-500
                  hover:shadow-md
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-400
                  focus:ring-offset-2
                  focus:ring-offset-zinc-900
                  sm:min-h-12
                  sm:rounded-2xl
                  sm:px-5 sm:text-sm
                "
              >
                {applyButtonText(
                  apartment.status
                )}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
