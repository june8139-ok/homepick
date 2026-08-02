import type { Apartment } from "../types/apartment";

type UnknownRecord = Record<string, unknown>;

type PriceRow = {
  type?: string;
  area?: string;
  name?: string;
  typeName?: string;
  houseType?: string;
  modelName?: string;
  houseTy?: string;
  exclusiveArea?: string;

  minPrice?: number | string | null;
  minimumPrice?: number | string | null;
  lowestPrice?: number | string | null;
  min_price?: number | string | null;

  price?: number | string | null;
  salePrice?: number | string | null;
  supplyPrice?: number | string | null;

  maxPrice?: number | string | null;
  maximumPrice?: number | string | null;
  highestPrice?: number | string | null;
  max_price?: number | string | null;

  types?: unknown;
};

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function booleanValue(
  value: unknown
) {
  return value === true;
}

export function isApplyHomeUnverified(
  apartment: Apartment
) {
  const record =
    apartment as Apartment & {
      source?: string;
      manualOverride?: boolean;
      manual_override?: boolean;
      isAutoCreated?: boolean;
      is_auto_created?: boolean;
      data?: {
        source?: string;
        manualOverride?: boolean;
        manual_override?: boolean;
        isAutoCreated?: boolean;
        is_auto_created?: boolean;
      };
    };

  const source =
    normalizeText(
      record.source ??
      record.data?.source
    );

  const isApplyHome =
    source === "applyhome" ||
    booleanValue(
      record.isAutoCreated
    ) ||
    booleanValue(
      record.is_auto_created
    ) ||
    booleanValue(
      record.data?.isAutoCreated
    ) ||
    booleanValue(
      record.data?.is_auto_created
    );

  const manuallyReviewed =
    booleanValue(
      record.manualOverride
    ) ||
    booleanValue(
      record.manual_override
    ) ||
    booleanValue(
      record.data?.manualOverride
    ) ||
    booleanValue(
      record.data?.manual_override
    );

  return (
    isApplyHome &&
    !manuallyReviewed
  );
}

function validPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function numberFromUnknown(value: unknown): number | null {
  if (validPrice(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return null;
  }

  const parsed = Number(digits);

  return validPrice(parsed) ? parsed : null;
}

function lowestValidPrice(values: unknown[]) {
  const prices = values
    .map(numberFromUnknown)
    .filter(
      (price): price is number =>
        validPrice(price)
    );

  return prices.length > 0
    ? Math.min(...prices)
    : null;
}

function highestValidPrice(values: unknown[]) {
  const prices = values
    .map(numberFromUnknown)
    .filter(
      (price): price is number =>
        validPrice(price)
    );

  return prices.length > 0
    ? Math.max(...prices)
    : null;
}

/*
 * priceInfo.units 안에 types가 있으면 세부 타입을 펼쳐서 반환합니다.
 * 검색카드의 84㎡ 대표가격이 평형 최고가가 아니라
 * 84A·84B·84C 각각의 가격을 기준으로 계산되게 합니다.
 */
function priceRowsOf(apartment: Apartment): PriceRow[] {
  const data =
    apartment as Apartment & {
      priceInfo?: unknown;
      data?: {
        priceInfo?: unknown;
      };
    };

  const priceInfo =
    data.priceInfo ??
    data.data?.priceInfo;

  if (!priceInfo) {
    return [];
  }

  if (Array.isArray(priceInfo)) {
    return priceInfo.filter(isRecord) as PriceRow[];
  }

  if (!isRecord(priceInfo)) {
    return [];
  }

  const candidates = [
    priceInfo.units,
    priceInfo.types,
    priceInfo.items,
    priceInfo.rows,
    priceInfo.prices,
    priceInfo.models,
    priceInfo.houseTypes,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    const rows = candidate.filter(isRecord) as PriceRow[];
    const flattened: PriceRow[] = [];

    for (const row of rows) {
      const nestedTypes = Array.isArray(row.types)
        ? row.types.filter(isRecord)
        : [];

      if (nestedTypes.length === 0) {
        flattened.push(row);
        continue;
      }

      for (const nestedType of nestedTypes) {
        flattened.push({
          ...nestedType,
          area:
            String(
              nestedType.area ??
                nestedType.typeName ??
                nestedType.type ??
                row.area ??
                ""
            ),
        });
      }
    }

    return flattened;
  }

  return [];
}

function rowLabel(row: PriceRow) {
  return String(
    row.typeName ??
      row.type ??
      row.area ??
      row.name ??
      row.houseType ??
      row.modelName ??
      row.houseTy ??
      row.exclusiveArea ??
      ""
  );
}

function rowExplicitMinimumPrice(row: PriceRow) {
  return lowestValidPrice([
    row.minPrice,
    row.minimumPrice,
    row.lowestPrice,
    row.min_price,
  ]);
}

function rowGeneralPrice(row: PriceRow) {
  return lowestValidPrice([
    row.price,
    row.salePrice,
    row.supplyPrice,
  ]);
}

function rowMaximumPrice(row: PriceRow) {
  return lowestValidPrice([
    row.maxPrice,
    row.maximumPrice,
    row.highestPrice,
    row.max_price,
  ]);
}

function is84Type(row: PriceRow) {
  const label = normalizeText(
    rowLabel(row)
  );

  if (!label) {
    return false;
  }

  return (
    /^84(?:[^\d]|$)/.test(label) ||
    /(?:^|[^\d])84(?:[^\d]|$)/.test(label)
  );
}

export function formatKoreanPrice(
  value?: number | null
) {
  if (!validPrice(value)) {
    return "";
  }

  const eok = Math.floor(value / 10000);
  const manwon = Math.round(value % 10000);

  if (eok > 0 && manwon > 0) {
    return `${eok}억 ${manwon.toLocaleString(
      "ko-KR"
    )}만원`;
  }

  if (eok > 0) {
    return `${eok}억원`;
  }

  return `${Math.round(value).toLocaleString(
    "ko-KR"
  )}만원`;
}

export function getRepresentativePrice(
  apartment: Apartment
) {
  const rows = priceRowsOf(apartment);
  const type84Rows = rows.filter(is84Type);

  /*
   * 관리자가 실제 최저가를 입력한 경우
   */
  const type84Minimum = lowestValidPrice(
    type84Rows.map(rowExplicitMinimumPrice)
  );

  if (type84Minimum) {
    return {
      label: "84㎡ 최저 분양가",
      value: type84Minimum,
      text: `${formatKoreanPrice(type84Minimum)}부터`,
      is84: true,
      isActualMinimum: true,
    };
  }

  /*
   * 일반 공급가격 필드가 있는 수동 데이터
   */
  const type84General = lowestValidPrice(
    type84Rows.map(rowGeneralPrice)
  );

  if (type84General) {
    return {
      label: "84㎡ 대표 분양가",
      value: type84General,
      text: formatKoreanPrice(type84General),
      is84: true,
      isActualMinimum: false,
    };
  }

  /*
   * 청약홈 자동 데이터:
   * 84A·84B·84C의 최고 공급가 중 가장 낮은 값입니다.
   */
  const type84Maximum = highestValidPrice(
    type84Rows.map(rowMaximumPrice)
  );

  if (type84Maximum) {
    return {
      label:
        "84㎡ 타입별 최고 공급금액",
      value:
        type84Maximum,
      text:
        `최고 ${formatKoreanPrice(
          type84Maximum
        )}`,
      is84: true,
      isActualMinimum: false,
    };
  }

  const allMinimum = lowestValidPrice(
    rows.map(rowExplicitMinimumPrice)
  );

  if (allMinimum) {
    return {
      label: "최저 분양가",
      value: allMinimum,
      text: `${formatKoreanPrice(allMinimum)}부터`,
      is84: false,
      isActualMinimum: true,
    };
  }

  const allGeneral = lowestValidPrice(
    rows.map(rowGeneralPrice)
  );

  if (allGeneral) {
    return {
      label: "대표 분양가",
      value: allGeneral,
      text: formatKoreanPrice(allGeneral),
      is84: false,
      isActualMinimum: false,
    };
  }

  const allMaximum = highestValidPrice(
    rows.map(rowMaximumPrice)
  );

  if (allMaximum) {
    return {
      label:
        "타입별 최고 공급금액",
      value:
        allMaximum,
      text:
        `최고 ${formatKoreanPrice(
          allMaximum
        )}`,
      is84: false,
      isActualMinimum: false,
    };
  }

  const fallback =
    apartment.priceDetail?.salePrice ||
    apartment.price ||
    "";

  return {
    label: "대표 분양가",
    value: null,
    text: fallback || "가격 확인 중",
    is84: false,
    isActualMinimum: false,
  };
}

export function formatMoveInDate(value?: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  const korean = raw.match(
    /(\d{4})\s*년\s*(\d{1,2})\s*월(?:\s*(\d{1,2})\s*일)?/
  );

  if (korean) {
    const year = korean[1];
    const month = korean[2].padStart(2, "0");
    const day = korean[3]?.padStart(2, "0");

    return day
      ? `${year}.${month}.${day}`
      : `${year}.${month}`;
  }

  const digits = raw.replace(/[^\d]/g, "");

  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}.${digits.slice(
      4,
      6
    )}.${digits.slice(6, 8)}`;
  }

  if (digits.length >= 6) {
    return `${digits.slice(0, 4)}.${digits.slice(
      4,
      6
    )}`;
  }

  return raw;
}

function koreaTodayDate() {
  const value =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(
      new Date()
    );

  return new Date(
    `${value}T00:00:00+09:00`
  );
}

function moveInEndDate(
  formatted: string
) {
  const match =
    formatted.match(
      /^(\d{4})\.(\d{2})(?:\.(\d{2}))?$/
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    match[3]
      ? Number(match[3])
      : new Date(
          year,
          month,
          0
        ).getDate();

  const date =
    new Date(
      `${String(year).padStart(
        4,
        "0"
      )}-${String(month).padStart(
        2,
        "0"
      )}-${String(day).padStart(
        2,
        "0"
      )}T00:00:00+09:00`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

export function getMoveInText(
  apartment: Apartment
) {
  const data =
    apartment as Apartment & {
      moveInDate?: unknown;
      moveIn?: unknown;
      occupancyDate?: unknown;
      completionDate?: unknown;
      projectInfo?: {
        moveInDate?: unknown;
      };
      data?: {
        moveInDate?: unknown;
        moveIn?: unknown;
        occupancyDate?: unknown;
        completionDate?: unknown;
        projectInfo?: {
          moveInDate?: unknown;
        };
        subscription?: {
          moveInDate?: unknown;
          occupancyDate?: unknown;
        };
      };
    };

  const raw =
    data.moveInDate ??
    data.moveIn ??
    data.occupancyDate ??
    data.completionDate ??
    data.projectInfo?.moveInDate ??
    data.data?.moveInDate ??
    data.data?.moveIn ??
    data.data?.occupancyDate ??
    data.data?.completionDate ??
    data.data?.projectInfo?.moveInDate ??
    data.data?.subscription?.moveInDate ??
    data.data?.subscription?.occupancyDate;

  const formatted =
    formatMoveInDate(raw);

  if (!formatted) {
    return "";
  }

  const endDate =
    moveInEndDate(
      formatted
    );

  const completed =
    endDate !== null &&
    koreaTodayDate() >
      endDate;

  return completed
    ? `${formatted} 입주 완료`
    : `${formatted} 입주 예정`;
}

const BENEFIT_RULES: Array<{
  label: string;
  keywords: string[];
}> = [
  {
    label: "계약금 500만원",
    keywords: [
      "계약금500만원",
      "계약금500만",
      "1차계약금500만원",
    ],
  },
  {
    label: "계약금 1,000만원",
    keywords: [
      "계약금1000만원",
      "계약금1,000만원",
      "1차계약금1000만원",
      "1차계약금1,000만원",
    ],
  },
  {
    label: "계약금 5%",
    keywords: ["계약금5%"],
  },
  {
    label: "중도금 무이자",
    keywords: [
      "중도금무이자",
      "중도금전액무이자",
      "전액무이자",
    ],
  },
  {
    label: "잔금유예",
    keywords: ["잔금유예", "입주유예"],
  },
  {
    label: "발코니 무상",
    keywords: [
      "발코니무상",
      "발코니확장무상",
      "발코니무료",
    ],
  },
  {
    label: "풀옵션 무상",
    keywords: ["풀옵션무상", "풀옵션무료"],
  },
  {
    label: "축하금",
    keywords: [
      "축하금",
      "페이백",
      "현금지원",
      "지원금",
    ],
  },
  {
    label: "전매 가능",
    keywords: ["전매가능", "입주전전매"],
  },
];

export function getKeyBenefits(
  apartment: Apartment,
  limit = 2
) {
  if (
    isApplyHomeUnverified(
      apartment
    )
  ) {
    return [];
  }

  const content = normalizeText(
    [
      apartment.condition,
      apartment.price,
      ...(apartment.pros ?? []),
    ].join(" ")
  );

  return BENEFIT_RULES.filter(({ keywords }) =>
    keywords.some((keyword) =>
      content.includes(normalizeText(keyword))
    )
  )
    .map(({ label }) => label)
    .slice(0, limit);
}
