"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { useAdmin } from "./AdminContext";
import { buildApartment } from "../../lib/buildApartment";
import { uploadImage } from "../../lib/uploadImage";
import type { Apartment } from "../../types/apartment";
import {
  detailSections,
  sectionLabels,
  detailHref,
  getDetailSections,
  hasSectionContent,
  overviewRows,
  locationRows,
  sectionImages,
  overviewExtraFields,
  paymentFields,
  validImage,
  type DetailSection,
  type DetailPageContent,
  type UnitEditorial,
} from "../../lib/apartmentPages";
function useDraft() {
  const c = useAdmin();
  const a: Apartment = {
    ...buildApartment(
      c.basicInfo,
      c.evaluation,
      c.locationInfo,
      c.priceInfo,
      c.contractDetails,
      c.jibnunSummary,
      c.conditionHistory,
    ),
    slug: c.editingSlug || "미리보기",
    listingStage: c.listingStage,
    housingSupplyType: c.housingSupplyType,
    images: { ...c.images, hero: c.images.hero[0] || null },
    detailPages: c.detailPages,
  };
  return { c, a };
}
const destinations: Record<DetailSection, string> = {
  overview: "edit-basic",
  pricing: "edit-contract",
  plans: "edit-images",
  location: "edit-location",
};
export function AdminContentStatus() {
  const { a } = useDraft();
  return (
    <section className="admin-content-status">
      <h2>등록 정보 연결 상태</h2>
      <p>
        한 번 입력한 자료를 단지 홈과 하위 페이지에서 함께 사용합니다. 새 설명을
        다시 작성할 필요는 없습니다.
      </p>
      <nav aria-label="관리자 입력 바로가기">
        {detailSections.map((k) => (
          <a href={`#${destinations[k]}`} key={k}>
            <strong>{sectionLabels[k]}</strong>
            <span>
              {a.detailPages?.[k]?.mode === "hidden"
                ? "관리자 숨김"
                : hasSectionContent(a, k)
                  ? "기존 자료 연결됨"
                  : "자료 보완 필요"}
            </span>
          </a>
        ))}
      </nav>
      <p className="admin-status-note">
        가격 기준일·혜택 적용 대상·출처를 확인하세요. 연결됨 표시는 데이터
        유무이며 정확성 확인 완료를 뜻하지 않습니다.
      </p>
    </section>
  );
}
const guide: Record<
  DetailSection,
  { uses: string; hint: string; example: string }
