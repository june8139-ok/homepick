"use client";

import {
  useEffect,
  useState,
} from "react";

type SyncResult = {
  fetched: number;
  relevant: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  priceSynced: number;
  priceMissing: number;
  errors: string[];
};

type SavedSyncData = {
  executedAt: string;
  result: SyncResult;
};

type SyncResponse = {
  success: boolean;
  message?: string;
  executedAt?: string;
  result?: SyncResult;
};

const STORAGE_KEY =
  "homepick-applyhome-last-sync";

function formatSyncDate(
  value?: string | null
) {
  if (!value) {
    return "실행 기록 없음";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "실행 기록 없음";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  ).format(date);
}

export default function ApplyHomeSyncCard() {
  const [
    syncing,
    setSyncing,
  ] = useState(false);

  const [
    lastSync,
    setLastSync,
  ] =
    useState<SavedSyncData | null>(
      null
    );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(
          saved
        ) as SavedSyncData;

      if (
        parsed?.executedAt &&
        parsed?.result
      ) {
        setLastSync(
          parsed
        );
      }
    } catch (error) {
      console.error(
        "동기화 기록 불러오기 오류:",
        error
      );
    }
  }, []);

  const handleSync =
    async () => {
      if (syncing) {
        return;
      }

      const confirmed =
        window.confirm(
          [
            "청약홈 최신 공고와 가격 정보를 지금 동기화할까요?",
            "",
            "신규 단지 등록 및 기존 청약 단지의",
            "일정·가격·세대수 정보가 갱신됩니다.",
          ].join("\n")
        );

      if (!confirmed) {
        return;
      }

      setSyncing(true);
      setMessage("");
      setErrorMessage("");

      try {
        const response =
          await fetch(
            "/api/admin/applyhome/sync",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as
            SyncResponse;

        if (
          !response.ok ||
          !data.success ||
          !data.result
        ) {
          throw new Error(
            data.message ||
              "동기화에 실패했습니다."
          );
        }

        const savedData: SavedSyncData =
          {
            executedAt:
              data.executedAt ??
              new Date().toISOString(),

            result:
              data.result,
          };

        setLastSync(
          savedData
        );

        setMessage(
          data.message ||
            "청약홈 동기화가 완료되었습니다."
        );

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            savedData
          )
        );

        /*
         * 동기화된 단지 수와 최근 수정 목록을
         * 다시 불러오기 위해 페이지를 새로고침합니다.
         * 결과는 localStorage에 저장되어 새로고침 후에도 유지됩니다.
         */
        window.setTimeout(
          () => {
            window.location.reload();
          },
          900
        );
      } catch (error) {
        console.error(
          "청약홈 동기화 실행 오류:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "청약홈 동기화 중 오류가 발생했습니다."
        );
      } finally {
        setSyncing(false);
      }
    };

  const result =
    lastSync?.result;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-extrabold text-emerald-600">
              APPLYHOME SYNC
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#132238]">
              청약홈 자동 동기화
            </h2>

            <p className="mt-2 max-w-2xl break-keep text-sm leading-6 text-zinc-500">
              신규 청약 공고와 청약 일정,
              평형별 분양가 및 공급
              세대수를 청약홈에서 다시
              불러옵니다.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleSync
            }
            disabled={
              syncing
            }
            className="
              inline-flex min-h-12
              shrink-0 cursor-pointer
              items-center justify-center
              rounded-xl bg-emerald-600
              px-6 text-sm font-black
              text-white transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-emerald-700
              hover:shadow-lg
              active:translate-y-0
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500
              focus-visible:ring-offset-2
              disabled:cursor-wait
              disabled:opacity-60
            "
          >
            {syncing
              ? "청약홈 동기화 중..."
              : "지금 동기화 실행"}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400">
              최근 성공
            </p>

            <p className="mt-1 text-sm font-extrabold text-zinc-800">
              {formatSyncDate(
                lastSync?.executedAt
              )}
            </p>
          </div>

          {result && (
            <span
              className={[
                "w-fit rounded-full px-3 py-1.5 text-xs font-bold",
                result.failed > 0
                  ? "bg-rose-50 text-rose-700"
                  : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {result.failed > 0
                ? `일부 실패 ${result.failed}건`
                : "정상 완료"}
            </span>
          )}
        </div>

        {result ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 xl:grid-cols-8">
              <ResultCard
                label="전체 조회"
                value={result.fetched}
                tone="zinc"
              />

              <ResultCard
                label="반영 대상"
                value={result.relevant}
                tone="cyan"
              />

              <ResultCard
                label="기간 제외"
                value={result.skipped}
                tone="slate"
              />

              <ResultCard
                label="신규 등록"
                value={result.inserted}
                tone="blue"
              />

              <ResultCard
                label="정보 수정"
                value={result.updated}
                tone="emerald"
              />

              <ResultCard
                label="가격 연동"
                value={result.priceSynced}
                tone="violet"
              />

              <ResultCard
                label="가격 미제공"
                value={result.priceMissing}
                tone="amber"
              />

              <ResultCard
                label="실패"
                value={result.failed}
                tone="rose"
              />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <StatusSummary
                label="목록 수집 결과"
                value={`${result.fetched.toLocaleString("ko-KR")}건 조회 · ${result.relevant.toLocaleString("ko-KR")}건 반영 대상`}
                success={result.fetched > 0}
              />

              <StatusSummary
                label="가격 수집 결과"
                value={`${result.priceSynced.toLocaleString("ko-KR")}건 연동 · ${result.priceMissing.toLocaleString("ko-KR")}건 미제공`}
                success={result.priceMissing === 0}
              />
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center">
            <p className="font-bold text-zinc-700">
              아직 관리자 화면에서
              실행한 동기화 기록이 없습니다.
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              위의 동기화 버튼을 누르면
              실행 결과가 이곳에 표시됩니다.
            </p>
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-800">
              {message}
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700/80">
              최신 단지 현황을 다시
              불러오고 있습니다.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-bold text-rose-700">
              동기화 실패
            </p>

            <p className="mt-1 break-all text-xs leading-5 text-rose-600">
              {errorMessage}
            </p>
          </div>
        )}

        {result &&
          result.errors.length >
            0 && (
            <details className="group mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-amber-800">
                <span>
                  실패 원인 및 오류 메시지
                  확인
                </span>

                <span className="transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-amber-200 px-4 py-3">
                <ul className="space-y-2">
                  {result.errors.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={`${item}-${index}`}
                        className="break-all text-xs leading-5 text-amber-800"
                      >
                        • {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </details>
          )}

        <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3">
          <p className="text-xs font-bold text-blue-700">
            운영 안내
          </p>

          <p className="mt-1 break-keep text-xs leading-5 text-blue-900/70">
            일반 단지 정보와 이미지를
            관리자에서 수정한 경우에는
            별도 동기화가 필요하지
            않습니다. 청약홈 수집 로직이나
            가격 연동 코드를 수정했을 때,
            또는 신규 공고를 즉시 반영할
            때 실행하세요.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatusSummary({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success: boolean;
}) {
  return (
    <article
      className={[
        "rounded-2xl border px-4 py-3",
        success
          ? "border-emerald-100 bg-emerald-50"
          : "border-amber-200 bg-amber-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={[
            "text-xs font-extrabold",
            success
              ? "text-emerald-700"
              : "text-amber-700",
          ].join(" ")}
        >
          {label}
        </p>

        <span
          className={[
            "rounded-full px-2 py-1 text-[10px] font-black",
            success
              ? "bg-white text-emerald-700"
              : "bg-white text-amber-700",
          ].join(" ")}
        >
          {success ? "정상" : "확인 필요"}
        </span>
      </div>

      <p className="mt-1.5 break-keep text-xs font-bold leading-5 text-zinc-700">
        {value}
      </p>
    </article>
  );
}

function ResultCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone:
    | "zinc"
    | "slate"
    | "cyan"
    | "blue"
    | "emerald"
    | "violet"
    | "amber"
    | "rose";
}) {
  const styles = {
    zinc:
      "border-zinc-200 bg-zinc-50 text-zinc-900",

    slate:
      "border-slate-200 bg-slate-50 text-slate-700",

    cyan:
      "border-cyan-100 bg-cyan-50 text-cyan-700",

    blue:
      "border-blue-100 bg-blue-50 text-blue-700",

    emerald:
      "border-emerald-100 bg-emerald-50 text-emerald-700",

    violet:
      "border-violet-100 bg-violet-50 text-violet-700",

    amber:
      "border-amber-100 bg-amber-50 text-amber-700",

    rose:
      "border-rose-100 bg-rose-50 text-rose-700",
  }[tone];

  return (
    <article
      className={[
        "min-w-0 rounded-xl border p-3 sm:rounded-2xl sm:p-4",
        styles,
      ].join(" ")}
    >
      <p className="truncate text-[10px] font-bold opacity-70 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black sm:text-3xl">
        {value}
        <span className="ml-1 text-xs font-bold opacity-70">
          건
        </span>
      </p>
    </article>
  );
}