import type { Apartment } from "../../types/apartment";
import UnitPriceCard from "./UnitPriceCard";

export default function PriceConditionCard({
  apartment,
}: {
  apartment: Apartment;
}) {
  const options = apartment.priceDetail?.options ?? [];

  return (
    <div className="mt-8 space-y-6">
      <UnitPriceCard apartment={apartment} />

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-600">
          CONTRACT CONDITION
        </p>
        <h2 className="mt-1 text-2xl font-extrabold">계약조건</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info title="계약금" value={apartment.priceDetail?.contractPrice || "확인 필요"} />
          <Info title="중도금" value={apartment.priceDetail?.middlePayment || "확인 필요"} />
          <Info title="잔금" value={apartment.priceDetail?.balance || "확인 필요"} />
          <Info title="대표 분양가" value={apartment.priceDetail?.salePrice || apartment.price || "확인 필요"} />
          <Info title="평당가" value={apartment.priceDetail?.pricePerPyeong || "확인 필요"} />
          <Info title="현재 핵심조건" value={apartment.condition || "계약조건 확인 필요"} />
        </div>

        {options.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-extrabold text-zinc-700">
              옵션 및 제공 품목
            </p>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {options.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-1 break-keep font-bold leading-6">{value}</p>
    </div>
  );
}