import Link from "next/link";
import { getApartments } from "../../../lib/getApartments";

function getGrade(score: number) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  return "C";
}

function getRankLabel(index: number) {
  if (index === 0) return "🥇 1위";
  if (index === 1) return "🥈 2위";
  if (index === 2) return "🥉 3위";
  return `${index + 1}위`;
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);

  const apartments = await getApartments();

  const regionApartments = apartments
    .filter((apt) => apt.city === decodedCity)
    .sort((a, b) => b.score.total - a.score.total);

  if (regionApartments.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">해당 지역의 단지가 없습니다.</h1>
          <Link
            href="/region"
            className="mt-4 inline-block rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white"
          >
            지역 목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const cityName = regionApartments[0].cityName || decodedCity;

  const averageScore = Math.round(
    regionApartments.reduce((sum, apt) => sum + apt.score.total, 0) /
      regionApartments.length
  );

  const topApartment = regionApartments[0];

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-6xl">
        <Link href="/region" className="text-sm text-zinc-500">
          ← 지역 목록으로 돌아가기
        </Link>

        <div className="mt-6 rounded-3xl bg-zinc-900 p-8 text-white">
          <p className="text-sm text-zinc-300">지역별 AI 분양 랭킹</p>

          <h1 className="mt-2 text-4xl font-bold">
            {cityName} AI 추천 TOP {regionApartments.length}
          </h1>

          <p className="mt-4 text-zinc-300">
            Supabase에 등록된 {cityName} 지역 단지를 AI 점수 기준으로 비교했습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">등록 단지</p>
            <p className="mt-2 text-3xl font-bold">
              {regionApartments.length}개
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">평균 AI 점수</p>
            <p className="mt-2 text-3xl font-bold">{averageScore}점</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">현재 1위 단지</p>
            <p className="mt-2 text-xl font-bold">{topApartment.name}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {topApartment.score.total}점 · {getGrade(topApartment.score.total)}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          {regionApartments.map((apt, index) => (
            <Link
              key={apt.slug}
              href={`/apartments/${apt.slug}`}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-bold text-white">
                    {getRankLabel(index)}
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-zinc-900 px-2 py-1 text-white">
                        {apt.status}
                      </span>

                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-600">
                        {apt.brand || "브랜드 없음"}
                      </span>

                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-600">
                        {getGrade(apt.score.total)}등급
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-bold">{apt.name}</h2>

                    <p className="mt-2 text-zinc-500">
                      {apt.price || "분양가 정보 없음"}
                    </p>

                    <p className="mt-2 text-zinc-700">
                      {apt.condition || "계약조건 정보 없음"}
                    </p>

                    {apt.aiReview?.summary && (
                      <p className="mt-3 text-sm text-zinc-500">
                        {apt.aiReview.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-5 text-left sm:text-right">
                  <p className="text-sm text-zinc-500">AI 종합점수</p>
                  <p className="mt-1 text-4xl font-bold">{apt.score.total}점</p>
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    {getGrade(apt.score.total)}등급
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}