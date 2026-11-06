"use client";

import Image from "next/image";
import { useState } from "react";
import type { UnitPrice } from "../../types/apartment";
import type { UnitEditorial } from "../../lib/apartmentPages";

const normalize = (value: string) =>
  value.normalize("NFKC").toUpperCase().replace(/타입|M2|\s/g, "");

function money(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value <= 0) return "";
  const amount = Math.round(value);
  const eok = Math.floor(amount / 10000);
  const rest = amount % 10000;
  return eok
    ? `${eok}억${rest ? ` ${rest.toLocaleString("ko-KR")}만원` : "원"}`
    : `${rest.toLocaleString("ko-KR")}만원`;
}

function findFacts(label: string, units: UnitPrice[]) {
  const key = normalize(label);
  const matches = units.flatMap((unit) =>
    (unit.types ?? []).filter((type) => normalize(type.typeName) === key),
  );
  if (matches.length) return matches.length === 1 ? matches[0] : undefined;
  // A named subtype must never inherit the totals of its area group.
  if (!/^\d+(?:\.\d+)?$/.test(key)) return undefined;
  const groups = units.filter((unit) => normalize(unit.area) === key);
  return groups.length === 1 ? groups[0] : undefined;
}

export default function PropertyPlanBrowser({
  name,
  plans,
  units,
  details,
}: {
  name: string;
  plans: { name: string; url: string }[];
  units: UnitPrice[];
  details: Record<string, UnitEditorial>;
}) {
  const names = [...new Set(plans.map((plan) => plan.name.trim() || "평면도"))];
  const [selection, setSelection] = useState({ type: "", image: 0 });
  const selected = names.includes(selection.type) ? selection.type : (names[0] ?? "");
  const matching = plans.filter(
    (plan) => (plan.name.trim() || "평면도") === selected,
  );
  const activeImage =
    selection.type === selected && matching[selection.image] ? selection.image : 0;
  const current = matching[activeImage];
  const extra = details[selected] || {};
  const facts = findFacts(selected || "", units);
  const price = money(facts?.minPrice);
  const highest = money(facts?.maxPrice);
  const rows = [
    ["전용면적", extra.exclusiveArea],
    ["공급면적", extra.supplyArea],
    ["방", extra.rooms],
    ["욕실", extra.bathrooms],
    ["구조", extra.layout],
    ["공급 수량", facts?.households?.toLocaleString("ko-KR")],
    [price === highest ? "공급금액" : "최저 공급금액", price],
    ["최고 공급금액", price === highest ? "" : highest],
  ].filter(([, value]) => value?.trim());
  const comparison = names.map((label) => ({
    label,
    area: details[label]?.exclusiveArea?.trim(),
    count: findFacts(label, units)?.households,
  }));
  const alt = `${name} ${selected === "평면도" ? "평면도" : `${selected} 평면도`}${
    matching.length > 1 ? ` ${activeImage + 1}` : ""
  }`;

  return (
    <section className="min-w-0">
      <h2 className="mb-4 text-xl font-bold">타입별 평형·평면도</h2>
      {current ? (
        <>
          <div>
            {names.length > 1 && (
              <div className="sticky top-[var(--property-plan-sticky-top,68px)] z-10 bg-white py-2">
                <div
                  role="group"
                  aria-label="평면 타입 선택"
                  className="flex gap-2 overflow-x-auto p-1"
                >
                  {names.map((label) => (
                    <button
                      type="button"
                      key={label}
                      aria-pressed={label === selected}
                      onClick={(event) => {
                        setSelection({ type: label, image: 0 });
                        const button = event.currentTarget;
                        const strip = button.parentElement;
                        if (strip) {
                          const bounds = strip.getBoundingClientRect();
                          const tab = button.getBoundingClientRect();
                          if (tab.left < bounds.left || tab.right > bounds.right) {
                            strip.scrollLeft += tab.left - bounds.left;
                          }
                        }
                      }}
                      className={`min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#103f36] ${
                        label === selected
                          ? "border-[#103f36] bg-[#103f36] text-white"
                          : "border-[#d8e4df] bg-white text-[#103f36] hover:bg-[#f1f7f4]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2 grid rounded-2xl border border-[#d8e4df] bg-white md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <figure className="m-0 min-w-0 p-4 sm:p-6">
                <a
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${alt} 원본 보기 (새 탭)`}
                  className="relative block h-[clamp(220px,72vw,360px)] rounded-xl bg-[#fafcfb] md:h-[420px]"
                >
                  <Image
                    key={current.url}
                    src={current.url}
                    alt={alt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1200px) 60vw, 720px"
                    quality={88}
                    className="object-contain"
                  />
                </a>
                <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {matching.length > 1 && (
                    <div role="group" aria-label="도면 선택" className="flex flex-wrap gap-2">
                      {matching.map((plan, index) => (
                        <button
                          key={plan.url + index}
                          type="button"
                          aria-pressed={index === activeImage}
                          onClick={() => setSelection({ type: selected, image: index })}
                          className={`min-h-10 rounded-lg border px-3 text-sm ${
                            index === activeImage
                              ? "border-[#103f36] bg-[#eaf3ef] font-semibold text-[#103f36]"
                              : "border-[#d8e4df]"
                          }`}
                        >
                          도면 {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto rounded-lg border border-[#d8e4df] px-3 py-2.5 text-sm font-semibold text-[#103f36]"
                  >
                    평면도 확대 <span aria-hidden="true">↗</span>
                  </a>
                </figcaption>
              </figure>

              <div className="min-w-0 rounded-b-2xl border-t border-[#d8e4df] bg-[#f2f7f4] p-5 md:rounded-r-2xl md:rounded-bl-none md:border-t-0 md:border-l md:p-7">
                <h3 className="mb-4 break-words text-3xl font-bold text-[#103f36]">
                  {selected}
                </h3>
                {extra.notes?.trim() && (
                  <p className="mb-4 whitespace-pre-line break-words text-sm leading-relaxed">
                    {extra.notes}
                  </p>
                )}
                {rows.length > 0 && (
                  <dl className="divide-y divide-[#d8e4df] border-y border-[#d8e4df] text-sm">
                    {rows.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2 py-2.5">
                        <dt className="text-slate-600">{label}</dt>
                        <dd className="m-0 break-words font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>

          {comparison.length > 1 && comparison.some(({ area, count }) => area || count != null) && (
            <div className="mt-6 overflow-x-auto rounded-xl border border-[#d8e4df]">
              <table className="w-full text-left text-sm">
                <caption className="px-4 py-3 text-left font-bold">타입별 면적·공급 수량</caption>
                <thead className="bg-[#f2f7f4]">
                  <tr>
                    <th scope="col" className="px-4 py-2">타입</th>
                    <th scope="col" className="px-4 py-2">전용면적</th>
                    <th scope="col" className="px-4 py-2">공급 수량</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d8e4df]">
                  {comparison.map(({ label, area, count }) => (
                    <tr key={label}>
                      <th scope="row" className="px-4 py-2 font-medium">{label}</th>
                      <td className="px-4 py-2">{area || "—"}</td>
                      <td className="px-4 py-2">{count?.toLocaleString("ko-KR") ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="property-prose">
          <p>{units.length ? "현재 등록된 평형 정보입니다. 평면도는 아직 등록되지 않았습니다." : "아직 등록된 평면도가 없습니다."}</p>
          <dl className="property-facts">
            {units.map((unit, index) => (
              <div key={unit.area + index}>
                <dt>{/㎡|m²|m2/i.test(unit.area) ? unit.area : `${unit.area}㎡`}</dt>
                <dd>
                  {[unit.households != null ? `공급 ${unit.households}` : "", unit.types?.map((type) => type.typeName).join(", ")].filter(Boolean).join(" · ") || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
