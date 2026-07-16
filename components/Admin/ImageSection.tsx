"use client";

import { useState } from "react";
import { uploadImage } from "../../lib/uploadImage";
import { useAdmin } from "./AdminContext";

type ImageCategory = "hero" | "location" | "community" | "gallery";

function makeSafeFolderName(name: string) {
  const source = name.trim() || "draft-apartment";

  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  return `apt-${Math.abs(hash).toString(36)}`;
}

export default function ImageSection() {
  const { basicInfo, images, setImages } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [floorPlanName, setFloorPlanName] = useState("");

  const baseFolder = makeSafeFolderName(basicInfo.name);

  const uploadFiles = async (
    files: FileList | null,
    category: ImageCategory
  ) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const folder = `${baseFolder}/${category}`;

      const urls = await Promise.all(
        Array.from(files).map((file) => uploadImage(file, folder))
      );

      if (category === "hero") {
        setImages({
          ...images,
          hero: [urls[0]],
        });
      } else {
        setImages({
          ...images,
          [category]: [...images[category], ...urls],
        });
      }
    } catch (error) {
      console.error(error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const uploadFloorPlan = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const typeName = floorPlanName.trim();

    if (!typeName) {
      alert("평면도 타입명을 먼저 입력해주세요. 예: 84A, 84B, 95A");
      return;
    }

    setUploading(true);

    try {
      const folder = `${baseFolder}/floorPlans`;

      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const url = await uploadImage(file, folder);

          return {
            name: typeName,
            url,
          };
        })
      );

      setImages({
        ...images,
        floorPlans: [...images.floorPlans, ...uploaded],
      });

      setFloorPlanName("");
    } catch (error) {
      console.error(error);
      alert("평면도 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (category: ImageCategory, url: string) => {
    setImages({
      ...images,
      [category]: images[category].filter((image) => image !== url),
    });
  };

  const removeFloorPlan = (url: string) => {
    setImages({
      ...images,
      floorPlans: images.floorPlans.filter((item) => item.url !== url),
    });
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">이미지 등록</h2>

      <p className="mt-2 text-sm text-zinc-500">
        대표 이미지, 입지, 평면도, 커뮤니티, 갤러리를 분류해서 등록합니다.
      </p>

      <p className="mt-3 text-xs text-zinc-400">저장 폴더: {baseFolder}</p>

      {uploading && (
        <div className="mt-4 rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-600">
          이미지 업로드 중입니다...
        </div>
      )}

      <div className="mt-6 space-y-8">
        <UploadBox
          title="대표 이미지"
          description="홈 화면과 상세페이지 상단에 노출됩니다. 1장만 사용합니다."
          multiple={false}
          images={images.hero}
          onUpload={(files) => uploadFiles(files, "hero")}
          onRemove={(url) => removeImage("hero", url)}
        />

        <UploadBox
          title="입지 이미지"
          description="입지, 교통, 생활권, 지도 이미지를 등록합니다."
          multiple
          images={images.location}
          onUpload={(files) => uploadFiles(files, "location")}
          onRemove={(url) => removeImage("location", url)}
        />

        <FloorPlanUploadBox
          floorPlanName={floorPlanName}
          setFloorPlanName={setFloorPlanName}
          floorPlans={images.floorPlans}
          onUpload={uploadFloorPlan}
          onRemove={removeFloorPlan}
        />

        <UploadBox
          title="커뮤니티 이미지"
          description="피트니스, 골프연습장, 사우나, 카페 등 커뮤니티 이미지를 등록합니다."
          multiple
          images={images.community}
          onUpload={(files) => uploadFiles(files, "community")}
          onRemove={(url) => removeImage("community", url)}
        />

        <UploadBox
          title="갤러리"
          description="상세페이지 하단에 추가로 보여줄 이미지를 등록합니다."
          multiple
          images={images.gallery}
          onUpload={(files) => uploadFiles(files, "gallery")}
          onRemove={(url) => removeImage("gallery", url)}
        />
      </div>
    </section>
  );
}

function UploadBox({
  title,
  description,
  multiple,
  images,
  onUpload,
  onRemove,
}: {
  title: string;
  description: string;
  multiple?: boolean;
  images: string[];
  onUpload: (files: FileList | null) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>

      <label className="mt-3 flex h-36 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:bg-zinc-100">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />

        <div className="text-center">
          <p className="text-lg font-semibold">📷 이미지 업로드</p>
          <p className="mt-2 text-sm text-zinc-500">
            클릭해서 이미지를 선택하세요
          </p>
        </div>
      </label>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative">
              <img
                src={image}
                alt={title}
                className="h-24 w-full rounded-xl object-cover"
              />

              <button
                type="button"
                onClick={() => onRemove(image)}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FloorPlanUploadBox({
  floorPlanName,
  setFloorPlanName,
  floorPlans,
  onUpload,
  onRemove,
}: {
  floorPlanName: string;
  setFloorPlanName: (value: string) => void;
  floorPlans: { name: string; url: string }[];
  onUpload: (files: FileList | null) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div>
      <p className="font-bold">평면도</p>
      <p className="mt-1 text-sm text-zinc-500">
        84A, 84B, 95A처럼 타입명을 입력한 뒤 평면도 이미지를 업로드합니다.
      </p>

      <div className="mt-3 flex gap-3">
        <input
          value={floorPlanName}
          onChange={(e) => setFloorPlanName(e.target.value)}
          placeholder="예: 84A, 84B, 95A"
          className="h-12 flex-1 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400"
        />

        <label className="flex h-12 cursor-pointer items-center rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white">
          평면도 업로드
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
        </label>
      </div>

      {floorPlans.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {floorPlans.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              <img
                src={item.url}
                alt={item.name}
                className="h-24 w-full object-cover"
              />

              <div className="p-2">
                <p className="text-sm font-bold">{item.name}</p>
              </div>

              <button
                type="button"
                onClick={() => onRemove(item.url)}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}