> = {
  overview: {
    uses: "기본정보의 주소·시행/시공·규모·세대수·주차·입주일",
    hint: "표는 기존 기본정보로 자동 구성됩니다. 기존에 없는 동수·층수·면적을 확인한 경우에만 보완하세요.",
    example:
      "사업 특징이나 공급 구성의 차이를 설명하세요. 예: 총 세대와 일반분양 세대의 차이, 아파트·오피스텔 동 구분.",
  },
  pricing: {
    uses: "평형별 가격·계약조건 선택·계약조건 상세·변경 이력",
    hint: "계약금 총액과 1차 납부금을 구분하세요. 지원 혜택에는 적용 대상·한도·지급 시점을 함께 적어주세요.",
    example:
      "가격의 기준과 제외 비용, 조건이 다른 타입을 추가 설명하세요. 예: 가격표는 모집공고 기준이며 발코니 확장비는 별도입니다.",
  },
  plans: {
    uses: "타입명이 연결된 기존 평면도·평형별 가격과 세대수·커뮤니티 이미지",
    hint: "기존 평면도를 자동으로 묶습니다. 확인 가능한 면적·방·욕실·구조만 추가하세요. 타입마다 같다고 추정하지 않습니다.",
    example: "기존 평면도와 타입 정보를 보충할 내용이 있을 때만 작성하세요.",
  },
  location: {
    uses: "기존 교통·교육·생활·직주근접·자연·개발계획·확인사항과 입지 이미지",
    hint: "시설명과 이동수단을 구체적으로 적으세요. 이동 시간은 출처와 기준이 확인된 경우에만, 개발계획은 진행 단계를 구분해 작성하세요.",
    example:
      "이미 입력한 교통·학교 설명은 반복하지 않아도 됩니다. 추가 확인사항이나 입지 이미지의 해설을 적어주세요.",
  },
};
const unitFields = [
  ["exclusiveArea", "전용면적", "84.95㎡"],
  ["supplyArea", "공급면적", "112.30㎡"],
  ["rooms", "방", "3개"],
  ["bathrooms", "욕실", "2개"],
  ["layout", "구조", "판상형·4베이 등 확인된 구조"],
  ["notes", "타입 설명", "수납·동선·가변형 선택 등 확인한 특징"],
] as const;
const paymentHints: Record<string, string> = {
  depositTotal: "예: 분양대금의 5% (총 계약금)",
  depositFirst: "예: 계약 시 500만원 (총액인지 1차인지 확인)",
  depositRemainder: "예: 계약 후 30일 이내 나머지 계약금 납부",
  middlePayment: "예: 분양대금 60%, 중도금 무이자. 적용 회차·기간 확인",
  balance: "예: 입주 지정기간 내 납부. 유예가 있으면 비율·기간·이자도 기재",
  options: "확장비와 옵션의 유상·무상 범위 및 제외 품목",
  benefitConditions: "지원 대상 타입·세대, 지급 시점, 한도, 유지 조건",
  cautions: "대출 심사·별도 비용·단기 잔금 일정 등 계약 전 확인할 내용",
};
export default function DetailPagesSection() {
  const { c, a } = useDraft();
  const { detailPages, setDetailPages, editingSlug } = c;
  const uploading = c.isUploadingDetails;
  const setUploading = c.setIsUploadingDetails;
  const [error, setError] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<DetailSection>("overview");
  const update = (key: DetailSection, patch: Partial<DetailPageContent>) =>
    setDetailPages({
      ...detailPages,
      [key]: { ...detailPages[key], ...patch },
    });
  const available = [
    ...new Set(
      [
        ...c.images.hero,
        ...c.images.gallery,
        ...c.images.community,
        ...c.images.location,
      ].filter(validImage),
    ),
  ];
  const names = [
    ...new Set(c.images.floorPlans.map((p) => p.name.trim()).filter(Boolean)),
  ];
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const key = uploadTarget;
    const old = detailPages[key] || {};
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) =>
          uploadImage(f, `detail-${Date.now()}/${key}`),
        ),
      );
      update(key, { images: [...(old.images || []), ...urls] });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.",
      );
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  };
  return (
    <section id="edit-detail-pages" className="admin-detail-editor">
      <h2>페이지별 보완·이미지·공개 설정</h2>
      <p>
        기존 입력 자료가 있으면 자동으로 하위 페이지에 연결됩니다. 아래는 추가
        설명과 자료 출처가 필요할 때만 작성하세요. 80자 재입력 조건은 없습니다.
      </p>
      <input
        ref={uploadRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="추가 자료 이미지 선택"
        disabled={uploading}
        onChange={(e) => upload(e.target.files)}
      />
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {detailSections.map((key) => {
        const content = detailPages[key] || {},
          g = guide[key],
          enabled = getDetailSections(a).includes(key);
        return (
          <details key={key} className="admin-detail-section">
            <summary>
              {sectionLabels[key]}{" "}
              <span>
                {content.mode === "hidden"
                  ? "숨김"
                  : enabled
                    ? "자동 연결"
                    : "자료 보완 필요"}
              </span>
            </summary>
            <fieldset disabled={uploading} className="admin-detail-inner">
              <div className="admin-connected">
                <strong>기존 자료에서 가져오는 내용</strong>
                <p>{g.uses}</p>
                <a href={`#${destinations[key]}`}>기존 입력 위치로 이동 ↑</a>
              </div>
              <label className="admin-editor-label">
                공개 방식
                <select
                  value={content.mode || "auto"}
                  onChange={(e) =>
                    update(key, {
                      mode: e.target.value === "hidden" ? "hidden" : "auto",
                    })
                  }
                  disabled={uploading}
                >
                  <option value="auto">자료가 있으면 자동 공개</option>
                  <option value="hidden">이 메뉴 숨기기</option>
                </select>
              </label>
              <p className="admin-editor-hint">{g.hint}</p>
              {key === "overview" && (
                <div className="admin-field-grid">
                  {overviewExtraFields.map(([field, label]) => (
                    <label key={field} className="admin-editor-label">
                      {label} (선택)
                      <input
                        value={content.fields?.[field] || ""}
                        onChange={(e) =>
                          update(key, {
                            fields: {
                              ...content.fields,
                              [field]: e.target.value,
                            },
                          })
                        }
                        placeholder={
                          field === "floors"
                            ? "예: 지하 2층~지상 29층"
                            : field === "buildings"
                              ? "예: 8개동"
                              : "수치와 단위 함께 기재"
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
              {key === "pricing" && (
                <div className="admin-field-grid">
                  {paymentFields.map(([field, label]) => (
                    <label key={field} className="admin-editor-label">
                      {label}
                      <textarea
                        rows={3}
                        value={content.fields?.[field] || ""}
                        onChange={(e) =>
                          update(key, {
                            fields: {
                              ...content.fields,
                              [field]: e.target.value,
                            },
                          })
                        }
                        placeholder={paymentHints[field]}
                      />
                    </label>
                  ))}
                </div>
              )}
              {key === "plans" && (
                <div>
                  {names.length ? (
                    names.map((name) => {
                      const row = content.unitDetails?.[name] || {};
                      return (
                        <details key={name} className="admin-unit-editor">
                          <summary>{name} · 평면도 자동 연결</summary>
                          <div className="admin-field-grid">
                            {unitFields.map(([field, label, example]) => (
                              <label key={field} className="admin-editor-label">
                                {label}
                                <input
                                  value={row[field] || ""}
                                  onChange={(e) =>
                                    update(key, {
                                      unitDetails: {
                                        ...content.unitDetails,
                                        [name]: {
                                          ...row,
                                          [field]: e.target.value,
                                        } as UnitEditorial,
                                      },
                                    })
                                  }
                                  placeholder={example}
                                />
                              </label>
                            ))}
                          </div>
                        </details>
                      );
                    })
                  ) : (
                    <p className="admin-editor-hint">
                      이미지 입력에 타입명과 평면도를 등록하면 타입별 보완
                      항목이 나타납니다.
                    </p>
                  )}
                </div>
              )}
              {key === "location" && (
                <div className="admin-connected">
                  <strong>현재 연결된 설명</strong>
                  {locationRows(a).map(([k, v]) => (
                    <p key={k}>
                      {k}: {v.slice(0, 100)}
                      {v.length > 100 ? "…" : ""}
                    </p>
                  ))}
                </div>
              )}
              <label className="admin-editor-label">
                추가 설명 (선택)
                <textarea
                  rows={4}
                  value={content.body || ""}
                  onChange={(e) => update(key, { body: e.target.value })}
                  placeholder={g.example}
                />
              </label>
              {(key === "overview" || key === "pricing") && (
                <div className="admin-image-purpose">
                  <h3>
                    {key === "overview"
                      ? "사업개요표·배치도"
                      : "분양가표·납부일정표"}{" "}
                    연결
                  </h3>
                  <p>
                    아래 기존 이미지를 선택하거나 자료를 추가 업로드하세요. 기존
                    갤러리를 삭제하거나 이동하지 않고 이 페이지에 연결합니다.
                  </p>
                  <div className="admin-purpose-grid">
                    {[
                      ...new Set([...available, ...(content.images || [])]),
                    ].map((url, i) => (
                      <label key={url}>
                        <input
                          type="checkbox"
                          checked={content.images?.includes(url) || false}
                          disabled={uploading}
                          onChange={(e) =>
                            update(key, {
                              images: e.target.checked
                                ? [...(content.images || []), url]
                                : (content.images || []).filter(
                                    (x) => x !== url,
                                  ),
                            })
                          }
                        />
                        <Image
                          src={url}
                          alt={`기존 자료 이미지 ${i + 1}`}
                          width={100}
                          height={70}
                          unoptimized
                          loading="lazy"
                          className="rounded object-cover"
                        />
                        <span>이미지 {i + 1}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          원본 확인 ↗
                        </a>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => {
                      setUploadTarget(key);
                      uploadRef.current?.click();
                    }}
                  >
                    {uploading ? "업로드 중…" : "이 페이지 자료 이미지 추가"}
                  </button>
                  <p>
                    {sectionImages(a, key).length}장 연결됨 · 선택한 순서로 표시
                  </p>
                </div>
              )}
              <div className="admin-field-grid">
                <label className="admin-editor-label">
                  자료 출처
                  <input
                    value={content.source || ""}
                    onChange={(e) => update(key, { source: e.target.value })}
                    placeholder="예: 입주자모집공고 / 공식 분양사무실 확인"
                  />
                </label>
                <label className="admin-editor-label">
                  이 정보의 확인일
                  <input
                    type="date"
                    value={content.checkedAt || ""}
                    onChange={(e) => update(key, { checkedAt: e.target.value })}
                  />
                </label>
              </div>
              <details className="admin-seo-options">
                <summary>검색 제목·설명 직접 조정 (선택)</summary>
                <p>
                  기본 제목·설명은 단지명·메뉴명·기존 내용으로 자동 생성됩니다.
                  검색 노출을 보장하는 설정은 아닙니다.
                </p>
                <label className="admin-editor-label">
                  제목 보충 문구
                  <input
                    maxLength={100}
                    value={content.seoTitle || ""}
                    onChange={(e) => update(key, { seoTitle: e.target.value })}
                  />
                </label>
                <label className="admin-editor-label">
                  검색 설명
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={content.seoDescription || ""}
                    onChange={(e) =>
                      update(key, { seoDescription: e.target.value })
                    }
                  />
                </label>
              </details>
              {key === "overview" && (
                <div className="admin-faq-editor">
                  <h3>실제 상담에서 자주 묻는 질문 (선택)</h3>
                  <p>
                    질문·답변을 모두 입력한 항목만 단지 홈에 표시합니다. 미입력
                    시 기존 자동 FAQ를 사용합니다.
                  </p>
                  {(content.faqs || []).map((f, i) => (
                    <div key={i}>
                      <label className="admin-editor-label">
                        질문 {i + 1}
                        <input
                          value={f.question}
                          onChange={(e) =>
                            update(key, {
                              faqs: (content.faqs || []).map((x, j) =>
                                j === i
                                  ? { ...x, question: e.target.value }
                                  : x,
                              ),
                            })
                          }
                        />
                      </label>
                      <label className="admin-editor-label">
                        답변
                        <textarea
                          rows={3}
                          value={f.answer}
                          onChange={(e) =>
                            update(key, {
                              faqs: (content.faqs || []).map((x, j) =>
                                j === i ? { ...x, answer: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          update(key, {
                            faqs: (content.faqs || []).filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                      >
                        질문 삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={(content.faqs || []).length >= 10}
                    onClick={() =>
                      update(key, {
                        faqs: [
                          ...(content.faqs || []),
                          { question: "", answer: "" },
                        ],
                      })
                    }
                  >
                    질문 추가
                  </button>
                </div>
              )}
              <div className="admin-connected">
                <strong>공개 화면에 연결될 자료</strong>
                <p>
                  {key === "overview"
                    ? `사업개요 ${overviewRows(a).length}개 항목`
                    : key === "plans"
                      ? `평면도 ${a.images.floorPlans.length}장`
                      : key === "location"
                        ? `입지 설명 ${locationRows(a).length}개 · 입지 이미지 ${a.images.location.length}장`
                        : `가격 ${a.priceInfo?.units.length || 0}개 평형 · 계약조건 상세 ${a.contractDetails ? "입력됨" : "미입력"}`}
                </p>
                {editingSlug && enabled && (
                  <Link target="_blank" href={detailHref(editingSlug, key)}>
                    저장된 페이지 확인 ↗
                  </Link>
                )}
                <p>공개 화면은 저장 후 반영됩니다.</p>
              </div>
            </fieldset>
          </details>
        );
      })}
    </section>
  );
}
