import type { Apartment } from "../../types/apartment";

import { getListingStage } from "../../lib/listingStage";

export type ApartmentFaqItem = {
  question: string;
  answer: string;
};

function cleanText(value?: string | null) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function formatDate(value?: string | null) {
  const text = cleanText(value);

  if (!text) {
    return "";
  }

  return text
    .replace(/\//g, ".")
    .replace(/-/g, ".");
}

function getCityName(apartment: Apartment) {
  return cleanText(
    apartment.cityName ||
      apartment.city
  );
}

function getPriceText(apartment: Apartment) {
  return cleanText(
    apartment.priceDetail?.salePrice ||
      apartment.price
  );
}

function getContractText(apartment: Apartment) {
  return cleanText(
    apartment.priceDetail?.contractPrice
  );
}

function getMiddlePaymentText(apartment: Apartment) {
  return cleanText(
    apartment.priceDetail?.middlePayment
  );
}

function getBalanceText(apartment: Apartment) {
  return cleanText(
    apartment.priceDetail?.balance
  );
}

function getMoveInText(apartment: Apartment) {
  return cleanText(
    apartment.projectInfo?.moveInDate
  );
}

function getSupplyText(apartment: Apartment) {
  if (
    typeof apartment.totalSupply === "number" &&
    apartment.totalSupply > 0
  ) {
    return `${apartment.totalSupply.toLocaleString()}세대`;
  }

  return cleanText(
    apartment.projectInfo?.totalHouseholds ||
      apartment.projectInfo?.saleHouseholds
  );
}

function getFloorPlanText(apartment: Apartment) {
  const names =
    apartment.images?.floorPlans
      ?.map((item) =>
        cleanText(item.name)
      )
      .filter(Boolean) ?? [];

  return unique(names)
    .slice(0, 8)
    .join(", ");
}

function getOptionText(apartment: Apartment) {
  return unique(
    (
      apartment.priceDetail?.options ??
      []
    )
      .map(cleanText)
      .filter(Boolean)
  )
    .slice(0, 5)
    .join(", ");
}

function getStrengthText(apartment: Apartment) {
  return unique(
    (apartment.pros ?? [])
      .map(cleanText)
      .filter(Boolean)
  )
    .slice(0, 4)
    .join(", ");
}

function createSubscriptionFaqs(
  apartment: Apartment
): ApartmentFaqItem[] {
  const faqs: ApartmentFaqItem[] = [];

  const name = apartment.name;
  const status =
    cleanText(apartment.status) ||
    "청약 정보 확인 중";
  const announcementDate =
    formatDate(
      apartment.subscription
        ?.announcementDate
    );
  const winnerDate =
    formatDate(
      apartment.subscription
        ?.winnerDate
    );
  const price =
    getPriceText(apartment);
  const supply =
    getSupplyText(apartment);
  const floorPlans =
    getFloorPlanText(apartment);
  const moveIn =
    getMoveInText(apartment);
  const city =
    getCityName(apartment);

  faqs.push({
    question: `${name}의 현재 청약 단계는 어떻게 되나요?`,
    answer:
      `${name}은 홈픽 등록 정보 기준으로 현재 '${status}' 단계입니다. ` +
      "청약 일정과 공급 내용은 변경될 수 있으므로 신청 전 청약홈 또는 사업주체의 최신 모집공고문을 확인해주세요.",
  });

  if (
    announcementDate ||
    winnerDate
  ) {
    const parts = [
      announcementDate
        ? `모집공고일은 ${announcementDate}입니다`
        : "",
      winnerDate
        ? `당첨자 발표일은 ${winnerDate}입니다`
        : "",
    ].filter(Boolean);

    faqs.push({
      question: `${name}의 모집공고와 당첨자 발표 일정은 언제인가요?`,
      answer:
        `${parts.join(". ")}. ` +
        "접수일과 계약일 등 나머지 일정은 최신 모집공고문을 기준으로 확인해주세요.",
    });
  }

  if (price) {
    faqs.push({
      question: `${name}의 분양가는 얼마인가요?`,
      answer:
        `${name}의 현재 등록된 대표 분양가는 ${price}입니다. ` +
        "주택형, 동·호수, 층에 따라 실제 공급금액이 달라질 수 있으므로 타입별 분양가표를 함께 확인해주세요.",
    });
  }

  if (
    supply ||
    floorPlans
  ) {
    const parts = [
      supply
        ? `공급 규모는 ${supply}입니다`
        : "",
      floorPlans
        ? `확인 가능한 평형·타입은 ${floorPlans}입니다`
        : "",
    ].filter(Boolean);

    faqs.push({
      question: `${name}의 공급 세대수와 평형 타입은 어떻게 되나요?`,
      answer:
        `${parts.join(". ")}. ` +
        "타입별 공급 물량은 모집공고문과 상세 공급정보를 기준으로 확인해주세요.",
    });
  }

  if (
    faqs.length < 4 &&
    moveIn
  ) {
    faqs.push({
      question: `${name}의 입주 예정 시기는 언제인가요?`,
      answer:
        `${name}의 현재 등록된 입주 예정 시기는 ${moveIn}입니다. ` +
        "공사 진행과 사업 일정에 따라 변경될 수 있습니다.",
    });
  }

  if (
    faqs.length < 4 &&
    city
  ) {
    faqs.push({
      question: `${name}은 어느 지역에 공급되나요?`,
      answer:
        `${name}은 ${cleanText(
          apartment.region
        ) || city}에 공급되는 단지입니다. ` +
        "교통, 학군, 생활편의시설 등 세부 입지 정보는 이 페이지의 입지 안내에서 확인할 수 있습니다.",
    });
  }

  return faqs.slice(0, 4);
}

function createSaleFaqs(
  apartment: Apartment
): ApartmentFaqItem[] {
  const faqs: ApartmentFaqItem[] = [];

  const name = apartment.name;
  const listingStage =
    getListingStage(apartment);
  const status =
    cleanText(apartment.status) ||
    "분양 정보 확인 중";
  const condition =
    cleanText(apartment.condition);
  const price =
    getPriceText(apartment);
  const contract =
    getContractText(apartment);
  const middlePayment =
    getMiddlePaymentText(apartment);
  const balance =
    getBalanceText(apartment);
  const moveIn =
    getMoveInText(apartment);
  const supply =
    getSupplyText(apartment);
  const floorPlans =
    getFloorPlanText(apartment);
  const options =
    getOptionText(apartment);
  const strengths =
    getStrengthText(apartment);

  if (
    listingStage === "firstCome"
  ) {
    faqs.push({
      question: `${name}은 현재 선착순 계약이 가능한가요?`,
      answer:
        `${name}은 홈픽 등록 정보 기준으로 현재 선착순 분양 단계입니다.` +
        (condition
          ? ` 등록된 핵심 계약조건은 '${condition}'입니다.`
          : "") +
        " 잔여세대와 계약 가능한 동·호수는 수시로 바뀔 수 있으므로 방문 또는 상담 전 최신 현황을 확인해주세요.",
    });
  } else {
    faqs.push({
      question: `${name}의 현재 분양 상태는 어떻게 되나요?`,
      answer:
        `${name}은 홈픽 등록 정보 기준으로 현재 '${status}' 상태입니다.` +
        (condition
          ? ` 등록된 핵심 조건은 '${condition}'입니다.`
          : "") +
        " 실제 계약 가능 여부와 잔여세대는 최신 안내를 기준으로 확인해주세요.",
    });
  }

  if (
    contract ||
    middlePayment ||
    balance
  ) {
    const parts = [
      contract
        ? `계약금은 ${contract}입니다`
        : "",
      middlePayment
        ? `중도금 조건은 ${middlePayment}입니다`
        : "",
      balance
        ? `잔금 조건은 ${balance}입니다`
        : "",
    ].filter(Boolean);

    faqs.push({
      question: `${name}의 계약금과 납부 조건은 어떻게 되나요?`,
      answer:
        `${parts.join(". ")}. ` +
        "계약 시점과 선택 세대에 따라 적용 조건이 달라질 수 있으므로 계약 전 공급계약서와 최신 안내를 확인해주세요.",
    });
  }

  if (price) {
    faqs.push({
      question: `${name}의 분양가는 얼마인가요?`,
      answer:
        `${name}의 현재 등록된 대표 분양가는 ${price}입니다. ` +
        "주택형, 동·호수, 층에 따라 실제 분양금액이 달라질 수 있으므로 타입별 가격표를 함께 확인해주세요.",
    });
  }

  if (
    options &&
    faqs.length < 4
  ) {
    faqs.push({
      question: `${name}에서 제공되는 옵션이나 혜택은 무엇인가요?`,
      answer:
        `${name}에 현재 등록된 옵션 및 제공 품목은 ${options}입니다. ` +
        "무상 제공 범위와 적용 세대는 계약 전 최신 안내를 확인해주세요.",
    });
  }

  if (
    moveIn &&
    faqs.length < 4
  ) {
    faqs.push({
      question: `${name}의 입주 예정 시기는 언제인가요?`,
      answer:
        `${name}의 현재 등록된 입주 예정 시기는 ${moveIn}입니다. ` +
        "공사 및 사업 일정에 따라 변경될 수 있습니다.",
    });
  }

  if (
    faqs.length < 4 &&
    (supply || floorPlans)
  ) {
    const parts = [
      supply
        ? `총 세대수는 ${supply}입니다`
        : "",
      floorPlans
        ? `확인 가능한 평형·타입은 ${floorPlans}입니다`
        : "",
    ].filter(Boolean);

    faqs.push({
      question: `${name}의 세대수와 평형 타입은 어떻게 되나요?`,
      answer:
        `${parts.join(". ")}. ` +
        "타입별 잔여세대와 선택 가능한 동·호수는 현재 분양 현황에 따라 달라질 수 있습니다.",
    });
  }

  if (
    faqs.length < 4 &&
    strengths
  ) {
    faqs.push({
      question: `${name}의 주요 장점은 무엇인가요?`,
      answer:
        `${name}의 현재 등록된 주요 장점은 ${strengths}입니다. ` +
        "실거주 및 투자 판단 전에는 현장과 공식 자료를 함께 확인해주세요.",
    });
  }

  return faqs.slice(0, 4);
}

export function getApartmentFaqItems(
  apartment: Apartment
): ApartmentFaqItem[] {
  const listingStage =
    getListingStage(apartment);

  if (
    listingStage === "subscription"
  ) {
    return createSubscriptionFaqs(
      apartment
    );
  }

  return createSaleFaqs(
    apartment
  );
}

export default function ApartmentFAQ({
  apartment,
}: {
  apartment: Apartment;
}) {
  const faqs =
    getApartmentFaqItems(
      apartment
    );

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="apartment-faq-title"
      className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6"
    >
      <p className="text-xs font-extrabold tracking-wide text-emerald-600 sm:text-sm">
        FAQ
      </p>

      <h2
        id="apartment-faq-title"
        className="mt-1 break-keep text-xl font-black tracking-tight text-[#132238] sm:text-2xl"
      >
        {apartment.name} 자주 묻는 질문
      </h2>

      <p className="mt-2 break-keep text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
        현재 등록된 분양·청약 정보를 기준으로 자주 묻는 내용을 정리했습니다.
      </p>

      <div className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 sm:mt-5 sm:rounded-2xl">
        {faqs.map(
          (faq, index) => (
            <details
              key={faq.question}
              className="group bg-white open:bg-zinc-50"
              open={index === 0}
            >
              <summary
                className="
                  flex min-h-12 cursor-pointer
                  list-none items-center
                  justify-between gap-4
                  px-4 py-3 text-left
                  transition-colors
                  hover:bg-emerald-50/60
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-inset
                  focus-visible:ring-emerald-500
                  sm:min-h-14 sm:px-5 sm:py-4
                  [&::-webkit-details-marker]:hidden
                "
              >
                <span className="break-keep text-sm font-extrabold leading-6 text-[#132238] sm:text-base">
                  {faq.question}
                </span>

                <span
                  aria-hidden="true"
                  className="
                    flex h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-full bg-zinc-100
                    text-base font-bold text-zinc-500
                    transition-transform duration-200
                    group-open:rotate-45
                    group-open:bg-emerald-100
                    group-open:text-emerald-700
                  "
                >
                  +
                </span>
              </summary>

              <div className="border-t border-zinc-100 px-4 py-3 text-xs leading-6 text-zinc-600 sm:px-5 sm:py-4 sm:text-sm sm:leading-7">
                {faq.answer}
              </div>
            </details>
          )
        )}
      </div>

      <p className="mt-3 break-keep text-[10px] leading-5 text-zinc-400 sm:text-xs">
        분양가, 계약조건, 잔여세대와 일정은 변경될 수 있으므로 계약 또는 청약 전 최신 공고와 공급계약서를 확인해주세요.
      </p>
    </section>
  );
}