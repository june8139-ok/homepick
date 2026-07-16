"use client";

import { useState } from "react";

type ReservationMode = "sale" | "subscription";

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
};

const initialForm: ReservationForm = {
  customerName: "",
  phone: "",
  interestedType: "",
  visitDate: "",
  message: "",
  privacyAgreed: false,
};

function formatPhoneInput(value: string) {
  const numbers = value
    .replace(/[^\d]/g, "")
    .slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(
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
  inputMode?: "text" | "tel" | "email" | "numeric";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-medium text-zinc-700">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </p>

      <input
        required={required}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-zinc-500"
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
  const [form, setForm] =
    useState<ReservationForm>(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [resultMessage, setResultMessage] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const isSubscription =
    mode === "subscription";

  const inquiryType = isSubscription
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

    if (isSubmitting) return;

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

            phone:
              form.phone,

            interestedType:
              form.interestedType,

            visitDate:
              isSubscription
                ? ""
                : form.visitDate,

            message:
              form.message,

            privacyAgreed:
              form.privacyAgreed,
          }),
        }
      );

      const result = await response.json();

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
            : "방문예약이 접수되었습니다.")
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
    phoneNumber?.replace(/[^\d]/g, "");

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div
        className={[
          "px-6 py-7 text-white",
          isSubscription
            ? "bg-blue-700"
            : "bg-zinc-900",
        ].join(" ")}
      >
        <p
          className={[
            "text-sm font-bold",
            isSubscription
              ? "text-blue-200"
              : "text-emerald-300",
          ].join(" ")}
        >
          {isSubscription
            ? "SUBSCRIPTION ALERT"
            : "VISIT RESERVATION"}
        </p>

        <h2 className="mt-1 text-2xl font-extrabold">
          {isSubscription
            ? "청약일정 알림 신청"
            : "방문예약 신청"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/75">
          {isSubscription
            ? `${apartmentName}의 청약 일정과 주요 정보를 안내받아보세요.`
            : `${apartmentName}의 잔여 호실과 최신 계약조건을 방문 상담으로 확인해보세요.`}
        </p>
      </div>

      <div className="p-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="이름"
              required
              value={form.customerName}
              placeholder="이름을 입력해주세요"
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
                  formatPhoneInput(value)
                )
              }
            />
          </div>

          <label className="block">
            <p className="mb-2 text-sm font-medium text-zinc-700">
              관심 평형·타입
            </p>

            {floorPlanNames.length > 0 ? (
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
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 outline-none transition focus:border-zinc-500"
              >
                <option value="">
                  관심 타입 선택
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
                className="h-12 w-full rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-zinc-500"
              />
            )}
          </label>

          {!isSubscription && (
            <label className="block">
              <p className="mb-2 text-sm font-medium text-zinc-700">
                희망 방문일
                <span className="ml-1 text-rose-500">
                  *
                </span>
              </p>

              <input
                type="date"
                required
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                value={form.visitDate}
                onChange={(event) =>
                  updateForm(
                    "visitDate",
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-zinc-200 px-3 outline-none transition focus:border-zinc-500"
              />
            </label>
          )}

          <label className="block">
            <p className="mb-2 text-sm font-medium text-zinc-700">
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
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-3 outline-none transition focus:border-zinc-500"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-zinc-50 p-4">
            <input
              type="checkbox"
              checked={
                form.privacyAgreed
              }
              onChange={(event) =>
                updateForm(
                  "privacyAgreed",
                  event.target.checked
                )
              }
              className="mt-1 h-4 w-4"
            />

            <span className="text-sm leading-6 text-zinc-600">
              상담 및 정보 안내를 위한
              이름, 휴대전화번호 등
              개인정보 수집과 이용에
              동의합니다.
              <strong className="ml-1 text-zinc-900">
                (필수)
              </strong>
            </span>
          </label>

          {resultMessage && (
            <div
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold",
                isSuccess
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600",
              ].join(" ")}
            >
              {resultMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              "w-full rounded-2xl px-6 py-4 font-bold text-white transition disabled:cursor-wait disabled:opacity-60",
              isSubscription
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-zinc-900 hover:bg-zinc-700",
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
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {kakaoUrl && (
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-center rounded-2xl bg-[#FEE500] px-5 py-3 text-sm font-bold text-zinc-900 transition hover:brightness-95"
              >
                카카오톡 상담
              </a>
            )}

            {normalizedPhone && (
              <a
                href={`tel:${normalizedPhone}`}
                className="flex min-h-12 items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
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