import type {
    Metadata,
  } from "next";
  
  import Link from "next/link";
  
  export const metadata: Metadata = {
    title:
      "개인정보처리방침 | 홈픽",
  
    description:
      "홈픽의 개인정보 수집 항목, 이용 목적, 보유기간과 이용자 권리를 안내합니다.",
  
    alternates: {
      canonical:
        "/privacy",
    },
  };
  
  const sections = [
    {
      title:
        "1. 개인정보의 처리 목적",
  
      content: (
        <>
          <p>
            홈픽(HomePick, 이하
            “홈픽”)은 다음 목적을
            위해 개인정보를
            처리합니다. 수집한
            개인정보는 아래 목적
            이외의 용도로 이용하지
            않으며, 이용 목적이
            변경되는 경우 관련
            법령에 따라 필요한
            조치를 진행합니다.
          </p>
  
          <ul>
            <li>
              방문예약 및 분양 상담
              접수
            </li>
  
            <li>
              청약 일정 알림 및 청약
              상담 신청 처리
            </li>
  
            <li>
              신청자 본인 확인과
              문의사항 응대
            </li>
  
            <li>
              신청 내역 관리 및
              중복 신청 확인
            </li>
  
            <li>
              서비스 운영, 오류
              확인 및 보안 관리
            </li>
          </ul>
        </>
      ),
    },
  
    {
      title:
        "2. 처리하는 개인정보 항목",
  
      content: (
        <>
          <p>
            홈픽은 서비스 이용 과정에서
            다음 정보를 수집할 수
            있습니다.
          </p>
  
          <div className="overflow-x-auto">
            <table className="mt-4 w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700">
                  <th className="border border-zinc-200 px-4 py-3">
                    구분
                  </th>
  
                  <th className="border border-zinc-200 px-4 py-3">
                    필수 항목
                  </th>
  
                  <th className="border border-zinc-200 px-4 py-3">
                    선택 항목
                  </th>
                </tr>
              </thead>
  
              <tbody>
                <tr>
                  <td className="border border-zinc-200 px-4 py-3 font-semibold">
                    방문예약
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    이름, 휴대전화번호,
                    희망 방문일,
                    개인정보 수집·이용
                    동의 여부
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    관심 평형·타입,
                    문의내용
                  </td>
                </tr>
  
                <tr>
                  <td className="border border-zinc-200 px-4 py-3 font-semibold">
                    청약 알림·상담
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    이름, 휴대전화번호,
                    생년월일, 거주지역,
                    개인정보 수집·이용
                    동의 여부
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    무주택 여부,
                    청약통장 여부,
                    특별공급 유형
                  </td>
                </tr>
  
                <tr>
                  <td className="border border-zinc-200 px-4 py-3 font-semibold">
                    자동 생성 정보
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    접속기록, IP 주소,
                    브라우저 및 기기
                    정보, 오류기록
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    해당 없음
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
  
    {
      title:
        "3. 개인정보의 처리 및 보유기간",
  
      content: (
        <>
          <p>
            홈픽은 개인정보 수집 및
            이용 목적이 달성되면 해당
            정보를 지체 없이
            파기합니다. 다만 상담
            이력 관리, 신청 확인 및
            분쟁 대응을 위해 신청일로부터
            최대 1년간 보관할 수
            있습니다.
          </p>
  
          <p>
            관계 법령에 따라 보존할
            필요가 있는 경우에는 해당
            법령에서 정한 기간 동안
            보관합니다.
          </p>
        </>
      ),
    },
  
    {
      title:
        "4. 개인정보의 제3자 제공",
  
      content: (
        <>
          <p>
            홈픽은 원칙적으로 이용자의
            개인정보를 제3자에게
            제공하지 않습니다.
          </p>
  
          <p>
            다만 이용자가 특정 단지의
            모델하우스 방문예약 또는
            분양 상담 연결을 명시적으로
            요청하고 별도로 동의한
            경우, 해당 단지의 시행사,
            분양대행사 또는 상담
            담당자에게 상담에 필요한
            최소한의 정보를 제공할 수
            있습니다. 이 경우 제공받는
            자, 제공 목적, 제공 항목과
            보유기간을 동의 화면에서
            별도로 안내합니다.
          </p>
        </>
      ),
    },
  
    {
      title:
        "5. 개인정보 처리업무의 위탁",
  
      content: (
        <>
          <p>
            홈픽은 안정적인 서비스
            제공을 위해 다음 외부
            서비스를 이용하고
            있습니다.
          </p>
  
          <div className="overflow-x-auto">
            <table className="mt-4 w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700">
                  <th className="border border-zinc-200 px-4 py-3">
                    수탁자
                  </th>
  
                  <th className="border border-zinc-200 px-4 py-3">
                    위탁 업무
                  </th>
                </tr>
              </thead>
  
              <tbody>
                <tr>
                  <td className="border border-zinc-200 px-4 py-3 font-semibold">
                    Supabase
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    데이터베이스 저장,
                    인증 및 서비스
                    운영
                  </td>
                </tr>
  
                <tr>
                  <td className="border border-zinc-200 px-4 py-3 font-semibold">
                    Vercel
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    웹사이트 호스팅,
                    서버 기능 실행 및
                    접속기록 처리
                  </td>
                </tr>
  
                <tr>
                  <td className="border border-zinc-200 px-4 py-3 font-semibold">
                    Resend
                  </td>
  
                  <td className="border border-zinc-200 px-4 py-3">
                    관리자 이메일 알림
                    발송
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <p>
            위 서비스는 글로벌
            인프라를 이용할 수 있으므로,
            서비스 설정에 따라 개인정보가
            국외 데이터센터에서 처리될
            수 있습니다. 홈픽은 실제
            이용 중인 데이터 저장지역과
            각 업체의 처리 조건을
            확인하여 필요한 고지와
            보호조치를 시행합니다.
          </p>
        </>
      ),
    },
  
    {
      title:
        "6. 개인정보의 파기절차 및 방법",
  
      content: (
        <>
          <p>
            보유기간이 경과하거나 처리
            목적이 달성된 개인정보는
            내부 확인 후 지체 없이
            파기합니다.
          </p>
  
          <ul>
            <li>
              전자적 파일: 복구 또는
              재생되지 않도록 안전한
              방법으로 삭제
            </li>
  
            <li>
              출력물: 분쇄 또는 소각
            </li>
          </ul>
        </>
      ),
    },
  
    {
      title:
        "7. 이용자와 법정대리인의 권리",
  
      content: (
        <>
          <p>
            이용자는 홈픽에 자신의
            개인정보에 대한 열람,
            정정, 삭제, 처리정지 또는
            동의 철회를 요청할 수
            있습니다.
          </p>
  
          <p>
            요청은 아래 이메일로
            접수할 수 있으며, 홈픽은
            본인 확인 후 관련 법령에
            따라 처리합니다.
          </p>
        </>
      ),
    },
  
    {
      title:
        "8. 개인정보의 안전성 확보조치",
  
      content: (
        <>
          <p>
            홈픽은 개인정보 보호를 위해
            접근권한 관리, 비밀키의
            서버 환경변수 보관, 전송
            구간 암호화, 관리자 인증,
            접속기록 확인과 같은
            조치를 시행합니다.
          </p>
        </>
      ),
    },
  
    {
      title:
        "9. 쿠키 및 자동 수집 기술",
  
      content: (
        <>
          <p>
            홈픽은 서비스 제공과 오류
            분석을 위해 브라우저가
            저장하는 쿠키 또는 유사한
            기술을 사용할 수 있습니다.
            이용자는 브라우저 설정에서
            쿠키 저장을 거부하거나
            삭제할 수 있습니다.
          </p>
  
          <p>
            쿠키를 차단할 경우 일부
            로그인 또는 관리자 기능의
            이용이 제한될 수 있습니다.
          </p>
        </>
      ),
    },
  
    {
      title:
        "10. 개인정보 보호책임자",
  
      content: (
        <>
          <div className="rounded-2xl bg-emerald-50 p-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-[150px_1fr]">
              <dt className="font-bold text-zinc-700">
                서비스명
              </dt>
  
              <dd>
                홈픽(HomePick)
              </dd>
  
              <dt className="font-bold text-zinc-700">
                운영자
              </dt>
  
              <dd>
                옥광준
              </dd>
  
              <dt className="font-bold text-zinc-700">
                개인정보 보호책임자
              </dt>
  
              <dd>
                옥광준
              </dd>
  
              <dt className="font-bold text-zinc-700">
                문의 이메일
              </dt>
  
              <dd>
                <a
                  href="mailto:june8139@gmail.com"
                  className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
                >
                  june8139@gmail.com
                </a>
              </dd>
            </dl>
          </div>
        </>
      ),
    },
  
    {
      title:
        "11. 개인정보처리방침의 변경",
  
      content: (
        <>
          <p>
            본 방침은 법령, 서비스
            내용 또는 개인정보 처리
            방식의 변경에 따라 수정될
            수 있습니다. 중요한 변경이
            있는 경우 시행 전에
            홈페이지를 통해
            안내합니다.
          </p>
  
          <p className="font-semibold">
            시행일: 2026년 7월 25일
          </p>
        </>
      ),
    },
  ];
  
  export default function PrivacyPage() {
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
              개인정보처리방침
            </span>
          </nav>
  
          <header className="rounded-3xl bg-zinc-900 px-6 py-9 text-white shadow-sm sm:px-10 sm:py-12">
            <p className="text-sm font-bold tracking-wide text-emerald-300">
              HOMEPICK POLICY
            </p>
  
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              개인정보처리방침
            </h1>
  
            <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-white/75">
              홈픽은 이용자의 개인정보를
              소중하게 보호하며, 수집과
              이용 과정을 투명하게
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
  
                  <div className="mt-4 space-y-4 break-keep text-sm leading-7 text-zinc-600 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
                    {section.content}
                  </div>
                </section>
              )
            )}
          </div>
  
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-bold text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-700"
            >
              이용약관 보기
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