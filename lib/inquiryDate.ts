const seoulDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayIsoDate(now = new Date()) {
  const parts = seoulDate.formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isAllowedVisitDate(value: string, today = todayIsoDate()) {
  return isValidIsoDate(value) && value >= today;
}

export const VISIT_SUCCESS_MESSAGE =
  "방문 희망일이 접수되었습니다. 담당자 확인 후 일정을 안내드립니다.";
