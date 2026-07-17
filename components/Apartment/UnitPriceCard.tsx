import type {
    Apartment,
    ApartmentPriceInfo,
    UnitPrice,
  } from "../../types/apartment";
  
  type Props = {
    apartment: Apartment;
    title?: string;
  };
  
  function validPrice(value?: number | null) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }
  
  function formatPrice(value?: number | null) {
    if (!validPrice(value)) return "";
    const amount = Math.round(value as number);
    const eok = Math.floor(amount / 10000);
    const manwon = amount % 10000;
    if (eok === 0) return `${amount.toLocaleString()}만원`;
    if (manwon === 0) return `${eok}억원`;
    return `${eok}억 ${manwon.toLocaleString()}만원`;
  }
  
  function unitPriceText(unit: UnitPrice) {
    const hasMin = validPrice(unit.minPrice);
    const hasMax = validPrice(unit.maxPrice);
    if (hasMin && hasMax) {
      return unit.minPrice === unit.maxPrice
        ? formatPrice(unit.minPrice)
        : `${formatPrice(unit.minPrice)} ~ ${formatPrice(unit.maxPrice)}`;
    }
    if (hasMax) return `최고 ${formatPrice(unit.maxPrice)}`;
    if (hasMin) return `${formatPrice(unit.minPrice)}부터`;
    return "가격 확인 중";
  }
  
  function minimumOf(info?: ApartmentPriceInfo) {
    if (validPrice(info?.minimumPrice)) return info?.minimumPrice ?? null;
    const values = (info?.units ?? [])
      .map((unit) => unit.minPrice)
      .filter(validPrice) as number[];
    return values.length ? Math.min(...values) : null;
  }
  
  function maximumOf(info?: ApartmentPriceInfo) {
    if (validPrice(info?.maximumPrice)) return info?.maximumPrice ?? null;
    const values = (info?.units ?? [])
      .map((unit) => unit.maxPrice)
      .filter(validPrice) as number[];
    return values.length ? Math.max(...values) : null;
  }
  
  export default function UnitPriceCard({
    apartment,
    title = "평형별 분양가",
  }: Props) {
    const info = apartment.priceInfo;
    const units = info?.units ?? [];
    const minimum = minimumOf(info);
    const maximum = maximumOf(info);
    const average = info?.averagePricePerPyeong;
  
    const hasStructuredPrice =
      units.length > 0 ||
      validPrice(minimum) ||
      validPrice(maximum) ||
      validPrice(average);
  
    if (!hasStructuredPrice) {
      return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-600">PRICE</p>
          <h2 className="mt-1 text-2xl font-extrabold">{title}</h2>
  
          <div className="mt-5 rounded-2xl bg-zinc-50 p-5">
            <p className="text-xs font-semibold text-zinc-500">분양가</p>
            <p className="mt-2 text-xl font-black text-zinc-900">
              {apartment.price ||
                apartment.priceDetail?.salePrice ||
                "가격 확인 중"}
            </p>
          </div>
  
          <p className="mt-4 text-xs leading-5 text-zinc-400">
            평형별 최저·최고 분양가는 관리자 입력 또는 청약홈 연동 후 표시됩니다.
          </p>
        </section>
      );
    }
  
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-600">PRICE</p>
            <h2 className="mt-1 text-2xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              같은 평형도 동·층·타입에 따라 실제 공급금액이 달라질 수 있습니다.
            </p>
          </div>
  
          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[430px]">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-700">최저 분양가</p>
              <p className="mt-1 text-xl font-black text-zinc-900">
                {minimum ? `${formatPrice(minimum)}부터` : "확인 중"}
              </p>
            </div>
  
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-xs font-bold text-zinc-500">전체 최고가</p>
              <p className="mt-1 text-xl font-black text-zinc-900">
                {maximum ? formatPrice(maximum) : "확인 중"}
              </p>
            </div>
          </div>
        </div>
  
        {units.length > 0 && (
          <div className="mt-6 grid gap-3">
            {units.map((unit, index) => (
              <div
                key={`${unit.area}-${index}`}
                className="rounded-2xl border border-zinc-200 bg-white"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex min-w-16 items-center justify-center rounded-xl bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-700">
                      {unit.area}
                    </span>
  
                    {typeof unit.households === "number" && unit.households > 0 && (
                      <span className="text-xs font-semibold text-zinc-400">
                        {unit.households.toLocaleString()}세대
                      </span>
                    )}
                  </div>
  
                  <p className="text-base font-black text-zinc-900">
                    {unitPriceText(unit)}
                  </p>
                </div>
  
                {Boolean(unit.types?.length) && (
                  <details className="border-t border-zinc-100">
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-bold text-zinc-500 hover:bg-zinc-50">
                      타입별 상세 가격 보기
                    </summary>
  
                    <div className="grid gap-2 border-t border-zinc-100 bg-zinc-50 p-3">
                      {unit.types?.map((type) => (
                        <div
                          key={type.typeName}
                          className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-extrabold text-zinc-800">
                              {type.typeName}
                            </p>
                            {typeof type.households === "number" &&
                              type.households > 0 && (
                                <p className="mt-1 text-xs text-zinc-400">
                                  {type.households.toLocaleString()}세대
                                </p>
                              )}
                          </div>
  
                          <p className="text-right font-bold text-zinc-700">
                            {unitPriceText({
                              area: unit.area,
                              minPrice: type.minPrice,
                              maxPrice: type.maxPrice,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
  
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold text-zinc-500">평균 평당가</p>
            <p className="mt-2 text-base font-black text-zinc-900">
              {validPrice(average)
                ? `${Math.round(average as number).toLocaleString()}만원`
                : apartment.priceDetail?.pricePerPyeong || "확인 중"}
            </p>
          </div>
  
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-700">가격 기준</p>
            <p className="mt-2 text-sm font-bold leading-6 text-blue-900/80">
              {info?.note ||
                "기본 화면은 평형별 최저·최고가를 보여주며, 상세 타입 가격은 펼쳐서 확인할 수 있습니다."}
            </p>
          </div>
        </div>
      </section>
    );
  }