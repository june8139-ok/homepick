import Link from "next/link";
import { notFound } from "next/navigation";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

import AdminEditor from "../../../../components/Admin/AdminEditor";
import { AdminProvider } from "../../../../components/Admin/AdminContext";

export const dynamic = "force-dynamic";

export default async function AdminApartmentEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  const { data, error } = await supabaseAdmin
    .from("apartments")
    .select("*")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error) {
    console.error(
      "관리자 단지 수정 조회 오류:",
      error
    );

    notFound();
  }

  if (!data) {
    notFound();
  }

  const apartmentData =
    data.data ?? {};

  const apartment = {
    ...apartmentData,

    slug: data.slug,
    name: data.name ?? apartmentData.name ?? "",
    brand:
      data.brand ?? apartmentData.brand ?? "",
    builder:
      data.builder ??
      apartmentData.builder ??
      "",

    city:
      apartmentData.city ??
      data.city ??
      "",

    cityName:
      apartmentData.cityName ??
      data.city ??
      "",

    district:
      apartmentData.district ??
      data.district ??
      "",

    districtName:
      apartmentData.districtName ??
      data.district ??
      "",

    region:
      data.region ??
      apartmentData.region ??
      "",

    latitude:
      data.latitude ??
      apartmentData.latitude ??
      null,

    longitude:
      data.longitude ??
      apartmentData.longitude ??
      null,

    type:
      data.type ??
      apartmentData.type ??
      "아파트",

    status:
      data.status ??
      apartmentData.status ??
      "등록예정",

    price:
      apartmentData.price ?? "",

    condition:
      apartmentData.condition ??
      data.condition ??
      "",

    priceDetail:
      apartmentData.priceDetail ?? {
        salePrice:
          apartmentData.price ?? "",
        pricePerPyeong: "",
        contractPrice: "",
        middlePayment: "",
        balance: "",
        options: [],
      },

    projectInfo:
      apartmentData.projectInfo ?? {
        totalHouseholds: "",
        saleHouseholds: "",
        parking: "",
        scale: "",
        usage:
          data.type ??
          apartmentData.type ??
          "아파트",
        moveInDate: "",
        developer: "",
        phone: "",
      },

    locationInfo:
      apartmentData.locationInfo ?? {
        transport: "",
        education: "",
        living: "",
        jobAccess: "",
        nature: "",
        futureValue: "",
        cautions: "",
      },

    score:
      apartmentData.score ?? {
        total:
          data.score_total ?? 0,
        price: 0,
        contract: 0,
        location: 0,
        living: 0,
        future: 0,
        risk: 0,
      },

    images:
      apartmentData.images ?? {
        hero:
          data.hero_image
            ? [data.hero_image]
            : [],
        location: [],
        floorPlans: [],
        community: [],
        gallery: [],
      },
  };

  return (
    <AdminProvider
      initialApartment={apartment}
    >
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
        <section className="mx-auto max-w-7xl">
          <Link
            href="/admin/apartments"
            className="
              inline-flex items-center rounded-xl
              px-3 py-2 text-sm font-bold
              text-zinc-500
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-emerald-50
              hover:text-emerald-700
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500
              focus-visible:ring-offset-2
            "
          >
            ← 단지 관리로 돌아가기
          </Link>

          <div className="mt-6 rounded-3xl bg-[#132238] p-8 text-white shadow-sm">
            <p className="text-sm font-bold text-emerald-300">
              EDIT APARTMENT
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              단지 수정
            </h1>

            <p className="mt-4 text-zinc-300">
              {apartment.name} 정보를 수정합니다.
            </p>
          </div>

          <AdminEditor mode="edit" />
        </section>
      </main>
    </AdminProvider>
  );
}