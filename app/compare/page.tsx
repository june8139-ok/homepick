import { Suspense } from "react";

import CompareClient from "./CompareClient";
import { apartments } from "../../data/apartments";

function CompareLoading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto w-full max-w-[1600px] px-5 py-10 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-zinc-200" />

          <div className="mt-3 h-10 w-72 rounded bg-zinc-200" />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="h-80 rounded-3xl bg-white shadow-sm" />
            <div className="h-80 rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareClient apartments={apartments} />
    </Suspense>
  );
}