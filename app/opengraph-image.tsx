import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "홈픽(HomePick) 전국 분양 아파트·청약·선착순 정보";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent:
              "space-between",
            width: "100%",
            padding: "68px 78px",
          }}
        >
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
                width: 76,
                height: 76,
                alignItems: "center",
                justifyContent:
                  "center",
                borderRadius: 22,
                background:
                  "#059669",
                color: "#ffffff",
                fontSize: 38,
                fontWeight: 900,
              }}
            >
              H
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#047857",
                }}
              >
                홈픽
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 23,
                  fontWeight: 700,
                  color: "#6b7280",
                }}
              >
                HomePick
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                fontSize: 60,
                lineHeight: 1.18,
                fontWeight: 900,
                letterSpacing: -2,
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
                color: "#4b5563",
              }}
            >
              청약 일정 · 선착순 분양 · 분양가 · 계약조건 · 입지 · 평면도
            </div>
          </div>

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
              ].map((label) => (
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
              ))}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#059669",
              }}
            >
              homepick.co.kr
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}