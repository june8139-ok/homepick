"use client";

import AdminEditor from "../../components/Admin/AdminEditor";
import { AdminProvider } from "../../components/Admin/AdminContext";

export default function AdminPage() {
  return (
    <AdminProvider>
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-zinc-900 p-8 text-white">
            <p className="text-sm text-zinc-300">ADMIN</p>

            <h1 className="mt-2 text-4xl font-bold">단지 등록 관리자</h1>

            <p className="mt-4 text-zinc-300">
              입력하는 즉시 분석점수와 미리보기가 실시간으로 변경됩니다.
            </p>
          </div>

          <AdminEditor mode="create" />
        </section>
      </main>
    </AdminProvider>
  );
}