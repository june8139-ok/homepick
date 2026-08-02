import {
    normalizeRegionRoute,
  } from "./regionUtils";
  
  const DEFAULT_SITE_URL =
    "https://jibnun.com";
  
  const INDEXNOW_ENDPOINT =
    "https://searchadvisor.naver.com/indexnow";
  
  function getSiteUrl() {
    const raw =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      DEFAULT_SITE_URL;
  
    try {
      return new URL(
        raw
      );
    } catch {
      return new URL(
        DEFAULT_SITE_URL
      );
    }
  }
  
  function toAbsoluteSiteUrl(
    value: string
  ) {
    const siteUrl =
      getSiteUrl();
  
    try {
      const resolved =
        new URL(
          value,
          siteUrl
        );
  
      if (
        resolved.host !==
        siteUrl.host
      ) {
        return null;
      }
  
      resolved.hash = "";
  
      return resolved.toString();
    } catch {
      return null;
    }
  }
  
  export function buildIndexNowUrls({
    slug,
    region,
    includeRegionHub = true,
  }: {
    slug?: string | null;
    region?: string | null;
    includeRegionHub?: boolean;
  }) {
    const urls: string[] = [];
  
    if (
      typeof slug ===
        "string" &&
      slug.trim()
    ) {
      urls.push(
        `/apartments/${encodeURIComponent(
          slug.trim()
        )}`
      );
    }
  
    const normalizedRegion =
      typeof region ===
        "string"
        ? normalizeRegionRoute(
            region
          )
        : "";
  
    if (normalizedRegion) {
      urls.push(
        `/region/${encodeURIComponent(
          normalizedRegion
        )}`
      );
    }
  
    if (includeRegionHub) {
      urls.push(
        "/region"
      );
    }
  
    return urls;
  }
  
  export type IndexNowResult = {
    attempted: number;
    submitted: number;
    skipped: boolean;
    status: number | null;
    message: string;
  };
  
  export async function submitIndexNow(
    values: Array<
      string | null | undefined
    >
  ): Promise<IndexNowResult> {
    const key =
      process.env.INDEXNOW_KEY?.trim();
  
    if (!key) {
      return {
        attempted: 0,
        submitted: 0,
        skipped: true,
        status: null,
        message:
          "INDEXNOW_KEY가 설정되지 않아 전송을 건너뛰었습니다.",
      };
    }
  
    const siteUrl =
      getSiteUrl();
  
    const urlList = [
      ...new Set(
        values
          .filter(
            (
              value
            ): value is string =>
              typeof value ===
                "string" &&
              Boolean(
                value.trim()
              )
          )
          .map(
            toAbsoluteSiteUrl
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      ),
    ].slice(0, 10000);
  
    if (
      urlList.length ===
      0
    ) {
      return {
        attempted: 0,
        submitted: 0,
        skipped: true,
        status: null,
        message:
          "전송할 변경 URL이 없습니다.",
      };
    }
  
    try {
      const response =
        await fetch(
          INDEXNOW_ENDPOINT,
          {
            method: "POST",
  
            headers: {
              "Content-Type":
                "application/json; charset=utf-8",
            },
  
            body:
              JSON.stringify({
                host:
                  siteUrl.host,
                key,
                keyLocation:
                  `${siteUrl.origin}/indexnow-key.txt`,
                urlList,
              }),
  
            cache: "no-store",
          }
        );
  
      const accepted =
        response.status ===
          200 ||
        response.status ===
          202;
  
      if (!accepted) {
        const responseText =
          await response
            .text()
            .catch(
              () => ""
            );
  
        console.error(
          "IndexNow 전송 실패:",
          {
            status:
              response.status,
            responseText,
            urlList,
          }
        );
      }
  
      return {
        attempted:
          urlList.length,
        submitted:
          accepted
            ? urlList.length
            : 0,
        skipped: false,
        status:
          response.status,
        message:
          accepted
            ? response.status ===
                202
              ? "IndexNow URL이 접수되었고 키 검증을 기다리고 있습니다."
              : "IndexNow 전송이 완료되었습니다."
            : `IndexNow 전송 실패: HTTP ${response.status}`,
      };
    } catch (error) {
      console.error(
        "IndexNow 요청 오류:",
        error
      );
  
      return {
        attempted:
          urlList.length,
        submitted: 0,
        skipped: false,
        status: null,
        message:
          error instanceof Error
            ? error.message
            : "IndexNow 요청 중 오류가 발생했습니다.",
      };
    }
  }
  