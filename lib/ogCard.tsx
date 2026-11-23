import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OG_SIZE } from "./ogMetadata";

type Card = {
  kind: "home" | "apartment" | "briefing" | "guide";
  title: string;
  candidates?: string[];
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://jibnun.com";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
let assets: Promise<[Buffer, Buffer]> | undefined;

function readAssets() {
  assets ??= Promise.all([
    readFile(join(process.cwd(), "assets", "og", "NotoSansKR-Share.otf")),
    readFile(join(process.cwd(), "public", "jibnun-logo-symbol.png")),
  ]).catch((error) => {
    assets = undefined;
    throw error;
  });
  return assets;
}

function publicPhoto(raw: string) {
  try {
    const site = new URL(SITE);
    const url = new URL(raw, site);
    const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.origin === site.origin && url.pathname.startsWith("/images/")) return url;
    if (storage && url.origin === new URL(storage).origin &&
        url.pathname.startsWith("/storage/v1/object/public/")) return url;
  } catch {
    return null;
  }
  return null;
}

async function loadPhoto(candidate: string) {
  const url = publicPhoto(candidate);
  if (!url) return undefined;
  try {
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(2500) });
    if (!response.ok || !response.body ||
        !/^image\/(?:jpeg|png|webp|avif)(?:;|$)/i.test(response.headers.get("content-type") || "") ||
        Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES) return undefined;

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
    const photo = await sharp(Buffer.concat(chunks), { limitInputPixels: 32_000_000 })
      .rotate().resize(640, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${photo.toString("base64")}`;
  } catch {
    return undefined;
  }
}

const labels = { home: "집눈", apartment: "집눈", briefing: "집눈 브리핑", guide: "집눈 가이드" };

export async function renderOgCard({ kind, title, candidates = [] }: Card) {
  const [font, logo] = await readAssets();
  let photo: string | undefined;
  for (const candidate of [...new Set(candidates.filter(Boolean))].slice(0, 2)) {
    photo = await loadPhoto(candidate);
    if (photo) break;
  }

  const home = kind === "home";
  const dark = home || kind === "apartment";
  const ink = dark ? "#ffffff" : "#103b31";
  const heading = Array.from(title.replace(/\s+/gu, " ").trim());
  const text = heading.length > 64 ? `${heading.slice(0, 63).join("")}…` : heading.join("");
  const textWidth = photo ? 535 : 1080;
  const words = text.split(" ");
  const longestWord = Math.max(1, ...words.map((word) => Array.from(word).length));
  const fontSize = home ? 110 : Math.max(37, Math.min(
    heading.length > 34 ? 49 : 70,
    Math.floor(textWidth / longestWord),
  ));
  const maxCharacters = Math.floor(textWidth / fontSize);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last && Array.from(`${last} ${word}`).length <= maxCharacters) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  const logoSize = home ? 124 : 66;
  const logoUrl = `data:image/png;base64,${logo.toString("base64")}`;
  const subtitle = home ? "전국 분양·청약 정보" :
    kind === "apartment" ? "분양가 · 평형 · 계약조건 · 입지정보" : "";

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: dark ? "#103b31" : kind === "guide" ? "#e3f3e9" : "#f6f5ef", color: ink, fontFamily: "Jibnun Korean" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: home ? "center" : "flex-start", width: photo ? 655 : 1200, padding: "48px 60px", gap: 27 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {/* ImageResponse renders native image elements. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="" width={logoSize} height={logoSize} style={{ borderRadius: home ? 25 : 15 }} />
          {!home && <div style={{ fontSize: 29 }}>{labels[kind]}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%", fontSize, lineHeight: 1.12 }}>
          {lines.map((line, i) => <div key={i} style={{ display: "flex", wordBreak: "break-word" }}>{line}</div>)}
        </div>
        {subtitle && <div style={{ fontSize: home ? 37 : 25, color: "#e1f2eb" }}>{subtitle}</div>}
      </div>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" width={545} height={630} style={{ objectFit: "cover" }} />
      )}
    </div>,
    {
      ...OG_SIZE,
      fonts: [{ name: "Jibnun Korean", data: Uint8Array.from(font).buffer, weight: 700 }],
      headers: { "Cache-Control": photo || !candidates.some(Boolean)
        ? "public, max-age=300, s-maxage=900, stale-while-revalidate=3600"
        : "public, max-age=0, s-maxage=60" },
    },
  );
}
