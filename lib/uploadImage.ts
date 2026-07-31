import { supabase } from "./supabase";

const STORAGE_BUCKET = "apartments";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type ImagePreset = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
};

function getImagePreset(
  folder: string
): ImagePreset {
  if (
    folder.includes(
      "/floorPlans"
    )
  ) {
    return {
      maxWidth: 2400,
      maxHeight: 2400,
      quality: 0.9,
    };
  }

  if (
    folder.includes("/hero")
  ) {
    return {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.82,
    };
  }

  return {
    maxWidth: 1600,
    maxHeight: 2000,
    quality: 0.8,
  };
}

function getResizedSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const scale = Math.min(
    1,
    maxWidth / width,
    maxHeight / height
  );

  return {
    width: Math.max(
      1,
      Math.round(width * scale)
    ),
    height: Math.max(
      1,
      Math.round(height * scale)
    ),
  };
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number
) {
  return new Promise<Blob>(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "이미지를 WebP로 변환하지 못했습니다."
              )
            );

            return;
          }

          resolve(blob);
        },
        "image/webp",
        quality
      );
    }
  );
}

async function convertToWebp(
  file: File,
  folder: string
) {
  if (
    !SUPPORTED_IMAGE_TYPES.has(
      file.type
    )
  ) {
    throw new Error(
      "JPG, JPEG, PNG, WebP 이미지만 업로드할 수 있습니다."
    );
  }

  const preset =
    getImagePreset(folder);

  const bitmap =
    await createImageBitmap(
      file,
      {
        imageOrientation:
          "from-image",
      }
    );

  try {
    const resized =
      getResizedSize(
        bitmap.width,
        bitmap.height,
        preset.maxWidth,
        preset.maxHeight
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      resized.width;

    canvas.height =
      resized.height;

    const context =
      canvas.getContext(
        "2d",
        {
          alpha: true,
        }
      );

    if (!context) {
      throw new Error(
        "이미지 변환 기능을 사용할 수 없습니다."
      );
    }

    context.imageSmoothingEnabled =
      true;

    context.imageSmoothingQuality =
      "high";

    context.drawImage(
      bitmap,
      0,
      0,
      resized.width,
      resized.height
    );

    return canvasToWebpBlob(
      canvas,
      preset.quality
    );
  } finally {
    bitmap.close();
  }
}

function makeFileName() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.webp`;
}

export async function uploadImage(
  file: File,
  folder: string
) {
  const webpBlob =
    await convertToWebp(
      file,
      folder
    );

  const fileName =
    makeFileName();

  const path =
    `${folder}/${fileName}`;

  const {
    error,
  } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(
      path,
      webpBlob,
      {
        contentType:
          "image/webp",
        cacheControl:
          "31536000",
        upsert: false,
      }
    );

  if (error) {
    throw error;
  }

  return supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)
    .data.publicUrl;
}