import Link from "next/link";

import InquiryManager from "../../../components/Admin/InquiryManager";
import { getInquiries } from "../../../lib/getInquiries";

export const dynamic = "force-dynamic";

function normalizeStatus(status?: string | null) {
  switch (status) {
    case "new":
      return "신규";

    case "contacted":
      return "상담중";

    case "scheduled":
      return "방문예정";

    case "contract":
      return "계약";

    case "cancel":
      return "취소";

    default:
      return status || "신규";
  }
}

export default async function InquiryPage() {
  const rawInquiries = await getInquiries();

  const inquiries = rawInquiries.map((item) => ({
    ...item,
    status: normalizeStatus(item.status),
  }));

  const newCount = inquiries.filter(
    (item) => item.status === "신규"
  ).length;

  const contactedCount = inquiries.filter(
    (item) => item.status === "상담중"
  ).length;

  const scheduledCount = inquiries.filter(
    (item) => item.status === "방문예정"
  ).length;

  const contractCount = inquiries.filter(
    (item) => item.status === "계약"
  ).length;

  const cancelCount = inquiries.filter(
    (item) => item.status === "취소"
  ).length;

  return (
    <main className="min-h-screen bg-zinc-100 px-5 py-8 text-zinc-900 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-600">
              HOMEPICK CRM
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              방문예약 관리
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              방문예약과 청약일정 알림 신청을 확인하고
              상담 진행 상태를 관리합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              ← 관리자 홈
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700"
            >
              사이트 보기
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="전체 신청"
            count={inquiries.length}
            description="누적 접수"
          />

          <SummaryCard
            label="신규"
            count={newCount}
            description="확인 필요"
          />

          <SummaryCard
            label="상담중"
            count={contactedCount}
            description="상담 진행"
          />

          <SummaryCard
            label="방문예정"
            count={scheduledCount}
            description="방문 일정"
          />

          <SummaryCard
            label="계약"
            count={contractCount}
            description={`취소 ${cancelCount}건`}
          />
        </div>

        <div className="mt-8">
          {inquiries.length > 0 ? (
            <InquiryManager
              initialInquiries={inquiries}
            />
          ) : (
            <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm font-bold text-zinc-400">
                NO INQUIRIES
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                아직 접수된 신청이 없습니다.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                상세페이지에서 방문예약이나 청약일정
                알림이 신청되면 이곳에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  count,
  description,
}: {
  label: string;
  count: number;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-4xl font-extrabold">
        {count}
      </p>

      <p className="mt-2 text-xs text-zinc-400">
        {description}
      </p>
    </article>
  );
}