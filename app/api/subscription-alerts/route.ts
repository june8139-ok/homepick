import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    supabaseAdmin,
  } from "../../../lib/supabaseAdmin";
  
  type SubscriptionAlertRequest = {
    apartmentSlug?: string;
    apartmentName?: string;
  
    name?: string;
    phone?: string;
    birthDate?: string;
    residence?: string;
  
    homeless?: boolean | null;
    subscriptionAccount?: boolean | null;
    specialSupply?: string | null;
  
    leadType?:
      | "consult"
      | "schedule";
  
    agree?: boolean;
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
          SubscriptionAlertRequest;
  
      const apartmentSlug =
        normalizeText(
          body.apartmentSlug
        );
  
      const apartmentName =
        normalizeText(
          body.apartmentName
        );
  
      const name =
        normalizeText(
          body.name
        );
  
      const phone =
        normalizePhone(
          body.phone
        );
  
      const birthDate =
        normalizeText(
          body.birthDate
        );
  
      const residence =
        normalizeText(
          body.residence
        );
  
      const leadType =
        body.leadType ===
        "consult"
          ? "consult"
          : "schedule";
  
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
        name.length < 2
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
        !isValidIsoDate(
          birthDate
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "생년월일을 정확히 입력해주세요.",
          },
          {
            status: 400,
          }
        );
      }
  
      if (
        residence.length <
        2
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "현재 거주지역을 입력해주세요.",
          },
          {
            status: 400,
          }
        );
      }
  
      if (
        body.agree !== true
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
  
      const {
        data:
          existingAlert,
        error:
          duplicateError,
      } =
        await supabaseAdmin
          .from(
            "subscription_alerts"
          )
          .select("id")
          .eq(
            "apartment_slug",
            apartmentSlug
          )
          .eq(
            "phone",
            phone
          )
          .maybeSingle();
  
      if (
        duplicateError
      ) {
        console.error(
          "청약 알림 중복 확인 오류:",
          duplicateError
        );
  
        return NextResponse.json(
          {
            success: false,
            message:
              duplicateError.message,
          },
          {
            status: 500,
          }
        );
      }
  
      if (
        existingAlert
      ) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          message:
            "이미 신청이 완료된 단지입니다.",
        });
      }
  
      const {
        error:
          insertError,
      } =
        await supabaseAdmin
          .from(
            "subscription_alerts"
          )
          .insert({
            apartment_slug:
              apartmentSlug,
  
            apartment_name:
              apartmentName,
  
            name,
            phone,
  
            birth_date:
              birthDate,
  
            province:
              residence,
  
            city: null,
            district: null,
  
            homeless:
              typeof body.homeless ===
              "boolean"
                ? body.homeless
                : null,
  
            subscription_account:
              typeof body.subscriptionAccount ===
              "boolean"
                ? body.subscriptionAccount
                : null,
  
            special_supply:
              normalizeText(
                body.specialSupply
              ) || null,
  
            memo: null,
            agree: true,
  
            lead_type:
              leadType,
  
            status: "new",
          });
  
      if (
        insertError
      ) {
        console.error(
          "청약 알림 신청 저장 오류:",
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
  
      return NextResponse.json({
        success: true,
        duplicate: false,
        message:
          leadType ===
          "consult"
            ? "청약 상담 신청이 완료되었습니다."
            : "청약 일정 알림 신청이 완료되었습니다.",
      });
    } catch (error) {
      console.error(
        "청약 알림 신청 API 오류:",
        error
      );
  
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "청약 알림 신청 중 오류가 발생했습니다.",
        },
        {
          status: 500,
        }
      );
    }
  }