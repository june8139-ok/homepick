"use client";

import type {
  ApartmentPriceInfo,
  UnitPrice,
  UnitTypePrice,
} from "../../types/apartment";

import {
  useAdmin,
} from "./AdminContext";

function parseNumber(
  value: string
): number | null {
  const normalized =
    value.replace(
      /[^0-9]/g,
      ""
    );

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

function numberText(
  value?: number | null
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    return "";
  }

  return value.toLocaleString();
}

function collectPriceRange(
  units: UnitPrice[]
) {
  const minimumValues: number[] =
    [];

  const maximumValues: number[] =
    [];

  units.forEach((unit) => {
    if (
      typeof unit.minPrice ===
        "number" &&
      unit.minPrice > 0
    ) {
      minimumValues.push(
        unit.minPrice
      );
    }

    if (
      typeof unit.maxPrice ===
        "number" &&
      unit.maxPrice > 0
    ) {
      maximumValues.push(
        unit.maxPrice
      );
    }

    unit.types?.forEach(
      (type) => {
        if (
          typeof type.minPrice ===
            "number" &&
          type.minPrice > 0
        ) {
          minimumValues.push(
            type.minPrice
          );
        }

        if (
          typeof type.maxPrice ===
            "number" &&
          type.maxPrice > 0
        ) {
          maximumValues.push(
            type.maxPrice
          );
        }
      }
    );
  });

  return {
    minimumPrice:
      minimumValues.length > 0
        ? Math.min(
            ...minimumValues
          )
        : null,

    maximumPrice:
      maximumValues.length > 0
        ? Math.max(
            ...maximumValues
          )
        : null,
  };
}

function withCalculatedRange(
  priceInfo: ApartmentPriceInfo,
  units: UnitPrice[]
): ApartmentPriceInfo {
  const range =
    collectPriceRange(
      units
    );

  return {
    ...priceInfo,

    units,

    minimumPrice:
      range.minimumPrice,

    maximumPrice:
      range.maximumPrice,

    updatedAt:
      new Date().toISOString(),
  };
}

function createEmptyUnit(): UnitPrice {
  return {
    area: "",
    minPrice: null,
    maxPrice: null,
    households: null,
    source: "manual",
    types: [],
  };
}

function createEmptyType(): UnitTypePrice {
  return {
    typeName: "",
    minPrice: null,
    maxPrice: null,
    households: null,
  };
}

