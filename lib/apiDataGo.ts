/**
 * 공공데이터포털
 * 한국부동산원 청약홈 분양정보 조회 서비스
 *
 * 사용 엔드포인트:
 * APT 분양정보 상세조회
 * getAPTLttotPblancDetail
 */

const DATA_GO_BASE_URL =
  "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

const APT_LIST_ENDPOINT =
  "getAPTLttotPblancDetail";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 100;
const MAX_PER_PAGE = 100;

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRY_COUNT = 2;

export type DataGoValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type DataGoRow = Record<
  string,
  unknown
>;

export type DataGoResponse<
  T extends DataGoRow = DataGoRow,
> = {
  currentCount: number;
  data: T[];
  matchCount: number;
  page: number;
  perPage: number;
  totalCount: number;
};

export type FetchAPTListOptions = {
  page?: number;
  perPage?: number;

  /**
   * 모집공고일 시작일
   * 예: 2026-01-01
   */
  announcementDateFrom?: string;

  /**
   * 모집공고일 종료일
   * 예: 2026-12-31
   */
  announcementDateTo?: string;

  /**
   * 주택관리번호
   */
  houseManageNo?: string;

  /**
   * 공고번호
   */
  pblancNo?: string;

  /**
   * 주택명
   */
  houseName?: string;

  /**
   * 지역 주소 검색
   */
  address?: string;
};

type ApiErrorPayload = {
  code?: string | number;
  message?: string;
  error?: string;
  details?: unknown;
};

function getServiceKey() {
  const serviceKey =
    process.env.DATA_GO_KR_SERVICE_KEY ??
    process.env.DATA_GO_SERVICE_KEY ??
    process.env.PUBLIC_DATA_SERVICE_KEY ??
    "";

  if (!serviceKey.trim()) {
    throw new Error(
      "공공데이터포털 인증키가 없습니다. " +
        ".env.local에 DATA_GO_KR_SERVICE_KEY를 등록해주세요."
    );
  }

  return serviceKey.trim();
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
  maximum?: number
) {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  const normalized = Math.max(
    1,
    Math.floor(value)
  );

  if (maximum !== undefined) {
    return Math.min(
      normalized,
      maximum
    );
  }

  return normalized;
}

function normalizeDate(
  value?: string
) {
  if (!value?.trim()) {
    return "";
  }

  const normalized = value
    .trim()
    .replace(/\./g, "-")
    .replace(/\//g, "-");

  const match = normalized.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (!match) {
    throw new Error(
      `날짜 형식이 올바르지 않습니다: ${value}. YYYY-MM-DD 형식으로 입력해주세요.`
    );
  }

  const [, year, month, day] =
    match;

  return [
    year,
    month.padStart(2, "0"),
    day.padStart(2, "0"),
  ].join("-");
}

function appendCondition(
  params: URLSearchParams,
  field: string,
  operator: "EQ" | "LIKE" | "GTE" | "LTE",
  value?: string
) {
  const normalized = value?.trim();

  if (!normalized) {
    return;
  }

  params.set(
    `cond[${field}::${operator}]`,
    normalized
  );
}

function buildAPTListUrl(
  options: FetchAPTListOptions
) {
  const serviceKey =
    getServiceKey();

  const page =
    normalizePositiveInteger(
      options.page,
      DEFAULT_PAGE
    );

  const perPage =
    normalizePositiveInteger(
      options.perPage,
      DEFAULT_PER_PAGE,
      MAX_PER_PAGE
    );

  const params =
    new URLSearchParams();

  params.set(
    "serviceKey",
    serviceKey
  );

  params.set(
    "page",
    String(page)
  );

  params.set(
    "perPage",
    String(perPage)
  );

  params.set(
    "returnType",
    "JSON"
  );

  const dateFrom =
    normalizeDate(
      options.announcementDateFrom
    );

  const dateTo =
    normalizeDate(
      options.announcementDateTo
    );

  appendCondition(
    params,
    "RCRIT_PBLANC_DE",
    "GTE",
    dateFrom
  );

  appendCondition(
    params,
    "RCRIT_PBLANC_DE",
    "LTE",
    dateTo
  );

  appendCondition(
    params,
    "HOUSE_MANAGE_NO",
    "EQ",
    options.houseManageNo
  );

  appendCondition(
    params,
    "PBLANC_NO",
    "EQ",
    options.pblancNo
  );

  appendCondition(
    params,
    "HOUSE_NM",
    "LIKE",
    options.houseName
  );

  appendCondition(
    params,
    "HSSPLY_ADRES",
    "LIKE",
    options.address
  );

  return (
    `${DATA_GO_BASE_URL}/` +
    `${APT_LIST_ENDPOINT}?` +
    params.toString()
  );
}

function parseErrorMessage(
  status: number,
  statusText: string,
  payload: unknown
) {
  if (
    payload &&
    typeof payload === "object"
  ) {
    const errorPayload =
      payload as ApiErrorPayload;

    const message =
      errorPayload.message ??
      errorPayload.error;

    if (message) {
      return `공공데이터 API 오류 (${status}): ${message}`;
    }
  }

  return (
    `공공데이터 API 요청 실패 ` +
    `(${status} ${statusText})`
  );
}

function isRetryableStatus(
  status: number
) {
  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500
  );
}

