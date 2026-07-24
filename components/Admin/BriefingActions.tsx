"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "../../lib/supabase/browser";

export default function BriefingActions({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [
    working,
    setWorking,
  ] = useState(false);

  async function togglePublished() {
    if (working) {
      return;
    }

    const nextPublished =
      !isPublished;

    const confirmed =
      window.confirm(
        nextPublished
          ? "이 브리핑을 홈페이지에 공개할까요?"
          : "이 브리핑을 비공개로 전환할까요?"
      );

    if (!confirmed) {
      return;
    }

    setWorking(true);

    try {
      const {
        error,
      } = await supabase
        .from("briefings")
        .update({
          is_published:
            nextPublished,

          published_at:
            nextPublished
              ? new Date().toISOString()
              : null,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert(
        nextPublished
          ? "브리핑이 홈페이지에 공개되었습니다."
          : "브리핑이 비공개로 전환되었습니다."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "브리핑 공개 상태 변경 오류:",
        error
      );

      alert(
        error instanceof Error
          ? `상태 변경에 실패했습니다.\n\n${error.message}`
          : "상태 변경 중 오류가 발생했습니다."
      );
    } finally {
      setWorking(false);
    }
  }

  async function removeBriefing() {
    if (working) {
      return;
    }

    const confirmed =
      window.confirm(
        "이 브리핑을 삭제할까요?\n삭제하면 복구할 수 없습니다."
      );

    if (!confirmed) {
      return;
    }

    setWorking(true);

    try {
      const {
        error,
      } = await supabase
        .from("briefings")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert(
        "브리핑이 삭제되었습니다."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "브리핑 삭제 오류:",
        error
      );

      alert(
        error instanceof Error
          ? `삭제에 실패했습니다.\n\n${error.message}`
          : "삭제 중 오류가 발생했습니다."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={working}
        onClick={
          togglePublished
        }
        className={[
          "cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          "disabled:cursor-wait disabled:opacity-50",
          isPublished
            ? "border-zinc-200 text-zinc-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            : "border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50",
        ].join(" ")}
      >
        {working
          ? "처리 중..."
          : isPublished
            ? "비공개"
            : "공개"}
      </button>

      <button
        type="button"
        disabled={working}
        onClick={
          removeBriefing
        }
        className="
          cursor-pointer rounded-lg
          border border-rose-200
          px-3 py-2 text-xs
          font-bold text-rose-600
          transition
          hover:bg-rose-50
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-rose-500
          focus-visible:ring-offset-2
          disabled:cursor-wait
          disabled:opacity-50
        "
      >
        삭제
      </button>
    </div>
  );
}