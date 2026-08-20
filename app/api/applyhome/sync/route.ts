import {
  revalidateTag,
} from "next/cache";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  syncApplyHomeApartments,
} from "../../../../lib/applyHomeSync";

export const dynamic =
  "force-dynamic";

export const maxDuration = 300;

function isAuthorized(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET?.trim();

  const manualSecret =
    process.env
      .APPLYHOME_SYNC_SECRET
      ?.trim();

  const authorization =
    request.headers
      .get("authorization")
      ?.trim();

  const suppliedManualSecret =
    request.headers
      .get("x-sync-secret")
      ?.trim() ||
    request.nextUrl.searchParams
      .get("secret")
      ?.trim();

  const isVercelCron =
    Boolean(cronSecret) &&
    authorization ===
      `Bearer ${cronSecret}`;

  const isManualRequest =
    Boolean(manualSecret) &&
    suppliedManualSecret ===
      manualSecret;

  return (
    isVercelCron ||
    isManualRequest
  );
}

async function runSync(
  request: NextRequest
) {
  try {
    if (
      !isAuthorized(request)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "동기화 권한이 없습니다.",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await syncApplyHomeApartments();

    /*
     * 실제 신규 등록 또는 의미 있는 변경이 있었을 때만
     * 공개 단지 목록 캐시를 무효화합니다.
     *
     * 변경이 없는 매일 동기화에서는 캐시를 그대로 유지해
     * 불필요한 Supabase 재조회와 Egress를 줄입니다.
     */
    if (
      result.inserted > 0 ||
      result.changed > 0
    ) {
      revalidateTag(
        "apartments",
        "max"
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "청약홈 신규 공고 동기화가 완료되었습니다.",
      result,
    });
  } catch (error) {
    console.error(
      "청약홈 자동 동기화 오류:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "청약홈 자동 동기화 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  return runSync(request);
}

export async function POST(
  request: NextRequest
) {
  return runSync(request);
}