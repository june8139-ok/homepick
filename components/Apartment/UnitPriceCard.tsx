import type {
  Apartment,
  UnitPrice,
} from "../../types/apartment";

type Props = {
  apartment: Apartment;
  title?: string;
};

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
  const eok = Math.floor(amount / 10000);
  const manwon = amount % 10000;

  if (eok === 0) {
    return `${amount.toLocaleString("ko-KR")}만원`;
  }

  if (manwon === 0) {
    return `${eok}억원`;
  }

  return `${eok}억 ${manwon.toLocaleString(
    "ko-KR"
  )}만원`;
}

function explicitMinimumOfUnit(
  unit: UnitPrice
) {
  const values = [
    unit.minPrice,
    ...(unit.types ?? []).map(
      (type) => type.minPrice
    ),
  ].filter(validPrice);

  return values.length > 0
    ? Math.min(...values)
    : null;
}

function lowestPublishedTopPrice(
  unit: UnitPrice
) {
  const values = (unit.types ?? [])
    .map((type) => type.maxPrice)
    .filter(validPrice);

  if (values.length > 0) {
    return Math.min(...values);
  }

  return validPrice(unit.maxPrice)
    ? unit.maxPrice
    : null;
}

function unitDisplayPrice(unit: UnitPrice) {
  const explicitMinimum =
    explicitMinimumOfUnit(unit);

  if (validPrice(explicitMinimum)) {
    return {
      value: explicitMinimum,
      label: "평형 최저 분양가",
      text: `${formatPrice(explicitMinimum)}부터`,
      isActualMinimum: true,
    };
  }

  const lowestTopPrice =
    lowestPublishedTopPrice(unit);

  if (validPrice(lowestTopPrice)) {
    return {
      value: lowestTopPrice,
      label: "타입별 최저 공급가",
      text: formatPrice(lowestTopPrice),
      isActualMinimum: false,
    };
  }

  return {
    value: null,
    label: "분양가",
    text: "가격 확인 중",
    isActualMinimum: false,
  };
}

function typePriceText(
  minPrice?: number | null,
  maxPrice?: number | null
) {
  const hasMin = validPrice(minPrice);
  const hasMax = validPrice(maxPrice);

  if (hasMin && hasMax) {
    const minimum = Math.min(minPrice, maxPrice);
    const maximum = Math.max(minPrice, maxPrice);

    if (minimum === maximum) {
      return formatPrice(minimum);
    }

    return `${formatPrice(minimum)} ~ ${formatPrice(
      maximum
    )}`;
  }

  if (hasMin) {
    return `${formatPrice(minPrice)}부터`;
  }

  if (hasMax) {
    return `최고 공급가 ${formatPrice(maxPrice)}`;
  }

  return "가격 확인 중";
}

