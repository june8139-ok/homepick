"use client";

import { useMemo, useState } from "react";

type FloorPlan = {
  name: string;
  url: string;
};

type ApartmentImages = {
  location?: string[];
  floorPlans?: FloorPlan[];
  community?: string[];
  gallery?: string[];
};

type ImageItem = {
  url: string;
  label: string;
  category: string;
};

type ImageTab = {
  key: string;
  title: string;
  images: ImageItem[];
};

type Props = {
  images?: ApartmentImages;
};

export default function ApartmentImageSections({ images }: Props) {
  const location = images?.location ?? [];
  const floorPlans = images?.floorPlans ?? [];
  const community = images?.community ?? [];
  const gallery = images?.gallery ?? [];

  const tabs = useMemo<ImageTab[]>(() => {
    const result: ImageTab[] = [];

    if (location.length > 0) {
      result.push({
        key: "location",
        title: "입지",
        images: location.map((url, index) => ({
          url,
          label: `입지 ${index + 1}`,
          category: "입지",
        })),
      });
    }

    if (floorPlans.length > 0) {
      result.push({
        key: "floorPlans",
        title: "평면도",
        images: floorPlans.map((plan) => ({
          url: plan.url,
          label: plan.name,
          category: "평면도",
        })),
      });
    }

    if (community.length > 0) {
      result.push({
        key: "community",
        title: "커뮤니티",
        images: community.map((url, index) => ({
          url,
          label: `커뮤니티 ${index + 1}`,
          category: "커뮤니티",
        })),
      });
    }

    if (gallery.length > 0) {
      result.push({
        key: "gallery",
        title: "갤러리",
        images: gallery.map((url, index) => ({
          url,
          label: `갤러리 ${index + 1}`,
          category: "갤러리",
        })),
      });
    }

    const allImages = result.flatMap((tab) => tab.images);

    if (allImages.length > 0) {
      result.unshift({
        key: "all",
        title: "전체",
        images: allImages,
      });
    }

    return result;
  }, [location, floorPlans, community, gallery]);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (tabs.length === 0) return null;

  const activeTab = tabs[activeTabIndex] ?? tabs[0];
  const activeImages = activeTab.images;
  const activeImage = activeImages[activeImageIndex] ?? activeImages[0];

  const moveImage = (direction: "prev" | "next") => {
    if (activeImages.length <= 1) return;

    if (direction === "prev") {
      setActiveImageIndex((prev) =>
        prev === 0 ? activeImages.length - 1 : prev - 1
      );
    }

    if (direction === "next") {
      setActiveImageIndex((prev) =>
        prev === activeImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const changeTab = (index: number) => {
    setActiveTabIndex(index);
    setActiveImageIndex(0);
  };

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">단지 이미지</h2>
          <p className="mt-2 text-sm text-zinc-500">
            입지, 평면도, 커뮤니티 이미지를 탭으로 확인할 수 있습니다.
          </p>
        </div>

        <p className="text-sm text-zinc-500">
          총 {tabs[0].images.length}장
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => changeTab(index)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTabIndex === index
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {tab.title} {tab.images.length}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-zinc-100">
        <div className="relative">
          <img
            src={activeImage.url}
            alt={activeImage.label}
            className="h-[420px] w-full object-contain bg-zinc-100"
          />

          {activeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveImage("prev")}
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => moveImage("next")}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            {activeImage.category} · {activeImage.label}
          </div>

          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            {activeImageIndex + 1} / {activeImages.length}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {activeImages.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => setActiveImageIndex(index)}
            className={`overflow-hidden rounded-2xl border transition ${
              activeImageIndex === index
                ? "border-zinc-900 ring-2 ring-zinc-900"
                : "border-zinc-200"
            }`}
          >
            <img
              src={image.url}
              alt={image.label}
              className="h-24 w-full object-cover"
            />
            <div className="bg-white p-2 text-left">
              <p className="truncate text-xs font-bold">{image.label}</p>
              <p className="text-[11px] text-zinc-500">{image.category}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}