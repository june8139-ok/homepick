import Link from "next/link";
import type { Apartment, SubscriptionSchedule } from "../../types/apartment";
import { parseSubscriptionDate } from "../../lib/subscriptionVisibility";
const day = (date: Date) =>
  Math.floor((date.getTime() + 9 * 60 * 60 * 1000) / 86400000);
const events: Array<
  [keyof SubscriptionSchedule, keyof SubscriptionSchedule, string]
> = [
  ["specialSupplyStartDate", "specialSupplyEndDate", "특별공급"],
  ["firstPriorityStartDate", "firstPriorityEndDate", "1순위"],
  ["secondPriorityStartDate", "secondPriorityEndDate", "2순위"],
  ["winnerDate", "winnerDate", "당첨자 발표"],
  ["contractStartDate", "contractEndDate", "계약 일정"],
];
function nextEvent(a: Apartment, now: number) {
  const today = day(new Date(now));
  const matches = events
    .flatMap(([start, end, label]) => {
      const date = parseSubscriptionDate(a.subscription?.[start]);
      if (!date) return [];
      const last = parseSubscriptionDate(a.subscription?.[end]) || date;
      return day(last) < today
        ? []
        : [
            {
              date,
              label,
              today: day(date) <= today && day(last) >= today,
              sort: Math.max(day(date), today),
            },
          ];
    })
    .sort((a, b) => a.sort - b.sort);
  return matches[0] || null;
}

export default function SubscriptionTimeline({ apartments, now }: { apartments: Apartment[]; now: number }) {
  const schedules = apartments.flatMap(a => {
    const event = nextEvent(a, now);
    return event ? [{ a, event }] : [];
  }).sort((a,b) => a.event.sort - b.event.sort || a.a.slug.localeCompare(b.a.slug)).slice(0,8);
  if (!schedules.length) return null;
  return <section className="subscription-timeline" aria-labelledby="subscription-timeline-title">
    <div className="subscription-timeline-heading"><h2 id="subscription-timeline-title">진행 중·다가오는 청약 일정</h2><p>특별공급 · 1순위 · 2순위 · 당첨자 발표 · 계약</p></div>
    <div className="subscription-timeline-grid">{schedules.map(({a,event}) => <Link key={a.slug} href={`/apartments/${encodeURIComponent(a.slug)}`} className="subscription-timeline-card">
      <span className="subscription-timeline-label">{event.label}</span>
      <p className="subscription-timeline-date"><time dateTime={event.date.toISOString().slice(0,10)}>{String(event.date.getUTCMonth()+1).padStart(2,"0")}.{String(event.date.getUTCDate()).padStart(2,"0")}</time><small> ({["일","월","화","수","목","금","토"][event.date.getUTCDay()]}){event.today ? " · 진행 중" : ""}</small></p>
      <h3>{a.name}</h3><p className="subscription-timeline-region">{a.cityName || a.region}</p>
    </Link>)}</div>
  </section>;
}
