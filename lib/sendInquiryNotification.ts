import { Resend } from "resend";

type InquiryNotificationInput = {
  apartmentName: string;
  inquiryType: "visit" | "subscription-alert";
  customerName: string;
  phone: string;
  interestedType?: string;
  visitDate?: string;
  message?: string;
};

function getInquiryTypeLabel(
  type: InquiryNotificationInput["inquiryType"]
) {
  return type === "visit"
    ? "방문예약"
    : "청약일정 알림";
}

function formatPhone(phone: string) {
  const numbers = phone.replace(/[^\d]/g, "");

  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(
      3,
      7
    )}-${numbers.slice(7)}`;
  }

  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(
      3,
      6
    )}-${numbers.slice(6)}`;
  }

  return phone;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendInquiryNotification(
  input: InquiryNotificationInput
) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY가 등록되지 않았습니다."
    );
  }

  if (!adminEmail) {
    throw new Error(
      "ADMIN_NOTIFICATION_EMAIL이 등록되지 않았습니다."
    );
  }

  const resend = new Resend(apiKey);

  const inquiryTypeLabel =
    getInquiryTypeLabel(input.inquiryType);

  const subject = `[집눈] ${input.apartmentName} ${inquiryTypeLabel} 접수`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#18181b;">
      <div style="background:#18181b;color:#ffffff;padding:22px;border-radius:18px 18px 0 0;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#6ee7b7;">
          집눈 CRM
        </p>
        <h1 style="margin:8px 0 0;font-size:24px;">
          신규 ${escapeHtml(inquiryTypeLabel)}
        </h1>
      </div>

      <div style="border:1px solid #e4e4e7;border-top:0;padding:24px;border-radius:0 0 18px 18px;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            <tr>
              <td style="padding:10px 0;color:#71717a;width:130px;">
                단지명
              </td>
              <td style="padding:10px 0;font-weight:700;">
                ${escapeHtml(input.apartmentName)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#71717a;">
                신청유형
              </td>
              <td style="padding:10px 0;font-weight:700;">
                ${escapeHtml(inquiryTypeLabel)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#71717a;">
                고객명
              </td>
              <td style="padding:10px 0;font-weight:700;">
                ${escapeHtml(input.customerName)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#71717a;">
                연락처
              </td>
              <td style="padding:10px 0;font-weight:700;">
                ${escapeHtml(formatPhone(input.phone))}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;color:#71717a;">
                관심타입
              </td>
              <td style="padding:10px 0;font-weight:700;">
                ${escapeHtml(input.interestedType || "미입력")}
              </td>
            </tr>

            ${
              input.inquiryType === "visit"
                ? `
                  <tr>
                    <td style="padding:10px 0;color:#71717a;">
                      희망 방문일
                    </td>
                    <td style="padding:10px 0;font-weight:700;">
                      ${escapeHtml(input.visitDate || "미입력")}
                    </td>
                  </tr>
                `
                : ""
            }

            <tr>
              <td style="padding:10px 0;color:#71717a;vertical-align:top;">
                문의내용
              </td>
              <td style="padding:10px 0;font-weight:700;white-space:pre-wrap;">
                ${escapeHtml(input.message || "문의내용 없음")}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:22px;padding:16px;background:#f4f4f5;border-radius:12px;">
          <p style="margin:0;font-size:13px;color:#52525b;">
            관리자 CRM에서 신청 상태와 상담 메모를 관리할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "집눈 <onboarding@resend.dev>",
    to: [adminEmail],
    subject,
    html,
  });

  if (error) {
    throw new Error(
      `이메일 알림 발송 실패: ${error.message}`
    );
  }

  return data;
}
