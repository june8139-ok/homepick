"use client";

import { useAdmin } from "./AdminContext";

export default function LocationSection() {
  const {
    locationInfo,
    setLocationInfo,
  } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-extrabold text-emerald-600">
          LOCATION INFORMATION
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
          입지·생활정보
        </h2>

        <p className="mt-2 break-keep text-sm leading-6 text-zinc-500">
          상세페이지에 표시할 교통, 교육,
          생활환경과 미래가치를 입력합니다.
          한 줄에 하나씩 입력하면 체크리스트로
          정리됩니다.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-sm font-extrabold text-emerald-800">
          입력 방법
        </p>

        <p className="mt-1 break-keep text-xs leading-5 text-emerald-900/70">
          광고성 표현보다 실제 위치, 거리,
          교통수단과 이용 가능한 시설을
          구체적으로 입력하는 것이 좋습니다.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <InfoTextarea
          label="🚉 교통"
          value={locationInfo.transport}
          placeholder={`죽전역 이용 가능
남대구IC 차량 접근 편리
달구벌대로·와룡로 인접`}
          onChange={(value) =>
            setLocationInfo({
              ...locationInfo,
              transport: value,
            })
          }
        />

        <InfoTextarea
          label="🏫 교육"
          value={locationInfo.education}
          placeholder={`초등학교 도보권
중·고등학교 인접
인근 학원가 이용 가능`}
          onChange={(value) =>
            setLocationInfo({
              ...locationInfo,
              education: value,
            })
          }
        />

        <InfoTextarea
          label="🛒 생활환경"
          value={locationInfo.living}
          placeholder={`대형마트 차량 5분
병원과 중심상권 인접
생활편의시설 이용 편리`}
          onChange={(value) =>
            setLocationInfo({
              ...locationInfo,
              living: value,
            })
          }
        />

        <InfoTextarea
          label="🏢 직주근접"
          value={locationInfo.jobAccess}
          placeholder={`산업단지 차량 10분
주요 업무지역 접근 편리
직주근접 수요 기대`}
          onChange={(value) =>
            setLocationInfo({
              ...locationInfo,
              jobAccess: value,
            })
          }
        />

        <InfoTextarea
          label="🌳 자연환경"
          value={locationInfo.nature}
          placeholder={`공원 도보권
산책로와 녹지공간 인접
쾌적한 주거환경`}
          onChange={(value) =>
            setLocationInfo({
              ...locationInfo,
              nature: value,
            })
          }
        />

        <InfoTextarea
          label="📈 미래가치"
          value={locationInfo.futureValue}
          placeholder={`교통망 확충 계획
도시개발사업 추진
신규 생활권 확대 기대`}
          onChange={(value) =>
            setLocationInfo({
              ...locationInfo,
              futureValue: value,
            })
          }
        />

        <div className="lg:col-span-2">
          <InfoTextarea
            label="⚠️ 체크할 점"
            value={locationInfo.cautions}
            placeholder={`예정시설 확정 시점 확인 필요
주변 신규 공급물량 확인
실제 개통 일정 변동 가능`}
            onChange={(value) =>
              setLocationInfo({
                ...locationInfo,
                cautions: value,
              })
            }
            rows={4}
            tone="warning"
          />
        </div>
      </div>
    </section>
  );
}

function InfoTextarea({
  label,
  value,
  placeholder,
  onChange,
  rows = 5,
  tone = "default",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rows?: number;
  tone?: "default" | "warning";
}) {
  const itemCount = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

  const borderClass =
    tone === "warning"
      ? "hover:border-amber-300 focus:border-amber-500 focus:ring-amber-500/15"
      : "hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/15";

  const badgeClass =
    tone === "warning"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-[#132238]">
          {label}
        </p>

        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
            badgeClass,
          ].join(" ")}
        >
          {itemCount}개 항목
        </span>
      </div>

      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={[
          "w-full resize-y rounded-2xl border border-zinc-200 bg-white",
          "px-4 py-3 text-sm leading-7 outline-none",
          "transition-all duration-200 placeholder:text-zinc-400",
          "focus:ring-2",
          borderClass,
        ].join(" ")}
      />

      <p className="mt-2 text-xs leading-5 text-zinc-400">
        한 줄에 하나씩 입력하면 상세페이지에서
        자동으로 목록 형태로 표시됩니다.
      </p>
    </label>
  );
}