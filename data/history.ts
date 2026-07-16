import type {
    ContractType,
    MiddlePaymentType,
    OptionBenefitType,
    CashBenefitType,
    SupportType,
  } from "./scoring";
  
  export type ConditionHistoryItem = {
    date: string;
    title: string;
    description: string;
    contractType: ContractType;
    middlePaymentType: MiddlePaymentType;
    optionBenefitType: OptionBenefitType;
    cashBenefitType: CashBenefitType;
    balanceSupport: SupportType;
  };
  
  export type ApartmentConditionHistory = {
    apartmentSlug: string;
    history: ConditionHistoryItem[];
  };
  
  export const conditionHistories: ApartmentConditionHistory[] = [
    {
      apartmentSlug: "cheongju-prugio-cielite",
      history: [
        {
          date: "2026.03",
          title: "청약 초기 조건",
          description:
            "일반 청약 기준으로 계약금 10%, 중도금 이자후불제, 발코니 및 옵션 유상 조건으로 시작한 단계입니다.",
          contractType: "ratio-10",
          middlePaymentType: "interest-deferred",
          optionBenefitType: "paid",
          cashBenefitType: "none",
          balanceSupport: "no",
        },
        {
          date: "2026.06",
          title: "선착순 동호지정 전환",
          description:
            "선착순 전환 이후 초기 자금 부담을 낮추기 위해 계약금 조건이 완화된 단계입니다.",
          contractType: "ratio-5",
          middlePaymentType: "interest-deferred",
          optionBenefitType: "paid",
          cashBenefitType: "none",
          balanceSupport: "no",
        },
        {
          date: "2026.07",
          title: "특별 계약조건 적용",
          description:
            "계약금 500만원과 중도금 무이자 조건이 적용되며, 일부 세대는 특별 혜택 확인이 필요한 단계입니다.",
          contractType: "fixed-500",
          middlePaymentType: "free",
          optionBenefitType: "paid",
          cashBenefitType: "none",
          balanceSupport: "no",
        },
      ],
    },
  
    {
      apartmentSlug: "cheongju-hanyang-lips-belluce",
      history: [
        {
          date: "2026.05",
          title: "분양 초기 조건",
          description:
            "초기 분양 조건으로 시작한 단계이며, 세부 계약조건은 확인이 필요합니다.",
          contractType: "unknown",
          middlePaymentType: "unknown",
          optionBenefitType: "unknown",
          cashBenefitType: "unknown",
          balanceSupport: "unknown",
        },
        {
          date: "2026.06",
          title: "혜택 조건 적용",
          description:
            "발코니 확장 무상 혜택이 적용되어 실입주 비용 부담이 줄어든 단계입니다.",
          contractType: "unknown",
          middlePaymentType: "unknown",
          optionBenefitType: "balcony-free",
          cashBenefitType: "none",
          balanceSupport: "no",
        },
      ],
    },
  ];