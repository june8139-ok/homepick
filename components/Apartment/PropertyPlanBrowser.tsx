"use client";
import Image from "next/image";
import { useState } from "react";
import type { UnitPrice } from "../../types/apartment";
import type { UnitEditorial } from "../../lib/apartmentPages";
const normalize = (v: string) => v.toUpperCase().replace(/타입|㎡|M²|\s/g, "");
function money(v?: number | null) {
  if (!v || v <= 0) return "";
  const n = Math.round(v),
    e = Math.floor(n / 10000),
    m = n % 10000;
  return `${e ? `${e}억 ` : ""}${m ? `${m.toLocaleString("ko-KR")}만원` : e ? "원" : ""}`.trim();
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
  const names = [...new Set(plans.map((p) => p.name.trim() || "평면도"))];
  const [selected, setSelected] = useState(names[0] || "");
  const matching = plans.filter(
    (p) => (p.name.trim() || "평면도") === selected,
  );
  const extra = details[selected] || {};
  const unit =
    units.find(
      (u) =>
        normalize(u.area) === normalize(selected) ||
        u.types?.some((t) => normalize(t.typeName) === normalize(selected)),
    ) || units.find((u) => parseFloat(u.area) === parseFloat(selected));
  const type = unit?.types?.find(
    (t) => normalize(t.typeName) === normalize(selected),
  );
  const rows = [
    ["전용면적", extra.exclusiveArea],
    ["공급면적", extra.supplyArea],
    ["방", extra.rooms],
    ["욕실", extra.bathrooms],
    ["구조", extra.layout],
    ["공급 세대수", type?.households ?? unit?.households],
    [
      "가격 기준",
      type ? "해당 타입 공급금액" : unit ? "해당 평형 공급금액" : "",
    ],
    ["최저 공급금액", money(type?.minPrice ?? unit?.minPrice)],
    ["최고 공급금액", money(type?.maxPrice ?? unit?.maxPrice)],
  ];
  return (
    <section className="property-plans">
      <h2>타입별 평형·평면도</h2>
      {names.length > 0 ? (
        <>
          <div className="property-type-tabs" aria-label="평면 타입 선택">
            {names.map((n) => (
              <button
                type="button"
                key={n}
                aria-pressed={n === selected}
                onClick={() => setSelected(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <h3>{selected}</h3>
          <dl className="property-facts">
            {rows
              .filter(([, v]) => v !== undefined && v !== null && v !== "")
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {matching.map((p, i) => (
            <figure className="property-figure" key={p.url + i}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} ${selected} 평면도 ${i + 1} 크게 보기`}
              >
                <Image
                  src={p.url}
                  alt={`${name} ${selected} 평면도${matching.length > 1 ? ` ${i + 1}` : ""}`}
                  width={1600}
                  height={1200}
                  sizes="(max-width:768px) 100vw,1000px"
                  quality={88}
                  className="h-auto w-full object-contain"
                />
              </a>
              <figcaption>
                평면도를 누르면 원본 이미지를 크게 볼 수 있습니다.
              </figcaption>
            </figure>
          ))}
          {extra.notes && <p className="property-prose">{extra.notes}</p>}
        </>
      ) : (
        <div className="property-prose">
          <p>현재 등록된 평형 정보입니다. 평면도 자료는 추가 확인 중입니다.</p>
          <dl className="property-facts">
            {units.map((u, i) => (
              <div key={u.area + i}>
                <dt>{u.area}㎡</dt>
                <dd>
                  {u.households != null ? `${u.households}세대` : ""}
                  {u.types?.length
                    ? ` · ${u.types.map((t) => t.typeName).join(", ")}`
                    : ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