function UnitTypeDetails({
  unit,
}: {
  unit: UnitPrice;
}) {
  const types = unit.types ?? [];

  if (types.length === 0) {
    return null;
  }

  return (
    <details className="group border-t border-zinc-100">
      <summary
        className="
          flex cursor-pointer list-none
          items-center justify-between gap-2
          px-3 py-2.5 text-[10px]
          font-extrabold text-zinc-600
          transition hover:bg-zinc-50
          hover:text-zinc-900
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-emerald-500
          sm:px-5 sm:py-4 sm:text-sm
        "
      >
        <span className="truncate">
          <span className="sm:hidden">
            타입별 가격
          </span>
          <span className="hidden sm:inline">
            타입별 공급가격 보기
          </span>
        </span>

        <span
          className="
            inline-flex h-7 w-7 shrink-0
            items-center justify-center
            rounded-full bg-zinc-100
            text-xs text-zinc-500
            transition duration-200
            group-open:rotate-180
            group-open:bg-emerald-100
            group-open:text-emerald-700
            sm:h-8 sm:w-8 sm:text-base
          "
        >
          ↓
        </span>
      </summary>

      <div className="divide-y divide-zinc-100 border-t border-zinc-100 bg-zinc-50/60">
        {types.map((type, typeIndex) => (
          <div
            key={`${type.typeName}-${typeIndex}`}
            className="
              flex flex-col gap-2 px-3 py-3
              transition hover:bg-white
              sm:flex-row sm:items-center
              sm:justify-between sm:gap-3
              sm:px-5 sm:py-4
            "
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                className="
                  inline-flex min-w-12 items-center
                  justify-center rounded-lg bg-white
                  px-2 py-1.5 text-[10px]
                  font-black text-zinc-800
                  ring-1 ring-zinc-200
                  sm:min-w-16 sm:rounded-xl
                  sm:px-3 sm:py-2 sm:text-sm
                "
              >
                {type.typeName}
              </span>

              {typeof type.households === "number" &&
                type.households > 0 && (
                  <span className="text-[9px] font-semibold text-zinc-400 sm:text-xs">
                    {type.households.toLocaleString(
                      "ko-KR"
                    )}
                    세대
                  </span>
                )}
            </div>

            <div className="sm:text-right">
              <p className="text-[9px] font-semibold text-zinc-400 sm:text-[10px]">
                {validPrice(type.minPrice)
                  ? "타입별 분양가"
                  : "청약홈 최고 공급가"}
              </p>

              <p className="mt-0.5 break-keep text-xs font-black leading-5 text-zinc-900 sm:text-base">
                {typePriceText(
                  type.minPrice,
                  type.maxPrice
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function UnitCard({
  unit,
}: {
  unit: UnitPrice;
}) {
  const display = unitDisplayPrice(unit);

  return (
    <article
      className="
        min-w-0 overflow-hidden rounded-2xl
        border border-zinc-200 bg-white
        transition duration-200 sm:rounded-3xl
        sm:hover:-translate-y-0.5
        sm:hover:shadow-md
      "
    >
      <div
        className="
          flex min-h-[126px] flex-col
          justify-between gap-3 bg-zinc-50/70
          p-3 sm:min-h-0 sm:flex-row
          sm:items-center sm:gap-4
          sm:border-b sm:border-zinc-100
          sm:p-5
        "
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <span
            className="
              inline-flex min-w-14 items-center
              justify-center rounded-xl
              bg-emerald-100 px-3 py-1.5
              text-base font-black text-emerald-800
              sm:min-w-20 sm:rounded-2xl
              sm:px-4 sm:py-2 sm:text-lg
            "
          >
            {unit.area}
          </span>

          {typeof unit.households === "number" &&
            unit.households > 0 && (
              <span
                className="
                  rounded-full bg-white px-2 py-1
                  text-[9px] font-bold text-zinc-500
                  ring-1 ring-zinc-200
                  sm:px-3 sm:py-1.5 sm:text-xs
                "
              >
                {unit.households.toLocaleString(
                  "ko-KR"
                )}
                세대
              </span>
            )}
        </div>

        <div className="min-w-0 sm:text-right">
          <p className="text-[9px] font-semibold text-zinc-400 sm:text-xs">
            {display.label}
          </p>

          <p className="mt-1 break-keep text-sm font-black leading-5 text-zinc-900 sm:text-xl sm:leading-7">
            {display.text}
          </p>
        </div>
      </div>

      <UnitTypeDetails unit={unit} />
    </article>
  );
}

export default function UnitPriceCard({
  apartment,
  title = "평형별 분양가",
}: Props) {
  const info = apartment.priceInfo;
  const units = info?.units ?? [];
  const average = info?.averagePricePerPyeong;

  const hasStructuredPrice =
    units.length > 0 ||
    validPrice(average);

  if (!hasStructuredPrice) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
        <p className="text-xs font-bold text-emerald-600 sm:text-sm">
          PRICE
        </p>

        <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
          {title}
        </h2>

        <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:mt-5 sm:rounded-2xl sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 sm:text-xs">
            분양가
          </p>

          <p className="mt-1 break-keep text-lg font-black text-zinc-900 sm:mt-2 sm:text-xl">
            {apartment.price ||
              apartment.priceDetail?.salePrice ||
              "가격 확인 중"}
          </p>
        </div>

        <p className="mt-3 text-[10px] leading-5 text-zinc-400 sm:mt-4 sm:text-xs">
          평형별 분양가는 청약홈 연동 또는
          관리자 입력 후 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
      <div>
        <p className="text-xs font-bold text-emerald-600 sm:text-sm">
          PRICE
        </p>

        <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1 break-keep text-xs leading-5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">
          평형 카드는 공개된 타입 가격 중 가장 낮은
          금액을 보여주며, 펼치면 타입별 공급가격을
          확인할 수 있습니다.
        </p>
      </div>

      {units.length > 0 && (
        <div
          className="
            mt-5 grid grid-cols-2 gap-2
            sm:gap-4 lg:mt-7
            lg:grid-cols-2 lg:gap-5
          "
        >
          {units.map((unit, index) => (
            <UnitCard
              key={`${unit.area}-${index}`}
              unit={unit}
            />
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
        <div className="min-w-0 rounded-xl bg-zinc-50 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-[10px] font-semibold text-zinc-500 sm:text-xs">
            평균 평당가
          </p>

          <p className="mt-1 break-keep text-xs font-black leading-5 text-zinc-900 sm:mt-2 sm:text-base sm:leading-6">
            {validPrice(average)
              ? `${Math.round(average).toLocaleString(
                  "ko-KR"
                )}만원`
              : apartment.priceDetail?.pricePerPyeong ||
                "확인 중"}
          </p>
        </div>

        <div className="min-w-0 rounded-xl bg-blue-50 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-[10px] font-semibold text-blue-700 sm:text-xs">
            가격 기준
          </p>

          <p className="mt-1 line-clamp-3 break-keep text-[10px] font-bold leading-4 text-blue-900/80 sm:mt-2 sm:text-sm sm:leading-6">
            {info?.note ||
              "청약홈 연동 가격으로, 실제 계약 전 모집공고 공급금액표를 다시 확인해주세요."}
          </p>
        </div>
      </div>
    </section>
  );
}