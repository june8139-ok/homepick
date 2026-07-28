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
  
  type DeleteRequest = {
    apartmentId: string;
  };
  
  type JsonRecord = Record<
    string,
    unknown
  >;
  
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
          DeleteRequest;
  
      if (
        !body.apartmentId
      ) {
        return NextResponse.json(
          {
            message:
              "삭제할 단지 ID가 필요합니다.",
          },
          {
            status: 400,
          }
        );
      }
  
      const {
        data:
          apartment,
        error:
          findError,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .select(
            `
              id,
              source,
              applyhome_id,
              is_auto_created,
              data
            `
          )
          .eq(
            "id",
            body.apartmentId
          )
          .single();
  
      if (findError) {
        throw findError;
      }
  
      const isApplyHomeApartment =
        apartment.source ===
          "applyhome" ||
        Boolean(
          apartment.applyhome_id
        ) ||
        Boolean(
          apartment.is_auto_created
        );
  
      /*
       * 청약홈 자동등록 단지는 완전 삭제하지 않고 제외 상태로 남깁니다.
       * applyhome_id를 유지해야 다음 동기화에서 신규 단지로 다시
       * 생성되는 것을 막을 수 있습니다.
       */
      if (
        isApplyHomeApartment
      ) {
        const currentData =
          isRecord(
            apartment.data
          )
            ? apartment.data
            : {};
  
        const {
          error:
            excludeError,
        } =
          await supabaseAdmin
            .from(
              "apartments"
            )
            .update({
              is_published:
                false,
              manual_override:
                true,
              sync_status:
                "excluded",
              data: {
                ...currentData,
                manualOverride:
                  true,
                excludedFromSync:
                  true,
              },
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              apartment.id
            );
  
        if (
          excludeError
        ) {
          throw excludeError;
        }
  
        return NextResponse.json({
          message:
            "자동수집 제외 처리되었습니다.",
          deletionType:
            "excluded",
        });
      }
  
      /*
       * 관리자 수동 등록 단지는 실제 DB 행을 완전히 삭제합니다.
       */
      const {
        error:
          deleteError,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .delete()
          .eq(
            "id",
            apartment.id
          );
  
      if (
        deleteError
      ) {
        throw deleteError;
      }
  
      return NextResponse.json({
        message:
          "단지가 삭제되었습니다.",
        deletionType:
          "hard",
      });
    } catch (error) {
      console.error(
        "관리자 단지 삭제 API 오류:",
        error
      );
  
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "단지 삭제 중 오류가 발생했습니다.",
        },
        {
          status: 500,
        }
      );
    }
  }
  