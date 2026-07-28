import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "집눈 | 전국 부동산을 한눈에";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

function JibnunSymbol() {
  return (
    <svg
      width="82"
      height="74"
      viewBox="0 0 72 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 코랄 지붕 */}
      <path
        d="M8 27.5L31 8L54 27.5"
        stroke="#FF5A5F"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 청록색 집 외곽 */}
      <path
        d="M12 26.5V50.5H42"
        stroke="#0F9D98"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 창문 */}
      <rect
        x="22"
        y="27"
        width="6"
        height="6"
        rx="1.4"
        fill="#0F9D98"
      />

      <rect
        x="31"
        y="27"
        width="6"
        height="6"
        rx="1.4"
        fill="#0F9D98"
      />

      <rect
        x="22"
        y="36"
        width="6"
        height="6"
        rx="1.4"
        fill="#0F9D98"
      />

      <rect
        x="31"
        y="36"
        width="6"
        height="6"
        rx="1.4"
        fill="#0F9D98"
      />

      {/* 돋보기 */}
      <circle
        cx="50"
        cy="46"
        r="10"
        stroke="#0F9D98"
        strokeWidth="4.5"
      />

      <path
        d="M57.5 53.5L66 62"
        stroke="#0F9D98"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* 돋보기 내부 코랄 포인트 */}
      <path
        d="M46.5 41.5C49.5 39.3 53.7 41 54 44.6"
        stroke="#FF5A5F"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #ecfdf5 0%, #ffffff 48%, #d1fae5 100%)",
          color: "#132238",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        {/* 우측 상단 민트 원형 장식 */}
        <div
          style={{
            position: "absolute",
            top: -110,
            right: -60,
            width: 380,
            height: 380,
            borderRadius: "999px",
            background:
              "rgba(16, 185, 129, 0.16)",
          }}
        />

        {/* 좌측 하단 청록 원형 장식 */}
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "999px",
            background:
              "rgba(5, 150, 105, 0.12)",
          }}
        />

        {/* 우측 중단 코랄 포인트 */}
        <div
          style={{
            position: "absolute",
            top: 210,
            right: 95,
            width: 96,
            height: 96,
            borderRadius: "999px",
            background:
              "rgba(255, 90, 95, 0.10)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent:
              "space-between",
            width: "100%",
            padding: "64px 76px",
          }}
        >
          {/* 브랜드 영역 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 88,
                height: 88,
                alignItems: "center",
                justifyContent:
                  "center",
                borderRadius: 24,
                background:
                  "rgba(255,255,255,0.82)",
                border:
                  "1px solid rgba(15,157,152,0.18)",
                boxShadow:
                  "0 12px 30px rgba(15,118,110,0.10)",
              }}
            >
              <JibnunSymbol />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  letterSpacing: -2,
                  color: "#0F766E",
                }}
              >
                집눈
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#4B5563",
                }}
              >
                전국 부동산을 한눈에
              </div>
            </div>
          </div>

          {/* 메인 문구 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 930,
            }}
          >
            <div
              style={{
                fontSize: 62,
                lineHeight: 1.18,
                fontWeight: 900,
                letterSpacing: -3,
              }}
            >
              전국 분양 아파트를
              <br />
              한눈에 검색하고 비교하세요
            </div>

            <div
              style={{
                marginTop: 26,
                fontSize: 27,
                lineHeight: 1.5,
                color: "#4B5563",
                fontWeight: 600,
              }}
            >
              청약 일정 · 선착순 분양 · 분양가 · 계약조건 · 입지 · 평면도
            </div>
          </div>

          {/* 하단 태그 + 도메인 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              {[
                "청약",
                "선착순",
                "지역검색",
                "단지비교",
              ].map(
                (label) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      borderRadius: 999,
                      background:
                        "#ffffff",
                      border:
                        "1px solid #a7f3d0",
                      padding:
                        "11px 18px",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#047857",
                    }}
                  >
                    {label}
                  </div>
                )
              )}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#0F766E",
              }}
            >
              jibnun.com
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}