"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
} from "react";

import {
  geocodeAddress,
} from "../../lib/naverGeocode";

import AdminLocationPicker from "./AdminLocationPicker";

import {
  useAdmin,
} from "./AdminContext";

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/**
 * 도시개발구역·블록명처럼 지도 검색이 어려운 문구가 포함된 경우를 대비해
 * 전체 주소부터 행정동 주소까지 순서대로 검색 후보를 만듭니다.
 * 입력한 원문 주소는 변경하지 않고, 지도 좌표 검색에만 사용합니다.
 */
function createGeocodeCandidates(address: string) {
  const normalized = address
    .trim()
    .replace(/\s+/g, " ");

  const withoutBlock = normalized
    .replace(
      /\s+(?:공동주택용지|주상복합용지|도시개발구역|지구단위계획구역|개발구역)?\s*[A-Z]?[0-9]+(?:-[0-9]+)?\s*(?:BL|블록|BLOCK)\b.*$/i,
      ""
    )
    .replace(
      /\s+(?:공동주택용지|주상복합용지|도시개발구역|지구단위계획구역|개발구역)\b.*$/i,
      ""
    )
    .trim();

  const tokens = normalized.split(" ");
  const dongIndex = tokens.findIndex((token) =>
    /(?:동|읍|면|리)$/.test(token)
  );

  const administrativeAddress =
    dongIndex >= 0
      ? tokens.slice(0, dongIndex + 1).join(" ")
      : "";

  return uniqueStrings([
    normalized,
    withoutBlock,
    administrativeAddress,
  ]);
}

