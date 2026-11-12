import { isAllowedVisitDate, VISIT_SUCCESS_MESSAGE } from "../../../lib/inquiryDate";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "../../../lib/supabaseAdmin";

import {
  sendInquiryNotification,
} from "../../../lib/sendInquiryNotification";

export const dynamic =
  "force-dynamic";

type InquiryRequest = {
  apartmentSlug?: string;
  apartmentName?: string;

  inquiryType?:
    | "visit"
    | "visit-reservation"
    | "kakao"
    | "subscription-alert";

  customerName?: string;
  phone?: string;
  interestedType?: string;
  visitDate?: string;
  message?: string;

  privacyAgreed?: boolean;
  thirdPartyAgreed?: boolean;
};

function normalizeText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizePhone(
  value: unknown
) {
  return normalizeText(value)
    .replace(/\D/g, "")
    .slice(0, 11);
}

function isValidPhone(
  value: string
) {
  return /^01[016789]\d{7,8}$/.test(
    value
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as
        InquiryRequest;

    const apartmentSlug =
      normalizeText(
        body.apartmentSlug
      );

    const apartmentName =
      normalizeText(
        body.apartmentName
      );

    const isVisitReservation = body.inquiryType === "visit-reservation";
    const inquiryType = body.inquiryType === "kakao" || body.inquiryType === "subscription-alert"
      ? body.inquiryType
      : "visit";
    const isKakao = inquiryType === "kakao";
    const requiresThirdPartyConsent = inquiryType !== "subscription-alert";

    // Kakao only asks for a phone number; keep compatibility with existing non-null CRM names.
    const customerName = isKakao ? "카카오톡 상담" : normalizeText(body.customerName);

    const phone =
      normalizePhone(
        body.phone
      );

    const interestedType =
      normalizeText(
        body.interestedType
      );

    const visitDate =
      normalizeText(
        body.visitDate
      );

    const message =
      normalizeText(
        body.message
      );

    const privacyAgreed =
      body.privacyAgreed ===
      true;

    const thirdPartyAgreed =
      body.thirdPartyAgreed ===
      true;

    if (
      !apartmentSlug ||
      !apartmentName ||
      (isKakao && apartmentName.length > 200)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "신청 단지 정보가 올바르지 않습니다.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      customerName.length <
      2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "이름을 2자 이상 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidPhone(
        phone
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "올바른 휴대폰번호를 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !privacyAgreed
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "개인정보 수집 및 이용 동의가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      requiresThirdPartyConsent && !thirdPartyAgreed
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "분양 상담을 위한 개인정보 제3자 제공 동의가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    // Legacy callers can still send a general inquiry without a date.
    const needsDateValidation = isVisitReservation || (inquiryType === "visit" && visitDate !== "");
    if (needsDateValidation && !isAllowedVisitDate(visitDate)) {
      return NextResponse.json(
        { success: false, message: "방문 희망일은 오늘부터 선택해주세요." },
        { status: 400 }
      );
    }

    const now =
      new Date().toISOString();

    const {
      data:
        createdInquiry,
      error:
        insertError,
    } =
      await supabaseAdmin
        .from(
          "inquiries"
        )
        .insert({
          apartment_slug:
            apartmentSlug,

          apartment_name:
            apartmentName,

          inquiry_type:
            inquiryType,

          customer_name:
            customerName,

          phone,

          interested_type:
            isVisitReservation || isKakao ? null : interestedType || null,

          visit_date:
            inquiryType ===
            "visit"
              ? visitDate || null
              : null,

          message:
            isVisitReservation || isKakao ? null : message || null,

          status: "new",

          privacy_agreed:
            true,

          third_party_agreed: requiresThirdPartyConsent,

          third_party_agreed_at: requiresThirdPartyConsent ? now : null,

          admin_memo: null,
        })
        .select(
          "id, created_at"
        )
        .single();

    if (
      insertError
    ) {
      console.error(
        "문의 신청 저장 오류:",
        insertError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "신청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
        },
        {
          status: 500,
        }
      );
    }

    try {
      const mailMessage = isKakao ? "카카오톡 상담 연결을 위해 접수되었습니다.\n제3자 제공 동의: 동의" : [
        `신청 구분: ${inquiryType === "visit" ? (visitDate ? "방문예약" : "상담신청") : "청약 일정 알림"}`,
        ...(!isVisitReservation ? [`관심 평형·타입: ${interestedType || "미입력"}`] : []),
        `희망 방문일: ${inquiryType === "visit" ? visitDate || "상담 후 결정" : "해당 없음"}`,
        `제3자 제공 동의: ${requiresThirdPartyConsent ? "동의" : "해당 없음"}`,
        ...(!isVisitReservation ? [`문의내용: ${message || "없음"}`] : []),
      ].join("\n");

      const mailResult = await sendInquiryNotification({
        apartmentName,
        inquiryType,
        customerName,
        phone,
        interestedType: isVisitReservation || isKakao ? undefined : interestedType,
        visitDate: inquiryType === "visit" ? visitDate : "",
        message: mailMessage,
      });

      console.log(
        "문의 이메일 발송 성공:",
        mailResult
      );
    } catch (mailError) {
      console.error(
        "문의 이메일 발송 실패:",
        mailError
      );
    }

    return NextResponse.json({
      success: true,

      message: isVisitReservation
        ? VISIT_SUCCESS_MESSAGE
        : inquiryType === "kakao"
          ? "카카오톡 상담이 접수되었습니다."
          : inquiryType === "visit"
            ? "상담신청이 접수되었습니다. 담당자가 연락드려 최신 조건과 방문 일정을 안내합니다."
            : "청약일정 알림 신청이 접수되었습니다.",

      inquiryId:
        createdInquiry.id,

      createdAt:
        createdInquiry.created_at,
    });
  } catch (error) {
    console.error(
      "문의 신청 API 오류:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "신청 처리 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}
