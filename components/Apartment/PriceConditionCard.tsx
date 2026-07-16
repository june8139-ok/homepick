import type { Apartment } from "../../types/apartment";

type Props = {
  apartment: Apartment;
};

export default function PriceConditionCard({ apartment }: Props) {
  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">가격 및 계약조건</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Info title="분양가" value={apartment.priceDetail.salePrice} />
        <Info title="평당가" value={apartment.priceDetail.pricePerPyeong} />
        <Info title="계약금" value={apartment.priceDetail.contractPrice} />
        <Info title="중도금" value={apartment.priceDetail.middlePayment} />
        <Info title="잔금" value={apartment.priceDetail.balance} />
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {apartment.priceDetail.options.map((item) => (
          <li key={item} className="rounded-xl border border-zinc-200 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}