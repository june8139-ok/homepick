import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getApartment } from "../../../lib/getApartment";
import { getDetailSections } from "../../../lib/apartmentPages";
import { isCompletedListing } from "../../../lib/listingStage";
import PropertyNav from "../../../components/Apartment/PropertyNav";
export default async function PropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const a = await getApartment((await params).slug);
  if (!a) notFound();
  return (
    <div className="property-site">
      {!isCompletedListing(a) && (
        <PropertyNav
          slug={a.slug}
          name={a.name}
          region={a.cityName || a.region}
          sections={getDetailSections(a)}
        />
      )}
      <div className="property-content">{children}</div>
    </div>
  );
}
