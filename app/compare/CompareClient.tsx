"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const scoreItems = [
  { key: "price", label: "가격 경쟁력", max: 25 },
  { key: "contract", label: "계약조건", max: 20 },
  { key: "location", label: "입지·교통", max: 20 },
  { key: "living", label: "실거주 환경", max: 15 },
  { key: "future", label: "미래가치", max: 10 },
  { key: "risk", label: "리스크 관리", max: 10 },
] as const;

function getScoreValue(apt: any, key: (typeof scoreItems)[number]["key"]) {
  return apt?.score?.[key] ?? 0;
}

export default function CompareClient({ apartments }: { apartments: any[] }) {
  const searchParams = useSearchParams();
  const [openSection, setOpenSection] = useState<string | null>("price");

  const leftSlug = searchParams.get("left");
  const rightSlug = searchParams.get("right");

  const left = apartments.find((apt) => apt.slug === leftSlug);
  const right = apartments.find((apt) => apt.slug === rightSlug);

  if (!left || !right) {
    return (
      <main className="min-h-screen bg-white px-6 py-20 text-zinc-900">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold">비교할 단지를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-zinc-500">
            상세페이지에서 비교하기 버튼을 눌러주세요.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white"
          >
            단지 검색하러 가기
          </Link>
        </section>
      </main>
    );
  }

  const totalDiff = (left.score?.total ?? 0) - (right.score?.total ?? 0);
  const winner = totalDiff >= 0 ? left : right;

  const scoreClass = (a: number, b: number) =>
    a > b
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : a < b
      ? "bg-zinc-50 text-zinc-500"
      : "bg-zinc-50 text-zinc-700";

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-6xl">
        <Link href="/search" className="text-sm text-zinc-500">
          ← 검색으로 돌아가기
        </Link>

        <p className="mt-6 text-sm text-zinc-500">AI 단지 비교</p>

        <h1 className="mt-3 text-3xl font-bold">
          {left.name} <span className="text-zinc-400">VS</span> {right.name}
        </h1>

        <section className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <p className="text-sm text-zinc-500">AI 종합판단</p>
          <h2 className="mt-2 text-2xl font-bold">
            현재 조건에서는 {winner.name}이 더 우세합니다.
          </h2>
          <p className="mt-3 text-zinc-600">
            종합점수 기준 {Math.abs(totalDiff)}점 차이입니다. 세부 항목을 눌러 실제 조건을 확인해보세요.
          </p>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[left, right].map((apt) => (
            <div key={apt.slug} className="rounded-2xl border border-zinc-200 p-5">
              <p className="text-sm text-zinc-500">{apt.region}</p>
              <h2 className="mt-2 text-2xl font-bold">{apt.name}</h2>
              <p className="mt-3 text-zinc-600">
                {apt.condition || "계약조건 정보 없음"}
              </p>
              <p className="mt-5 text-4xl font-bold">
                {apt.score?.total ?? 0}점
              </p>
              <Link
                href={`/apartments/${apt.slug}`}
                className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white"
              >
                상세보기
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-xl font-bold">AI 비교표</h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200">
            <div className="grid grid-cols-4 bg-zinc-50 px-4 py-3 text-sm font-bold">
              <div>평가항목</div>
              <div className="text-center">{left.brand || left.name}</div>
              <div className="text-center">{right.brand || right.name}</div>
              <div className="text-center">우세</div>
            </div>

            {scoreItems.map((item) => {
              const leftScore = getScoreValue(left, item.key);
              const rightScore = getScoreValue(right, item.key);
              const isOpen = openSection === item.key;

              let winnerText = "동일";
              if (leftScore > rightScore) winnerText = left.brand || left.name;
              if (rightScore > leftScore) winnerText = right.brand || right.name;

              return (
                <div key={item.key} className="border-t border-zinc-200">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : item.key)}
                    className="grid w-full grid-cols-4 items-center px-4 py-4 text-left hover:bg-zinc-50"
                  >
                    <div className="font-medium">{item.label}</div>

                    <div className="text-center">
                      <span
                        className={`inline-flex min-w-12 justify-center rounded-full px-3 py-1 text-sm font-bold ${scoreClass(
                          leftScore,
                          rightScore
                        )}`}
                      >
                        {leftScore}
                      </span>
                    </div>

                    <div className="text-center">
                      <span
                        className={`inline-flex min-w-12 justify-center rounded-full px-3 py-1 text-sm font-bold ${scoreClass(
                          rightScore,
                          leftScore
                        )}`}
                      >
                        {rightScore}
                      </span>
                    </div>

                    <div className="text-center text-sm font-medium">
                      {winnerText === "동일" ? "동일" : `🏆 ${winnerText}`}
                    </div>
                  </button>

                  {isOpen && item.key === "price" && (
                    <div className="grid gap-4 bg-zinc-50 p-4 sm:grid-cols-2">
                      {[left, right].map((apt) => (
                        <div key={apt.slug} className="rounded-xl bg-white p-4">
                          <h3 className="font-bold">{apt.name}</h3>

                          <div className="mt-4 space-y-3 text-sm">
                            <p>
                              <span className="text-zinc-500">분양가</span>
                              <br />
                              <strong>
                                {apt.priceDetail?.salePrice || apt.price || "정보 없음"}
                              </strong>
                            </p>
                            <p>
                              <span className="text-zinc-500">평당가</span>
                              <br />
                              <strong>
                                {apt.priceDetail?.pricePerPyeong || "정보 없음"}
                              </strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isOpen && item.key === "contract" && (
                    <div className="grid gap-4 bg-zinc-50 p-4 sm:grid-cols-2">
                      {[left, right].map((apt) => (
                        <div key={apt.slug} className="rounded-xl bg-white p-4">
                          <h3 className="font-bold">{apt.name}</h3>

                          <div className="mt-4 space-y-3 text-sm">
                            <p>
                              <span className="text-zinc-500">계약금</span>
                              <br />
                              <strong>
                                {apt.priceDetail?.contractPrice || "정보 없음"}
                              </strong>
                            </p>
                            <p>
                              <span className="text-zinc-500">중도금</span>
                              <br />
                              <strong>
                                {apt.priceDetail?.middlePayment || "정보 없음"}
                              </strong>
                            </p>
                            <p>
                              <span className="text-zinc-500">잔금</span>
                              <br />
                              <strong>
                                {apt.priceDetail?.balance || "정보 없음"}
                              </strong>
                            </p>

                            <div>
                              <span className="text-zinc-500">기타 조건</span>
                              <ul className="mt-2 space-y-1">
                                {(apt.priceDetail?.options ?? []).length > 0 ? (
                                  apt.priceDetail.options.map((option: string) => (
                                    <li key={option}>• {option}</li>
                                  ))
                                ) : (
                                  <li>• {apt.condition || "정보 없음"}</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isOpen && item.key !== "price" && item.key !== "contract" && (
                    <div className="bg-zinc-50 p-4 text-sm text-zinc-600">
                      이 항목은 다음 단계에서 상세 설명을 추가할 예정입니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-xl font-bold">AI 최종 결론</h2>
          <p className="mt-3 text-zinc-600">
            현재 등록된 점수 기준으로는 <strong>{winner.name}</strong>이 종합적으로 더 우세합니다.
            다만 실제 선택은 분양가, 계약조건, 잔여 호실, 입주 목적에 따라 달라질 수 있습니다.
          </p>
        </section>
      </section>
    </main>
  );
}