function wait(milliseconds: number) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

async function fetchJsonWithRetry<T>(
  url: string,
  retryCount = MAX_RETRY_COUNT
): Promise<T> {
  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retryCount;
    attempt += 1
  ) {
    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

    try {
      const response =
        await fetch(url, {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },

          cache: "no-store",

          signal:
            controller.signal,
        });

      const contentType =
        response.headers.get(
          "content-type"
        ) ?? "";

      let payload: unknown;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        payload =
          await response.json();
      } else {
        const text =
          await response.text();

        try {
          payload =
            JSON.parse(text);
        } catch {
          payload = {
            message:
              text.slice(0, 500),
          };
        }
      }

      if (!response.ok) {
        const error =
          new Error(
            parseErrorMessage(
              response.status,
              response.statusText,
              payload
            )
          );

        if (
          !isRetryableStatus(
            response.status
          ) ||
          attempt === retryCount
        ) {
          throw error;
        }

        lastError = error;

        await wait(
          600 *
            (attempt + 1)
        );

        continue;
      }

      return payload as T;
    } catch (error) {
      lastError = error;

      const aborted =
        error instanceof Error &&
        error.name ===
          "AbortError";

      if (
        attempt === retryCount
      ) {
        if (aborted) {
          throw new Error(
            "공공데이터 API 요청 시간이 초과되었습니다."
          );
        }

        throw error;
      }

      await wait(
        600 *
          (attempt + 1)
      );
    } finally {
      clearTimeout(
        timeoutId
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "공공데이터 API 요청에 실패했습니다."
      );
}

function normalizeResponse<
  T extends DataGoRow,
>(
  payload: unknown,
  requestedPage: number,
  requestedPerPage: number
): DataGoResponse<T> {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    throw new Error(
      "공공데이터 API 응답 형식이 올바르지 않습니다."
    );
  }

  const source =
    payload as Partial<
      DataGoResponse<T>
    > & {
      response?: unknown;
      resultCode?:
        | string
        | number;
      resultMsg?: string;
    };

  if (
    source.resultCode &&
    String(source.resultCode) !==
      "0" &&
    String(source.resultCode) !==
      "00"
  ) {
    throw new Error(
      source.resultMsg ||
        `공공데이터 API 오류 코드: ${source.resultCode}`
    );
  }

  if (
    !Array.isArray(source.data)
  ) {
    throw new Error(
      "공공데이터 API 응답에 data 배열이 없습니다."
    );
  }

  const data =
    source.data as T[];

  const currentCount =
    Number(
      source.currentCount
    );

  const matchCount =
    Number(
      source.matchCount
    );

  const totalCount =
    Number(
      source.totalCount
    );

  const page =
    Number(source.page);

  const perPage =
    Number(source.perPage);

  return {
    currentCount:
      Number.isFinite(
        currentCount
      )
        ? currentCount
        : data.length,

    data,

    matchCount:
      Number.isFinite(matchCount)
        ? matchCount
        : data.length,

    page:
      Number.isFinite(page)
        ? page
        : requestedPage,

    perPage:
      Number.isFinite(perPage)
        ? perPage
        : requestedPerPage,

    totalCount:
      Number.isFinite(totalCount)
        ? totalCount
        : Number.isFinite(
              matchCount
            )
          ? matchCount
          : data.length,
  };
}

/**
 * APT 분양공고 목록 조회
 */
export async function fetchAPTList<
  T extends DataGoRow = DataGoRow,
>(
  options: FetchAPTListOptions = {}
): Promise<DataGoResponse<T>> {
  const page =
    normalizePositiveInteger(
      options.page,
      DEFAULT_PAGE
    );

  const perPage =
    normalizePositiveInteger(
      options.perPage,
      DEFAULT_PER_PAGE,
      MAX_PER_PAGE
    );

  const url =
    buildAPTListUrl({
      ...options,
      page,
      perPage,
    });

  const payload =
    await fetchJsonWithRetry<
      unknown
    >(url);

  return normalizeResponse<T>(
    payload,
    page,
    perPage
  );
}

/**
 * 주택관리번호와 공고번호로
 * 특정 APT 공고 조회
 */
export async function fetchAPTById<
  T extends DataGoRow = DataGoRow,
>({
  houseManageNo,
  pblancNo,
}: {
  houseManageNo: string;
  pblancNo: string;
}): Promise<T | null> {
  if (
    !houseManageNo.trim() ||
    !pblancNo.trim()
  ) {
    throw new Error(
      "houseManageNo와 pblancNo가 필요합니다."
    );
  }

  const response =
    await fetchAPTList<T>({
      page: 1,
      perPage: 1,
      houseManageNo,
      pblancNo,
    });

  return response.data[0] ?? null;
}