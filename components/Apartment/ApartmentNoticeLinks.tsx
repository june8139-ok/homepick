import Link from "next/link";
import { detailHref } from "../../lib/apartmentPages";
import { normalizeApartment } from "../../lib/normalizeApartment";
import { supabase } from "../../lib/supabase";
import { formatSubscriptionDate } from "../../lib/subscriptionVisibility";
import type { Apartment } from "../../types/apartment";

export default async function ApartmentNoticeLinks({ apartment }: { apartment: Apartment }) {
  const parentSlug = apartment.noticeParentSlug;

  if (parentSlug) {
    const { data, error } = await supabase.from("apartments").select("slug,name")
      .eq("is_published", true).eq("slug", parentSlug).maybeSingle();
    if (error) throw new Error("대표 단지 조회에 실패했습니다.", { cause: error });
    if (!data) return null;
    const parent = data;

    return (
      <p className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
        <Link className="font-bold text-emerald-800 hover:underline" href={detailHref(parent.slug)}>
          {parent.name} 단지 정보와 다른 모집공고 보기 →
        </Link>
      </p>
    );
  }

  const { data, error } = await supabase.from("apartments").select("*")
    .eq("is_published", true).contains("data", { noticeParentSlug: apartment.slug });
  if (error) throw new Error("연결된 모집공고 조회에 실패했습니다.", { cause: error });
  const linked = (data ?? []).map(normalizeApartment).filter((item) => item.slug !== apartment.slug);
  if (!linked.length) return null;

  const notices = [
    ...(apartment.subscription?.announcementDate || apartment.subscription?.noticeUrl ? [apartment] : []),
    ...linked,
  ].map((item) => ({
    item,
    date: formatSubscriptionDate(item.subscription?.announcementDate),
  })).sort((a, b) => b.date.localeCompare(a.date) || a.item.name.localeCompare(b.item.name, "ko"));

  return (
    <section className="my-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-extrabold text-zinc-900">이 단지의 모집공고</h2>
      <p className="mt-1 text-sm text-zinc-600">
        모집 세대수와 가격·계약조건은 각 공고의 적용 물량을 확인해 주세요.
      </p>
      <ul className="mt-3 divide-y divide-zinc-200">
        {notices.map(({ item, date }) => (
          <li key={item.slug} className="py-3">
            <div className="font-bold text-zinc-900">
              {item.slug === apartment.slug ? item.name : (
                <Link className="text-emerald-800 hover:underline" href={detailHref(item.slug)}>
                  {item.name} 공고 보기 →
                </Link>
              )}
            </div>
            {(date || item.projectInfo?.saleHouseholds) && (
              <p className="mt-1 text-sm text-zinc-600">
                {[date && `공고일 ${date}`, item.projectInfo?.saleHouseholds && `공고 공급 ${item.projectInfo.saleHouseholds}`]
                  .filter(Boolean).join(" · ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
