"use client";
import Link from "next/link";
import { useAdmin } from "./AdminContext";
import {
  detailSections,
  sectionLabels,
  detailHref,
  type DetailPageContent,
} from "../../lib/apartmentPages";
export default function DetailPagesSection() {
  const { detailPages, setDetailPages, editingSlug } = useAdmin();
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-xl font-bold">단지별 상세 페이지</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        기존 사업개요·가격·평면도·입지 입력을 활용합니다. 각 메뉴에 별도의
        설명을 80자 이상 작성하고 공개를 선택하세요. 평형은 평면도, 분양가는
        가격 또는 계약조건이 있어야 공개됩니다. 저장 후 공개 화면에 반영됩니다.
      </p>
      {detailSections.map((key) => {
        const c = detailPages[key] || {};
        const update = (patch: Partial<DetailPageContent>) =>
          setDetailPages({ ...detailPages, [key]: { ...c, ...patch } });
        return (
          <details key={key} className="mt-4 border-t border-zinc-200 pt-4">
            <summary className="cursor-pointer font-bold">
              {sectionLabels[key]} · {c.published ? "공개 선택" : "비공개"}
            </summary>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!c.published}
                  onChange={(e) => update({ published: e.target.checked })}
                />
                자료 요건을 충족하면 이 페이지 공개
              </label>
              <label className="block text-sm">
                이 메뉴만의 상세 설명 ({c.body?.trim().length || 0}자)
                <textarea
                  rows={7}
                  value={c.body || ""}
                  onChange={(e) => update({ body: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200 p-3"
                  placeholder="다른 메뉴의 설명을 반복하지 말고 이 주제의 구체적인 내용을 작성하세요. 빈 줄로 문단을 나눌 수 있습니다."
                />
              </label>
              {(
                [
                  ["seoTitle", "검색 제목 보충 문구 (선택)"],
                  ["seoDescription", "검색 설명 (선택)"],
                  ["source", "자료 출처"],
                  ["checkedAt", "최근 확인일"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="block text-sm">
                  {label}
                  <input
                    type={field === "checkedAt" ? "date" : "text"}
                    value={c[field] || ""}
                    onChange={(e) => update({ [field]: e.target.value })}
                    className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3"
                  />
                </label>
              ))}
              <p className="rounded-xl bg-zinc-50 p-3 text-sm leading-6">
                검색 제목은 단지명 + {sectionLabels[key]} + 보충 문구로
                생성됩니다. 검색 설명에도 단지명과 메뉴명을 포함합니다. 80자는
                공개를 위한 최소 입력 기준이며 검색 노출을 보장하는 기준은
                아닙니다.
              </p>
              {editingSlug && (
                <Link
                  href={detailHref(editingSlug, key)}
                  target="_blank"
                  className="text-sm font-bold text-emerald-700"
                >
                  저장된 공개 페이지 확인 ↗
                </Link>
              )}
            </div>
          </details>
        );
      })}
    </section>
  );
}
