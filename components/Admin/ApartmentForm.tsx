"use client";

type Props = {
  form: {
    name: string;
    brand: string;
    builder: string;
    cityName: string;
    region: string;
    salePrice: string;
    pricePerPyeong: string;
    heroImage: string;
    galleryImages: string;
    memo: string;
  };
  setForm: (form: Props["form"]) => void;
};

export default function ApartmentForm({ form, setForm }: Props) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">단지 등록</p>
      <h2 className="mt-2 text-2xl font-bold">기본정보 입력</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="단지명" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="브랜드" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
        <Input label="시공사" value={form.builder} onChange={(v) => setForm({ ...form, builder: v })} />
        <Input label="지역명" value={form.cityName} onChange={(v) => setForm({ ...form, cityName: v })} />
        <Input label="주소/입지" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
        <Input label="분양가" value={form.salePrice} onChange={(v) => setForm({ ...form, salePrice: v })} />
        <Input label="평당가" value={form.pricePerPyeong} onChange={(v) => setForm({ ...form, pricePerPyeong: v })} />
        <Input label="대표 이미지 경로" value={form.heroImage} onChange={(v) => setForm({ ...form, heroImage: v })} />
      </div>

      <div className="mt-4">
        <Textarea
          label="갤러리 이미지 경로"
          value={form.galleryImages}
          onChange={(v) => setForm({ ...form, galleryImages: v })}
          placeholder="/images/apartments/example/1.jpg&#10;/images/apartments/example/2.jpg"
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="기타 특이사항"
          value={form.memo}
          onChange={(v) => setForm({ ...form, memo: v })}
          placeholder="예: 일부 세대 한정, 고층 제외, 상품권 지급 등"
        />
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-zinc-400"
      />
    </label>
  );
}