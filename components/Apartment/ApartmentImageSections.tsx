"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";

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

type ImageCategory =
  | "location"
  | "floorPlan"
  | "community"
  | "gallery";

type ImageItem = {
  id: string;
  url: string;
  category: ImageCategory;
  label: string;
  alt: string;
};

type Props = {
  images?: ApartmentImages;
  apartmentName?: string;
};

function createAlt(
  apartmentName: string,
  category: ImageCategory,
  label: string
) {
  const name =
    apartmentName.trim() ||
    "아파트";

  switch (category) {
    case "location":
      return `${name} 입지환경 ${label}`;

    case "floorPlan":
      return `${name} ${label} 평면도`;

    case "community":
      return `${name} 커뮤니티 ${label}`;

    case "gallery":
      return `${name} 단지 이미지 ${label}`;

    default:
      return `${name} 단지 이미지`;
  }
}

function getCategoryBadge(
  category: ImageCategory
) {
  switch (category) {
    case "location":
      return "입지";

    case "floorPlan":
      return "평면";

    case "community":
      return "커뮤니티";

    case "gallery":
      return "단지사진";

    default:
      return "이미지";
  }
}

function getCategoryBadgeClassName(
  category: ImageCategory
) {
  switch (category) {
    case "location":
      return "bg-sky-600/90 text-white";

    case "floorPlan":
      return "bg-violet-600/90 text-white";

    case "community":
      return "bg-amber-500/95 text-white";

    case "gallery":
      return "bg-zinc-900/80 text-white";

    default:
      return "bg-zinc-900/80 text-white";
  }
}

/**
 * 버튼이나 링크처럼 별도의 클릭 기능이 있는 요소에서는
 * 부모 이미지의 드래그·확대 기능을 시작하지 않습니다.
 */
function isInteractiveTarget(
  target: EventTarget | null
) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "button, a, input, label"
      )
    )
  );
}

