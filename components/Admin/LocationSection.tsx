"use client";

import type { EvaluationInput } from "../../data/scoring";
import { useAdmin } from "./AdminContext";

export default function LocationSection() {
  const {
    evaluation,
    setEvaluation,
    locationInfo,
    setLocationInfo,
  } = useAdmin();

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-extrabold text-emerald-600">
          LOCATION INFORMATION
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#132238]">
          입지·생활정보
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          평가 항목을 선택하고, 상세페이지에 표시할 실제 정보를
          한 줄에 하나씩 입력합니다.
        </p>
      </div>

      <div className="mt-7 space-y-9">
        <OptionGroup
          title="학군 평가"
          value={evaluation.schoolLevel}
          options={[
            [
              "elementary-middle-high-1to3min",
              "초·중·고 도보 1~3분",
            ],
            [
              "elementary-middle-high-walk",
              "초·중·고 도보권",
            ],
            [
              "elementary-walk-middle-high-near",
              "초등학교 도보 + 중·고 인접",
            ],
            ["elementary-walk", "초등학교 도보권"],
            ["weak", "학군 접근성 약함"],
            ["unknown", "확인 필요"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              schoolLevel:
                value as EvaluationInput["schoolLevel"],
            })
          }
        />

        <OptionGroup
          title="교통 평가"
          value={evaluation.transportLevel}
          options={[
            ["station-ic-future", "역세권 + IC + 교통호재"],
            [
              "station-or-rail-good-road",
              "역·트램·철도 예정 + 도로 양호",
            ],
            ["ic-good", "IC·광역도로 접근 우수"],
            ["car-only", "차량 이동 중심"],
            ["weak", "교통 접근성 약함"],
            ["unknown", "확인 필요"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              transportLevel:
                value as EvaluationInput["transportLevel"],
            })
          }
        />

        <OptionGroup
          title="생활 인프라 평가"
          value={evaluation.infraLevel}
          options={[
            [
              "excellent",
              "대형마트·백화점·병원·상권 풍부",
            ],
            ["good", "생활 인프라 양호"],
            ["normal", "기본 편의시설 있음"],
            ["weak", "인프라 부족"],
            ["unknown", "확인 필요"],
          ]}
          onChange={(value) =>
            setEvaluation({
              ...evaluation,
              infraLevel:
                value as EvaluationInput["infraLevel"],
            })
          }
        />

        <div className="border-t border-zinc-200 pt-8">
          <h3 className="text-xl font-extrabold text-[#132238]">
            상세페이지 표시 내용
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            한 줄에 하나씩 입력하면 상세페이지에서 자동으로
            체크리스트 형태로 정리됩니다.
          </p>

          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-bold text-emerald-800">
              입력 예시
            </p>

            <div className="mt-2 text-sm leading-6 text-emerald-900/75">
              <p>GTX-C 연장 추진</p>
              <p>IC 차량 5분</p>
              <p>광역버스 노선 이용 가능</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <InfoTextarea
              label="🚉 교통"
              value={locationInfo.transport}
              placeholder={`GTX-C 연장 추진
IC 차량 5분
광역버스 노선 이용 가능`}
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
중학교 예정부지 인접
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
              placeholder={`호수공원 도보권
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
        </div>
      </div>
    </section>
  );
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="font-extrabold text-[#132238]">{title}</h3>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(([optionValue, label]) => {
          const selected = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={[
                "cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-semibold",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-md",
                "active:translate-y-0 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
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
            "rounded-full px-2.5 py-1 text-xs font-bold",
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
        onChange={(event) => onChange(event.target.value)}
        className={[
          "w-full resize-y rounded-2xl border border-zinc-200 bg-white",
          "px-4 py-3 text-sm leading-7 outline-none",
          "transition-all duration-200 placeholder:text-zinc-400",
          "focus:ring-2",
          borderClass,
        ].join(" ")}
      />

      <p className="mt-2 text-xs leading-5 text-zinc-400">
        한 줄에 하나씩 입력하면 상세페이지에서 자동으로 체크
        목록으로 표시됩니다.
      </p>
    </label>
  );
}