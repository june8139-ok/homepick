import {
  getAdminAuth,
} from "../../../../lib/adminAuth";

import {
    NextResponse,
  } from "next/server";
  
  
import {
    syncApplyHomeApartments,
  } from "../../../../lib/applyHomeSync";
  
  export const dynamic =
    "force-dynamic";
  
  export const maxDuration = 300;
  
  export async function POST() {
    try {
      const auth =
        await getAdminAuth();

      if (!auth.ok) {
        return NextResponse.json(
          {
            success: false,
            message:
              auth.message,
          },
          {
            status:
              auth.status,
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
