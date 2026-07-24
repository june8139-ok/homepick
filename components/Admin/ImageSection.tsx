"use client";

import {
  useRef,
  useState,
} from "react";

import {
  uploadImage,
} from "../../lib/uploadImage";

import {
  useAdmin,
} from "./AdminContext";

type ImageCategory =
  | "hero"
  | "location"
  | "community"
  | "gallery";

type FloorPlan = {
  name: string;
  url: string;
};

function makeSafeFolderName(
  name: string
) {
  const source =
    name.trim() ||
    "draft-apartment";

  let hash = 0;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    hash =
      (hash << 5) -
      hash +
      source.charCodeAt(
        index
      );

    hash |= 0;
  }

  return `apt-${Math.abs(
    hash
  ).toString(36)}`;
}

function moveItem<T>(
  items: T[],
  fromIndex: number,
  toIndex: number
) {
  if (
    toIndex < 0 ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [
    ...items,
  ];

  const [
    movedItem,
  ] = nextItems.splice(
    fromIndex,
    1
  );

  nextItems.splice(
    toIndex,
    0,
    movedItem
  );

  return nextItems;
}

export default function ImageSection() {
  const {
    basicInfo,
    images,
    setImages,
  } = useAdmin();

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    uploadStatus,
    setUploadStatus,
  ] = useState("");

  const [
    floorPlanName,
    setFloorPlanName,
  ] = useState("");

  const baseFolder =
    makeSafeFolderName(
      basicInfo.name
    );

  const uploadFiles =
    async (
      files: FileList | null,
      category: ImageCategory
    ) => {
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

      const selectedFiles =
        Array.from(files);

      setUploading(true);
      setUploadStatus(
        `${selectedFiles.length}개 이미지를 업로드하고 있습니다.`
      );

      try {
        const folder =
          `${baseFolder}/${category}`;

        const urls =
          await Promise.all(
            selectedFiles.map(
              (file) =>
                uploadImage(
                  file,
                  folder
                )
            )
          );

        if (
          category === "hero"
        ) {
          setImages({
            ...images,
            hero: [
              urls[0],
            ],
          });
        } else {
          setImages({
            ...images,
            [category]: [
              ...images[
                category
              ],
              ...urls,
            ],
          });
        }

        setUploadStatus(
          `${urls.length}개 이미지 업로드가 완료되었습니다.`
        );
      } catch (error) {
        console.error(
          "이미지 업로드 오류:",
          error
        );

        setUploadStatus("");

        alert(
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 오류가 발생했습니다."
        );
      } finally {
        setUploading(false);
      }
    };

  const uploadFloorPlan =
    async (
      files: FileList | null
    ) => {
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

      const typeName =
        floorPlanName.trim();

      if (!typeName) {
        alert(
          "평면도 타입명을 먼저 입력해주세요. 예: 84A, 84B, 95A"
        );

        return;
      }

      const selectedFiles =
        Array.from(files);

      setUploading(true);

      setUploadStatus(
        `${typeName} 평면도 ${selectedFiles.length}개를 업로드하고 있습니다.`
      );

      try {
        const folder =
          `${baseFolder}/floorPlans`;

        const uploaded =
          await Promise.all(
            selectedFiles.map(
              async (file) => {
                const url =
                  await uploadImage(
                    file,
                    folder
                  );

                return {
                  name:
                    typeName,
                  url,
                };
              }
            )
          );

        setImages({
          ...images,

          floorPlans: [
            ...images.floorPlans,
            ...uploaded,
          ],
        });

        setFloorPlanName("");

        setUploadStatus(
          `${typeName} 평면도 업로드가 완료되었습니다.`
        );
      } catch (error) {
        console.error(
          "평면도 업로드 오류:",
          error
        );

        setUploadStatus("");

        alert(
          error instanceof Error
            ? error.message
            : "평면도 업로드 중 오류가 발생했습니다."
        );
      } finally {
        setUploading(false);
      }
    };

  const removeImage = (
    category: ImageCategory,
    url: string
  ) => {
    setImages({
      ...images,

      [category]:
        images[
          category
        ].filter(
          (image) =>
            image !== url
        ),
    });
  };

  const moveImage = (
    category: Exclude<
      ImageCategory,
      "hero"
    >,
    fromIndex: number,
    toIndex: number
  ) => {
    setImages({
      ...images,

      [category]:
        moveItem(
          images[
            category
          ],
          fromIndex,
          toIndex
        ),
    });
  };

  const removeFloorPlan = (
    url: string
  ) => {
    setImages({
      ...images,

      floorPlans:
        images.floorPlans.filter(
          (item) =>
            item.url !== url
        ),
    });
  };

  const moveFloorPlan = (
    fromIndex: number,
    toIndex: number
  ) => {
    setImages({
      ...images,

      floorPlans:
        moveItem(
          images.floorPlans,
          fromIndex,
          toIndex
        ),
    });
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-emerald-600">
            IMAGE MANAGEMENT
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
            단지 이미지
          </h2>

          <p className="mt-2 max-w-2xl break-keep text-sm leading-6 text-zinc-500">
            대표 이미지와 입지,
            평면도, 커뮤니티,
            갤러리 이미지를 분류해
            등록합니다.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-500">
          총{" "}
          {images.hero.length +
            images.location
              .length +
            images.floorPlans
              .length +
            images.community
              .length +
            images.gallery
              .length}
          장
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-500">
          저장 폴더
        </p>

        <p className="mt-1 break-all text-xs font-bold text-zinc-700">
          {baseFolder}
        </p>
      </div>

      {(uploading ||
        uploadStatus) && (
        <div
          className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
            uploading
              ? "border-blue-100 bg-blue-50 text-blue-700"
              : "border-emerald-100 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {uploading
            ? "⏳ "
            : "✓ "}
          {uploadStatus}
        </div>
      )}

      <div className="mt-7 space-y-8">
        <HeroUploadBox
          image={
            images.hero[0]
          }
          disabled={
            uploading
          }
          onUpload={(
            files
          ) =>
            uploadFiles(
              files,
              "hero"
            )
          }
          onRemove={() =>
            setImages({
              ...images,
              hero: [],
            })
          }
        />

        <ImageUploadBox
          title="입지 이미지"
          description="지도, 교통망, 생활권과 주변 환경 이미지를 등록합니다."
          images={
            images.location
          }
          disabled={
            uploading
          }
          onUpload={(
            files
          ) =>
            uploadFiles(
              files,
              "location"
            )
          }
          onRemove={(
            url
          ) =>
            removeImage(
              "location",
              url
            )
          }
          onMove={(
            fromIndex,
            toIndex
          ) =>
            moveImage(
              "location",
              fromIndex,
              toIndex
            )
          }
        />

        <FloorPlanUploadBox
          floorPlanName={
            floorPlanName
          }
          setFloorPlanName={
            setFloorPlanName
          }
          floorPlans={
            images.floorPlans
          }
          disabled={
            uploading
          }
          onUpload={
            uploadFloorPlan
          }
          onRemove={
            removeFloorPlan
          }
          onMove={
            moveFloorPlan
          }
        />

        <ImageUploadBox
          title="커뮤니티 이미지"
          description="피트니스, 골프연습장, 사우나, 카페 등 커뮤니티 시설을 등록합니다."
          images={
            images.community
          }
          disabled={
            uploading
          }
          onUpload={(
            files
          ) =>
            uploadFiles(
              files,
              "community"
            )
          }
          onRemove={(
            url
          ) =>
            removeImage(
              "community",
              url
            )
          }
          onMove={(
            fromIndex,
            toIndex
          ) =>
            moveImage(
              "community",
              fromIndex,
              toIndex
            )
          }
        />

        <ImageUploadBox
          title="갤러리"
          description="상세페이지에서 추가로 보여줄 단지 조감도와 기타 이미지를 등록합니다."
          images={
            images.gallery
          }
          disabled={
            uploading
          }
          onUpload={(
            files
          ) =>
            uploadFiles(
              files,
              "gallery"
            )
          }
          onRemove={(
            url
          ) =>
            removeImage(
              "gallery",
              url
            )
          }
          onMove={(
            fromIndex,
            toIndex
          ) =>
            moveImage(
              "gallery",
              fromIndex,
              toIndex
            )
          }
        />
      </div>
    </section>
  );
}

