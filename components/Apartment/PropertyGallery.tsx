"use client";
import Image from "next/image";
import { useState } from "react";
export default function PropertyGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const active = Math.min(index, images.length - 1);
  if (!images.length) return null;
  return (
    <div className="property-hero-image">
      <Image
        src={images[active]}
        alt={`${name} 대표·갤러리 이미지 ${active + 1}`}
        fill
        priority
        quality={90}
        sizes="(max-width:768px) 100vw, 800px"
        className="object-cover"
      />
      {images.length > 1 && (
        <div className="property-gallery-controls">
          <button
            type="button"
            aria-label="이전 단지 사진"
            onClick={() =>
              setIndex((active - 1 + images.length) % images.length)
            }
          >
            ←
          </button>
          <span>
            {active + 1} / {images.length}
          </span>
          <button
            type="button"
            aria-label="다음 단지 사진"
            onClick={() => setIndex((active + 1) % images.length)}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
