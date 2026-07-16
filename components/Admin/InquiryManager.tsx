"use client";

import { useState } from "react";

type Inquiry = {
  id: string;
  customer_name: string;
  apartment_name: string;
  phone: string;
  interested_type: string | null;
  visit_date: string | null;
  status: string;
  admin_memo: string | null;
};

const statuses = [
  "신규",
  "상담중",
  "방문예정",
  "계약",
  "취소",
];

export default function InquiryManager({
  initialInquiries,
}: {
  initialInquiries: Inquiry[];
}) {
  const [items, setItems] =
    useState(initialInquiries);

  async function updateInquiry(
    id: string,
    payload: {
      status?: string;
      adminMemo?: string;
    }
  ) {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(payload),
    });

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                payload.status ??
                item.status,

              admin_memo:
                payload.adminMemo ??
                item.admin_memo,
            }
          : item
      )
    );
  }

  return (
    <div className="space-y-5">

      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold">
                {item.customer_name}
              </h2>

              <p className="text-zinc-500">
                {item.apartment_name}
              </p>

            </div>

            <a
              href={`tel:${item.phone}`}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-white"
            >
              전화걸기
            </a>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <Info
              label="연락처"
              value={item.phone}
            />

            <Info
              label="관심타입"
              value={
                item.interested_type ??
                "-"
              }
            />

            <Info
              label="예약일"
              value={
                item.visit_date ??
                "-"
              }
            />

            <Info
              label="현재상태"
              value={item.status}
            />

          </div>

          <div className="mt-5 flex flex-wrap gap-2">

            {statuses.map((status) => (

              <button
                key={status}
                onClick={() =>
                  updateInquiry(item.id, {
                    status,
                  })
                }
                className={[
                  "rounded-xl px-4 py-2 text-sm font-bold",

                  item.status === status
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100",
                ].join(" ")}
              >
                {status}
              </button>

            ))}

          </div>

          <textarea
            defaultValue={
              item.admin_memo ?? ""
            }
            onBlur={(e) =>
              updateInquiry(item.id, {
                adminMemo:
                  e.target.value,
              })
            }
            placeholder="관리자 메모"

            className="mt-5 h-32 w-full rounded-xl border p-3"
          />

        </div>
      ))}

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-100 p-3">

      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>

    </div>
  );
}