function HeroUploadBox({
  image,
  disabled,
  onUpload,
  onRemove,
}: {
  image?: string;
  disabled: boolean;
  onUpload: (
    files: FileList | null
  ) => void;
  onRemove: () => void;
}) {
  return (
    <SectionGroup
      title="대표 이미지"
      description="홈 카드와 상세페이지 상단에 노출됩니다. 대표 이미지는 1장만 사용합니다."
      count={
        image ? 1 : 0
      }
    >
      {image ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="relative">
            <img
              src={image}
              alt="단지 대표 이미지"
              className="h-56 w-full object-cover sm:h-72"
            />

            <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white shadow">
              대표 이미지
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-xs font-semibold text-zinc-500">
              새 이미지를 업로드하면
              기존 대표 이미지가
              교체됩니다.
            </p>

            <div className="flex gap-2">
              <FileUploadButton
                label="대표 이미지 교체"
                disabled={
                  disabled
                }
                onUpload={
                  onUpload
                }
              />

              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={
                  onRemove
                }
                className="cursor-pointer rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : (
        <DropUploadArea
          multiple={
            false
          }
          disabled={
            disabled
          }
          title="대표 이미지 업로드"
          description="이미지를 끌어다 놓거나 클릭해서 1장을 선택하세요."
          onUpload={
            onUpload
          }
        />
      )}
    </SectionGroup>
  );
}

