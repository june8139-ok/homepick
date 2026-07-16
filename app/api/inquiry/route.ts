import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { sendInquiryNotification } from "../../../lib/sendInquiryNotification";

export const dynamic = "force-dynamic";

type InquiryType =
  | "visit"
  | "subscription-alert";

type InquiryRequestBody = {
  apartmentSlug?: string;
  apartmentName?: string;

  inquiryType?: InquiryType;

  customerName?: string;
  phone?: string;

  interestedType?: string;
  visitDate?: string;
  message?: string;

  privacyAgreed?: boolean;
};

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidPhone(value: string) {
  const normalized = normalizePhone(value);

  return /^01[016789]\d{7,8}$/.test(normalized);
}

function getInquiryTypeLabel(type: InquiryType) {
  switch (type) {
    case "visit":
      return "방문예약";

    case "subscription-alert":
      return "청약일정 알림";

    default:
      return "상담";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body =
      (await request.json()) as InquiryRequestBody;

    const apartmentSlug =
      body.apartmentSlug?.trim() ?? "";

    const apartmentName =
      body.apartmentName?.trim() ?? "";

    const inquiryType =
      body.inquiryType ?? "visit";

    const customerName =
      body.customerName?.trim() ?? "";

    const phone =
      body.phone?.trim() ?? "";

    const interestedType =
      body.interestedType?.trim() ?? "";

    const visitDate =
      body.visitDate?.trim() ?? "";

    const message =
      body.message?.trim() ?? "";

    if (!apartmentSlug || !apartmentName) {
      return NextResponse.json(
        {
          success: false,
          message: "단지 정보가 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          message: "이름을 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "휴대전화 번호를 정확히 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (
      inquiryType === "visit" &&
      !visitDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "희망 방문일을 선택해주세요.",
        },
        { status: 400 }
      );
    }

    if (!body.privacyAgreed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "개인정보 수집 및 이용에 동의해주세요.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("inquiries")
        .insert({
          apartment_slug: apartmentSlug,
          apartment_name: apartmentName,

          inquiry_type: inquiryType,

          customer_name: customerName,

          phone: normalizePhone(phone),

          interested_type:
            interestedType || null,

          visit_date:
            inquiryType === "visit"
              ? visitDate
              : null,

          message: message || null,

          privacy_agreed: true,

          status: "신규",
        })
        .select("id, created_at")
        .single();

    if (error) {
      console.error(
        "Supabase 저장 오류",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "예약 정보를 저장하지 못했습니다.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------
    // 이메일 알림
    // -----------------------------

    try {
      await sendInquiryNotification({
        apartmentName,
        inquiryType,
        customerName,
        phone: normalizePhone(phone),
        interestedType,
        visitDate,
        message,
      });
    } catch (mailError) {
      console.error(
        "이메일 발송 실패",
        mailError
      );

      // 이메일 실패해도 예약은 유지
    }

    return NextResponse.json({
      success: true,
      message: `${getInquiryTypeLabel(
        inquiryType
      )}이 정상적으로 접수되었습니다.`,
      inquiryId: data.id,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error(
      "상담 API 오류",
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