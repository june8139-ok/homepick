import { ImageResponse } from "next/og";


export const alt =
  "집눈 JIBNUN | 전국 부동산을 한눈에";

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
            "linear-gradient(135deg, #F8FBFA 0%, #FFFFFF 55%, #E8F7F2 100%)",
          color: "#132238",
        }}
      >
        {/* 우측 배경 패널 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 410,
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(15,118,110,0.10) 0%, rgba(16,185,129,0.03) 100%)",
            borderLeft:
              "1px solid rgba(15,118,110,0.08)",
          }}
        />

        {/* 우측 아파트 실루엣 */}
        <div
          style={{
            position: "absolute",
            right: 70,
            bottom: 70,
            width: 270,
            height: 360,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 10,
              width: 82,
              height: 225,
              display: "flex",
              borderRadius: "12px 12px 0 0",
              background:
                "rgba(15,118,110,0.12)",
              border:
                "1px solid rgba(15,118,110,0.12)",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 95,
              width: 105,
              height: 320,
              display: "flex",
              borderRadius: "14px 14px 0 0",
              background:
                "rgba(15,118,110,0.19)",
              border:
                "1px solid rgba(15,118,110,0.15)",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 70,
              height: 260,
              display: "flex",
              borderRadius: "12px 12px 0 0",
              background:
                "rgba(15,118,110,0.10)",
              border:
                "1px solid rgba(15,118,110,0.12)",
            }}
          />

          {/* 창문 포인트 */}
          {[
            [128, 90],
            [128, 138],
            [128, 186],
            [128, 234],
            [164, 90],
            [164, 138],
            [164, 186],
            [164, 234],
          ].map(([left, bottom], index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left,
                bottom,
                width: 13,
                height: 22,
                display: "flex",
                borderRadius: 3,
                background:
                  index === 5
                    ? "#FF686B"
                    : "rgba(255,255,255,0.72)",
              }}
            />
          ))}
        </div>

        {/* 장식선 */}
        <div
          style={{
            position: "absolute",
            top: 74,
            left: 72,
            width: 70,
            height: 5,
            display: "flex",
            borderRadius: 999,
            background: "#FF686B",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "92px 72px 64px",
          }}
        >
          {/* 브랜드 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 82,
                height: 82,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: 24,
                background: "#FFFFFF",
                border:
                  "1px solid rgba(15,118,110,0.14)",
                boxShadow:
                  "0 16px 38px rgba(15,118,110,0.10)",
              }}
            >
              <img
                src={`${SITE_URL}/jibnun-logo-symbol.png`}
                alt=""
                width="68"
                height="68"
                style={{
                  width: 68,
                  height: 68,
                  objectFit: "contain",
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
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 49,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: -2.5,
                    color: "#0F766E",
                  }}
                >
                  집눈
                </div>

                <div
                  style={{
                    display: "flex",
                    marginTop: 7,
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: 2,
                    color: "#94A3B8",
                  }}
                >
                  JIBNUN
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#64748B",
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
              width: 760,
              marginTop: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: -4,
                color: "#132238",
              }}
            >
              전국 부동산을
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 4,
                fontSize: 72,
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: -4,
                color: "#132238",
              }}
            >
              한눈에
              <span
                style={{
                  display: "flex",
                  marginLeft: 20,
                  color: "#0F766E",
                }}
              >
                비교하다
              </span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 24,
                fontWeight: 650,
                letterSpacing: -0.8,
                color: "#566477",
              }}
            >
              분양 · 청약 · 선착순 아파트 정보를 한곳에서
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
                alignItems: "center",
                gap: 12,
                fontSize: 18,
                fontWeight: 750,
                color: "#64748B",
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  display: "flex",
                  borderRadius: 999,
                  background: "#FF686B",
                }}
              />

              분양가 · 계약조건 · 입지 · 청약일정
            </div>

            <div
              style={{
                display: "flex",
                marginRight: 8,
                fontSize: 23,
                fontWeight: 900,
                letterSpacing: -0.5,
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