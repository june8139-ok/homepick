"use client";

import DashboardCard from "./DashboardCard";

type AdminDashboardProps = {
  total: number;
  subscription: number;
  firstCome: number;
  completed: number;
  pendingPublish: number;
  loading?: boolean;
};

export default function AdminDashboard({
  total,
  subscription,
  firstCome,
  completed,
  pendingPublish,
  loading = false,
}: AdminDashboardProps) {
  return (
    <section className="mt-6">
      <div>
        <p className="text-sm font-bold text-emerald-600">
          TODAY
        </p>

        <h2 className="mt-1 text-2xl font-black text-zinc-900">
          오늘 확인할 운영 현황
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          게시 대기와 단지 노출 상태를 빠르게 확인하세요.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="게시 대기"
          count={pendingPublish}
          description="등록되었지만 아직 사이트에 게시되지 않은 단지입니다."
          href="/admin/apartments"
          buttonLabel="게시 관리"
          color="amber"
          loading={loading}
        />

        <DashboardCard
          title="청약 단지"
          count={subscription}
          description="현재 청약 단계로 분류된 단지입니다."
          href="/admin/apartments"
          buttonLabel="청약 단지 보기"
          color="blue"
          loading={loading}
        />

        <DashboardCard
          title="선착순 단지"
          count={firstCome}
          description="현재 선착순 분양으로 노출 중인 단지입니다."
          href="/admin/apartments"
          buttonLabel="선착순 관리"
          color="green"
          loading={loading}
        />

        <DashboardCard
          title="전체 등록"
          count={total}
          description={`노출 종료 ${completed}건을 포함한 전체 등록 단지입니다.`}
          href="/admin/apartments"
          buttonLabel="전체 단지 관리"
          color="zinc"
          loading={loading}
        />
      </div>
    </section>
  );
}