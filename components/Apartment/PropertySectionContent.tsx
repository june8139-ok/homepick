import { conditionHistories } from "../../data/history";
import Image from "next/image";
import type { Apartment } from "../../types/apartment";
import {
  overviewRows,
  locationRows,
  paymentRows,
  sectionImages,
  overviewIntroduction,
  validImage,
  type DetailSection,
} from "../../lib/apartmentPages";
import PropertyPlanBrowser from "./PropertyPlanBrowser";
import PriceConditionCard from "./PriceConditionCard";
import ConditionHistory from "./ConditionHistory";
export function SectionPictures({
  images,
  label,
}: {
  images: string[];
  label: string;
}) {
  return (
    <>
      {images.filter(validImage).map((src, i) => (
        <figure className="property-figure" key={src + i}>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} ${i + 1} 크게 보기`}
          >
            <Image
              src={src}
              alt={`${label} ${i + 1}`}
              width={1600}
              height={1200}
              sizes="(max-width:768px) 100vw,1000px"
              quality={88}
              className="h-auto w-full object-contain"
            />
          </a>
          <figcaption>
            {label}
            {images.length > 1 ? ` · ${i + 1}` : ""} — 누르면 원본 보기
          </figcaption>
        </figure>
      ))}
    </>
  );
}
function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="property-facts">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
export default function PropertySectionContent({
  a,
  section,
}: {
  a: Apartment;
  section: DetailSection;
}) {
  const content = a.detailPages?.[section] || {};
  const history = a.conditionHistory.length
    ? a.conditionHistory
    : conditionHistories.find((x) => x.apartmentSlug === a.slug)?.history || [];
  return (
    <>
      {section === "overview" && (
        <>
          <div className="property-prose">
            <p>{overviewIntroduction(a)}</p>
          </div>
          <Facts rows={overviewRows(a)} />
          <SectionPictures
            images={sectionImages(a, section)}
            label={`${a.name} 사업개요 자료`}
          />
        </>
      )}
      {section === "pricing" && (
        <>
          <p className="property-section-lead">
            {a.housingSupplyType === "privateRental"
              ? "임대보증금·월세 및 임대조건을 확인하세요."
              : "등록된 평형별 가격과 현재 계약조건을 확인하세요."}
          </p>
          {a.listingStage === "soldOut" && (
            <p className="property-source">
              분양완료 단지의 보관 자료입니다. 아래 조건은 현재 모집 조건이
              아닙니다.
            </p>
          )}
          <PriceConditionCard apartment={a} />
          {paymentRows(a).length > 0 && (
            <section className="property-detail-block">
              <h2>납부 일정·혜택 적용 조건</h2>
              <Facts rows={paymentRows(a)} />
            </section>
          )}
          {a.contractDetails && (
            <section className="property-prose">
              <h2>계약조건 상세 안내</h2>
              <p>{a.contractDetails}</p>
            </section>
          )}
          <SectionPictures
            images={sectionImages(a, section)}
            label={`${a.name} 가격·계약조건 자료`}
          />
          {history.length > 0 && (
            <section className="property-detail-block">
              <h2>조건 변경·확인 이력</h2>
              <ConditionHistory items={history} />
            </section>
          )}
        </>
      )}
      {section === "plans" && (
        <>
          <PropertyPlanBrowser
            key={a.slug}
            name={a.name}
            plans={a.images.floorPlans.filter((p) => validImage(p.url))}
            units={a.priceInfo?.units || []}
            details={content.unitDetails || {}}
          />
          {a.images.community.length > 0 && (
            <section className="property-detail-block">
              <h2>커뮤니티·공용시설</h2>
              <SectionPictures
                images={a.images.community}
                label={`${a.name} 커뮤니티·공용시설`}
              />
            </section>
          )}
        </>
      )}
      {section === "location" && (
        <>
          <p className="property-section-lead">{a.region}</p>
          <SectionPictures
            images={sectionImages(a, section)}
            label={`${a.name} 입지·주변 환경`}
          />
          <Facts rows={locationRows(a)} />
        </>
      )}
      {content.body && (
        <section className="property-prose">
          <h2>추가 안내</h2>
          {content.body.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}
      {(content.source || content.checkedAt) && (
        <p className="property-source">
          {content.source && `자료 출처: ${content.source}`}
          {content.checkedAt && ` · 최근 확인: ${content.checkedAt}`}
        </p>
      )}
    </>
  );
}
