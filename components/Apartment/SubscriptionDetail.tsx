import ReservationCard from "./ReservationCard";
import UnitPriceCard from "./UnitPriceCard";

import type {
  Apartment,
  SubscriptionSchedule,
} from "../../types/apartment";

type ApplyHomeData = Record<string, unknown>;

const APPLYHOME_MAIN_URL = "https://www.applyhome.co.kr";

function getText(data: ApplyHomeData | undefined, key: string) {
  const value = data?.[key];
  return value === null || value === undefined || value === ""
    ? ""
    : String(value).trim();
}

function formatDate(value?: string | null) {
  if (!value) return "일정 확인 중";
  const parts = value.replace(/\./g, "-").replace(/\//g, "-").split("-");
  return parts.length === 3
    ? `${parts[0]}.${parts[1]}.${parts[2]}`
    : value;
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "일정 확인 중";
  if (start && end && start !== end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  return formatDate(start ?? end);
}

function timeline(schedule?: SubscriptionSchedule) {
  return [
    { label: "모집공고", value: formatDate(schedule?.announcementDate) },
    { label: "특별공급", value: formatPeriod(schedule?.specialSupplyStartDate, schedule?.specialSupplyEndDate) },
    { label: "1순위", value: formatPeriod(schedule?.firstPriorityStartDate, schedule?.firstPriorityEndDate) },
    { label: "2순위", value: formatPeriod(schedule?.secondPriorityStartDate, schedule?.secondPriorityEndDate) },
    { label: "당첨자 발표", value: formatDate(schedule?.winnerDate) },
    { label: "계약기간", value: formatPeriod(schedule?.contractStartDate, schedule?.contractEndDate) },
  ];
}

function statusDescription(status: string) {
  if (status === "청약예정") return "청약 접수를 앞두고 있는 단지입니다.";
  if (["특별공급", "1순위", "2순위", "청약중"].includes(status)) {
    return "현재 청약 접수가 진행 중인 단지입니다.";
  }
  if (status === "당첨자발표") {
    return "당첨자 발표 및 서류 일정을 확인할 단계입니다.";
  }
  if (status === "계약중") return "당첨자 계약 일정이 진행 중입니다.";
  if (status === "청약마감") return "청약 접수가 종료된 단지입니다.";
  return "청약 일정과 모집공고를 확인해보세요.";
}

function applyButtonText(status: string) {
  if (status === "청약예정") return "청약 예정";
  if (["특별공급", "1순위", "2순위", "청약중"].includes(status)) {
    return "청약홈에서 청약하기 ↗";
  }
  if (["당첨자발표", "계약중", "청약마감"].includes(status)) {
    return "청약 접수 종료";
  }
  return "청약홈으로 이동 ↗";
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold leading-6 text-zinc-900">
        {value || "정보 확인 중"}
      </p>
    </div>
  );
}

export default function SubscriptionDetail({
  apartment,
}: {
  apartment: Apartment;
}) {
  const applyHome = apartment.applyHome as ApplyHomeData | undefined;
  const schedule = apartment.subscription;
  const items = timeline(schedule);

  const totalSupply =
    apartment.totalSupply ??
    Number(getText(applyHome, "TOT_SUPLY_HSHLDCO"));

  const developer =
    apartment.projectInfo?.developer ||
    getText(applyHome, "BSNS_MBY_NM");

  const builder =
    apartment.builder ||
    getText(applyHome, "CNSTRCT_ENTRPS_NM");

  const phone =
    apartment.projectInfo?.phone ||
    getText(applyHome, "MDHS_TELNO");

  const moveInDate =
    apartment.projectInfo?.moveInDate ||
    getText(applyHome, "MVN_PREARNGE_YM");

  const housingType =
    getText(applyHome, "HOUSE_DTL_SECD_NM") ||
    apartment.type;

  const noticeUrl =
    schedule?.noticeUrl ||
    apartment.applyHomeUrl ||
    getText(applyHome, "PBLANC_URL");

  const applyUrl =
    schedule?.applyUrl ||
    schedule?.applyHomeUrl ||
    APPLYHOME_MAIN_URL;

  const applyClosed = [
    "당첨자발표",
    "계약중",
    "청약마감",
  ].includes(apartment.status);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">
              SUBSCRIPTION STATUS
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              {apartment.status}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {statusDescription(apartment.status)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <InfoItem
              label="공급 세대수"
              value={
                Number.isFinite(totalSupply) && totalSupply > 0
                  ? `${totalSupply.toLocaleString()}세대`
                  : "정보 확인 중"
              }
            />
            <InfoItem
              label="당첨자 발표"
              value={formatDate(schedule?.winnerDate)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
        <p className="text-sm font-bold text-blue-600">
          SUBSCRIPTION SCHEDULE
        </p>
        <h2 className="mt-1 text-2xl font-extrabold">청약 일정</h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.label}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="font-bold">{item.label}</p>
              </div>
              <p className="mt-4 text-sm font-semibold text-zinc-700">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <UnitPriceCard apartment={apartment} title="평형별 분양가" />

      <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
        <p className="text-sm font-bold text-zinc-500">PROJECT OVERVIEW</p>
        <h2 className="mt-1 text-2xl font-extrabold">사업개요</h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="사업지 주소" value={apartment.region} />
          <InfoItem label="주택 구분" value={housingType} />
          <InfoItem label="시공사" value={builder} />
          <InfoItem label="사업주체" value={developer} />
          <InfoItem label="입주 예정" value={moveInDate || "정보 확인 중"} />
          <InfoItem label="문의전화" value={phone} />
        </div>
      </section>

      <ReservationCard
        apartmentSlug={apartment.slug}
        apartmentName={apartment.name}
        mode="subscription"
        phoneNumber={phone}
        floorPlanNames={apartment.images.floorPlans
          .map((item) => item.name)
          .filter(Boolean)}
      />

      <section className="rounded-3xl bg-zinc-900 p-7 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-300">APPLYHOME</p>
            <h2 className="mt-1 text-2xl font-extrabold">
              모집공고와 청약 신청
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              모집공고 확인과 실제 청약 신청은 서로 다른 화면일 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">
            {noticeUrl ? (
              <a
                href={noticeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-800 px-5 py-3 text-sm font-extrabold text-white"
              >
                모집공고 보기 ↗
              </a>
            ) : (
              <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-zinc-800 px-5 py-3 text-sm font-bold text-zinc-400">
                모집공고 준비 중
              </span>
            )}

            {applyClosed ? (
              <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-zinc-700 px-5 py-3 text-sm font-extrabold text-zinc-300">
                {applyButtonText(apartment.status)}
              </span>
            ) : (
              <a
                href={applyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-400"
              >
                {applyButtonText(apartment.status)}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}