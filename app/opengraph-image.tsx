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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/$/,
    ""
  ) || "https://jibnun.com";

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
            "linear-gradient(135deg, #ecfdf5 0%, #ffffff 52%, #d1fae5 100%)",
          color: "#132238",
        }}
      >
        {/* 우측 상단 장식 */}
        <div
          style={{
            position: "absolute",
            top: -130,
            right: -80,
            width: 420,
            height: 420,
            display: "flex",
            borderRadius: 999,
            background:
              "rgba(16, 185, 129, 0.14)",
          }}
        />

        {/* 좌측 하단 장식 */}
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -130,
            width: 440,
            height: 440,
            display: "flex",
            borderRadius: 999,
            background:
              "rgba(15, 118, 110, 0.10)",
          }}
        />

        {/* 코랄 포인트 */}
        <div
          style={{
            position: "absolute",
            top: 105,
            right: 145,
            width: 26,
            height: 26,
            display: "flex",
            borderRadius: 999,
            background: "#FF5A5F",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent:
              "space-between",
            padding: "58px 72px",
          }}
        >
          {/* 상단 브랜드 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                overflow: "hidden",
                borderRadius: 24,
                background: "#ffffff",
                border:
                  "1px solid #a7f3d0",
                boxShadow:
                  "0 12px 28px rgba(15, 118, 110, 0.12)",
              }}
            >
              <img
                src={`${SITE_URL}/icon-512.png`}
                alt=""
                width="78"
                height="78"
                style={{
                  width: 78,
                  height: 78,
                  objectFit:
                    "contain",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 48,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: -2,
                  color: "#0F766E",
                }}
              >
                집눈
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 10,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#64748B",
                }}
              >
                전국 부동산을 한눈에
              </div>
            </div>
          </div>

          {/* 중앙 문구 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 64,
                lineHeight: 1.16,
                fontWeight: 900,
                letterSpacing: -3,
                color: "#111827",
              }}
            >
              분양 아파트부터 청약 일정까지
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 64,
                lineHeight: 1.16,
                fontWeight: 900,
                letterSpacing: -3,
                color: "#111827",
              }}
            >
              한눈에 찾고
              <span
                style={{
                  display: "flex",
                  marginLeft: 16,
                  color: "#FF5A5F",
                }}
              >
                비교하세요
              </span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 25,
                fontWeight: 600,
                color: "#4B5563",
              }}
            >
              청약 일정 · 선착순 분양 · 분양가 · 계약조건 · 입지정보
            </div>
          </div>

          {/* 하단 */}
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
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding:
                    "10px 17px",
                  borderRadius: 999,
                  background:
                    "#ffffff",
                  border:
                    "1px solid #a7f3d0",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#047857",
                }}
              >
                청약
              </div>

              <div
                style={{
                  display: "flex",
                  padding:
                    "10px 17px",
                  borderRadius: 999,
                  background:
                    "#ffffff",
                  border:
                    "1px solid #a7f3d0",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#047857",
                }}
              >
                선착순
              </div>

              <div
                style={{
                  display: "flex",
                  padding:
                    "10px 17px",
                  borderRadius: 999,
                  background:
                    "#ffffff",
                  border:
                    "1px solid #a7f3d0",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#047857",
                }}
              >
                지역검색
              </div>

              <div
                style={{
                  display: "flex",
                  padding:
                    "10px 17px",
                  borderRadius: 999,
                  background:
                    "#ffffff",
                  border:
                    "1px solid #a7f3d0",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#047857",
                }}
              >
                단지비교
              </div>
            </div>

            <div
              style={{
                display: "flex",
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