export default function ApartmentImageSections({
  images,
  apartmentName = "",
}: Props) {
  const location =
    images?.location ?? [];

  const floorPlans =
    images?.floorPlans ?? [];

  const community =
    images?.community ?? [];

  const gallery =
    images?.gallery ?? [];

  const imageItems =
    useMemo<ImageItem[]>(
      () => {
        const result: ImageItem[] =
          [];

        location.forEach(
          (url, index) => {
            const label =
              location.length > 1
                ? `입지 ${index + 1}`
                : "입지";

            result.push({
              id: `location-${index}-${url}`,
              url,
              category:
                "location",
              label,
              alt: createAlt(
                apartmentName,
                "location",
                label
              ),
            });
          }
        );

        floorPlans.forEach(
          (plan, index) => {
            const label =
              plan.name?.trim() ||
              `타입 ${index + 1}`;

            result.push({
              id: `floor-plan-${index}-${plan.url}`,
              url: plan.url,
              category:
                "floorPlan",
              label,
              alt: createAlt(
                apartmentName,
                "floorPlan",
                label
              ),
            });
          }
        );

        community.forEach(
          (url, index) => {
            const label =
              community.length > 1
                ? `커뮤니티 ${index + 1}`
                : "커뮤니티";

            result.push({
              id: `community-${index}-${url}`,
              url,
              category:
                "community",
              label,
              alt: createAlt(
                apartmentName,
                "community",
                label
              ),
            });
          }
        );

        gallery.forEach(
          (url, index) => {
            const label =
              gallery.length > 1
                ? `단지사진 ${index + 1}`
                : "단지사진";

            result.push({
              id: `gallery-${index}-${url}`,
              url,
              category:
                "gallery",
              label,
              alt: createAlt(
                apartmentName,
                "gallery",
                label
              ),
            });
          }
        );

        return result;
      },
      [
        apartmentName,
        community,
        floorPlans,
        gallery,
        location,
      ]
    );

  const [
    activeImageIndex,
    setActiveImageIndex,
  ] = useState(0);

  const [
    viewerOpen,
    setViewerOpen,
  ] = useState(false);

  const pointerStartX =
    useRef<number | null>(
      null
    );

  const pointerCurrentX =
    useRef<number | null>(
      null
    );

  const pointerMoved =
    useRef(false);

  const thumbnailRefs =
    useRef<
      Array<HTMLButtonElement | null>
    >([]);

  useEffect(() => {
    if (
      activeImageIndex >=
      imageItems.length
    ) {
      setActiveImageIndex(0);
    }
  }, [
    activeImageIndex,
    imageItems.length,
  ]);

  const moveImage =
    useCallback(
      (
        direction:
          | "prev"
          | "next"
      ) => {
        if (
          imageItems.length <= 1
        ) {
          return;
        }

        setActiveImageIndex(
          (currentIndex) => {
            if (
              direction ===
              "prev"
            ) {
              return currentIndex ===
                0
                ? imageItems.length -
                    1
                : currentIndex - 1;
            }

            return currentIndex ===
              imageItems.length - 1
              ? 0
              : currentIndex + 1;
          }
        );
      },
      [imageItems.length]
    );

  /**
   * 화살표나 스와이프로 이미지가 변경되었을 때
   * 모바일 썸네일 목록에서도 선택된 항목이 보이도록 이동합니다.
   */
  useEffect(() => {
    const activeThumbnail =
      thumbnailRefs.current[
        activeImageIndex
      ];

    if (
      !activeThumbnail ||
      typeof window ===
        "undefined" ||
      window.innerWidth >= 1024
    ) {
      return;
    }

    activeThumbnail.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeImageIndex]);

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key ===
          "Escape" &&
        viewerOpen
      ) {
        setViewerOpen(false);
        return;
      }

      if (
        imageItems.length <= 1
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        moveImage("prev");
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        moveImage("next");
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    imageItems.length,
    moveImage,
    viewerOpen,
  ]);

  useEffect(() => {
    if (!viewerOpen) {
      return;
    }

    const originalOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [viewerOpen]);

  if (
    imageItems.length === 0
  ) {
    return null;
  }

  const activeImage =
    imageItems[
      activeImageIndex
    ] ?? imageItems[0];

  const resetPointer = () => {
    pointerStartX.current =
      null;

    pointerCurrentX.current =
      null;
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      isInteractiveTarget(
        event.target
      )
    ) {
      resetPointer();
      return;
    }

    pointerStartX.current =
      event.clientX;

    pointerCurrentX.current =
      event.clientX;

    pointerMoved.current =
      false;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      pointerStartX.current ===
      null
    ) {
      return;
    }

    pointerCurrentX.current =
      event.clientX;

    if (
      Math.abs(
        event.clientX -
          pointerStartX.current
      ) > 8
    ) {
      pointerMoved.current =
        true;
    }
  };

  const finishPointer = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      pointerStartX.current ===
        null ||
      pointerCurrentX.current ===
        null
    ) {
      return;
    }

    const distance =
      pointerStartX.current -
      pointerCurrentX.current;

    const minimumDistance =
      45;

    if (
      distance >
      minimumDistance
    ) {
      moveImage("next");
    } else if (
      distance <
      -minimumDistance
    ) {
      moveImage("prev");
    }

    resetPointer();

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  };

  const handleImageClick =
    () => {
      if (
        pointerMoved.current
      ) {
        pointerMoved.current =
          false;

        return;
      }

      setViewerOpen(true);
    };

  const handleArrowPointerDown = (
    event: PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    resetPointer();
  };

  const handleArrowPointerUp = (
    event: PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    resetPointer();
  };

  return (
    <>
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-emerald-600 sm:text-sm">
              PHOTO &amp; FLOOR
              PLAN
            </p>

            <h2 className="mt-1 text-xl font-black text-[#132238] sm:text-2xl">
              단지 사진·평면정보
            </h2>

            <p className="mt-1 hidden text-sm leading-6 text-zinc-500 sm:block">
              입지환경부터 평면도와
              커뮤니티까지
              확인해보세요.
            </p>
          </div>

          <div className="min-w-0 shrink-0 text-right">
            <p className="max-w-28 truncate text-xs font-black text-zinc-900 sm:max-w-52 sm:text-sm">
              {
                activeImage.label
              }
            </p>

            <p className="mt-0.5 text-[10px] font-extrabold text-zinc-400 sm:text-sm">
              {activeImageIndex +
                1}{" "}
              /{" "}
              {
                imageItems.length
              }
            </p>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={`${activeImage.label} 크게 보기`}
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            finishPointer
          }
          onPointerCancel={
            finishPointer
          }
          onClick={
            handleImageClick
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              setViewerOpen(
                true
              );
            }
          }}
          className="
            relative mt-4 cursor-zoom-in
            touch-pan-y select-none
            overflow-hidden rounded-2xl
            border border-zinc-100
            bg-zinc-100
            transition-shadow
            hover:shadow-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
            sm:mt-6 sm:rounded-3xl
          "
        >
          <div className="relative flex h-[260px] items-center justify-center min-[420px]:h-[310px] sm:h-[430px] lg:h-[500px]">
            <img
              key={
                activeImage.id
              }
              src={
                activeImage.url
              }
              alt={
                activeImage.alt
              }
              loading="lazy"
              draggable={false}
              className="pointer-events-none h-full w-full object-contain"
            />

            {imageItems.length >
              1 && (
              <>
                <button
                  type="button"
                  onPointerDown={
                    handleArrowPointerDown
                  }
                  onPointerUp={
                    handleArrowPointerUp
                  }
                  onPointerCancel={
                    handleArrowPointerUp
                  }
                  onClick={(
                    event
                  ) => {
                    event.preventDefault();
                    event.stopPropagation();

                    resetPointer();
                    moveImage(
                      "prev"
                    );
                  }}
                  aria-label="이전 이미지 보기"
                  className="
                    absolute left-2 top-1/2
                    z-10 flex h-9 w-9
                    -translate-y-1/2
                    cursor-pointer items-center
                    justify-center rounded-full
                    border border-white/40
                    bg-black/55 text-xl
                    text-white shadow-lg
                    backdrop-blur transition
                    hover:scale-105
                    hover:bg-black/75
                    active:scale-95
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-400
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-black/40
                    sm:left-5 sm:h-12
                    sm:w-12 sm:text-2xl
                  "
                >
                  ‹
                </button>

                <button
                  type="button"
                  onPointerDown={
                    handleArrowPointerDown
                  }
                  onPointerUp={
                    handleArrowPointerUp
                  }
                  onPointerCancel={
                    handleArrowPointerUp
                  }
                  onClick={(
                    event
                  ) => {
                    event.preventDefault();
                    event.stopPropagation();

                    resetPointer();
                    moveImage(
                      "next"
                    );
                  }}
                  aria-label="다음 이미지 보기"
                  className="
                    absolute right-2 top-1/2
                    z-10 flex h-9 w-9
                    -translate-y-1/2
                    cursor-pointer items-center
                    justify-center rounded-full
                    border border-white/40
                    bg-black/55 text-xl
                    text-white shadow-lg
                    backdrop-blur transition
                    hover:scale-105
                    hover:bg-black/75
                    active:scale-95
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-emerald-400
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-black/40
                    sm:right-5 sm:h-12
                    sm:w-12 sm:text-2xl
                  "
                >
                  ›
                </button>
              </>
            )}

            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 sm:bottom-4 sm:left-4">
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs",
                  getCategoryBadgeClassName(
                    activeImage.category
                  ),
                ].join(" ")}
              >
                {getCategoryBadge(
                  activeImage.category
                )}
              </span>

              <span className="max-w-40 truncate rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur sm:max-w-72 sm:px-3 sm:py-1.5 sm:text-xs">
                {
                  activeImage.label
                }
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5 sm:text-xs">
              탭하여 확대
            </div>
          </div>
        </div>

        {imageItems.length >
          1 && (
          <div className="mt-3 sm:mt-5">
            <div className="-mx-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0">
              <div className="flex min-w-max gap-2.5 lg:grid lg:min-w-0 lg:grid-cols-5 xl:grid-cols-6">
                {imageItems.map(
                  (
                    image,
                    index
                  ) => {
                    const active =
                      activeImageIndex ===
                      index;

                    return (
                      <button
                        key={
                          image.id
                        }
                        ref={(
                          element
                        ) => {
                          thumbnailRefs.current[
                            index
                          ] =
                            element;
                        }}
                        type="button"
                        onClick={() =>
                          setActiveImageIndex(
                            index
                          )
                        }
                        aria-label={`${image.label} 이미지 보기`}
                        aria-pressed={
                          active
                        }
                        className={[
                          "group relative w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-zinc-100 text-left transition-all duration-200 sm:w-36 sm:rounded-2xl lg:w-auto",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                          active
                            ? "border-emerald-600 shadow-md ring-2 ring-emerald-100"
                            : "border-transparent hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md",
                        ].join(
                          " "
                        )}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                          <img
                            src={
                              image.url
                            }
                            alt=""
                            loading="lazy"
                            draggable={
                              false
                            }
                            className={[
                              "h-full w-full object-cover transition duration-300",
                              active
                                ? "scale-[1.02]"
                                : "group-hover:scale-105",
                            ].join(
                              " "
                            )}
                          />

                          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                          <span
                            className={[
                              "absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold shadow-sm backdrop-blur sm:left-2 sm:top-2 sm:rounded-lg sm:px-2 sm:py-1 sm:text-[10px]",
                              getCategoryBadgeClassName(
                                image.category
                              ),
                            ].join(
                              " "
                            )}
                          >
                            {getCategoryBadge(
                              image.category
                            )}
                          </span>

                          {active && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white shadow-md sm:right-2 sm:top-2 sm:h-6 sm:w-6 sm:text-xs">
                              ✓
                            </span>
                          )}

                          <p className="absolute inset-x-2 bottom-1.5 truncate text-[10px] font-extrabold text-white drop-shadow sm:bottom-2 sm:text-xs">
                            {
                              image.label
                            }
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        <p className="mt-1 text-center text-[10px] leading-5 text-zinc-400 sm:hidden">
          썸네일을 가로로 밀거나
          큰 이미지를 좌우로
          넘겨보세요.
        </p>
      </section>

      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${apartmentName} 이미지 크게 보기`}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
          onClick={() =>
            setViewerOpen(
              false
            )
          }
        >
          <button
            type="button"
            onPointerDown={(
              event
            ) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(
              event
            ) => {
              event.preventDefault();
              event.stopPropagation();

              setViewerOpen(
                false
              );
            }}
            aria-label="이미지 닫기"
            className="
              absolute right-4 top-4 z-20
              flex h-11 w-11 cursor-pointer
              items-center justify-center
              rounded-full bg-white/15
              text-2xl text-white
              backdrop-blur transition
              hover:scale-105
              hover:bg-white/25
              active:scale-95
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white
              focus-visible:ring-offset-2
              focus-visible:ring-offset-black
            "
          >
            ×
          </button>

          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              finishPointer
            }
            onPointerCancel={
              finishPointer
            }
            className="
              relative flex h-full w-full
              touch-pan-y select-none
              items-center justify-center
              overflow-auto px-3 py-16
              sm:px-16
            "
          >
            <img
              key={`viewer-${activeImage.id}`}
              src={
                activeImage.url
              }
              alt={
                activeImage.alt
              }
              draggable={false}
              className="max-h-full max-w-full object-contain"
            />

            {imageItems.length >
              1 && (
              <>
                <button
                  type="button"
                  onPointerDown={
                    handleArrowPointerDown
                  }
                  onPointerUp={
                    handleArrowPointerUp
                  }
                  onPointerCancel={
                    handleArrowPointerUp
                  }
                  onClick={(
                    event
                  ) => {
                    event.preventDefault();
                    event.stopPropagation();

                    resetPointer();
                    moveImage(
                      "prev"
                    );
                  }}
                  aria-label="이전 이미지 보기"
                  className="
                    absolute left-3 top-1/2
                    z-20 flex h-11 w-11
                    -translate-y-1/2
                    cursor-pointer items-center
                    justify-center rounded-full
                    bg-white/15 text-2xl
                    text-white backdrop-blur
                    transition
                    hover:scale-105
                    hover:bg-white/25
                    active:scale-95
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white
                    sm:left-7 sm:h-14 sm:w-14
                  "
                >
                  ‹
                </button>

                <button
                  type="button"
                  onPointerDown={
                    handleArrowPointerDown
                  }
                  onPointerUp={
                    handleArrowPointerUp
                  }
                  onPointerCancel={
                    handleArrowPointerUp
                  }
                  onClick={(
                    event
                  ) => {
                    event.preventDefault();
                    event.stopPropagation();

                    resetPointer();
                    moveImage(
                      "next"
                    );
                  }}
                  aria-label="다음 이미지 보기"
                  className="
                    absolute right-3 top-1/2
                    z-20 flex h-11 w-11
                    -translate-y-1/2
                    cursor-pointer items-center
                    justify-center rounded-full
                    bg-white/15 text-2xl
                    text-white backdrop-blur
                    transition
                    hover:scale-105
                    hover:bg-white/25
                    active:scale-95
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white
                    sm:right-7 sm:h-14 sm:w-14
                  "
                >
                  ›
                </button>
              </>
            )}

            <div className="pointer-events-none absolute bottom-5 left-1/2 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur sm:px-4">
              <span
                className={[
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                  getCategoryBadgeClassName(
                    activeImage.category
                  ),
                ].join(" ")}
              >
                {getCategoryBadge(
                  activeImage.category
                )}
              </span>

              <span className="truncate">
                {
                  activeImage.label
                }{" "}
                ·{" "}
                {activeImageIndex +
                  1}{" "}
                /{" "}
                {
                  imageItems.length
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}