export default function BasicInfoSection() {
  const {
    basicInfo,
    setBasicInfo,

    listingStage,
    setListingStage,
  } = useAdmin();

  const [
    isFindingLocation,
    setIsFindingLocation,
  ] = useState(false);

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const hasLocation =
    basicInfo.latitude !== null &&
    basicInfo.longitude !== null;

  const handleFindLocation =
    async () => {
      if (
        !basicInfo.region.trim()
      ) {
        setLocationMessage(
          "먼저 사업지 주소를 입력해주세요."
        );

        return;
      }

      setIsFindingLocation(
        true
      );

      setLocationMessage("");

      try {
        const candidates =
          createGeocodeCandidates(
            basicInfo.region
          );

        let coordinates:
          | Awaited<ReturnType<typeof geocodeAddress>>
          | null = null;

        let matchedAddress = "";
        let lastError: unknown = null;

        for (const candidate of candidates) {
          try {
            coordinates =
              await geocodeAddress(
                candidate
              );

            matchedAddress = candidate;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!coordinates) {
          throw (
            lastError ??
            new Error(
              "주소의 위치를 찾지 못했습니다."
            )
          );
        }

        setBasicInfo({
          ...basicInfo,

          latitude:
            coordinates.latitude,

          longitude:
            coordinates.longitude,
        });

        const usedFallback =
          matchedAddress !==
          basicInfo.region
            .trim()
            .replace(/\s+/g, " ");

        setLocationMessage(
          usedFallback
            ? `전체 주소를 찾지 못해 '${matchedAddress}' 기준 위치를 표시했습니다. 지도 핀을 실제 사업지로 옮겨 확인해주세요.`
            : "주소의 지도 위치를 확인했습니다."
        );
      } catch (error) {
        setLocationMessage(
          error instanceof Error
            ? `${error.message} 주소를 동·읍·면 단위로 줄여 검색하거나 지도에서 직접 위치를 선택해주세요.`
            : "위치를 찾지 못했습니다. 지도에서 직접 위치를 선택해주세요."
        );
      } finally {
        setIsFindingLocation(
          false
        );
      }
    };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-extrabold text-emerald-600">
          APARTMENT INFORMATION
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
          단지 기본정보
        </h2>

        <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
          단지명과 사업지 주소,
          공급 규모와 분양가 등
          상세페이지의 기본 정보를
          입력합니다.
        </p>
      </div>

      {/* 노출 상태 */}
      <SectionBlock
        title="단지 노출 상태"
        description="현재 단지의 분양 진행 단계를 선택하세요."
      >
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StageButton
            active={
              listingStage ===
              "subscription"
            }
            onClick={() =>
              setListingStage(
                "subscription"
              )
            }
            label="청약"
            description="청약 접수 또는 계약 진행"
          />

          <StageButton
            active={
              listingStage ===
              "firstCome"
            }
            onClick={() =>
              setListingStage(
                "firstCome"
              )
            }
            label="선착순"
            description="동·호 지정 및 잔여세대"
          />

          <StageButton
            active={
              listingStage ===
              "existing"
            }
            onClick={() =>
              setListingStage(
                "existing"
              )
            }
            label="기존 아파트"
            description="입주 또는 일반 정보"
          />

          <StageButton
            active={
              listingStage ===
              "completed"
            }
            onClick={() =>
              setListingStage(
                "completed"
              )
            }
            label="노출 종료"
            description="공급 완료 또는 게시 종료"
          />
        </div>
      </SectionBlock>

      {/* 단지 식별 정보 */}
      <SectionBlock
        title="단지 정보"
        description="검색 결과와 상세페이지 제목에 사용되는 정보입니다."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="단지명"
            value={
              basicInfo.name
            }
            placeholder="예: 청주 푸르지오 씨엘리체"
            required
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                name: value,
              })
            }
          />

          <Input
            label="지역"
            value={
              basicInfo.cityName
            }
            placeholder="예: 청주"
            required
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                cityName:
                  value,
              })
            }
          />

          <Input
            label="브랜드"
            value={
              basicInfo.brand
            }
            placeholder="예: 푸르지오"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                brand: value,
              })
            }
          />

          <Input
            label="시공사"
            value={
              basicInfo.builder
            }
            placeholder="예: 대우건설"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                builder:
                  value,
              })
            }
          />
        </div>
      </SectionBlock>

      {/* 주소 및 지도 */}
      <SectionBlock
        title="사업지 주소 및 지도"
        description="주소를 입력한 뒤 지도 위치를 확인하세요."
      >
        <div>
          <label className="block">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-[#132238]">
                사업지 주소
                <span className="ml-1 text-rose-500">
                  *
                </span>
              </p>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-bold",
                  hasLocation
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700",
                ].join(
                  " "
                )}
              >
                {hasLocation
                  ? "지도 위치 확인"
                  : "위치 확인 필요"}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={
                  basicInfo.region
                }
                placeholder="예: 충청북도 청주시 서원구 분평동 123-4"
                onChange={(
                  event
                ) => {
                  setBasicInfo({
                    ...basicInfo,

                    region:
                      event
                        .target
                        .value,

                    latitude:
                      null,

                    longitude:
                      null,
                  });

                  setLocationMessage(
                    ""
                  );
                }}
                className="
                  h-12 min-w-0 flex-1
                  rounded-xl border
                  border-zinc-200
                  bg-white px-4 text-sm
                  outline-none
                  transition
                  placeholder:text-zinc-400
                  hover:border-emerald-300
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/15
                "
              />

              <button
                type="button"
                disabled={
                  isFindingLocation
                }
                onClick={
                  handleFindLocation
                }
                className="
                  inline-flex h-12
                  shrink-0 cursor-pointer
                  items-center justify-center
                  rounded-xl
                  bg-emerald-600
                  px-5 text-sm
                  font-bold text-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-emerald-700
                  hover:shadow-md
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                  disabled:cursor-wait
                  disabled:opacity-60
                "
              >
                {isFindingLocation
                  ? "위치 확인 중..."
                  : "주소로 위치 찾기"}
              </button>
            </div>
          </label>

          <AdminLocationPicker
            latitude={
              basicInfo.latitude
            }
            longitude={
              basicInfo.longitude
            }
            apartmentName={
              basicInfo.name
            }
            onLocationChange={(
              latitude,
              longitude
            ) => {
              setBasicInfo({
                ...basicInfo,
                latitude,
                longitude,
              });

              setLocationMessage(
                "지도에서 위치를 직접 지정했습니다."
              );
            }}
            onReset={() => {
              setBasicInfo({
                ...basicInfo,

                latitude:
                  null,

                longitude:
                  null,
              });

              setLocationMessage(
                "지도 위치를 초기화했습니다."
              );
            }}
          />

          {locationMessage && (
            <p
              className={[
                "mt-3 rounded-xl px-3 py-2 text-sm font-semibold",
                hasLocation
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600",
              ].join(
                " "
              )}
            >
              {locationMessage}
            </p>
          )}
        </div>
      </SectionBlock>

      {/* 공급 및 사업 규모 */}
      <SectionBlock
        title="공급 및 사업 규모"
        description="세대수, 주차, 건축 규모와 입주 정보를 입력하세요."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="총 세대수"
            value={
              basicInfo.totalHouseholds
            }
            placeholder="예: 1,450세대"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,

                totalHouseholds:
                  value,
              })
            }
          />

          <Input
            label="일반분양 세대수"
            value={
              basicInfo.saleHouseholds
            }
            placeholder="예: 850세대"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,

                saleHouseholds:
                  value,
              })
            }
          />

          <Input
            label="사업 규모"
            value={
              basicInfo.scale
            }
            placeholder="예: 지하 2층~지상 35층, 10개동"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                scale: value,
              })
            }
          />

          <Input
            label="주차대수"
            value={
              basicInfo.parking
            }
            placeholder="예: 총 1,722대 / 세대당 1.41대"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                parking: value,
              })
            }
          />

          <Input
            label="용도"
            value={
              basicInfo.usage
            }
            placeholder="예: 공동주택 및 근린생활시설"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                usage: value,
              })
            }
          />

          <Input
            label="사업주체"
            value={
              basicInfo.developer
            }
            placeholder="예: 시행사 또는 사업주체명"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,

                developer:
                  value,
              })
            }
          />

          <div className="sm:col-span-2">
            <Input
              label="입주 예정"
              value={
                basicInfo.moveInDate
              }
              placeholder="예: 2028년 3월"
              onChange={(value) =>
                setBasicInfo({
                  ...basicInfo,

                  moveInDate:
                    value,
                })
              }
            />
          </div>
        </div>
      </SectionBlock>

      {/* 가격 */}
      <SectionBlock
        title="가격 정보"
        description="검색 카드와 상세페이지에 표시할 대표 가격을 입력하세요."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="분양가"
            value={
              basicInfo.salePrice
            }
            placeholder="예: 84㎡ 7억대"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,

                salePrice:
                  value,
              })
            }
          />

          <Input
            label="평당가"
            value={
              basicInfo.pricePerPyeong
            }
            placeholder="예: 평당 약 2,050만원"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,

                pricePerPyeong:
                  value,
              })
            }
          />
        </div>
      </SectionBlock>
    </section>
  );
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-7 border-t border-zinc-100 pt-7 first:border-t-0">
      <h3 className="text-lg font-extrabold text-[#132238]">
        {title}
      </h3>

      <p className="mt-1 break-keep text-xs leading-5 text-zinc-400">
        {description}
      </p>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (
    value: string
  ) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-extrabold text-[#132238]">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </p>

      <input
        value={value}
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-12 w-full rounded-xl
          border border-zinc-200
          bg-white px-4 text-sm
          outline-none transition
          placeholder:text-zinc-400
          hover:border-emerald-300
          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-500/15
        "
      />
    </label>
  );
}

function StageButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={
        active
      }
      onClick={
        onClick
      }
      className={[
        "min-h-20 cursor-pointer rounded-2xl border px-4 py-3 text-left",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        "active:translate-y-0 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        active
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50",
      ].join(
        " "
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <strong className="text-sm">
          {label}
        </strong>

        {active && (
          <span
            aria-hidden="true"
            className="shrink-0 font-black"
          >
            ✓
          </span>
        )}
      </span>

      <span
        className={[
          "mt-1 block text-xs leading-5",
          active
            ? "text-emerald-50"
            : "text-zinc-400",
        ].join(
          " "
        )}
      >
        {description}
      </span>
    </button>
  );
}