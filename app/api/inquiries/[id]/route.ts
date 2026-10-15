import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "../../../../lib/adminAuth";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id } = await context.params;

    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    const allowedStatuses =
      new Set([
        "new",
        "contacted",
        "scheduled",
        "completed",
        "closed",
      ]);

    if (
      typeof body.status ===
        "string" &&
      allowedStatuses.has(
        body.status
      )
    ) {
      updateData.status =
        body.status;
    }

    if (
      body.adminMemo !== undefined
    ) {
      updateData.admin_memo =
        typeof body.adminMemo ===
        "string"
          ? body.adminMemo
              .trim()
              .slice(0, 5000)
          : "";
    }

    if (
      Object.keys(
        updateData
      ).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "수정할 문의 정보가 없습니다.",
        },
        {
          status: 400,
        }
      );
    }

    const { error } = await supabaseAdmin
      .from("inquiries")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}