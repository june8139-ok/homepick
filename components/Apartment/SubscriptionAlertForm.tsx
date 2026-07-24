"use client";

import type {
  FormEvent,
} from "react";

import {
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

type LeadType =
  | "consult"
  | "schedule"
  | "closed";

type YesNoValue =
  | ""
  | "yes"
  | "no";

type SubscriptionAlertFormProps = {
  apartmentSlug: string;
  apartmentName: string;
  leadType?: LeadType;
};

type FormState = {
  name: string;
  phone: string;
  birthDate: string;
  residence: string;
  homeless: YesNoValue;
  subscriptionAccount: YesNoValue;
  specialSupply: string;
  agree: boolean;
};

type FieldErrors = Partial<
  Record<
    | "name"
    | "phone"
    | "birthDate"
    | "residence"
    | "agree",
    string
  >
>;

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  birthDate: "",
  residence: "",
  homeless: "",
  subscriptionAccount: "",
  specialSupply:
    "선택하지 않음",
  agree: false,
};

const SPECIAL_SUPPLY_OPTIONS = [
  "선택하지 않음",
  "일반공급",
  "생애최초",
  "신혼부부",
  "신생아 특별공급",
  "다자녀가구",
  "노부모부양",
  "기관추천",
  "특별공급 해당 없음",
  "잘 모르겠음",
];

function normalizePhone(
  value: string
) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11);
}

