"use client";

import {
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

  phoneNumber?: string;
  kakaoUrl?: string;

  floorPlanNames?: string[];
};

type ReservationForm = {
  customerName: string;
  phone: string;
  interestedType: string;
  visitDate: string;
  message: string;
  privacyAgreed: boolean;
  thirdPartyAgreed: boolean;
};

const initialForm: ReservationForm = {
  customerName: "",
  phone: "",
  interestedType: "",
  visitDate: "",
  message: "",
  privacyAgreed: false,
  thirdPartyAgreed: false,
};

function getTodayDate() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

function formatDisplayDate(
  value: string
) {
  if (!value) {
    return "날짜 선택";
  }

  const [year, month, day] =
    value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${Number(month)}월 ${Number(
    day
  )}일`;
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
          px-3 text-xs text-zinc-900
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
  phoneNumber,
  kakaoUrl,
  floorPlanNames = [],
}: ReservationCardProps) {
  const dateInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

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

  const openDatePicker = () => {
    const input =
      dateInputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    try {
      input.showPicker?.();
    } catch {
      // 기본 날짜 입력 동작 유지
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
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

    setIsSubmitting(true);
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
              form.customerName,

            phone: form.phone,

            interestedType:
              form.interestedType,

            visitDate:
              isSubscription
                ? ""
                : form.visitDate,

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

      if (!response.ok) {
        throw new Error(
          result.message ||
            "신청 처리 중 오류가 발생했습니다."
        );
      }

      setIsSuccess(true);

      setResultMessage(
        result.message ||
          (isSubscription
            ? "청약일정 알림 신청이 접수되었습니다."
            : "방문예약이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.")
      );

      setForm(initialForm);
    } catch (error) {
      setIsSuccess(false);

      setResultMessage(
        error instanceof Error
          ? error.message
          : "신청 처리 중 오류가 발생했습니다."
      );
    } finally {
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
            : "VISIT RESERVATION"}
        </p>

        <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
          {isSubscription
            ? "청약일정 알림 신청"
            : "방문예약 신청"}
        </h2>

        <p className="mt-2 max-w-3xl break-keep text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">
          {isSubscription
            ? `${apartmentName}의 청약 일정과 주요 정보를 안내받아보세요.`
            : `${apartmentName}의 잔여 호실과 최신 계약조건을 방문 상담으로 확인해보세요.`}
        </p>
      </div>

      <div className="p-4 sm:p-7">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5"
        >
          {/* 이름 + 휴대전화 */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
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

          {/* 관심 타입 + 희망 방문일 */}
          <div
            className={[
              "grid gap-2 sm:gap-4",
              isSubscription
                ? "grid-cols-1"
                : "grid-cols-2",
            ].join(" ")}
          >
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
                    bg-white px-3 text-xs
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
                    px-3 text-xs outline-none
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

            {!isSubscription && (
              <div className="min-w-0">
                <p className="mb-2 text-xs font-medium text-zinc-700 sm:text-sm">
                  희망 방문일

                  <span className="ml-1 text-rose-500">
                    *
                  </span>
                </p>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={
                    openDatePicker
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();
                      openDatePicker();
                    }
                  }}
                  className="
                    group relative flex
                    h-11 min-w-0 cursor-pointer
                    items-center rounded-xl
                    border border-zinc-200
                    bg-white px-3 transition-all
                    hover:border-emerald-400
                    hover:bg-emerald-50/30
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-500
                    focus-visible:ring-offset-2
                    sm:h-12 sm:px-4
                  "
                >
                  <p
                    className={[
                      "min-w-0 flex-1 truncate text-xs font-semibold sm:text-sm",
                      form.visitDate
                        ? "text-zinc-900"
                        : "text-zinc-400",
                    ].join(" ")}
                  >
                    {formatDisplayDate(
                      form.visitDate
                    )}
                  </p>

                  <span
                    aria-hidden="true"
                    className="
                      ml-1 flex h-7 w-7
                      shrink-0 items-center
                      justify-center rounded-lg
                      bg-zinc-100 text-sm
                      transition
                      group-hover:bg-emerald-100
                      sm:ml-3 sm:h-9 sm:w-9
                      sm:rounded-xl sm:text-lg
                    "
                  >
                    📅
                  </span>

                  <input
                    ref={dateInputRef}
                    type="date"
                    required
                    min={getTodayDate()}
                    value={
                      form.visitDate
                    }
                    onChange={(event) =>
                      updateForm(
                        "visitDate",
                        event.target.value
                      )
                    }
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      try {
                        event.currentTarget
                          .showPicker?.();
                      } catch {
                        // 기본 날짜 입력 동작 유지
                      }
                    }}
                    aria-label="희망 방문일 선택"
                    className="
                      absolute inset-0
                      h-full w-full
                      cursor-pointer opacity-0
                    "
                  />
                </div>
              </div>
            )}
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
                  : "희망 방문시간이나 문의사항을 입력해주세요."
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
                px-3 py-3 text-xs
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
                        관심 평형, 희망
                        방문일 및 문의내용
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
                : "bg-zinc-900 hover:bg-emerald-600 focus-visible:ring-emerald-500",
            ].join(" ")}
          >
            {isSubmitting
              ? "신청 접수 중..."
              : isSubscription
                ? "청약일정 알림 신청하기"
                : "방문예약 신청하기"}
          </button>
        </form>

        {(kakaoUrl ||
          normalizedPhone) && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
            {kakaoUrl && (
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  flex min-h-11 cursor-pointer
                  items-center justify-center
                  rounded-xl bg-[#FEE500]
                  px-3 py-3 text-xs font-bold
                  text-zinc-900 transition
                  hover:-translate-y-0.5
                  hover:brightness-95
                  hover:shadow-md
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-yellow-400
                  focus-visible:ring-offset-2
                  sm:min-h-12 sm:rounded-2xl
                  sm:px-5 sm:text-sm
                "
              >
                카카오톡 상담
              </a>
            )}

            {normalizedPhone && (
              <a
                href={`tel:${normalizedPhone}`}
                className="
                  flex min-h-11 cursor-pointer
                  items-center justify-center
                  rounded-xl border
                  border-zinc-300 bg-white
                  px-3 py-3 text-xs font-bold
                  text-zinc-800 transition
                  hover:-translate-y-0.5
                  hover:border-emerald-300
                  hover:bg-emerald-50
                  hover:text-emerald-700
                  hover:shadow-md
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                  sm:min-h-12 sm:rounded-2xl
                  sm:px-5 sm:text-sm
                "
              >
                전화상담
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}