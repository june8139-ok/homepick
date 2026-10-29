"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { Apartment, SubscriptionSchedule } from "../../types/apartment";
import type { Briefing } from "../../types/briefing";
import {
  getHomeVisibleApartments,
  getVisibleSubscriptions,
  isFirstComeApartment,
  parseSubscriptionDate,
} from "../../lib/subscriptionVisibility";
import { isPublicListing } from "../../lib/listingStage";
import { getListingCardPrice } from "../../lib/apartmentDisplay";
import { getRecentUpdatedApartments } from "../../lib/recentApartments";
import FavoriteButton from "../Apartment/FavoriteButton";
import FeaturedSlider from "./FeaturedSlider";
import SearchHero from "./SearchHero";
import DeferredRegionMapSection from "./DeferredRegionMapSection";
import HomeBriefingSection from "./HomeBriefingSection";
const regions = [
  "서울",
  "경기",
  "인천",
  "대전",
  "세종",
  "충남",
  "충북",
  "부산",
  "대구",
  "울산",
  "경남",
  "경북",
  "광주",
  "전남",
  "전북",
  "강원",
  "제주",
];
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
function photo(a: Apartment) {
  return (
    [a.images.hero, ...a.images.gallery].find(
      (x) => x && !x.includes("/default/"),
    ) || ""
  );
}
function UnitCard({ a }: { a: Apartment }) {
  const image = photo(a);
  const href = `/apartments/${encodeURIComponent(a.slug)}`;
  const price = getListingCardPrice(a, true).text;
  return (
    <article className="home-unit-card">
      <Link href={href} className="home-unit-photo">
        {image ? (
          <Image
            src={image}
            alt={`${a.name} 대표 이미지`}
            fill
            quality={88}
            sizes="(max-width:639px) 46vw,(max-width:1023px) 30vw,290px"
            className="object-cover"
          />
        ) : (
          <span>단지 이미지 준비 중</span>
        )}
      </Link>
      <div className="home-unit-copy">
        <div className="home-unit-heading">
          <Link href={href}>
            <h3>{a.name}</h3>
          </Link>
          <FavoriteButton slug={a.slug} apartmentName={a.name} />
        </div>
        <p>{a.cityName || a.region}</p>
        {price && <strong>{price}</strong>}
        {a.condition && <p className="home-unit-condition">{a.condition}</p>}
      </div>
    </article>
  );
}
export default function HomeClient({
  apartments,
  briefings,
  referenceNow,
}: {
  apartments: Apartment[];
  briefings: Briefing[];
  referenceNow: number;
}) {
  const visible = useMemo(
    () => getHomeVisibleApartments(apartments, new Date(referenceNow)),
    [apartments, referenceNow],
  );
  const search = useMemo(
    () => apartments.filter(isPublicListing),
    [apartments],
  );
  const firstCome = useMemo(
    () =>
      visible
        .filter(isFirstComeApartment)
        .sort(
          (a, b) =>
            (Date.parse(b.createdAt || "") || 0) -
            (Date.parse(a.createdAt || "") || 0),
        ),
    [visible],
  );
  const schedules = useMemo(
    () =>
      getVisibleSubscriptions(apartments, new Date(referenceNow))
        .flatMap((a) => {
          const event = nextEvent(a, referenceNow);
          return event ? [{ a, event }] : [];
        })
        .sort(
          (a, b) =>
            a.event.sort - b.event.sort || a.a.slug.localeCompare(b.a.slug),
        )
        .slice(0, 4),
    [apartments, referenceNow],
  );
  const recent = useMemo(
    () =>
      getRecentUpdatedApartments(visible, undefined, referenceNow).slice(0, 4),
    [visible, referenceNow],
  );
  return (
    <main className="home-refined">
      <FeaturedSlider apartments={firstCome} />
      <SearchHero apartments={search} />
      <div className="home-content">
        <section className="home-schedules">
          <div className="home-section-title">
            <h2>
              {schedules.some((x) => x.event.today)
                ? "오늘의 청약"
                : "다가오는 청약"}
            </h2>
            <Link href="/subscription">
              전체 보기 <span>›</span>
            </Link>
          </div>
          {schedules.length ? (
            <div className="home-schedule-grid">
              {schedules.slice(0, 4).map(({ a, event }) => (
                <Link
                  href={`/apartments/${encodeURIComponent(a.slug)}`}
                  key={a.slug}
                  className="home-schedule-card"
                >
                  <span
                    className={`home-event-label ${event.label === "특별공급" ? "warm" : ""}`}
                  >
                    {event.label}
                  </span>
                  <p className="home-event-date">
                    {`${String(event.date.getUTCMonth() + 1).padStart(2, "0")}.${String(event.date.getUTCDate()).padStart(2, "0")}`}{" "}
                    <small>
                      (
                      {
                        ["일", "월", "화", "수", "목", "금", "토"][
                          event.date.getUTCDay()
                        ]
                      }
                      ){event.today ? " · 진행 중" : ""}
                    </small>
                  </p>
                  <h3>{a.name}</h3>
                  <p className="home-event-region">{a.cityName || a.region}</p>
                  <span className="home-card-arrow" aria-hidden="true">
                    ›
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="home-small-empty">
              확인 가능한 예정 일정이 없습니다.{" "}
              <Link href="/subscription">전체 청약 보기 →</Link>
            </p>
          )}
        </section>
        <section className="home-listings">
          <div className="home-section-title">
            <h2>지금 살펴볼 단지</h2>
            <Link href="/first-come">
              전체 보기 <span>›</span>
            </Link>
          </div>
          <div className="home-unit-grid">
            {firstCome.slice(0, 4).map((a) => (
              <UnitCard key={a.slug} a={a} />
            ))}
          </div>
          {!firstCome.length && (
            <p className="home-small-empty">
              현재 공개된 선착순 단지가 없습니다.
            </p>
          )}
        </section>
        {recent.length > 0 && (
          <section className="home-recent">
            <div className="home-section-title">
              <h2>최근 업데이트</h2>
              <Link href="/search?recent=1">전체 보기 ›</Link>
            </div>
            <div className="home-recent-grid">
              {recent.map((a) => (
                <Link
                  key={a.slug}
                  href={`/apartments/${encodeURIComponent(a.slug)}`}
                >
                  <span>{a.lastUpdateType || "정보 업데이트"}</span>
                  <strong>{a.name}</strong>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <DeferredRegionMapSection apartments={visible} />
        <section className="home-region-links">
          <div className="home-section-title">
            <h2>지역별 분양정보</h2>
            <Link href="/region">전체 보기 ›</Link>
          </div>
          <nav aria-label="지역별 분양정보">
            {regions.map((region) => (
              <Link key={region} href={`/region/${encodeURIComponent(region)}`}>
                {region}
              </Link>
            ))}
          </nav>
        </section>
        <HomeBriefingSection briefings={briefings} />
      </div>
    </main>
  );
}
