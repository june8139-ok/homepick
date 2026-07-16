import { NextResponse } from "next/server";
import { fetchAPTList } from "../../../lib/apiDataGo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await fetchAPTList({
      page: 1,
      perPage: 100,
    });

    return NextResponse.json({
      success: true,
      totalCount: result.totalCount ?? 0,
      currentCount:
        result.currentCount ?? result.data?.length ?? 0,
      data: result.data ?? [],
    });
  } catch (error) {
    console.error("청약홈 API 연결 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "청약홈 정보를 불러오지 못했습니다.",
        data: [],
      },
      {
        status: 500,
      }
    );
  }
}