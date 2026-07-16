import Link from "next/link";
import { getApartments } from "../../lib/getApartments";
import { getBadges } from "../../data/badges";

export default async function RegionIndexPage() {
  const apartments = await getApartments();

  const cities = apartments.reduce((acc, apt) => {
    if (!apt.city) return acc;

    const existing = acc.find((item) => item.city === apt.city);

    if (existing) {
      existing.count += 1;
      existing.totalScore += apt.score.total;

      if (apt.score.total > existing.topScore) {
        existing.topScore = apt.score.total;
        existing.topApartment = apt.name;
        existing.topApartmentSlug = apt.slug;
      }
    } else {
      acc.push({
        city: apt.city,
        cityName: apt.cityName || apt.city,
        count: 1,
        totalScore: apt.score.total,
        topScore: apt.score.total,
        topApartment: apt.name,
        topApartmentSlug: apt.slug,
      });
    }

    return acc;
  }, [] as {
    city: string;
    cityName: string;
    count: number;
    totalScore: number;
    topScore: number;
    topApartment: string;
    topApartmentSlug: string;
  }[]);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-zinc-500">
          ← 홈으로 돌아가기
        </Link>

        <div className="mt-6 rounded-3xl bg-zinc-900 p-8 text-white">
          <p className="text-sm text-zinc-300">지역별 분양정보</p>

          <h1 className="mt-2 text-4xl font-bold">
            전국 지역별 AI 분양 랭킹
          </h1>

          <p className="mt-4 text-zinc-300">
            Supabase에 등록된 단지를 지역별로 확인하세요.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => {
            const averageScore = Math.round(city.totalScore / city.count);

            const topApt = apartments.find(
              (apt) => apt.slug === city.topApartmentSlug
            );

            const badges = topApt
              ? getBadges(topApt as any, apartments as any).slice(0, 3)
              : [];

            return (
              <Link
                key={city.city}
                href={`/region/${encodeURIComponent(city.city)}`}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-zinc-500">
                  AI REGION
                </p>

                <h2 className="mt-2 text-3xl font-bold">{city.cityName}</h2>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">등록 단지</p>
                    <p className="mt-1 text-2xl font-bold">{city.count}개</p>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">평균 점수</p>
                    <p className="mt-1 text-2xl font-bold">{averageScore}점</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-zinc-900 p-4 text-white">
                  <p className="text-sm text-zinc-300">현재 1위 단지</p>
                  <p className="mt-1 font-bold">{city.topApartment}</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    AI {city.topScore}점
                  </p>

                  {badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-white/10 px-2 py-1 text-xs text-white"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {cities.length === 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
              등록된 지역이 없습니다.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}