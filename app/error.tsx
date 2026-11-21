"use client";

export default function SiteError({
  unstable_retry,
}: {
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-zinc-900">
        페이지를 불러오지 못했습니다
      </h1>
      <p className="mt-3 text-sm text-zinc-600">
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={unstable_retry}
        className="mt-6 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white"
      >
        다시 시도
      </button>
    </main>
  );
}
