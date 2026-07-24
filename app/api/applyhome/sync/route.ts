import { NextRequest, NextResponse } from "next/server";
import { syncApplyHomeApartments } from "../../../../lib/applyHomeSync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest) {
  const expectedSecret = process.env.APPLYHOME_SYNC_SECRET?.trim();

  if (!expectedSecret) {
    throw new Error(
      ".env.local에 APPLYHOME_SYNC_SECRET를 등록해주세요."
    );
  }

  const suppliedSecret =
    request.headers.get("x-sync-secret")?.trim() ||
    request.nextUrl.searchParams.get("secret")?.trim();

  return suppliedSecret === expectedSecret;
}

async function runSync(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { success: false, message: "동기화 권한이 없습니다." },
        { status: 401 }
      );
    }

    const result = await syncApplyHomeApartments();

    return NextResponse.json({
      success: true,
      message: "청약홈 신규 공고 동기화가 완료되었습니다.",
      result,
    });
  } catch (error) {
    console.error("청약홈 자동 동기화 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "청약홈 자동 동기화 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return runSync(request);
}

export async function POST(request: NextRequest) {
  return runSync(request);
}
