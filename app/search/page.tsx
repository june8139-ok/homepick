import { Suspense } from "react";

import SearchClient from "./SearchClient";
import { getApartments } from "../../lib/getApartments";

function SearchLoading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1760px] px-5 py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-36 rounded bg-zinc-200" />
            <div className="mt-3 h-10 w-80 rounded bg-zinc-200" />
            <div className="mt-6 h-16 max-w-4xl rounded-2xl bg-zinc-100" />
            <div className="mt-5 h-20 rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1760px] px-5 py-5 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(410px,0.62fr)_minmax(700px,1.38fr)]">
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>

          <div className="min-h-[680px] animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </section>
    </main>
  );
}

export default async function SearchPage() {
  const apartments = await getApartments();

  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchClient apartments={apartments} />
    </Suspense>
  );
}