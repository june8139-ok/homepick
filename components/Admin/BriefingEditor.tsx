"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "../../lib/supabase/browser";

import {
  uploadImage,
} from "../../lib/uploadImage";

import type {
  Briefing,
  BriefingCategory,
} from "../../types/briefing";

type ApartmentOption = {
  slug: string;
  name: string;
  city: string;
};

type Props = {
  mode:
    | "create"
    | "edit";

  initialBriefing?:
    Briefing;
};

const categories: BriefingCategory[] = [
  "청약 일정",
  "선착순 소식",
  "계약조건 변경",
  "지역 분양 브리핑",
];

function createSlug(
  value: string
) {
  return value
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9가-힣\s-]/g,
      ""
    )
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDateTimeLocal(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  return new Date(
    date.getTime() -
      offset * 60_000
  )
    .toISOString()
    .slice(0, 16);
}

export default function BriefingEditor({
  mode,
  initialBriefing,
}: Props) {
  const router = useRouter();

  const supabase =
    useMemo(
      () => createClient(),
      []
    );

  const [title, setTitle] =
    useState(
      initialBriefing?.title ??
        ""
    );

  const [slug, setSlug] =
    useState(
      initialBriefing?.slug ??
        ""
    );

  const [slugEdited, setSlugEdited] =
    useState(
      mode === "edit"
    );

  const [summary, setSummary] =
    useState(
      initialBriefing?.summary ??
        ""
    );

  const [content, setContent] =
    useState(
      initialBriefing?.content ??
        ""
    );

  const [category, setCategory] =
    useState<BriefingCategory>(
      initialBriefing?.category ??
        "지역 분양 브리핑"
    );

  const [region, setRegion] =
    useState(
      initialBriefing?.region ??
        ""
    );

  const [
    thumbnailUrl,
    setThumbnailUrl,
  ] = useState(
    initialBriefing
      ?.thumbnailUrl ?? ""
  );

  const [
    relatedSlugs,
    setRelatedSlugs,
  ] = useState<string[]>(
    initialBriefing
      ?.relatedApartmentSlugs ??
      []
  );

  const [
    isPublished,
    setIsPublished,
  ] = useState(
    initialBriefing
      ?.isPublished ?? false
  );

  const [
    publishedAt,
    setPublishedAt,
  ] = useState(
    toDateTimeLocal(
      initialBriefing
        ?.publishedAt
    )
  );

  const [
    apartments,
    setApartments,
  ] =
    useState<
      ApartmentOption[]
    >([]);

  const [
    apartmentSearch,
    setApartmentSearch,
  ] = useState("");

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    async function loadApartments() {
      const {
        data,
        error,
      } = await supabase
        .from("apartments")
        .select(
          "slug, name, city"
        )
        .order("name");

      if (error) {
        console.error(
          "관련 단지 조회 오류:",
          error
        );

        return;
      }

      setApartments(
        (
          data ??
          []
        ) as ApartmentOption[]
      );
    }

    loadApartments();
  }, [supabase]);

  useEffect(() => {
    if (
      slugEdited ||
      mode === "edit"
    ) {
      return;
    }

    setSlug(
      createSlug(title)
    );
  }, [
    title,
    slugEdited,
    mode,
  ]);

  useEffect(() => {
    if (
      isPublished &&
      !publishedAt
    ) {
      setPublishedAt(
        toDateTimeLocal(
          new Date().toISOString()
        )
      );
    }
  }, [
    isPublished,
    publishedAt,
  ]);

  const filteredApartments =
    apartments
      .filter((apartment) => {
        const keyword =
          apartmentSearch
            .trim()
            .toLowerCase();

        if (!keyword) {
          return true;
        }

        return [
          apartment.name,
          apartment.city,
          apartment.slug,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword)
        );
      })
      .slice(0, 12);

  function toggleApartment(
    apartmentSlug: string
  ) {
    setRelatedSlugs(
      (previous) =>
        previous.includes(
          apartmentSlug
        )
          ? previous.filter(
              (item) =>
                item !==
                apartmentSlug
            )
          : [
              ...previous,
              apartmentSlug,
            ]
    );
  }

  async function handleImageUpload(
    file?: File
  ) {
    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const url =
        await uploadImage(
          file,
          "briefings"
        );

      setThumbnailUrl(url);
    } catch (error) {
      console.error(
        "브리핑 이미지 업로드 오류:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "이미지 업로드에 실패했습니다."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    const resolvedTitle =
      title.trim();

    const resolvedSlug =
      createSlug(slug);

    if (!resolvedTitle) {
      alert(
        "제목을 입력해주세요."
      );

      return;
    }

    if (!resolvedSlug) {
      alert(
        "URL 주소를 입력해주세요."
      );

      return;
    }

    if (!summary.trim()) {
      alert(
        "한 줄 요약을 입력해주세요."
      );

      return;
    }

    if (!content.trim()) {
      alert(
        "본문을 입력해주세요."
      );

      return;
    }

    setSaving(true);

    try {
      const publishedDate =
        isPublished
          ? publishedAt
            ? new Date(
                publishedAt
              ).toISOString()
            : new Date().toISOString()
          : null;

      const payload = {
        title:
          resolvedTitle,

        slug:
          resolvedSlug,

        summary:
          summary.trim(),

        content:
          content.trim(),

        category,
        region:
          region.trim(),

        thumbnail_url:
          thumbnailUrl.trim() ||
          null,

        related_apartment_slugs:
          relatedSlugs,

        is_published:
          isPublished,

        published_at:
          publishedDate,
      };

      const response =
        await fetch(
          "/api/admin/briefings",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action: "save",
              mode,
              id:
                mode === "edit"
                  ? initialBriefing?.id
                  : undefined,
              payload,
            }),
          }
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          message?: string;
          code?: string;
        };

      if (!response.ok) {
        if (
          response.status === 409 ||
          result.code === "23505"
        ) {
          alert(
            "같은 URL 주소가 이미 사용 중입니다."
          );

          return;
        }

        throw new Error(
          result.message ??
            "브리핑 저장에 실패했습니다."
        );
      }

      alert(
        mode === "create"
          ? "브리핑이 저장되었습니다."
          : "브리핑 수정 내용이 저장되었습니다."
      );

      router.push(
        "/admin/briefings"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "브리핑 저장 오류:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "브리핑 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-emerald-600">
            BRIEFING EDITOR
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#132238]">
            {mode ===
            "create"
              ? "분양 브리핑 작성"
              : "분양 브리핑 수정"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            글을 저장하면 공개 목록과
            SEO 정보가 자동으로
            반영됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/briefings"
            )
          }
          className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          목록으로
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <label className="block">
              <span className="text-sm font-extrabold text-zinc-700">
                제목 *
              </span>

              <input
                value={title}
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                placeholder="예: 대전 신규 선착순 분양 단지 정리"
                className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-extrabold text-zinc-700">
                URL 주소 *
              </span>

              <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
                <span className="shrink-0 pl-4 text-sm text-zinc-400">
                  /briefing/
                </span>

                <input
                  value={slug}
                  onChange={(
                    event
                  ) => {
                    setSlugEdited(
                      true
                    );

                    setSlug(
                      event.target
                        .value
                    );
                  }}
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-extrabold text-zinc-700">
                한 줄 요약 *
              </span>

              <textarea
                value={summary}
                onChange={(
                  event
                ) =>
                  setSummary(
                    event.target
                      .value
                  )
                }
                rows={3}
                placeholder="목록과 검색 결과에 표시될 핵심 내용을 입력하세요."
                className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />

              <p className="mt-1 text-right text-xs text-zinc-400">
                {summary.length}
                자
              </p>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-extrabold text-zinc-700">
                본문 *
              </span>

              <textarea
                value={content}
                onChange={(
                  event
                ) =>
                  setContent(
                    event.target
                      .value
                  )
                }
                rows={20}
                placeholder="브리핑 본문을 입력하세요. 줄바꿈은 상세페이지에 그대로 반영됩니다."
                className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />

              <p className="mt-1 text-right text-xs text-zinc-400">
                {content.length}
                자
              </p>
            </label>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black text-[#132238]">
              관련 단지
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              이 글과 관련된 단지를
              선택하면 브리핑 상세에
              자동으로 연결됩니다.
            </p>

            <input
              value={
                apartmentSearch
              }
              onChange={(
                event
              ) =>
                setApartmentSearch(
                  event.target
                    .value
                )
              }
              placeholder="단지명 또는 지역 검색"
              className="mt-4 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {filteredApartments.map(
                (apartment) => {
                  const selected =
                    relatedSlugs.includes(
                      apartment.slug
                    );

                  return (
                    <button
                      key={
                        apartment.slug
                      }
                      type="button"
                      onClick={() =>
                        toggleApartment(
                          apartment.slug
                        )
                      }
                      className={[
                        "cursor-pointer rounded-xl border px-4 py-3 text-left transition",
                        selected
                          ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-zinc-50",
                      ].join(
                        " "
                      )}
                    >
                      <p className="truncate text-sm font-extrabold text-[#132238]">
                        {
                          apartment.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {apartment.city ||
                          "지역 확인 중"}
                      </p>
                    </button>
                  );
                }
              )}
            </div>

            <p className="mt-3 text-xs font-semibold text-emerald-700">
              선택된 단지{" "}
              {relatedSlugs.length}
              개
            </p>
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#132238]">
              분류 및 지역
            </h2>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-zinc-600">
                카테고리
              </span>

              <select
                value={category}
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value as BriefingCategory
                  )
                }
                className="mt-2 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              >
                {categories.map(
                  (item) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-zinc-600">
                지역
              </span>

              <input
                value={region}
                onChange={(
                  event
                ) =>
                  setRegion(
                    event.target
                      .value
                  )
                }
                placeholder="예: 대전"
                className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#132238]">
              대표 이미지
            </h2>

            <input
              type="file"
              accept="image/*"
              disabled={
                uploading
              }
              onChange={(
                event
              ) =>
                handleImageUpload(
                  event.target
                    .files?.[0]
                )
              }
              className="mt-4 block w-full cursor-pointer rounded-xl border border-zinc-200 p-3 text-xs"
            />

            {uploading && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                이미지 업로드
                중...
              </p>
            )}

            {thumbnailUrl && (
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                <img
                  src={
                    thumbnailUrl
                  }
                  alt="브리핑 대표 이미지 미리보기"
                  className="h-40 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() =>
                    setThumbnailUrl(
                      ""
                    )
                  }
                  className="w-full cursor-pointer border-t border-zinc-200 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  이미지 제거
                </button>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#132238]">
              공개 설정
            </h2>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-zinc-50 px-4 py-3">
              <span className="text-sm font-bold text-zinc-600">
                홈페이지 공개
              </span>

              <input
                type="checkbox"
                checked={
                  isPublished
                }
                onChange={(
                  event
                ) =>
                  setIsPublished(
                    event.target
                      .checked
                  )
                }
                className="h-5 w-5 accent-emerald-600"
              />
            </label>

            {isPublished && (
              <label className="mt-4 block">
                <span className="text-sm font-bold text-zinc-600">
                  공개일
                </span>

                <input
                  type="datetime-local"
                  value={
                    publishedAt
                  }
                  onChange={(
                    event
                  ) =>
                    setPublishedAt(
                      event.target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                />
              </label>
            )}
          </section>

          <button
            type="button"
            disabled={
              saving ||
              uploading
            }
            onClick={
              handleSave
            }
            className="w-full cursor-pointer rounded-2xl bg-[#132238] px-6 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg disabled:cursor-wait disabled:opacity-60"
          >
            {saving
              ? "저장 중..."
              : isPublished
                ? "저장하고 공개하기"
                : "임시저장하기"}
          </button>
        </aside>
      </div>
    </main>
  );
}