export default function PriceInfoSection() {
  const {
    basicInfo,
    setBasicInfo,

    priceInfo,
    setPriceInfo,
  } = useAdmin();

  const updateUnits = (
    nextUnits: UnitPrice[]
  ) => {
    setPriceInfo(
      withCalculatedRange(
        priceInfo,
        nextUnits
      )
    );
  };

  const updateUnit = (
    unitIndex: number,
    patch: Partial<UnitPrice>
  ) => {
    const nextUnits =
      priceInfo.units.map(
        (unit, index) =>
          index === unitIndex
            ? {
                ...unit,
                ...patch,
              }
            : unit
      );

    updateUnits(
      nextUnits
    );
  };

  const removeUnit = (
    unitIndex: number
  ) => {
    const confirmed =
      window.confirm(
        "이 평형과 하위 타입 가격을 삭제할까요?"
      );

    if (!confirmed) {
      return;
    }

    updateUnits(
      priceInfo.units.filter(
        (_, index) =>
          index !== unitIndex
      )
    );
  };

  const moveUnit = (
    fromIndex: number,
    toIndex: number
  ) => {
    if (
      toIndex < 0 ||
      toIndex >=
        priceInfo.units.length
    ) {
      return;
    }

    const nextUnits = [
      ...priceInfo.units,
    ];

    const [moved] =
      nextUnits.splice(
        fromIndex,
        1
      );

    nextUnits.splice(
      toIndex,
      0,
      moved
    );

    updateUnits(
      nextUnits
    );
  };

  const addType = (
    unitIndex: number
  ) => {
    const unit =
      priceInfo.units[
        unitIndex
      ];

    const nextTypes = [
      ...(unit.types ?? []),
      createEmptyType(),
    ];

    updateUnit(
      unitIndex,
      {
        types:
          nextTypes,
      }
    );
  };

  const updateType = (
    unitIndex: number,
    typeIndex: number,
    patch: Partial<UnitTypePrice>
  ) => {
    const unit =
      priceInfo.units[
        unitIndex
      ];

    const nextTypes =
      (unit.types ?? []).map(
        (type, index) =>
          index === typeIndex
            ? {
                ...type,
                ...patch,
              }
            : type
      );

    updateUnit(
      unitIndex,
      {
        types:
          nextTypes,
      }
    );
  };

  const removeType = (
    unitIndex: number,
    typeIndex: number
  ) => {
    const unit =
      priceInfo.units[
        unitIndex
      ];

    updateUnit(
      unitIndex,
      {
        types:
          (unit.types ?? []).filter(
            (_, index) =>
              index !==
              typeIndex
          ),
      }
    );
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-extrabold text-emerald-600">
          PRICE INFORMATION
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
          분양가 정보
        </h2>

        <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
          청약홈에서 수집한 가격을
          확인하거나, 선착순 단지의
          평형별 최저가·최고가를 직접
          입력합니다.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm font-extrabold text-blue-800">
          가격 입력 단위
        </p>

        <p className="mt-1 break-keep text-xs leading-5 text-blue-800/75">
          모든 금액은 만원 단위로
          입력합니다. 예를 들어
          5억 2,300만원은
          52,300으로 입력하세요.
        </p>
      </div>

      <div className="mt-7 border-t border-zinc-100 pt-7">
        <h3 className="text-lg font-extrabold text-[#132238]">
          대표 가격
        </h3>

        <p className="mt-1 text-xs leading-5 text-zinc-400">
          검색카드 등에 사용할 대표
          문구입니다. 비워두면 평형별
          최저·최고가로 자동 생성됩니다.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextInput
            label="대표 분양가 문구"
            value={
              basicInfo.salePrice
            }
            placeholder="예: 84㎡ 5억대"
            onChange={(value) =>
              setBasicInfo({
                ...basicInfo,
                salePrice:
                  value,
              })
            }
          />

          <TextInput
            label="평당가 문구"
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

          <NumberInput
            label="평균 평당가"
            value={
              priceInfo.averagePricePerPyeong
            }
            placeholder="예: 2050"
            suffix="만원"
            onChange={(value) =>
              setPriceInfo({
                ...priceInfo,

                averagePricePerPyeong:
                  value,

                updatedAt:
                  new Date().toISOString(),
              })
            }
          />

          <label className="block">
            <p className="mb-2 text-sm font-extrabold text-[#132238]">
              가격 기준 메모
            </p>

            <textarea
              rows={3}
              value={
                priceInfo.note ??
                ""
              }
              placeholder="예: 2026년 7월 공급금액 기준, 발코니 확장비 및 옵션비 별도"
              onChange={(event) =>
                setPriceInfo({
                  ...priceInfo,

                  note:
                    event.target
                      .value,

                  updatedAt:
                    new Date().toISOString(),
                })
              }
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
          <Summary
            label="전체 최저가"
            value={
              priceInfo.minimumPrice
            }
          />

          <Summary
            label="전체 최고가"
            value={
              priceInfo.maximumPrice
            }
          />
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#132238]">
              평형별 분양가
            </h3>

            <p className="mt-1 break-keep text-xs leading-5 text-zinc-400">
              59㎡, 84㎡처럼 면적을
              추가하고 필요하면 A·B·C
              타입별 가격도 등록하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              updateUnits([
                ...priceInfo.units,
                createEmptyUnit(),
              ])
            }
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[#132238] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            + 평형 추가
          </button>
        </div>

        {priceInfo.units.length ===
        0 ? (
          <div className="mt-5 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-5 py-10 text-center">
            <p className="font-extrabold text-[#132238]">
              등록된 평형별 가격이
              없습니다.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              평형 추가를 눌러
              59㎡, 84㎡ 등의 가격을
              입력하세요.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {priceInfo.units.map(
              (
                unit,
                unitIndex
              ) => (
                <UnitEditor
                  key={`unit-${unitIndex}`}
                  unit={
                    unit
                  }
                  unitIndex={
                    unitIndex
                  }
                  totalUnits={
                    priceInfo
                      .units
                      .length
                  }
                  onUpdate={(
                    patch
                  ) =>
                    updateUnit(
                      unitIndex,
                      patch
                    )
                  }
                  onRemove={() =>
                    removeUnit(
                      unitIndex
                    )
                  }
                  onMove={(
                    toIndex
                  ) =>
                    moveUnit(
                      unitIndex,
                      toIndex
                    )
                  }
                  onAddType={() =>
                    addType(
                      unitIndex
                    )
                  }
                  onUpdateType={(
                    typeIndex,
                    patch
                  ) =>
                    updateType(
                      unitIndex,
                      typeIndex,
                      patch
                    )
                  }
                  onRemoveType={(
                    typeIndex
                  ) =>
                    removeType(
                      unitIndex,
                      typeIndex
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function UnitEditor({
  unit,
  unitIndex,
  totalUnits,
  onUpdate,
  onRemove,
  onMove,
  onAddType,
  onUpdateType,
  onRemoveType,
}: {
  unit: UnitPrice;
  unitIndex: number;
  totalUnits: number;

  onUpdate: (
    patch: Partial<UnitPrice>
  ) => void;

  onRemove: () => void;

  onMove: (
    toIndex: number
  ) => void;

  onAddType: () => void;

  onUpdateType: (
    typeIndex: number,
    patch: Partial<UnitTypePrice>
  ) => void;

  onRemoveType: (
    typeIndex: number
  ) => void;
}) {
  const types =
    unit.types ?? [];

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">
            {unitIndex + 1}
          </span>

          <div>
            <p className="text-xs font-semibold text-zinc-400">
              평형
            </p>

            <p className="font-black text-[#132238]">
              {unit.area ||
                "새 평형"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <SmallButton
            label="↑"
            title="위로 이동"
            disabled={
              unitIndex === 0
            }
            onClick={() =>
              onMove(
                unitIndex - 1
              )
            }
          />

          <SmallButton
            label="↓"
            title="아래로 이동"
            disabled={
              unitIndex ===
              totalUnits - 1
            }
            onClick={() =>
              onMove(
                unitIndex + 1
              )
            }
          />

          <button
            type="button"
            onClick={
              onRemove
            }
            className="cursor-pointer rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextInput
            label="전용면적"
            value={
              unit.area
            }
            placeholder="예: 84㎡"
            onChange={(value) =>
              onUpdate({
                area: value,
              })
            }
          />

          <NumberInput
            label="최저 분양가"
            value={
              unit.minPrice
            }
            placeholder="예: 51000"
            suffix="만원"
            onChange={(value) =>
              onUpdate({
                minPrice:
                  value,
              })
            }
          />

          <NumberInput
            label="최고 분양가"
            value={
              unit.maxPrice
            }
            placeholder="예: 62000"
            suffix="만원"
            onChange={(value) =>
              onUpdate({
                maxPrice:
                  value,
              })
            }
          />

          <NumberInput
            label="공급 세대수"
            value={
              unit.households
            }
            placeholder="예: 450"
            suffix="세대"
            onChange={(value) =>
              onUpdate({
                households:
                  value,
              })
            }
          />
        </div>

        <div className="mt-6 border-t border-zinc-100 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-[#132238]">
                타입별 상세 가격
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                84A, 84B처럼
                타입마다 가격이 다를
                때만 추가하세요.
              </p>
            </div>

            <button
              type="button"
              onClick={
                onAddType
              }
              className="cursor-pointer rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              + 타입 추가
            </button>
          </div>

          {types.length > 0 && (
            <div className="mt-4 space-y-3">
              {types.map(
                (
                  type,
                  typeIndex
                ) => (
                  <div
                    key={`type-${typeIndex}`}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                      <TextInput
                        label="타입명"
                        value={
                          type.typeName
                        }
                        placeholder="예: 84A"
                        onChange={(
                          value
                        ) =>
                          onUpdateType(
                            typeIndex,
                            {
                              typeName:
                                value,
                            }
                          )
                        }
                      />

                      <NumberInput
                        label="최저가"
                        value={
                          type.minPrice
                        }
                        placeholder="예: 51000"
                        suffix="만원"
                        onChange={(
                          value
                        ) =>
                          onUpdateType(
                            typeIndex,
                            {
                              minPrice:
                                value,
                            }
                          )
                        }
                      />

                      <NumberInput
                        label="최고가"
                        value={
                          type.maxPrice
                        }
                        placeholder="예: 59000"
                        suffix="만원"
                        onChange={(
                          value
                        ) =>
                          onUpdateType(
                            typeIndex,
                            {
                              maxPrice:
                                value,
                            }
                          )
                        }
                      />

                      <NumberInput
                        label="세대수"
                        value={
                          type.households
                        }
                        placeholder="예: 210"
                        suffix="세대"
                        onChange={(
                          value
                        ) =>
                          onUpdateType(
                            typeIndex,
                            {
                              households:
                                value,
                            }
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveType(
                            typeIndex
                          )
                        }
                        className="h-12 cursor-pointer rounded-xl border border-rose-200 bg-white px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-extrabold text-[#132238]">
        {label}
      </p>

      <input
        type="text"
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
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  placeholder,
  suffix,
  onChange,
}: {
  label: string;
  value?: number | null;
  placeholder: string;
  suffix: string;
  onChange: (
    value: number | null
  ) => void;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-extrabold text-[#132238]">
        {label}
      </p>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={
            numberText(value)
          }
          placeholder={
            placeholder
          }
          onChange={(
            event
          ) =>
            onChange(
              parseNumber(
                event.target
                  .value
              )
            )
          }
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-14 text-sm outline-none transition placeholder:text-zinc-400 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:rounded-2xl sm:p-4">
      <p className="text-[10px] font-bold text-zinc-500 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#132238] sm:text-lg">
        {typeof value ===
          "number" &&
        value > 0
          ? `${value.toLocaleString()}만원`
          : "자동 계산"}
      </p>
    </div>
  );
}

function SmallButton({
  label,
  title,
  disabled,
  onClick,
}: {
  label: string;
  title: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {label}
    </button>
  );
}