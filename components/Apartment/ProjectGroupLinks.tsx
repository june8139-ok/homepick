import Link from "next/link";

import {
  getApartments,
} from "../../lib/getApartments";

import type {
  Apartment,
} from "../../types/apartment";

function getShortName(
  name: string,
  projectGroup: string
) {
  const shortName = name
    .replace(projectGroup, "")
    .trim()
    .replace(/^[-·|]/, "")
    .trim();

  return shortName || name;
}

export default async function ProjectGroupLinks({
  apartment,
}: {
  apartment: Apartment;
}) {
  const projectGroup =
    apartment.projectGroup?.trim();

  if (!projectGroup) {
    return null;
  }

  const apartments =
    await getApartments();

  const relatedApartments =
    apartments
      .filter(
        (item) =>
          item.projectGroup?.trim() ===
          projectGroup
      )
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "ko"
        )
      );

  if (
    relatedApartments.length <= 1
  ) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div>
        <p className="text-xs font-extrabold text-emerald-600 sm:text-sm">
          SAME PROJECT
        </p>

        <h2 className="mt-1 text-lg font-extrabold text-[#132238] sm:text-xl">
          같은 사업지 다른 블록
        </h2>

        <p className="mt-1 break-keep text-xs leading-5 text-zinc-500 sm:text-sm">
          같은 사업지의 다른 블록 정보를 함께 확인해보세요.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {relatedApartments.map(
          (item) => {
            const isCurrent =
              item.slug ===
              apartment.slug;

            const label =
              getShortName(
                item.name,
                projectGroup
              );

            if (isCurrent) {
              return (
                <span
                  key={item.slug}
                  aria-current="page"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#132238] px-4 py-2 text-sm font-extrabold text-white"
                >
                  {label}
                </span>
              );
            }

            return (
              <Link
                key={item.slug}
                href={`/apartments/${item.slug}`}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {label}
              </Link>
            );
          }
        )}
      </div>
    </section>
  );
}
