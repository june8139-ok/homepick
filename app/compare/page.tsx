import { Suspense } from "react";

import CompareClient from "./CompareClient";
import { getApartments } from "../../lib/getApartments";

function CompareLoading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-zinc-200" />

          <div className="mt-4 h-10 w-64 rounded bg-zinc-200" />

          <div className="mt-3 h-5 w-96 max-w-full rounded bg-zinc-200" />

          <div className="mt-8 flex gap-4 overflow-hidden">
            <div className="h-[430px] min-w-[340px] rounded-3xl bg-white shadow-sm" />

            <div className="h-[430px] min-w-[340px] rounded-3xl bg-white shadow-sm" />
          </div>

          <div className="mt-8 h-96 rounded-3xl bg-white shadow-sm" />
        </div>
      </section>
    </main>
  );
}

export default async function ComparePage() {
  const apartments =
    await getApartments();

  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareClient
        apartments={apartments}
      />
    </Suspense>
  );
}