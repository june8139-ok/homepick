import {
    revalidateTag,
  } from "next/cache";
  
  import {
    NextRequest,
    NextResponse,
  } from "next/server";
  
  import {
    createClient,
  } from "../../../../lib/supabase/server";
  
  import {
    supabaseAdmin,
  } from "../../../../lib/supabaseAdmin";
  
  type BriefingPayload = {
    title: string;
    slug: string;
    summary: string;
    content: string;
    category: string;
    region: string;
    thumbnail_url: string | null;
    related_apartment_slugs: string[];
    is_published: boolean;
    published_at: string | null;
  };
  
  type RequestBody =
    | {
        action: "save";
        mode:
          | "create"
          | "edit";
        id?: string;
        payload: BriefingPayload;
      }
    | {
        action:
          "togglePublished";
        id: string;
        isPublished: boolean;
      }
    | {
        action: "delete";
        id: string;
      };
  
  function invalidateBriefings() {
    /*
     * Route Handler에서도 즉시 만료가 필요하므로 expire: 0을 사용합니다.
     * 다음 공개 페이지 요청은 이전 캐시를 먼저 보여주지 않고
     * 최신 브리핑 데이터를 다시 조회합니다.
     */
    revalidateTag(
      "briefings",
      {
        expire: 0,
      }
    );
  }
  
  async function requireUser() {
    const supabase =
      await createClient();
  
    const {
      data: {
        user,
      },
      error,
    } =
      await supabase.auth.getUser();
  
    if (
      error ||
      !user
    ) {
      return null;
    }
  
    return user;
  }
  
  export async function POST(
    request: NextRequest
  ) {
    try {
      const user =
        await requireUser();
  
      if (!user) {
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
  
      const body =
        (await request.json()) as
          RequestBody;
  
      if (
        body.action === "save"
      ) {
        const {
          mode,
          id,
          payload,
        } = body;
  
        if (
          mode !== "create" &&
          mode !== "edit"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "잘못된 저장 방식입니다.",
            },
            {
              status: 400,
            }
          );
        }
  
        if (
          !payload?.title?.trim() ||
          !payload?.slug?.trim() ||
          !payload?.summary?.trim() ||
          !payload?.content?.trim()
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "제목, URL 주소, 한 줄 요약, 본문은 필수입니다.",
            },
            {
              status: 400,
            }
          );
        }
  
        const savePayload = {
          title:
            payload.title.trim(),
          slug:
            payload.slug.trim(),
          summary:
            payload.summary.trim(),
          content:
            payload.content.trim(),
          category:
            payload.category,
          region:
            payload.region.trim(),
          thumbnail_url:
            payload.thumbnail_url,
          related_apartment_slugs:
            Array.isArray(
              payload.related_apartment_slugs
            )
              ? payload.related_apartment_slugs
              : [],
          is_published:
            Boolean(
              payload.is_published
            ),
          published_at:
            payload.is_published
              ? payload.published_at ??
                new Date().toISOString()
              : null,
        };
  
        if (
          mode === "edit"
        ) {
          if (!id) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "수정할 브리핑 ID가 없습니다.",
              },
              {
                status: 400,
              }
            );
          }
  
          const {
            error,
          } =
            await supabaseAdmin
              .from(
                "briefings"
              )
              .update({
                ...savePayload,
                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                id
              );
  
          if (error) {
            if (
              error.code ===
              "23505"
            ) {
              return NextResponse.json(
                {
                  success: false,
                  code:
                    error.code,
                  message:
                    "같은 URL 주소가 이미 사용 중입니다.",
                },
                {
                  status: 409,
                }
              );
            }
  
            throw error;
          }
        } else {
          const {
            error,
          } =
            await supabaseAdmin
              .from(
                "briefings"
              )
              .insert(
                savePayload
              );
  
          if (error) {
            if (
              error.code ===
              "23505"
            ) {
              return NextResponse.json(
                {
                  success: false,
                  code:
                    error.code,
                  message:
                    "같은 URL 주소가 이미 사용 중입니다.",
                },
                {
                  status: 409,
                }
              );
            }
  
            throw error;
          }
        }
  
        invalidateBriefings();
  
        return NextResponse.json({
          success: true,
          message:
            mode === "create"
              ? "브리핑이 저장되었습니다."
              : "브리핑 수정 내용이 저장되었습니다.",
        });
      }
  
      if (
        body.action ===
        "togglePublished"
      ) {
        if (!body.id) {
          return NextResponse.json(
            {
              success: false,
              message:
                "브리핑 ID가 필요합니다.",
            },
            {
              status: 400,
            }
          );
        }
  
        const {
          error,
        } =
          await supabaseAdmin
            .from(
              "briefings"
            )
            .update({
              is_published:
                body.isPublished,
              published_at:
                body.isPublished
                  ? new Date().toISOString()
                  : null,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              body.id
            );
  
        if (error) {
          throw error;
        }
  
        invalidateBriefings();
  
        return NextResponse.json({
          success: true,
          message:
            body.isPublished
              ? "브리핑이 공개되었습니다."
              : "브리핑이 비공개로 전환되었습니다.",
        });
      }
  
      if (
        body.action === "delete"
      ) {
        if (!body.id) {
          return NextResponse.json(
            {
              success: false,
              message:
                "브리핑 ID가 필요합니다.",
            },
            {
              status: 400,
            }
          );
        }
  
        const {
          error,
        } =
          await supabaseAdmin
            .from(
              "briefings"
            )
            .delete()
            .eq(
              "id",
              body.id
            );
  
        if (error) {
          throw error;
        }
  
        invalidateBriefings();
  
        return NextResponse.json({
          success: true,
          message:
            "브리핑이 삭제되었습니다.",
        });
      }
  
      return NextResponse.json(
        {
          success: false,
          message:
            "지원하지 않는 작업입니다.",
        },
        {
          status: 400,
        }
      );
    } catch (error) {
      console.error(
        "브리핑 관리자 API 오류:",
        error
      );
  
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "브리핑 처리 중 오류가 발생했습니다.",
        },
        {
          status: 500,
        }
      );
    }
  }