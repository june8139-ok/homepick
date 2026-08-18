import {
  revalidateTag,
} from "next/cache";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "../../../../../lib/supabase/server";

import {
  supabaseAdmin,
} from "../../../../../lib/supabaseAdmin";

type JsonRecord = Record<
  string,
  unknown
>;

type ActionRequest =
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
    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          message:
            "관리자 로그인이 필요합니다.",
        },
        {
          status: 401,
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