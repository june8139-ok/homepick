import {
    NextResponse,
  } from "next/server";
  
  import {
    createClient,
  } from "../../../../../lib/supabase/server";
  
  import {
    supabaseAdmin,
  } from "../../../../../lib/supabaseAdmin";
  
  export const dynamic =
    "force-dynamic";
  
  export async function GET() {
    try {
      /*
       * 관리자 로그인 여부를 확인합니다.
       */
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
  
      /*
       * 관리자 목록은 서비스 역할 키로 조회합니다.
       * 따라서 is_published가 false인 초안도
       * 관리자 화면에서는 확인할 수 있습니다.
       */
      const {
        data:
          apartments,
        error,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .select("*")
          .or(
            "sync_status.is.null,sync_status.neq.excluded"
          )
          .order(
            "updated_at",
            {
              ascending: false,
            }
          );
  
      if (error) {
        console.error(
          "관리자 단지 목록 조회 오류:",
          error
        );
  
        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status: 500,
          }
        );
      }
  
      return NextResponse.json(
        {
          apartments:
            apartments ?? [],
        },
        {
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    } catch (error) {
      console.error(
        "관리자 단지 목록 API 오류:",
        error
      );
  
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "단지 목록을 불러오는 중 오류가 발생했습니다.",
        },
        {
          status: 500,
        }
      );
    }
  }
  