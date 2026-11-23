import { renderOgCard } from "../lib/ogCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "../lib/ogMetadata";

export const alt = "집눈 | 전국 분양·청약 정보";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";

export default function OpenGraphImage() {
  return renderOgCard({ kind: "home", title: "집눈" });
}
