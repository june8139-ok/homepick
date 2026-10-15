import { asRecord, updateFirstComeReview, type ReviewAction } from "../../../../../lib/firstComeReview";
import {
  getAdminAuth,
} from "../../../../../lib/adminAuth";

import {
  revalidateTag,
} from "next/cache";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "../../../../../lib/supabaseAdmin";

type JsonRecord = Record<
  string,
  unknown
>;

type ReviewRequest = { action: "reviewFirstCome"; apartmentId: string; result: ReviewAction; intervalDays: 30 | 60; note?: string };

type ActionRequest =
  | ReviewRequest
  | {
      action:
        "togglePublished";
      apartmentId: string;
      isPublished: boolean;
    }
  | {
      action:
        "transitionToFirstCome";
      apartmentId: string;
      data: JsonRecord;
    };

function isRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const auth =
      await getAdminAuth();

    if (!auth.ok) {
      return NextResponse.json(
        {
          message:
            auth.message,
        },
        {
          status:
            auth.status,
        }
      );
    }

    const body =
      (await request.json()) as
        ActionRequest;

    if (
      !body.apartmentId
    ) {
      return NextResponse.json(
        {
          message:
            "단지 ID가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.action === "reviewFirstCome") {
      const allowed = ["confirmed", "excluded", "resumed", "soldOut"];
      if (!allowed.includes(body.result) || ![30, 60].includes(body.intervalDays) ||
          (body.note !== undefined && typeof body.note !== "string")) {
        return NextResponse.json({ message: "확인 결과와 주기를 확인해 주세요." }, { status: 400 });
      }
      const note = (body.note ?? "").trim();
      if (note.length > 500 || (body.result === "excluded" && !note)) {
        return NextResponse.json({ message: "추적 제외 사유는 1~500자로 입력해 주세요." }, { status: 400 });
      }
      const { data: existing, error: readError } = await supabaseAdmin
        .from("apartments").select("id, data, status, updated_at, source, applyhome_id, is_auto_created")
        .eq("id", body.apartmentId).maybeSingle();
      if (readError) throw readError;
      if (!existing) return NextResponse.json({ message: "단지를 찾을 수 없습니다." }, { status: 404 });
      const current = asRecord(existing.data);
      const stage = typeof current.listingStage === "string" ? current.listingStage
        : /분양완료|공급완료|마감완료/.test(existing.status ?? "") ? "soldOut"
        : /노출\s*종료|게시\s*종료/.test(existing.status ?? "") ? "completed"
        : /선착순|분양중/.test(existing.status ?? "") || /동호지정|잔여세대|회사보유분/.test(String(current.condition ?? "")) ? "firstCome"
        : /청약|접수|특별공급|1순위|2순위|당첨|계약중/.test(existing.status ?? "") ? "subscription" : "existing";
      const firstComeOnly = body.result === "confirmed" || body.result === "soldOut";
      if (firstComeOnly ? stage !== "firstCome" : !["firstCome", "subscription"].includes(stage)) {
        return NextResponse.json({ message: "현재 단지 상태에서는 처리할 수 없습니다. 목록을 새로고침해 주세요." }, { status: 409 });
      }
      const nextData = updateFirstComeReview(current, body.result, body.intervalDays, note);
      const payload: JsonRecord = { data: nextData, updated_at: new Date().toISOString() };
      if (body.result === "soldOut") {
        nextData.listingStage = "soldOut";
        nextData.status = "100% 분양완료";
        nextData.lastMeaningfulUpdateAt = payload.updated_at;
        nextData.lastUpdateType = "분양완료 확인";
        payload.status = "100% 분양완료";
        if (existing.source === "applyhome" || existing.applyhome_id || existing.is_auto_created) {
          nextData.manualOverride = true;
          payload.manual_override = true;
        }
      }
      // 조회 이후 다른 저장이 있었다면 덮어쓰지 않습니다.
      let query = supabaseAdmin.from("apartments").update(payload).eq("id", existing.id);
      query = existing.updated_at ? query.eq("updated_at", existing.updated_at) : query.is("updated_at", null);
      const { data: saved, error: saveError } = await query.select("id, data, status, updated_at").maybeSingle();
      if (saveError) throw saveError;
      if (!saved) return NextResponse.json({ message: "다른 변경이 먼저 저장되었습니다. 새로고침 후 다시 처리해 주세요." }, { status: 409 });
      revalidateTag("apartments", "max");
      return NextResponse.json({ message: "확인 결과를 저장했습니다.", apartment: saved });
    }

    if (
      body.action ===
      "togglePublished"
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .update({
            is_published:
              body.isPublished,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            body.apartmentId
          )
          .select(
            "id, is_published"
          )
          .single();

      if (error) {
        throw error;
      }

      revalidateTag(
        "apartments",
        "max"
      );

      return NextResponse.json({
        message:
          "게시 상태가 변경되었습니다.",
        apartment: data,
      });
    }

    if (
      body.action ===
      "transitionToFirstCome"
    ) {
      if (
        !isRecord(
          body.data
        )
      ) {
        return NextResponse.json(
          {
            message:
              "단지 데이터 형식이 올바르지 않습니다.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data:
          existingApartment,
        error:
          existingError,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .select(
            `
              id,
              data,
              source,
              applyhome_id,
              is_auto_created
            `
          )
          .eq(
            "id",
            body.apartmentId
          )
          .single();

      if (
        existingError
      ) {
        throw existingError;
      }

      const existingData =
        isRecord(
          existingApartment.data
        )
          ? existingApartment.data
          : {};

      const isApplyHomeApartment =
        existingApartment.source ===
          "applyhome" ||
        Boolean(
          existingApartment.applyhome_id
        ) ||
        Boolean(
          existingApartment.is_auto_created
        );

      const nextData: JsonRecord = {
        ...existingData,
        ...body.data,
        listingStage:
          "firstCome",
        status:
          "선착순 분양",
      };

      // 전환 버튼은 실제 선착순 진행을 확인하고 누르는 작업입니다.
      if (existingData.listingStage !== "firstCome") {
        const confirmedData = updateFirstComeReview(nextData, "confirmed", 30, "청약에서 선착순 전환 확인");
        const review = asRecord(confirmedData.firstComeReview);
        review.firstComeStartedAt = review.lastConfirmedAt;
        nextData.firstComeReview = review;
      } else {
        nextData.firstComeReview = existingData.firstComeReview;
      }

      if (
        isApplyHomeApartment
      ) {
        nextData.manualOverride =
          true;
      }

      const updatePayload: JsonRecord = {
        data:
          nextData,
        status:
          "선착순 분양",
        updated_at:
          new Date().toISOString(),
      };

      if (
        isApplyHomeApartment
      ) {
        updatePayload.manual_override =
          true;
      }

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .update(
            updatePayload
          )
          .eq(
            "id",
            body.apartmentId
          )
          .select(
            `
              id,
              status,
              manual_override,
              data
            `
          )
          .single();

      if (error) {
        throw error;
      }

      revalidateTag(
        "apartments",
        "max"
      );

      return NextResponse.json({
        message:
          "선착순 분양으로 전환되었습니다.",
        apartment: data,
      });
    }

    return NextResponse.json(
      {
        message:
          "지원하지 않는 작업입니다.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "관리자 단지 작업 API 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "단지 작업 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

