import { useEffect, useId, useRef, useState } from "react";

import { trackInquiryEvent } from "./inquiryAnalytics";

function formatPhone(value: string) {
  const numbers = value.replace(/[^\d]/g, "").slice(0, 11);

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, numbers.length - 4)}-${numbers.slice(-4)}`;
}

type Props = {
  onClose: () => void;
  apartmentSlug: string;
  apartmentName: string;
  kakaoUrl: string;
  placement: string;
};

export default function KakaoConsultDialog({
  onClose,
  apartmentSlug,
  apartmentName,
  kakaoUrl,
  placement,
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);
  const [complexName, setComplexName] = useState(apartmentName);
  const [phone, setPhone] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [thirdPartyAgreed, setThirdPartyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const trimmedName = complexName.trim();
    if (!trimmedName) {
      setErrorMessage("단지명을 입력해주세요.");
      return;
    }

    if (!/^01[016789]\d{7,8}$/.test(phone.replace(/\D/g, ""))) {
      setErrorMessage("휴대전화번호를 정확히 입력해주세요.");
      return;
    }

    if (!privacyAgreed) {
      setErrorMessage("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    if (!thirdPartyAgreed) {
      setErrorMessage("분양 상담을 위한 개인정보 제3자 제공에 동의해주세요.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    trackInquiryEvent("kakao_submit", apartmentSlug, placement);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentSlug,
          apartmentName: trimmedName,
          inquiryType: "kakao",
          phone,
          privacyAgreed,
          thirdPartyAgreed,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "상담 접수 중 오류가 발생했습니다.");
      }

      trackInquiryEvent("kakao_success", apartmentSlug, placement);
      window.location.assign(kakaoUrl);
    } catch (error) {
      trackInquiryEvent("kakao_error", apartmentSlug, placement);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "상담 접수 중 오류가 발생했습니다. 입력값을 확인한 뒤 다시 시도해주세요."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!submittingRef.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !submittingRef.current) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-[90dvh] overflow-y-auto rounded-t-3xl border-0 bg-white p-5 text-zinc-900 shadow-xl backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-3xl sm:p-6"
      style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-lg font-extrabold">
          카카오톡 상담
        </h2>
        <button
          type="button"
          aria-label="카카오톡 상담 닫기"
          disabled={isSubmitting}
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          ×
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        단지명과 연락처를 남기면 카카오톡 상담으로 연결됩니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block min-w-0">
          <p className="mb-2 text-xs font-medium text-zinc-700 sm:text-sm">단지명 (필수)</p>
          <input
            required
            maxLength={200}
            value={complexName}
            name="apartmentName"
            autoComplete="organization"
            onChange={(event) => setComplexName(event.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block min-w-0">
          <p className="mb-2 text-xs font-medium text-zinc-700 sm:text-sm">
            휴대전화 <span className="ml-1 text-rose-500">*</span>
          </p>
          <input
            required
            value={phone}
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="010-1234-5678"
            onChange={(event) => setPhone(formatPhone(event.target.value))}
            className="h-11 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-transparent bg-zinc-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
            <input
              type="checkbox"
              required
              checked={privacyAgreed}
              onChange={(event) => setPrivacyAgreed(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
            />
            <span className="text-xs leading-5 text-zinc-600">
              개인정보 수집·이용에 동의합니다.
              <strong className="ml-1 text-zinc-900">(필수)</strong>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-transparent bg-zinc-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
            <input
              type="checkbox"
              required
              checked={thirdPartyAgreed}
              onChange={(event) => setThirdPartyAgreed(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
            />
            <span className="min-w-0 text-xs leading-5 text-zinc-600">
              해당 분양 현장의 상담 담당자에게 개인정보 제공에 동의합니다.
              <strong className="ml-1 text-zinc-900">(필수)</strong>
              <details className="mt-2">
                <summary className="w-fit cursor-pointer rounded font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  자세히 보기
                </summary>
                <div className="mt-2 space-y-2 rounded-xl border border-zinc-200 bg-white p-3 text-[11px] leading-5 text-zinc-500">
                  <p>
                    <strong className="text-zinc-700">제공받는 자</strong>
                    <br />
                    이용자가 상담을 신청한 해당 단지의 시행사, 분양대행사, 모델하우스 또는 지정 상담 담당자
                  </p>
                  <p>
                    <strong className="text-zinc-700">제공 목적</strong>
                    <br />
                    카카오톡 상담 연결, 잔여세대·분양가·계약조건 안내
                  </p>
                  <p>
                    <strong className="text-zinc-700">제공 항목</strong>
                    <br />
                    단지명, 휴대전화번호
                  </p>
                  <p>
                    <strong className="text-zinc-700">보유 및 이용기간</strong>
                    <br />
                    상담 종료 또는 제공 목적 달성 후 파기
                  </p>
                  <p>
                    <strong className="text-zinc-700">동의 거부권</strong>
                    <br />
                    동의를 거부할 수 있으나 카카오톡 상담 연결이 제한될 수 있습니다.
                  </p>
                </div>
              </details>
            </span>
          </label>
        </div>

        {errorMessage && (
          <div role="status" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-semibold leading-5 text-rose-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#FEE500] px-3 py-3 text-sm font-bold text-zinc-900 transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "접수 중..." : "카카오톡 상담 시작"}
        </button>
      </form>
    </dialog>
  );
}
