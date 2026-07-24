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

function isValidIsoDate(
  value: string
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  return (
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month - 1 &&
    date.getDate() ===
      day
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

    const inquiryType =
      body.inquiryType ===
      "subscription-alert"
        ? "subscription-alert"
        : "visit";

    const customerName =
      normalizeText(
        body.customerName
      );

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
      !apartmentName
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
      inquiryType ===
        "visit" &&
      !thirdPartyAgreed
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

    if (
      inquiryType ===
        "visit" &&
      !isValidIsoDate(
        visitDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "희망 방문일을 정확히 선택해주세요.",
        },
        {
          status: 400,
        }
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
            interestedType ||
            null,

          visit_date:
            inquiryType ===
            "visit"
              ? visitDate
              : null,

          message:
            message || null,

          status: "new",

          privacy_agreed:
            true,

          third_party_agreed:
            inquiryType ===
            "visit"
              ? true
              : false,

          third_party_agreed_at:
            inquiryType ===
              "visit" &&
            thirdPartyAgreed
              ? now
              : null,

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
            insertError.message,
        },
        {
          status: 500,
        }
      );
    }

    try {
      const mailMessage = [
        `신청 구분: ${
          inquiryType ===
          "visit"
            ? "방문예약"
            : "청약 일정 알림"
        }`,
        `관심 평형·타입: ${
          interestedType ||
          "미입력"
        }`,
        `희망 방문일: ${
          inquiryType ===
          "visit"
            ? visitDate
            : "해당 없음"
        }`,
        `제3자 제공 동의: ${
          inquiryType ===
          "visit"
            ? "동의"
            : "해당 없음"
        }`,
        `문의내용: ${
          message ||
          "없음"
        }`,
      ].join("\n");

      const mailResult =
        await sendInquiryNotification({
          apartmentName,
          inquiryType,
          customerName,
          phone,
          interestedType,
          visitDate:
            inquiryType ===
            "visit"
              ? visitDate
              : "",
          message:
            mailMessage,
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

      message:
        inquiryType ===
        "visit"
          ? "방문예약이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다."
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