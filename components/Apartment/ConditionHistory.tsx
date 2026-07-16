import type { ApartmentConditionHistory } from "../../data/history";

type Props = {
  conditionHistory?: ApartmentConditionHistory;
};

function getContractLabel(value: string) {
  const labels: Record<string, string> = {
    "fixed-500": "계약금 500만원",
    "fixed-1000": "계약금 1,000만원",
    "ratio-5": "계약금 5%",
    "ratio-10": "계약금 10%",
    unknown: "확인 필요",
  };
  return labels[value] ?? value;
}

function getMiddlePaymentLabel(value: string) {
  const labels: Record<string, string> = {
    free: "중도금 무이자",
    "partial-free": "일부 무이자",
    "interest-deferred": "이자후불제",
    self: "자납",
    unknown: "확인 필요",
  };
  return labels[value] ?? value;
}

function getOptionLabel(value: string) {
  const labels: Record<string, string> = {
    "balcony-and-options-free": "발코니+옵션 무상",
    "balcony-free": "발코니 무상",
    "some-options-free": "일부 옵션 무상",
    paid: "유상",
    unknown: "확인 필요",
  };
  return labels[value] ?? value;
}

function getCashBenefitLabel(value: string) {
  const labels: Record<string, string> = {
    "over-2000": "2,000만원 이상",
    "over-1000": "1,000만원 이상",
    small: "소액 혜택",
    none: "없음",
    unknown: "확인 필요",
  };
  return labels[value] ?? value;
}

function getBalanceSupportLabel(value: string) {
  const labels: Record<string, string> = {
    yes: "지원 있음",
    no: "일반 잔금",
    unknown: "확인 필요",
  };
  return labels[value] ?? value;
}

export default function ConditionHistory({ conditionHistory }: Props) {
  if (!conditionHistory) return null;

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">CONDITION HISTORY</p>
      <h2 className="mt-2 text-xl font-bold">계약조건 변경 이력</h2>
      <p className="mt-2 text-sm text-zinc-500">
        청약 초기 조건부터 현재 조건까지 변경 흐름을 확인할 수 있습니다.
      </p>

      <div className="mt-6 space-y-4">
        {conditionHistory.history.map((item, index) => (
          <div
            key={`${item.date}-${item.title}`}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  {item.date}
                </p>
                <h3 className="mt-1 text-lg font-bold">
                  {index + 1}. {item.title}
                </h3>
              </div>

              <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white">
                조건 변경
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-600">{item.description}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Info title="계약금" value={getContractLabel(item.contractType)} />
              <Info
                title="중도금"
                value={getMiddlePaymentLabel(item.middlePaymentType)}
              />
              <Info
                title="발코니/옵션"
                value={getOptionLabel(item.optionBenefitType)}
              />
              <Info
                title="현금혜택"
                value={getCashBenefitLabel(item.cashBenefitType)}
              />
              <Info
                title="잔금지원"
                value={getBalanceSupportLabel(item.balanceSupport)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-sm">
      <p className="text-zinc-500">{title}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}