function formatPhone(
  value: string
) {
  const numbers =
    normalizePhone(value);

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
    7
  )}-${numbers.slice(7)}`;
}

function isValidPhone(
  value: string
) {
  return /^01[016789]\d{7,8}$/.test(
    normalizePhone(value)
  );
}

function normalizeBirthDate(
  value: string
) {
  return value
    .replace(/\D/g, "")
    .slice(0, 6);
}

function convertBirthDateToISO(
  value: string
) {
  const numbers =
    normalizeBirthDate(value);

  if (numbers.length !== 6) {
    return null;
  }

  const shortYear = Number(
    numbers.slice(0, 2)
  );

  const month = Number(
    numbers.slice(2, 4)
  );

  const day = Number(
    numbers.slice(4, 6)
  );

  const currentYear =
    new Date().getFullYear();

  const currentShortYear =
    currentYear % 100;

  const fullYear =
    shortYear <=
    currentShortYear
      ? 2000 + shortYear
      : 1900 + shortYear;

  const date = new Date(
    fullYear,
    month - 1,
    day
  );

  const isValid =
    date.getFullYear() ===
      fullYear &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() === day;

  if (!isValid) {
    return null;
  }

  const formattedMonth =
    String(month).padStart(
      2,
      "0"
    );

  const formattedDay =
    String(day).padStart(
      2,
      "0"
    );

  return `${fullYear}-${formattedMonth}-${formattedDay}`;
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-[10px] font-semibold leading-4 text-red-600 sm:mt-2 sm:text-xs">
      {message}
    </p>
  );
}

function RadioOption({
  name,
  value,
  checked,
  label,
  onChange,
}: {
  name: string;
  value: Exclude<
    YesNoValue,
    ""
  >;
  checked: boolean;
  label: string;
  onChange: (
    value: Exclude<
      YesNoValue,
      ""
    >
  ) => void;
}) {
  return (
    <label
      className={[
        "flex min-h-10 cursor-pointer items-center justify-center gap-1.5",
        "rounded-xl border px-2 py-2 text-xs font-bold transition",
        "sm:min-h-12 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
        "hover:-translate-y-0.5 hover:border-emerald-500",
        "focus-within:ring-2 focus-within:ring-emerald-500",
        "focus-within:ring-offset-2",
        checked
          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
          : "border-zinc-200 bg-white text-zinc-700",
      ].join(" ")}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() =>
          onChange(value)
        }
        className="h-3.5 w-3.5 accent-emerald-600 sm:h-4 sm:w-4"
      />

      <span>{label}</span>
    </label>
  );
}

function InputField({
  label,
  required,
  value,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  type?: string;
  inputMode?:
    | "text"
    | "numeric"
    | "tel";
  autoComplete?: string;
  maxLength?: number;
  error?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-bold text-zinc-800 sm:text-sm">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(
          error
        )}
        className={[
          "mt-2 h-11 w-full min-w-0 rounded-xl border px-3 text-xs",
          "outline-none transition placeholder:text-zinc-400",
          "focus:ring-2 focus:ring-emerald-100",
          "sm:h-12 sm:px-4 sm:text-sm",
          error
            ? "border-red-400 focus:border-red-500"
            : "border-zinc-300 focus:border-emerald-500",
        ].join(" ")}
      />

      <FieldError
        message={error}
      />
    </label>
  );
}

export default function SubscriptionAlertForm({
  apartmentSlug,
  apartmentName,
  leadType = "schedule",
}: SubscriptionAlertFormProps) {
  const [
    form,
    setForm,
  ] = useState<FormState>(
    INITIAL_FORM
  );

  const [
    errors,
    setErrors,
  ] = useState<FieldErrors>({});

  const [
    isExtraOpen,
    setIsExtraOpen,
  ] = useState(
    leadType === "consult"
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isCompleted,
    setIsCompleted,
  ] = useState(false);

  const [
    isDuplicate,
    setIsDuplicate,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const isConsult =
    leadType === "consult";

  const isClosed =
    leadType === "closed";

  const content = useMemo(() => {
    if (isClosed) {
      return {
        eyebrow:
          "HOMEPICK SUBSCRIPTION",

        title:
          "신청이 종료되었습니다",

        description:
          "현재 이 단지는 청약 알림 및 상담 신청이 종료된 상태입니다.",

        buttonText:
          "신청 종료",
      };
    }

    if (isConsult) {
      return {
        eyebrow:
          "HOMEPICK CONSULTATION",

        title:
          "청약 상담 신청",

        description:
          "청약 상담과 모델하우스 운영 및 방문 관련 안내를 받아보세요.",

        buttonText:
          "청약 상담 신청하기",
      };
    }

    return {
      eyebrow:
        "HOMEPICK SUBSCRIPTION ALERT",

      title:
        "청약 일정 알림 신청",

      description:
        "모델하우스 운영기간과 특별공급, 1순위, 당첨자 발표 등 주요 일정을 문자로 안내합니다.",

      buttonText:
        "청약 일정 알림 신청하기",
    };
  }, [
    isClosed,
    isConsult,
  ]);

  function updateField<
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSubmitError("");

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  }

  function validateForm() {
    const nextErrors: FieldErrors =
      {};

    if (!form.name.trim()) {
      nextErrors.name =
        "이름을 입력해주세요.";
    } else if (
      form.name.trim().length <
      2
    ) {
      nextErrors.name =
        "이름을 2자 이상 입력해주세요.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "휴대폰번호를 입력해주세요.";
    } else if (
      !isValidPhone(form.phone)
    ) {
      nextErrors.phone =
        "올바른 휴대폰번호를 입력해주세요.";
    }

    if (!form.birthDate) {
      nextErrors.birthDate =
        "생년월일을 입력해주세요.";
    } else if (
      form.birthDate.length !== 6
    ) {
      nextErrors.birthDate =
        "숫자 6자리로 입력해주세요.";
    } else if (
      !convertBirthDateToISO(
        form.birthDate
      )
    ) {
      nextErrors.birthDate =
        "생년월일을 정확히 확인해주세요.";
    }

    if (!form.residence.trim()) {
      nextErrors.residence =
        "현재 거주지역을 입력해주세요.";
    } else if (
      form.residence.trim()
        .length < 2
    ) {
      nextErrors.residence =
        "거주지역을 정확히 입력해주세요.";
    }

    if (!form.agree) {
      nextErrors.agree =
        "개인정보 수집 및 이용 동의가 필요합니다.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  }

  async function checkDuplicate(
    phone: string
  ) {
    const {
      data,
      error,
    } = await supabase
      .from(
        "subscription_alerts"
      )
      .select("id")
      .eq(
        "apartment_slug",
        apartmentSlug
      )
      .eq("phone", phone)
      .limit(1);

    if (error) {
      console.warn(
        "중복 신청 확인 실패:",
        error.message
      );

      return false;
    }

    return Boolean(
      data &&
        data.length > 0
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      isClosed ||
      isSubmitting
    ) {
      return;
    }

    setSubmitError("");
    setIsDuplicate(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const phone =
        normalizePhone(
          form.phone
        );

      const birthDate =
        convertBirthDateToISO(
          form.birthDate
        );

      if (!birthDate) {
        setErrors(
          (previous) => ({
            ...previous,
            birthDate:
              "생년월일을 정확히 확인해주세요.",
          })
        );

        return;
      }

      const duplicate =
        await checkDuplicate(
          phone
        );

      if (duplicate) {
        setIsDuplicate(true);
        setIsCompleted(true);
        return;
      }

      const { error } =
        await supabase
          .from(
            "subscription_alerts"
          )
          .insert({
            apartment_slug:
              apartmentSlug,

            apartment_name:
              apartmentName,

            name:
              form.name.trim(),

            phone,

            birth_date:
              birthDate,

            province:
              form.residence.trim(),

            city: null,
            district: null,

            homeless:
              form.homeless === ""
                ? null
                : form.homeless ===
                    "yes",

            subscription_account:
              form.subscriptionAccount ===
              ""
                ? null
                : form.subscriptionAccount ===
                    "yes",

            special_supply:
              form.specialSupply ===
              "선택하지 않음"
                ? null
                : form.specialSupply,

            memo: null,
            agree: true,

            lead_type:
              isConsult
                ? "consult"
                : "schedule",

            status: "new",
          });

      if (error) {
        throw error;
      }

      setIsDuplicate(false);
      setIsCompleted(true);
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (error) {
      console.error(
        "청약 신청 저장 오류:",
        error
      );

      setSubmitError(
        "신청 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetCompletedScreen() {
    setIsCompleted(false);
    setIsDuplicate(false);
    setSubmitError("");
    setErrors({});
  }

  function resetExtraOptions() {
    setForm((previous) => ({
      ...previous,
      homeless: "",
      subscriptionAccount: "",
      specialSupply:
        "선택하지 않음",
    }));
  }

  if (isCompleted) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm sm:rounded-3xl sm:p-9">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-sm sm:h-16 sm:w-16 sm:text-3xl">
            ✓
          </div>

          <p className="mt-4 text-xs font-bold text-emerald-700 sm:mt-6 sm:text-sm">
            HOMEPICK
          </p>

          <h2 className="mt-2 break-keep text-xl font-extrabold text-zinc-900 sm:text-3xl">
            {isDuplicate
              ? "이미 신청이 완료된 단지입니다"
              : isConsult
                ? "청약 상담 신청이 완료되었습니다"
                : "청약 일정 알림 신청이 완료되었습니다"}
          </h2>

          <p className="mt-3 break-keep text-xs leading-6 text-zinc-600 sm:mt-4 sm:text-sm sm:leading-7">
            {isDuplicate
              ? "동일한 휴대폰번호로 신청한 내역이 있습니다. 기존 신청 정보를 기준으로 안내드립니다."
              : isConsult
                ? "신청 내용을 확인한 뒤 청약 상담과 모델하우스 안내를 드립니다."
                : "특별공급, 1순위와 당첨자 발표 등 주요 일정을 문자로 안내해드립니다."}
          </p>

          <button
            type="button"
            onClick={
              resetCompletedScreen
            }
            className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-xs font-extrabold text-zinc-700 transition hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:mt-7 sm:min-h-12 sm:px-6 sm:text-sm"
          >
            다른 번호로 신청하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm sm:rounded-3xl">
      <div className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-4 sm:p-7">
        <p className="text-xs font-bold tracking-wide text-emerald-700 sm:text-sm">
          {content.eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-zinc-900 sm:mt-2 sm:text-3xl">
          {content.title}
        </h2>

        <p className="mt-2 break-keep text-xs leading-5 text-zinc-600 sm:mt-3 sm:max-w-2xl sm:text-sm sm:leading-7">
          {content.description}
        </p>

        <div className="mt-3 rounded-xl border border-emerald-100 bg-white px-3 py-3 sm:mt-5 sm:rounded-2xl sm:px-5 sm:py-4">
          <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
            신청 단지
          </p>

          <p className="mt-1 break-keep text-sm font-extrabold text-zinc-900 sm:text-base">
            {apartmentName}
          </p>
        </div>
      </div>

      {isClosed ? (
        <div className="p-4 sm:p-7">
          <div className="rounded-xl bg-zinc-100 px-4 py-5 text-center sm:rounded-2xl sm:px-5 sm:py-6">
            <p className="text-sm font-extrabold text-zinc-600">
              현재 신청할 수 없습니다.
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
              청약 일정과 모집공고는 위 내용을 통해 확인해주세요.
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 p-4 sm:space-y-6 sm:p-7"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-5">
            <InputField
              label="이름"
              required
              value={form.name}
              placeholder="이름"
              autoComplete="name"
              error={errors.name}
              onChange={(value) =>
                updateField(
                  "name",
                  value
                )
              }
            />

            <InputField
              label="휴대폰번호"
              required
              value={form.phone}
              placeholder="010-0000-0000"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              error={errors.phone}
              onChange={(value) =>
                updateField(
                  "phone",
                  formatPhone(value)
                )
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-5">
            <InputField
              label="생년월일"
              required
              value={
                form.birthDate
              }
              placeholder="예: 960813"
              inputMode="numeric"
              autoComplete="bday"
              maxLength={6}
              error={
                errors.birthDate
              }
              onChange={(value) =>
                updateField(
                  "birthDate",
                  normalizeBirthDate(
                    value
                  )
                )
              }
            />

            <InputField
              label="현재 거주지역"
              required
              value={
                form.residence
              }
              placeholder="예: 대전 유성구"
              autoComplete="address-level2"
              error={
                errors.residence
              }
              onChange={(value) =>
                updateField(
                  "residence",
                  value
                )
              }
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 sm:rounded-2xl">
            <button
              type="button"
              onClick={() =>
                setIsExtraOpen(
                  (previous) =>
                    !previous
                )
              }
              aria-expanded={
                isExtraOpen
              }
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:px-5 sm:py-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 sm:text-sm">
                  맞춤 청약 알림 설정

                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700 sm:text-[11px]">
                    선택
                  </span>
                </p>

                <p className="mt-1 line-clamp-1 text-[10px] text-zinc-500 sm:text-xs sm:leading-5">
                  청약 조건을 입력하면 신청자 유형별로 관리할 수 있습니다.
                </p>
              </div>

              <span
                aria-hidden="true"
                className={[
                  "ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold text-zinc-500 shadow-sm transition-transform duration-300 sm:h-8 sm:w-8 sm:text-lg",
                  isExtraOpen
                    ? "rotate-180"
                    : "rotate-0",
                ].join(" ")}
              >
                ⌄
              </span>
            </button>

            <div
              className={[
                "grid transition-all duration-300 ease-in-out",
                isExtraOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 border-t border-zinc-200 bg-white p-4 sm:space-y-6 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    <fieldset className="min-w-0">
                      <legend className="text-xs font-bold text-zinc-800 sm:text-sm">
                        무주택 여부
                      </legend>

                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-3">
                        <RadioOption
                          name="homeless"
                          value="yes"
                          label="무주택"
                          checked={
                            form.homeless ===
                            "yes"
                          }
                          onChange={(
                            value
                          ) =>
                            updateField(
                              "homeless",
                              value
                            )
                          }
                        />

                        <RadioOption
                          name="homeless"
                          value="no"
                          label="유주택"
                          checked={
                            form.homeless ===
                            "no"
                          }
                          onChange={(
                            value
                          ) =>
                            updateField(
                              "homeless",
                              value
                            )
                          }
                        />
                      </div>
                    </fieldset>

                    <fieldset className="min-w-0">
                      <legend className="text-xs font-bold text-zinc-800 sm:text-sm">
                        청약통장 여부
                      </legend>

                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-3">
                        <RadioOption
                          name="subscriptionAccount"
                          value="yes"
                          label="있음"
                          checked={
                            form.subscriptionAccount ===
                            "yes"
                          }
                          onChange={(
                            value
                          ) =>
                            updateField(
                              "subscriptionAccount",
                              value
                            )
                          }
                        />

                        <RadioOption
                          name="subscriptionAccount"
                          value="no"
                          label="없음"
                          checked={
                            form.subscriptionAccount ===
                            "no"
                          }
                          onChange={(
                            value
                          ) =>
                            updateField(
                              "subscriptionAccount",
                              value
                            )
                          }
                        />
                      </div>
                    </fieldset>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-800 sm:text-sm">
                      특별공급 유형
                    </span>

                    <select
                      value={
                        form.specialSupply
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "specialSupply",
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 text-xs outline-none transition hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:h-12 sm:px-4 sm:text-sm"
                    >
                      {SPECIAL_SUPPLY_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={
                      resetExtraOptions
                    }
                    className="cursor-pointer text-[10px] font-bold text-zinc-500 underline-offset-4 transition hover:text-emerald-700 hover:underline sm:text-xs"
                  >
                    선택한 청약 조건 초기화
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              className={[
                "flex cursor-pointer items-start gap-2 rounded-xl border bg-zinc-50 p-3 transition",
                "hover:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2",
                "sm:gap-3 sm:rounded-2xl sm:p-4",
                errors.agree
                  ? "border-red-300"
                  : "border-zinc-200",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(
                  event
                ) =>
                  updateField(
                    "agree",
                    event.target.checked
                  )
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600 sm:mt-1"
              />

              <span className="text-[11px] leading-5 text-zinc-600 sm:text-sm sm:leading-6">
                <strong className="font-extrabold text-zinc-900">
                  개인정보 수집 및 이용에 동의합니다.
                </strong>

                <span className="hidden sm:inline">
                  <br />
                  청약 일정 또는 상담 안내를 위해 이름, 휴대폰번호, 생년월일과 거주지역 정보를 수집합니다.
                </span>
              </span>
            </label>

            <FieldError
              message={errors.agree}
            />
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-semibold leading-5 text-red-700 sm:px-4 sm:text-sm sm:leading-6"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className={[
              "flex min-h-12 w-full items-center justify-center",
              "cursor-pointer rounded-xl px-4 py-3",
              "text-sm font-extrabold text-white shadow-sm",
              "transition focus:outline-none focus:ring-2",
              "focus:ring-emerald-500 focus:ring-offset-2",
              "sm:min-h-14 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base",
              isSubmitting
                ? "cursor-wait bg-zinc-400"
                : "bg-emerald-600 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md",
            ].join(" ")}
          >
            {isSubmitting
              ? "신청 내용을 저장 중입니다..."
              : content.buttonText}
          </button>

          <p className="text-center text-[10px] leading-5 text-zinc-500 sm:text-xs">
            실제 청약 신청은 청약홈에서 별도로 진행해야 합니다.
          </p>
        </form>
      )}
    </section>
  );
}