import { ImageResponse } from "next/og";

export const alt =
  "집눈 JIBNUN | 전국 분양 아파트를 한눈에";

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
          background: "#F8FBFA",
          color: "#0F172A",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -150,
            left: -110,
            width: 420,
            height: 420,
            display: "flex",
            borderRadius: 9999,
            background:
              "rgba(20, 184, 166, 0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -170,
            width: 500,
            height: 500,
            display: "flex",
            borderRadius: 9999,
            background:
              "rgba(255, 104, 107, 0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 390,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(155deg, #0F766E 0%, #0B5F59 55%, #123A45 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 54,
              right: 54,
              width: 56,
              height: 56,
              display: "flex",
              borderRadius: 9999,
              border:
                "2px solid rgba(255,255,255,0.16)",
            }}
          />

          <div
            style={{
              width: 230,
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 54,
              background: "#FFFFFF",
              boxShadow:
                "0 28px 70px rgba(0,0,0,0.22)",
            }}
          >
            <img
              src={`${SITE_URL}/jibnun-logo-symbol.png`}
              alt="집눈 로고"
              width="190"
              height="190"
              style={{
                width: 190,
                height: 190,
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: -1.5,
              color: "#FFFFFF",
            }}
          >
            집눈
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 7,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 1.8,
              color:
                "rgba(255,255,255,0.72)",
            }}
          >
            JIBNUN
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 30,
              padding: "11px 18px",
              borderRadius: 9999,
              border:
                "1px solid rgba(255,255,255,0.20)",
              background:
                "rgba(255,255,255,0.08)",
              fontSize: 17,
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            jibnun.com
          </div>
        </div>

        <div
          style={{
            width: 810,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "58px 66px 54px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                display: "flex",
                borderRadius: 9999,
                background: "#FF686B",
              }}
            />

            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 850,
                letterSpacing: -0.5,
                color: "#0F766E",
              }}
            >
              전국 부동산을 한눈에
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 66,
                lineHeight: 1.05,
                fontWeight: 950,
                letterSpacing: -4,
                color: "#111827",
              }}
            >
              전국 분양 아파트를
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 6,
                fontSize: 66,
                lineHeight: 1.05,
                fontWeight: 950,
                letterSpacing: -4,
                color: "#111827",
              }}
            >
              한눈에 찾고
              <span
                style={{
                  display: "flex",
                  marginLeft: 18,
                  color: "#FF5A5F",
                }}
              >
                비교하세요
              </span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 23,
                fontWeight: 700,
                letterSpacing: -0.8,
                color: "#596579",
              }}
            >
              청약 · 선착순 · 분양가 · 계약조건을 한곳에서
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: "auto",
            }}
          >
            {[
              "청약 일정",
              "선착순 분양",
              "분양가",
              "계약조건",
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 16px",
                  borderRadius: 9999,
                  border:
                    "1px solid rgba(15,118,110,0.14)",
                  background: "#FFFFFF",
                  boxShadow:
                    "0 8px 24px rgba(15,118,110,0.06)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#334155",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