function ImageUploadBox({
  title,
  description,
  images,
  disabled,
  onUpload,
  onRemove,
  onMove,
}: {
  title: string;
  description: string;
  images: string[];
  disabled: boolean;
  onUpload: (
    files: FileList | null
  ) => void;
  onRemove: (
    url: string
  ) => void;
  onMove: (
    fromIndex: number,
    toIndex: number
  ) => void;
}) {
  return (
    <SectionGroup
      title={title}
      description={
        description
      }
      count={
        images.length
      }
    >
      <DropUploadArea
        multiple
        disabled={
          disabled
        }
        title={`${title} 업로드`}
        description="여러 장을 한 번에 선택하거나 드래그해서 올릴 수 있습니다."
        onUpload={
          onUpload
        }
      />

      {images.length >
        0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {images.map(
            (
              image,
              index
            ) => (
              <ImageCard
                key={`${image}-${index}`}
                image={
                  image
                }
                alt={`${title} ${index + 1}`}
                index={
                  index
                }
                total={
                  images.length
                }
                disabled={
                  disabled
                }
                onMove={
                  onMove
                }
                onRemove={() =>
                  onRemove(
                    image
                  )
                }
              />
            )
          )}
        </div>
      )}
    </SectionGroup>
  );
}

function FloorPlanUploadBox({
  floorPlanName,
  setFloorPlanName,
  floorPlans,
  disabled,
  onUpload,
  onRemove,
  onMove,
}: {
  floorPlanName: string;
  setFloorPlanName: (
    value: string
  ) => void;
  floorPlans: FloorPlan[];
  disabled: boolean;
  onUpload: (
    files: FileList | null
  ) => void;
  onRemove: (
    url: string
  ) => void;
  onMove: (
    fromIndex: number,
    toIndex: number
  ) => void;
}) {
  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  return (
    <SectionGroup
      title="평면도"
      description="타입명을 먼저 입력한 뒤 해당 타입의 평면도 이미지를 등록합니다."
      count={
        floorPlans.length
      }
    >
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <label className="block">
          <p className="mb-2 text-sm font-extrabold text-[#132238]">
            평면 타입명
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={
                floorPlanName
              }
              disabled={
                disabled
              }
              onChange={(
                event
              ) =>
                setFloorPlanName(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  floorPlanName.trim()
                ) {
                  event.preventDefault();

                  inputRef.current?.click();
                }
              }}
              placeholder="예: 84A, 84B, 95A"
              className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              disabled={
                disabled ||
                !floorPlanName.trim()
              }
              onClick={() =>
                inputRef.current?.click()
              }
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-[#132238] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              평면도 선택
            </button>

            <input
              ref={
                inputRef
              }
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(
                event
              ) => {
                onUpload(
                  event.target
                    .files
                );

                event.currentTarget.value =
                  "";
              }}
            />
          </div>
        </label>

        <p className="mt-2 text-xs leading-5 text-zinc-400">
          같은 타입의 이미지가
          여러 장이면 한 번에
          선택할 수 있습니다.
        </p>
      </div>

      {floorPlans.length >
        0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {floorPlans.map(
            (
              item,
              index
            ) => (
              <div
                key={`${item.url}-${index}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="relative">
                  <img
                    src={
                      item.url
                    }
                    alt={`${item.name} 평면도`}
                    className="h-32 w-full object-cover"
                  />

                  <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-[#132238] shadow">
                    {item.name}
                  </span>
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-black text-[#132238]">
                    {item.name}
                  </p>

                  <ImageControls
                    index={
                      index
                    }
                    total={
                      floorPlans.length
                    }
                    disabled={
                      disabled
                    }
                    onMove={
                      onMove
                    }
                    onRemove={() =>
                      onRemove(
                        item.url
                      )
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </SectionGroup>
  );
}

function SectionGroup({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-zinc-100 pt-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-[#132238]">
            {title}
          </h3>

          <p className="mt-1 break-keep text-xs leading-5 text-zinc-500">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
          {count}장
        </span>
      </div>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

function DropUploadArea({
  multiple = false,
  disabled,
  title,
  description,
  onUpload,
}: {
  multiple?: boolean;
  disabled: boolean;
  title: string;
  description: string;
  onUpload: (
    files: FileList | null
  ) => void;
}) {
  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  return (
    <label
      onDragEnter={(
        event
      ) => {
        event.preventDefault();

        if (
          !disabled
        ) {
          setIsDragging(
            true
          );
        }
      }}
      onDragOver={(
        event
      ) => {
        event.preventDefault();
      }}
      onDragLeave={(
        event
      ) => {
        event.preventDefault();

        setIsDragging(
          false
        );
      }}
      onDrop={(
        event
      ) => {
        event.preventDefault();

        setIsDragging(
          false
        );

        if (
          !disabled
        ) {
          onUpload(
            event.dataTransfer
              .files
          );
        }
      }}
      className={[
        "flex min-h-36 items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center",
        "transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-60"
          : "cursor-pointer",
        isDragging
          ? "border-emerald-500 bg-emerald-50 shadow-md"
          : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50",
      ].join(" ")}
    >
      <input
        type="file"
        accept="image/*"
        multiple={
          multiple
        }
        disabled={
          disabled
        }
        className="hidden"
        onChange={(
          event
        ) => {
          onUpload(
            event.target
              .files
          );

          event.currentTarget.value =
            "";
        }}
      />

      <div>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
          📷
        </div>

        <p className="mt-3 text-sm font-extrabold text-[#132238]">
          {title}
        </p>

        <p className="mt-1 break-keep text-xs leading-5 text-zinc-500">
          {isDragging
            ? "여기에 놓으면 업로드됩니다."
            : description}
        </p>
      </div>
    </label>
  );
}

function FileUploadButton({
  label,
  disabled,
  onUpload,
}: {
  label: string;
  disabled: boolean;
  onUpload: (
    files: FileList | null
  ) => void;
}) {
  return (
    <label
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#132238] px-4 py-2.5 text-xs font-bold text-white",
        "transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2",
        disabled
          ? "pointer-events-none opacity-50"
          : "",
      ].join(" ")}
    >
      {label}

      <input
        type="file"
        accept="image/*"
        disabled={
          disabled
        }
        className="hidden"
        onChange={(
          event
        ) => {
          onUpload(
            event.target
              .files
          );

          event.currentTarget.value =
            "";
        }}
      />
    </label>
  );
}

function ImageCard({
  image,
  alt,
  index,
  total,
  disabled,
  onMove,
  onRemove,
}: {
  image: string;
  alt: string;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (
    fromIndex: number,
    toIndex: number
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
      <div className="relative">
        <img
          src={image}
          alt={alt}
          className="h-32 w-full object-cover"
        />

        {index === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow">
            첫 이미지
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs font-semibold text-zinc-500">
          {index + 1}번째
          이미지
        </p>

        <ImageControls
          index={index}
          total={total}
          disabled={
            disabled
          }
          onMove={
            onMove
          }
          onRemove={
            onRemove
          }
        />
      </div>
    </div>
  );
}

function ImageControls({
  index,
  total,
  disabled,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  disabled: boolean;
  onMove: (
    fromIndex: number,
    toIndex: number
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      <button
        type="button"
        aria-label="이미지 순서를 앞으로 이동"
        disabled={
          disabled ||
          index === 0
        }
        onClick={() =>
          onMove(
            index,
            index - 1
          )
        }
        className="cursor-pointer rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ←
      </button>

      <button
        type="button"
        aria-label="이미지 순서를 뒤로 이동"
        disabled={
          disabled ||
          index ===
            total - 1
        }
        onClick={() =>
          onMove(
            index,
            index + 1
          )
        }
        className="cursor-pointer rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-bold text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
      >
        →
      </button>

      <button
        type="button"
        disabled={
          disabled
        }
        onClick={
          onRemove
        }
        className="ml-auto cursor-pointer rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        삭제
      </button>
    </div>
  );
}