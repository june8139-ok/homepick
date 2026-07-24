"use client";

import AdminEditor from "../../../components/Admin/AdminEditor";
import { AdminProvider } from "../../../components/Admin/AdminContext";

export default function AdminCreatePage() {
  return (
    <AdminProvider>
      <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-zinc-900 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold text-emerald-400">
              HOMEPICK ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              신규 단지 등록
            </h1>

            <p className="mt-4 text-sm leading-6 text-zinc-300 sm:text-base">
              입력하는 즉시 분석점수와 미리보기가 실시간으로 변경됩니다.
            </p>
          </div>

          <AdminEditor mode="create" />
        </section>
      </main>
    </AdminProvider>
  );
}