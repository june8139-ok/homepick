import type {
  Metadata,
} from "next";

import Link from "next/link";

export const metadata: Metadata = {
  title:
    "이용약관 | 집눈",

  description:
    "집눈 분양정보, 청약정보, 방문예약과 상담 서비스 이용조건을 안내합니다.",

  alternates: {
    canonical:
      "/terms",
  },
};

const sections = [
  {
    title:
      "제1조 목적",

    paragraphs: [
      "이 약관은 집눈(이하 “집눈”)이 제공하는 분양정보, 청약정보, 아파트 검색·비교, 방문예약, 청약 알림 및 상담 연결 서비스의 이용조건과 운영자 및 이용자의 권리·의무를 정하는 것을 목적으로 합니다.",
    ],
  },

  {
    title:
      "제2조 서비스의 내용",

    paragraphs: [
      "집눈은 전국 아파트와 분양 단지에 관한 정보 검색, 지역별 탐색, 단지 비교, 청약 일정 확인, 방문예약 및 상담 신청 기능을 제공합니다.",
      "서비스 내용은 운영상 필요, 관계 법령, 제휴 관계 또는 정보 제공처의 사정에 따라 변경될 수 있습니다.",
    ],
  },

  {
    title:
      "제3조 분양 및 청약정보의 성격",

    paragraphs: [
      "집눈에서 제공하는 분양가, 계약조건, 잔여세대, 청약일정, 입주예정일, 교통·교육·생활환경 및 개발계획 등의 정보는 공공데이터, 모집공고, 시행사·시공사·분양 관계자와 공개자료 등을 바탕으로 정리한 참고 정보입니다.",
      "정보는 작성 또는 수집 이후 변경될 수 있으며, 집눈이 특정 단지의 계약조건, 분양 가능 여부, 프리미엄, 수익 또는 미래가치를 보장하는 것은 아닙니다.",
      "이용자는 청약 또는 계약 전에 반드시 청약홈, 공식 모집공고, 시행사, 분양사무실 및 관계기관을 통해 최신 내용을 직접 확인해야 합니다.",
    ],
  },

  {
    title:
      "제4조 방문예약 및 상담 신청",

    paragraphs: [
      "이용자는 본인의 정확한 정보를 입력하여 방문예약, 청약 알림 또는 상담을 신청해야 합니다.",
      "방문예약 신청은 모델하우스 방문시간이나 상담 가능 여부를 확정하는 행위가 아니며, 담당자의 확인 또는 별도 연락을 통해 최종 조정될 수 있습니다.",
      "이용자가 개인정보 제3자 제공에 동의한 경우 집눈은 신청한 단지의 시행사, 분양대행사, 모델하우스 또는 지정 상담 담당자에게 상담과 안내에 필요한 최소한의 정보를 전달할 수 있습니다.",
      "청약 알림은 편의를 위한 보조 서비스이며, 통신 장애, 외부 데이터 변경, 시스템 오류 또는 일정 변경으로 인해 일부 안내가 지연되거나 누락될 수 있습니다.",
    ],
  },

  {
    title:
      "제5조 이용자의 의무",

    list: [
      "타인의 이름이나 연락처 등 개인정보를 무단으로 사용하지 않을 것",
      "허위 정보, 반복 신청 또는 상담 업무를 방해하는 정보를 입력하지 않을 것",
      "집눈의 서버, 데이터베이스 또는 관리자 기능에 비정상적으로 접근하지 않을 것",
      "자동화 도구를 이용한 과도한 수집, 복제, 크롤링 또는 서비스 방해 행위를 하지 않을 것",
      "서비스에 포함된 이미지, 문서, 데이터와 콘텐츠를 권리자의 허락 없이 상업적으로 복제하거나 재배포하지 않을 것",
    ],
  },

  {
    title:
      "제6조 서비스의 변경 및 중단",

    paragraphs: [
      "집눈은 시스템 점검, 장애, 호스팅 또는 데이터 제공처의 문제, 천재지변, 관계 법령의 변경 등 불가피한 사유가 있는 경우 서비스의 전부 또는 일부를 변경하거나 일시 중단할 수 있습니다.",
      "예측 가능한 중요한 변경이나 중단이 있는 경우 가능한 범위에서 사전에 홈페이지를 통해 안내합니다.",
    ],
  },

  {
    title:
      "제7조 외부 서비스와 링크",

    paragraphs: [
      "집눈은 청약홈, 지도, 카카오톡, 전화 또는 제3자 웹사이트로 연결되는 링크를 제공할 수 있습니다.",
      "외부 서비스의 내용, 운영방침, 개인정보 처리와 거래는 해당 서비스 제공자의 책임 아래 이루어지며, 이용자는 외부 서비스의 약관과 정책을 확인해야 합니다.",
    ],
  },

  {
    title:
      "제8조 지식재산권",

    paragraphs: [
      "집눈이 직접 제작한 화면 구성, 문구, 데이터 정리 방식, 로고와 콘텐츠에 대한 권리는 집눈 또는 정당한 권리자에게 있습니다.",
      "공공데이터, 시행사 제공자료, 단지 이미지와 상표 등 제3자의 자료에 대한 권리는 각각의 권리자에게 있으며, 집눈은 출처와 이용조건을 존중합니다.",
    ],
  },

  {
    title:
      "제9조 책임의 제한",

    paragraphs: [
      "집눈은 고의 또는 중대한 과실이 없는 한 외부 정보 제공처의 오류, 정보 변경, 통신 장애 또는 이용자가 최종 확인 없이 정보를 사용하여 발생한 손해에 대해 책임을 부담하지 않습니다.",
      "집눈의 정보는 부동산 계약, 투자, 법률, 세무 또는 금융 자문을 대신하지 않습니다. 중요한 의사결정은 관련 전문가와 공식 기관의 확인을 거쳐야 합니다.",
      "이 조항은 관련 법령상 집눈이 부담해야 하는 책임을 부당하게 면제하거나 제한하는 의미로 적용되지 않습니다.",
    ],
  },

  {
    title:
      "제10조 개인정보 보호",

    paragraphs: [
      "집눈은 서비스 이용 과정에서 처리하는 개인정보를 개인정보 보호법 등 관련 법령과 개인정보처리방침에 따라 보호합니다.",
    ],
  },

  {
    title:
      "제11조 약관의 변경",

    paragraphs: [
      "집눈은 관계 법령 또는 서비스 내용의 변경에 따라 이 약관을 수정할 수 있습니다.",
      "이용자에게 불리하거나 중요한 변경이 있는 경우 시행일과 변경 내용을 홈페이지를 통해 사전에 안내합니다.",
    ],
  },

  {
    title:
      "제12조 준거법 및 분쟁 해결",

    paragraphs: [
      "이 약관은 대한민국 법령에 따라 해석됩니다.",
      "서비스 이용과 관련하여 분쟁이 발생한 경우 당사자는 원만한 해결을 위해 성실히 협의하며, 해결되지 않는 경우 관련 법령에서 정한 관할 법원에 따릅니다.",
    ],
  },

  {
    title:
      "부칙",

    paragraphs: [
      "본 약관은 2026년 7월 25일부터 시행합니다.",
      "운영자: 옥광준 · 문의 이메일: june8139@gmail.com",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-4xl">
        <nav
          aria-label="현재 위치"
          className="mb-5 text-sm text-zinc-500"
        >
          <Link
            href="/"
            className="transition hover:text-emerald-700"
          >
            홈
          </Link>

          <span className="mx-2 text-zinc-300">
            /
          </span>

          <span className="font-semibold text-zinc-700">
            이용약관
          </span>
        </nav>

        <header className="rounded-3xl bg-zinc-900 px-6 py-9 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-bold tracking-wide text-emerald-300">
            집눈 이용약관
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            이용약관
          </h1>

          <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-white/75">
            집눈이 제공하는 분양정보,
            청약정보, 방문예약과 상담
            서비스의 이용 기준을
            안내합니다.
          </p>
        </header>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white px-5 py-3 shadow-sm sm:px-9">
          {sections.map(
            (section) => (
              <section
                key={
                  section.title
                }
                className="border-b border-zinc-200 py-7 last:border-b-0 sm:py-9"
              >
                <h2 className="text-xl font-extrabold sm:text-2xl">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4 break-keep text-sm leading-7 text-zinc-600">
                  {section.paragraphs?.map(
                    (paragraph) => (
                      <p key={paragraph}>
                        {paragraph}
                      </p>
                    )
                  )}

                  {section.list && (
                    <ul className="space-y-2">
                      {section.list.map(
                        (item) => (
                          <li
                            key={item}
                            className="ml-5 list-disc"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </section>
            )
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-bold text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            개인정보처리방침 보기
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            홈으로
          </Link>
        </div>
      </article>
    </main>
  );
}
