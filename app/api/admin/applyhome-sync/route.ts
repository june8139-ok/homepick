import {
    NextResponse,
  } from "next/server";
  
  import {
    createClient,
  } from "../../../../lib/supabase/server";
  
  import {
    syncApplyHomeApartments,
  } from "../../../../lib/applyHomeSync";
  
  export const dynamic =
    "force-dynamic";
  
  export const maxDuration = 300;
  
  export async function POST() {
    try {
      /*
       * 브라우저에 동기화 비밀키를 노출하지 않고
       * 현재 관리자 로그인 세션으로 권한을 확인합니다.
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
            success: false,
            message:
              "관리자 로그인이 필요합니다.",
          },
          {
            status: 401,
          }
        );
      }
  
      const result =
        await syncApplyHomeApartments();
  
      return NextResponse.json({
        success: true,
  
        message:
          "청약홈 동기화가 완료되었습니다.",
  
        executedAt:
          new Date().toISOString(),
  
        result,
      });
    } catch (error) {
      console.error(
        "관리자 청약홈 동기화 오류:",
        error
      );
  
      return NextResponse.json(
        {
          success: false,
  
          message:
            error instanceof Error
              ? error.message
              : "청약홈 동기화 중 오류가 발생했습니다.",
        },
        {
          status: 500,
        }
      );
    }
  }