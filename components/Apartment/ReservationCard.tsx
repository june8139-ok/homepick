"use client";

import { ChatConsultLinks, trackInquiryEvent } from "./InquiryActions";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type ReservationMode =
  | "sale"
  | "subscription";

type ReservationCardProps = {
  apartmentSlug: string;
  apartmentName: string;

  mode?: ReservationMode;
  listingStage?: string;

  phoneNumber?: string;
  kakaoUrl?: string;

  floorPlanNames?: string[];
};

type ReservationForm = {
  customerName: string;
  phone: string;
  interestedType: string;
  message: string;
  privacyAgreed: boolean;
  thirdPartyAgreed: boolean;
};

const initialForm: ReservationForm = {
  customerName: "",
  phone: "",
  interestedType: "",
  message: "",
  privacyAgreed: false,
  thirdPartyAgreed: false,
};

function formatPhoneInput(
  value: string
) {
  const numbers = value
    .replace(/[^\d]/g, "")
    .slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(
      0,
      3
    )}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(
    0,
    3
  )}-${numbers.slice(
    3,
    numbers.length - 4
  )}-${numbers.slice(-4)}`;
}

function FormInput({
  label,
  value,
  placeholder,
  required = false,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  inputMode?:
    | "text"
    | "tel"
    | "email"
    | "numeric";
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block min-w-0">
      <p className="mb-2 text-xs font-medium text-zinc-700 sm:text-sm">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </p>

      <input
        required={required}
        value={value}
        type={inputMode === "tel" ? "tel" : "text"}
        autoComplete={inputMode === "tel" ? "tel" : "name"}
        name={inputMode === "tel" ? "phone" : "customerName"}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-11 w-full min-w-0
          rounded-xl border
          border-zinc-200 bg-white
          px-3 text-base text-zinc-900
          outline-none transition
          placeholder:text-zinc-400
          hover:border-zinc-300
          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-100
          sm:h-12 sm:px-4 sm:text-base
        "
      />
    </label>
  );
}

export default function ReservationCard({
  apartmentSlug,
  apartmentName,
  mode = "sale",
  listingStage,
  phoneNumber,
  kakaoUrl,
  floorPlanNames = [],
}: ReservationCardProps) {
  const successRef = useRef<HTMLDivElement>(null);
  const [inquiryId, setInquiryId] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const startedRef = useRef(false);
  const submittingRef = useRef(false);

  const [form, setForm] =
    useState<ReservationForm>(
      initialForm
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    resultMessage,
    setResultMessage,
  ] = useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const isSubscription =
    mode === "subscription";

  // Explicit opt-in by the parent stage prevents benefit banners on subscription pages.
  const showVisitBenefit = !isSubscription && listingStage === "firstCome";
  useEffect(() => {
    if (isSuccess) successRef.current?.focus();
  }, [isSuccess]);

  const copyInquiry = async () => {
    const text = `관심 단지: ${apartmentName}\n접수번호: ${inquiryId}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("복사했습니다. 채팅창에 붙여넣어 보내주세요.");
    } catch {
      setCopyMessage("복사하지 못했습니다. 아래 단지명과 접수번호를 선택해 복사해주세요.");
    }
  };

  const inquiryType =
    isSubscription
      ? "subscription-alert"
      : "visit";

  const updateForm = <
    Key extends keyof ReservationForm,
  >(
    key: Key,
    value: ReservationForm[Key]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    if (form.customerName.trim().length < 2 || !/^01[016789]\d{7,8}$/.test(form.phone.replace(/\D/g, ""))) {
      setIsSuccess(false);
      setResultMessage("이름을 2자 이상, 휴대전화번호를 정확히 입력해주세요.");
      return;
    }

    if (!form.privacyAgreed) {
      setIsSuccess(false);

      setResultMessage(
        "개인정보 수집 및 이용에 동의해주세요."
      );

      return;
    }

    if (
      !isSubscription &&
      !form.thirdPartyAgreed
    ) {
      setIsSuccess(false);

      setResultMessage(
        "분양 상담을 위한 개인정보 제3자 제공에 동의해주세요."
      );

      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    trackInquiryEvent("inquiry_submit", apartmentSlug, "form");
    setResultMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch(
        "/api/inquiry",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            apartmentSlug,
            apartmentName,
            inquiryType,

            customerName:
              form.customerName.trim(),

            phone: form.phone,

            interestedType:
              form.interestedType,

            visitDate: "",

            message: form.message,

            privacyAgreed:
              form.privacyAgreed,

            thirdPartyAgreed:
              isSubscription
                ? false
                : form.thirdPartyAgreed,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
            "신청 처리 중 오류가 발생했습니다."
        );
      }

      setInquiryId(typeof result.inquiryId === "string" || typeof result.inquiryId === "number"
        ? String(result.inquiryId) : "");
      setCopyMessage("");
      setIsSuccess(true);
      trackInquiryEvent("inquiry_success", apartmentSlug, "form");

      setResultMessage(isSubscription
        ? "청약일정 알림 신청이 접수되었습니다."
        : "상담신청이 접수되었습니다. 담당자가 연락드려 최신 조건과 방문 일정을 안내합니다.");

      setForm(initialForm);
    } catch (error) {
      trackInquiryEvent("inquiry_error", apartmentSlug, "form");
      setIsSuccess(false);

      setResultMessage(
        error instanceof Error
          ? error.message
          : "신청 처리 중 오류가 발생했습니다."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const normalizedPhone =
    phoneNumber?.replace(
      /[^\d]/g,
      ""
    );

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm sm:mt-8 sm:rounded-3xl">
      <div
        className={[
          "px-4 py-5 text-white sm:px-7 sm:py-7",
          isSubscription
            ? "bg-blue-700"
            : "bg-zinc-900",
        ].join(" ")}
      >
        <p
          className={[
            "text-xs font-bold sm:text-sm",
            isSubscription
              ? "text-blue-200"
              : "text-emerald-300",
          ].join(" ")}
        >
          {isSubscription
            ? "SUBSCRIPTION ALERT"
            : "CONSULTATION"}
        </p>

        <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
          {isSubscription
            ? "청약일정 알림 신청"
            : "상담신청"}
        </h2>

        <p className="mt-2 max-w-3xl break-keep text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">
          {isSubscription
            ? `${apartmentName}의 청약 일정과 주요 정보를 안내받아보세요.`
            : `${apartmentName}의 잔여세대와 최신 계약조건을 안내받으세요. 방문 일정은 상담 후 결정할 수 있습니다.`}
        </p>
        {showVisitBenefit && (
          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 sm:p-5">
            <p className="inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-extrabold text-zinc-900">집눈 방문예약 특별 혜택</p>
            <h3 className="mt-3 break-keep text-lg font-extrabold leading-7 text-white sm:text-xl">
              집눈에서 사전 예약하고 방문하면<br />
              <span className="text-amber-200">집눈이 상품권을 드립니다</span>
            </h3>
            <p className="mt-2 break-keep text-xs leading-5 text-white/80 sm:text-sm sm:leading-6">집눈을 통해 방문예약 후 모델하우스 실제 방문을 완료한 고객에게 집눈에서 직접 지급합니다.</p>
            <p className="mt-3 text-xs font-bold leading-5 text-amber-100">방문 확인 후 1팀당 상품권 1개 · 계약 여부와 관계없이 지급</p>
            <p className="mt-2 text-xs leading-5 text-white/65">상담 신청만으로는 지급되지 않습니다. 방문 일정은 상담 후 확정하며, 채팅 예약 시에도 집눈 방문예약임을 알려주세요.</p>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-7">
        {isSuccess ? (
          <div ref={successRef} tabIndex={-1} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <h3 className="text-lg font-extrabold text-emerald-800">{isSubscription ? "청약일정 알림 신청이 완료되었습니다" : "상담신청이 완료되었습니다"}</h3>
            <p role="status" className="mt-2 text-sm leading-6 text-emerald-900">{resultMessage}</p>
            {inquiryId && <>
              <div className="mt-4 select-text rounded-xl bg-white p-3 text-sm leading-6 text-zinc-700">
                <p>{apartmentName}</p>
                <p className="break-all">접수번호: {inquiryId}</p>
              </div>
              <button type="button" onClick={copyInquiry} className="mt-3 min-h-11 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">단지명·접수번호 복사</button>
              <p className="mt-2 text-xs leading-5 text-zinc-600">채팅 상담을 이어가려면 복사한 내용을 채팅창에 보내주세요. 신청 내역을 확인하는 데 도움이 됩니다.</p>
              {copyMessage && <p role="status" className="mt-2 text-xs leading-5 text-emerald-800">{copyMessage}</p>}
            </>}
            {showVisitBenefit && <p className="mt-4 text-xs leading-5 text-zinc-600">방문 일정은 담당자와 확정해주세요. 상품권은 실제 방문 확인 후 집눈에서 1팀당 1개 지급합니다.</p>}
            <button type="button" onClick={() => {
              setIsSuccess(false); setResultMessage(""); setInquiryId(""); setCopyMessage(""); startedRef.current = false;
            }} className="mt-4 block min-h-11 text-sm font-semibold text-zinc-600 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">새 상담 신청하기</button>
          </div>
        ) : <form
          onSubmit={handleSubmit}
          onFocusCapture={() => {
            if (!startedRef.current) {
              startedRef.current = true;
              trackInquiryEvent("inquiry_start", apartmentSlug, "form");
            }
          }}
          className="space-y-4 sm:space-y-5"
        >
          {/* 이름 + 휴대전화 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="이름"
              required
              value={
                form.customerName
              }
              placeholder="이름"
              onChange={(value) =>
                updateForm(
                  "customerName",
                  value
                )
              }
            />

            <FormInput
              label="휴대전화"
              required
              value={form.phone}
              placeholder="010-1234-5678"
              inputMode="tel"
              onChange={(value) =>
                updateForm(
                  "phone",
                  formatPhoneInput(
                    value
                  )
                )
              }
            />
          </div>

          <details className="rounded-xl border border-zinc-200 p-4">
            <summary className="cursor-pointer text-sm font-bold text-zinc-600">관심타입·문의내용 추가하기 (선택)</summary>
            <div className="mt-4 space-y-4">
          {/* 선택 입력 */}
          <div>
            <label className="block min-w-0">
              <p className="mb-2 text-xs font-medium text-zinc-700 sm:text-sm">
                관심 평형·타입
              </p>

              {floorPlanNames.length >
              0 ? (
                <select
                  value={
                    form.interestedType
                  }
                  onChange={(event) =>
                    updateForm(
                      "interestedType",
                      event.target.value
                    )
                  }
                  className="
                    h-11 w-full min-w-0
                    cursor-pointer rounded-xl
                    border border-zinc-200
                    bg-white px-3 text-base
                    text-zinc-900 outline-none
                    transition hover:border-zinc-300
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    sm:h-12 sm:px-4 sm:text-base
                  "
                >
                  <option value="">
                    타입 선택
                  </option>

                  {floorPlanNames.map(
                    (name) => (
                      <option
                        key={name}
                        value={name}
                      >
                        {name}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  value={
                    form.interestedType
                  }
                  placeholder="예: 84A"
                  onChange={(event) =>
                    updateForm(
                      "interestedType",
                      event.target.value
                    )
                  }
                  className="
                    h-11 w-full min-w-0
                    rounded-xl border
                    border-zinc-200 bg-white
                    px-3 text-base outline-none
                    transition
                    placeholder:text-zinc-400
                    hover:border-zinc-300
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-100
                    sm:h-12 sm:px-4 sm:text-base
                  "
                />
              )}
            </label>


          </div>

          <label className="block">
            <p className="mb-2 text-xs font-medium text-zinc-700 sm:text-sm">
              {isSubscription
                ? "알림 요청사항"
                : "문의내용"}
            </p>

            <textarea
              value={form.message}
              placeholder={
                isSubscription
                  ? "궁금한 청약 일정이나 주택형을 입력해주세요."
                  : "궁금한 계약조건이나 관심타입을 입력해주세요."
              }
              onChange={(event) =>
                updateForm(
                  "message",
                  event.target.value
                )
              }
              rows={3}
              className="
                w-full resize-none
                rounded-xl border
                border-zinc-200 bg-white
                px-3 py-3 text-base
                outline-none transition
                placeholder:text-zinc-400
                hover:border-zinc-300
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
                sm:px-4 sm:text-base
              "
            />
          </label>

            </div>
          </details>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-transparent bg-zinc-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40 sm:gap-3 sm:rounded-2xl sm:p-4">
              <input
                type="checkbox"
                required
                checked={
                  form.privacyAgreed
                }
                onChange={(event) =>
                  updateForm(
                    "privacyAgreed",
                    event.target.checked
                  )
                }
                className="
                  mt-0.5 h-4 w-4
                  shrink-0 cursor-pointer
                  accent-emerald-600
                  sm:mt-1
                "
              />

              <span className="text-xs leading-5 text-zinc-600 sm:text-sm sm:leading-6">
                개인정보 수집·이용에
                동의합니다.

                <strong className="ml-1 text-zinc-900">
                  (필수)
                </strong>
              </span>
            </label>

            {!isSubscription && (
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-transparent bg-zinc-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40 sm:gap-3 sm:rounded-2xl sm:p-4">
                <input
                  type="checkbox"
                  required
                  checked={
                    form.thirdPartyAgreed
                  }
                  onChange={(event) =>
                    updateForm(
                      "thirdPartyAgreed",
                      event.target.checked
                    )
                  }
                  className="
                    mt-0.5 h-4 w-4
                    shrink-0 cursor-pointer
                    accent-emerald-600
                    sm:mt-1
                  "
                />

                <span className="min-w-0 text-xs leading-5 text-zinc-600 sm:text-sm sm:leading-6">
                  해당 분양 현장의 상담
                  담당자에게 개인정보
                  제공에 동의합니다.

                  <strong className="ml-1 text-zinc-900">
                    (필수)
                  </strong>

                  <details className="mt-2">
                    <summary className="w-fit cursor-pointer rounded font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                      자세히 보기
                    </summary>

                    <div className="mt-2 space-y-2 rounded-xl border border-zinc-200 bg-white p-3 text-[11px] leading-5 text-zinc-500 sm:text-xs sm:leading-6">
                      <p>
                        <strong className="text-zinc-700">
                          제공받는 자
                        </strong>
                        <br />
                        이용자가 상담을
                        신청한 해당 단지의
                        시행사, 분양대행사,
                        모델하우스 또는
                        지정 상담 담당자
                      </p>

                      <p>
                        <strong className="text-zinc-700">
                          제공 목적
                        </strong>
                        <br />
                        모델하우스 방문예약
                        확인, 분양 상담,
                        잔여세대·분양가·
                        계약조건 안내
                      </p>

                      <p>
                        <strong className="text-zinc-700">
                          제공 항목
                        </strong>
                        <br />
                        이름, 휴대전화번호,
                        관심 평형 및 문의내용
                      </p>

                      <p>
                        <strong className="text-zinc-700">
                          보유 및 이용기간
                        </strong>
                        <br />
                        상담 종료 또는 제공
                        목적 달성 후 파기
                      </p>

                      <p>
                        <strong className="text-zinc-700">
                          동의 거부권
                        </strong>
                        <br />
                        동의를 거부할 수
                        있으나 방문예약 및
                        담당자 상담 연결이
                        제한될 수 있습니다.
                      </p>
                    </div>
                  </details>
                </span>
              </label>
            )}
          </div>

          {resultMessage && (
            <div
              role="status"
              className={[
                "rounded-xl border px-3 py-3 text-xs font-semibold leading-5 sm:rounded-2xl sm:px-4 sm:text-sm sm:leading-6",
                isSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-600",
              ].join(" ")}
            >
              {resultMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              "w-full cursor-pointer rounded-xl px-4 py-3.5 text-sm font-bold text-white sm:rounded-2xl sm:px-6 sm:py-4",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-lg",
              "active:translate-y-0 active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-wait disabled:opacity-60",
              isSubscription
                ? "bg-blue-600 hover:bg-blue-500 focus-visible:ring-blue-500"
                : "bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-500",
            ].join(" ")}
          >
            {isSubmitting
              ? "신청 접수 중..."
              : isSubscription
                ? "청약일정 알림 신청하기"
                : "상담신청하기"}
          </button>
        </form>}

        <div className="mt-4">
          <ChatConsultLinks apartmentSlug={apartmentSlug} placement="form" kakaoUrl={kakaoUrl} />
          {normalizedPhone && (
            <a href={`tel:${normalizedPhone}`} className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-3 py-3 text-sm font-bold text-zinc-700">전화상담</a>
          )}
        </div>
      </div>
    </section>
  );
}
