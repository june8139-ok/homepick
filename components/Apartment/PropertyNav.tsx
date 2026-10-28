"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  detailHref,
  sectionLabels,
  type DetailSection,
} from "../../lib/apartmentPages";
import FavoriteButton from "./FavoriteButton";
export default function PropertyNav({
  slug,
  name,
  region,
  sections,
}: {
  slug: string;
  name: string;
  region: string;
  sections: DetailSection[];
}) {
  const pathname = usePathname();
  const home = detailHref(slug);
  const current = decodeURIComponent(pathname);
  return (
    <div className="property-nav">
      <div className="property-nav-title">
        <div>
          <span>{region}</span>
          <p>{name}</p>
        </div>
        <FavoriteButton slug={slug} apartmentName={name} />
      </div>
      <nav aria-label="단지 상세 메뉴">
        <Link
          href={home}
          aria-current={
            current === decodeURIComponent(home) ? "page" : undefined
          }
        >
          단지홈
        </Link>
        {sections.map((key) => (
          <Link
            key={key}
            href={detailHref(slug, key)}
            aria-current={current.endsWith(`/${key}`) ? "page" : undefined}
          >
            {sectionLabels[key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
