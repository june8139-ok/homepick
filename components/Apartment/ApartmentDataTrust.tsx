"use client";

import type {
  Apartment,
} from "../../types/apartment";

type TrustItem = {
  label: string;
  value: string;
  tone:
    | "emerald"
    | "blue"
    | "amber"
    | "zinc";
};

function formatCheckedAt(
  value?: string | null
) {
  if (!value?.trim()) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      timeZone:
        "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  )
    .format(date)
    .replace(
      /\s/g,
      ""
    );
}

function getTrustItems(
  apartment: Apartment
): TrustItem[] {
  const isApplyHome =
    apartment.source ===
      "applyhome" ||
    apartment.isAutoCreated ===
      true;

  const items: TrustItem[] = [
    {
      label: "자료 출처",
      value: apartment.materialSource || (isApplyHome ? "청약홈 공개자료" : "출처 확인 필요"),
      tone: isApplyHome ? "blue" : "emerald",
    },
    {
      label: "자료 기준일",
      value: formatCheckedAt(apartment.materialDate) || "미상",
      tone: "zinc",
    },
    {
      label: "집눈 수정일",
      value: formatCheckedAt(apartment.editorialUpdatedAt) || "미기록",
      tone: "zinc",
    },
  ];

  if (isApplyHome) {
    items.push({
      label: "청약홈 동기화일",
      value: formatCheckedAt(apartment.lastSyncedAt) || "미기록",
      tone: "zinc",
    });
  }
  return items;
}

export default function ApartmentDataTrust({
  apartment,
}: {
  apartment: Apartment;
}) {
  const items =
    getTrustItems(
      apartment
    );

  const toneClasses = {
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-800",

    blue:
      "border-blue-200 bg-blue-50 text-blue-800",

    amber:
      "border-amber-200 bg-amber-50 text-amber-800",

    zinc:
      "border-zinc-200 bg-zinc-50 text-zinc-700",
  } as const;

  return (
    <section
      aria-label="자료 출처와 기준일"
      className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:mt-5 sm:p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {items.map(
          (item) => (
            <div
              key={
                item.label
              }
              className={[
                "inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5",
                "text-[10px] font-bold sm:px-3 sm:text-xs",
                toneClasses[
                  item.tone
                ],
              ].join(" ")}
            >
              <span className="opacity-70">
                {item.label}
              </span>

              <span
                aria-hidden="true"
                className="opacity-35"
              >
                ·
              </span>

              <strong className="truncate font-black">
                {item.value}
              </strong>
            </div>
          )
        )}
      </div>

      <p className="mt-2 break-keep text-[10px] leading-5 text-zinc-400 sm:text-xs">
        분양가, 계약조건, 일정과 잔여세대는 변경될 수 있으므로 청약 또는 계약 전 공식 자료와 최신 안내를 다시 확인해주세요.
      </p>
    </section>
  );
}
