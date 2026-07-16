import Link from "next/link";
import type { Apartment } from "../../types/apartment";

type Props = {
  apartment: Apartment;
  relatedApartments: Apartment[];
};

function getStatusStyle(status?: string) {
  if (
    status?.includes("청약") ||
    status === "당첨자발표" ||
    status === "계약중"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (status?.includes("선착순")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status?.includes("분양중")) {
    return "bg-amber-50 text-amber-700";
  }

  if (status?.includes("마감")) {
    return "bg-zinc-100 text-zinc-600";
  }

  return "bg-zinc-100 text-zinc-700";
}

function getHeroImage(apartment: Apartment) {
  const hero = apartment.images?.hero;

  if (
    !hero ||
    hero.trim() === "" ||
    hero.includes(
      "/images/apartments/default/main.jpg"
    )
  ) {
    return null;
  }

  return hero;
}

function getConditionText(apartment: Apartment) {
  if (apartment.condition?.trim()) {
    return apartment.condition;
  }

  const details = [
    apartment.priceDetail?.contractPrice,
    apartment.priceDetail?.middlePayment,
    ...(apartment.priceDetail?.options ?? []),
  ].filter(Boolean);

  return (
    details.slice(0, 2).join(" · ") ||
    "계약조건 확인 중"
  );
}

function RelatedImage({
  apartment,
}: {
  apartment: Apartment;
}) {
  const image = getHeroImage(apartment);

  if (!image) {
    return (
      <div className="flex h-36 w-full items-center justify-center bg-zinc-100 text-sm font-medium text-zinc-400 sm:h-full sm:w-44">
        이미지 준비 중
      </div>
    );
  }

  return (
    <div className="h-36 w-full overflow-hidden sm:h-full sm:w-44">
      <img
        src={image}
        alt={apartment.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

export default function RelatedApartments({
  apartment,
  relatedApartments,
}: Props) {
  if (relatedApartments.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-emerald-600">
            REGIONAL COMPARISON
          </p>

          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#132238]">
            같은 지역 다른 단지
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {apartment.cityName || apartment.city} 지역에서
            함께 비교해볼 만한 단지입니다.
          </p>
        </div>

        <Link
          href={`/search?q=${encodeURIComponent(
            apartment.cityName || apartment.city
          )}`}
          className="
            inline-flex min-h-11 items-center justify-center
            rounded-xl border border-zinc-200 bg-white px-4 py-2
            text-sm font-bold text-zinc-700
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-emerald-300
            hover:bg-emerald-50
            hover:text-emerald-700
            hover:shadow-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
          "
        >
          지역 단지 더 보기 →
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {relatedApartments.map((apt) => {
          const conditionText =
            getConditionText(apt);

          return (
            <article
              key={apt.slug}
              className="
                group overflow-hidden rounded-2xl
                border border-zinc-200 bg-white
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-emerald-300
                hover:shadow-lg
              "
            >
              <div className="flex flex-col sm:min-h-[176px] sm:flex-row">
                <RelatedImage apartment={apt} />

                <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-bold",
                          getStatusStyle(apt.status),
                        ].join(" ")}
                      >
                        {apt.status || "정보 확인 중"}
                      </span>

                      {apt.brand && (
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                          {apt.brand}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 break-keep text-xl font-extrabold leading-tight text-[#132238]">
                      {apt.name}
                    </h3>

                    <p className="mt-2 line-clamp-1 text-sm text-zinc-500">
                      {apt.region || "주소 정보 확인 중"}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#F8FAF7] p-3">
                        <p className="text-xs font-bold text-zinc-500">
                          분양가
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-[#132238]">
                          {apt.price ||
                            apt.priceDetail?.salePrice ||
                            "분양가 확인 중"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8FAF7] p-3">
                        <p className="text-xs font-bold text-zinc-500">
                          핵심 계약조건
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm font-extrabold leading-6 text-[#132238]">
                          {conditionText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Link
                      href={`/apartments/${apt.slug}`}
                      className="
                        inline-flex min-h-11 items-center justify-center
                        rounded-xl border border-zinc-200 bg-white px-4 py-2
                        text-sm font-bold text-zinc-700
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:border-emerald-300
                        hover:bg-emerald-50
                        hover:text-emerald-700
                        hover:shadow-md
                        active:translate-y-0
                        active:scale-[0.98]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-emerald-500
                        focus-visible:ring-offset-2
                      "
                    >
                      상세정보 보기
                    </Link>

                    <Link
                      href={`/compare?left=${apartment.slug}&right=${apt.slug}`}
                      className="
                        inline-flex min-h-11 items-center justify-center
                        rounded-xl bg-[#132238] px-4 py-2
                        text-sm font-bold text-white
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:bg-emerald-600
                        hover:shadow-md
                        active:translate-y-0
                        active:scale-[0.98]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-emerald-500
                        focus-visible:ring-offset-2
                      "
                    >
                      현재 단지와 비교
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}