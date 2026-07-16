import Link from "next/link";

import { conditionHistories } from "../../../data/history";
import { getApartment } from "../../../lib/getApartment";
import { getApartments } from "../../../lib/getApartments";

import ApartmentHero from "../../../components/Apartment/ApartmentHero";
import SubscriptionDetail from "../../../components/Apartment/SubscriptionDetail";
import SaleDetail from "../../../components/Apartment/SaleDetail";
import RelatedApartments from "../../../components/Apartment/RelatedApartments";

import type { Apartment } from "../../../types/apartment";

const subscriptionStatuses = [
  "청약예정",
  "특별공급",
  "1순위",
  "2순위",
  "청약중",
  "당첨자발표",
  "계약중",
  "청약마감",
];

function isSubscriptionApartment(apartment: Apartment) {
  return (
    apartment.source === "applyhome" ||
    subscriptionStatuses.includes(apartment.status)
  );
}

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const apartment = (await getApartment(
    slug
  )) as Apartment | null;

  const apartments = (await getApartments()) as Apartment[];

  if (!apartment) {
    return (
      <main className="min-h-screen bg-white px-6 py-20">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold">
            단지를 찾을 수 없습니다.
          </h1>

          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium text-zinc-500"
          >
            ← 홈으로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  const isSubscription =
    isSubscriptionApartment(apartment);

  const relatedApartments = apartments
    .filter(
      (item) =>
        item.city === apartment.city &&
        item.slug !== apartment.slug &&
        item.score.total > 0
    )
    .sort(
      (a, b) =>
        b.score.total - a.score.total
    )
    .slice(0, 3);

  const conditionHistory =
    conditionHistories.find(
      (item) =>
        item.apartmentSlug === apartment.slug
    );

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/search"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← 분양 단지 목록으로
          </Link>

          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              isSubscription
                ? "bg-blue-50 text-blue-700"
                : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {isSubscription
              ? "청약 상세"
              : "분양 분석"}
          </span>
        </div>

        <ApartmentHero apartment={apartment} />

        {isSubscription ? (
          <SubscriptionDetail
            apartment={apartment}
          />
        ) : (
          <SaleDetail
            apartment={apartment}
            conditionHistory={conditionHistory}
          />
        )}

        <RelatedApartments
          apartment={apartment}
          relatedApartments={relatedApartments}
        />
      </section>
    </main>
  );
}