"use client";

import { useState } from "react";
import { geocodeAddress } from "../../lib/naverGeocode";
import { useAdmin } from "./AdminContext";

export default function BasicInfoSection() {
  const { basicInfo, setBasicInfo } = useAdmin();

  const [isFindingLocation, setIsFindingLocation] =
    useState(false);

  const [locationMessage, setLocationMessage] =
    useState("");

  const handleFindLocation = async () => {
    if (!basicInfo.region.trim()) {
      setLocationMessage(
        "먼저 사업지 주소를 입력해주세요."
      );
      return;
    }

    setIsFindingLocation(true);
    setLocationMessage("");

    try {
      const coordinates = await geocodeAddress(
        basicInfo.region
      );

      setBasicInfo({
        ...basicInfo,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      setLocationMessage(
        "위치를 찾았습니다. 등록 또는 수정 저장을 눌러주세요."
      );
    } catch (error) {
      setLocationMessage(
        error instanceof Error
          ? error.message
          : "위치를 찾지 못했습니다."
      );
    } finally {
      setIsFindingLocation(false);
    }
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">
        기본정보
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        단지명, 사업지 주소, 세대수, 사업규모와
        입주예정일 등 기본 정보를 입력합니다.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          label="단지명"
          value={basicInfo.name}
          placeholder="예: 청주 푸르지오 씨엘리체"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              name: value,
            })
          }
        />

        <Input
          label="브랜드"
          value={basicInfo.brand}
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
          value={basicInfo.builder}
          placeholder="예: 대우건설"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              builder: value,
            })
          }
        />

        <Input
          label="지역"
          value={basicInfo.cityName}
          placeholder="예: 청주"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              cityName: value,
            })
          }
        />

        <div className="sm:col-span-2">
          <label className="block">
            <p className="mb-2 text-sm font-medium text-zinc-700">
              사업지 주소
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={basicInfo.region}
                placeholder="예: 충청북도 청주시 서원구 분평동 123-4"
                onChange={(event) =>
                  setBasicInfo({
                    ...basicInfo,
                    region: event.target.value,
                    latitude: null,
                    longitude: null,
                  })
                }
                className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />

              <button
                type="button"
                disabled={isFindingLocation}
                onClick={handleFindLocation}
                className="h-12 shrink-0 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isFindingLocation
                  ? "위치 찾는 중..."
                  : "주소로 위치 찾기"}
              </button>
            </div>
          </label>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <CoordinateBox
              label="위도"
              value={basicInfo.latitude}
            />

            <CoordinateBox
              label="경도"
              value={basicInfo.longitude}
            />
          </div>

          {locationMessage && (
            <p
              className={[
                "mt-2 text-sm",
                basicInfo.latitude !== null &&
                basicInfo.longitude !== null
                  ? "text-emerald-600"
                  : "text-rose-500",
              ].join(" ")}
            >
              {locationMessage}
            </p>
          )}
        </div>

        <Input
          label="총 세대수"
          value={basicInfo.totalHouseholds}
          placeholder="예: 1,450세대"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              totalHouseholds: value,
            })
          }
        />

        <Input
          label="일반분양 세대수"
          value={basicInfo.saleHouseholds}
          placeholder="예: 850세대"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              saleHouseholds: value,
            })
          }
        />

        <Input
          label="주차대수"
          value={basicInfo.parking}
          placeholder="예: 총 1,722대 / 세대당 1.41대"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              parking: value,
            })
          }
        />

        <Input
          label="사업 규모"
          value={basicInfo.scale}
          placeholder="예: 지하 2층~지상 35층, 10개동"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              scale: value,
            })
          }
        />

        <Input
          label="용도"
          value={basicInfo.usage}
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
          value={basicInfo.developer}
          placeholder="예: 시행사 또는 사업주체명"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              developer: value,
            })
          }
        />

        <Input
          label="입주 예정"
          value={basicInfo.moveInDate}
          placeholder="예: 2028년 3월"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              moveInDate: value,
            })
          }
        />

        <Input
          label="분양가"
          value={basicInfo.salePrice}
          placeholder="예: 84㎡ 7억대"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              salePrice: value,
            })
          }
        />

        <Input
          label="평당가"
          value={basicInfo.pricePerPyeong}
          placeholder="예: 평당 약 2,050만원"
          onChange={(value) =>
            setBasicInfo({
              ...basicInfo,
              pricePerPyeong: value,
            })
          }
        />
      </div>
    </section>
  );
}

function CoordinateBox({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3">
      <p className="text-xs font-medium text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-zinc-700">
        {value ?? "주소로 위치를 찾아주세요"}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-medium text-zinc-700">
        {label}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
      />
    </label>
  );
}