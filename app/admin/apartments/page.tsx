"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type AdminApartmentRow = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  builder: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  status: string | null;
  type: string | null;
  score_total: number | null;
  grade: string | null;
  hero_image: string | null;
  is_published: boolean | null;
  data: {
    condition?: string;
    price?: string;
    cityName?: string;
    images?: {
      hero?: string | string[] | null;
    };
  } | null;
};

function getHeroImage(apt: AdminApartmentRow) {
  const dataHero = apt.data?.images?.hero;

  if (Array.isArray(dataHero)) return dataHero[0] ?? "";
  if (typeof dataHero === "string") return dataHero;

  return apt.hero_image ?? "";
}

function getCondition(apt: AdminApartmentRow) {
  return apt.data?.condition || apt.data?.price || "조건 정보 없음";
}

export default function AdminApartmentsPage() {
  const [keyword, setKeyword] = useState("");
  const [apartments, setApartments] = useState<AdminApartmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApartments() {
      const { data, error } = await supabase
        .from("apartments")
        .select("*")
        .order("score_total", { ascending: false });

      if (error) {
        console.error("Supabase 목록 조회 오류:", error);
        alert(`단지 목록을 불러오지 못했습니다.\n\n${error.message}`);
        setLoading(false);
        return;
      }

      setApartments(data ?? []);
      setLoading(false);
    }

    fetchApartments();
  }, []);

  const handleTogglePublished = async (apt: AdminApartmentRow) => {
    const nextPublished = !apt.is_published;

    setPublishingId(apt.id);

    const { error } = await supabase
      .from("apartments")
      .update({ is_published: nextPublished })
      .eq("id", apt.id);

    if (error) {
      console.error("게시상태 변경 오류:", error);
      alert(`게시상태 변경 중 오류가 발생했습니다.\n\n${error.message}`);
      setPublishingId(null);
      return;
    }

    setApartments((prev) =>
      prev.map((item) =>
        item.id === apt.id ? { ...item, is_published: nextPublished } : item
      )
    );

    setPublishingId(null);
  };

  const handleDelete = async (apt: AdminApartmentRow) => {
    const ok = window.confirm(
      `"${apt.name}" 단지를 정말 삭제할까요?\n\n삭제하면 Supabase apartments 테이블에서 제거됩니다.`
    );

    if (!ok) return;

    setDeletingId(apt.id);

    const { error } = await supabase
      .from("apartments")
      .delete()
      .eq("id", apt.id);

    if (error) {
      console.error("Supabase 삭제 오류:", error);
      alert(`삭제 중 오류가 발생했습니다.\n\n${error.message}`);
      setDeletingId(null);
      return;
    }

    setApartments((prev) => prev.filter((item) => item.id !== apt.id));
    setDeletingId(null);
    alert("삭제되었습니다.");
  };

  const filteredApartments = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    return apartments.filter((apt) => {
      if (!query) return true;

      return (
        apt.name?.toLowerCase().includes(query) ||
        apt.region?.toLowerCase().includes(query) ||
        apt.city?.toLowerCase().includes(query) ||
        apt.status?.toLowerCase().includes(query) ||
        apt.brand?.toLowerCase().includes(query)
      );
    });
  }, [apartments, keyword]);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-zinc-900 p-8 text-white">
          <p className="text-sm text-zinc-300">ADMIN</p>
          <h1 className="mt-2 text-4xl font-bold">단지 관리</h1>
          <p className="mt-4 text-zinc-300">
            Supabase에 등록된 단지를 검색하고 수정할 단지를 선택합니다.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white"
            >
              + 신규 단지 등록
            </Link>

            <Link
              href="/"
              className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm text-zinc-600"
            >
              홈페이지 보기
            </Link>
          </div>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="단지명, 지역, 브랜드, 상태 검색"
            className="w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm outline-none focus:border-zinc-900 md:w-80"
          />
        </div>

        <div className="mt-4 text-sm text-zinc-500">
          {loading ? "불러오는 중..." : `총 ${filteredApartments.length}개 단지`}
        </div>

        <div className="mt-6 grid gap-4">
          {filteredApartments.map((apt) => {
            const heroImage = getHeroImage(apt);
            const isDeleting = deletingId === apt.id;
            const isPublishing = publishingId === apt.id;

            return (
              <article
                key={apt.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    {heroImage ? (
                      <img
                        src={heroImage}
                        alt={apt.name}
                        className="h-24 w-28 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-28 items-center justify-center rounded-2xl bg-zinc-100 text-xs text-zinc-400">
                        이미지 없음
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-zinc-900 px-2 py-1 text-white">
                          {apt.status || "상태없음"}
                        </span>

                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-600">
                          {apt.city || apt.data?.cityName || "지역없음"}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 font-bold ${
                            apt.is_published
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {apt.is_published ? "게시중" : "숨김"}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-bold">{apt.name}</h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        {apt.region || "지역 정보 없음"}
                      </p>

                      <p className="mt-2 text-sm font-medium text-zinc-800">
                        {getCondition(apt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">분석점수</p>
                      <p className="text-2xl font-bold">
                        {apt.score_total ?? 0}점
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(apt)}
                        disabled={isPublishing}
                        className={`rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                          apt.is_published
                            ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isPublishing
                          ? "변경중..."
                          : apt.is_published
                          ? "숨기기"
                          : "게시하기"}
                      </button>

                      <Link
                        href={`/apartments/${apt.slug}`}
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                      >
                        보기
                      </Link>

                      <Link
                        href={`/admin/apartments/${apt.slug}`}
                        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700"
                      >
                        수정
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(apt)}
                        disabled={isDeleting}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "삭제중..." : "삭제"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && filteredApartments.length === 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}