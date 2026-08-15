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
  
  function isRecord(
    value: unknown
  ): value is JsonRecord {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  }
  
  function isValidCoordinate(
    latitude: unknown,
    longitude: unknown
  ) {
    return (
      typeof latitude === "number" &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      typeof longitude === "number" &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude !== 0 &&
      longitude !== 0
    );
  }
  
  export async function POST(
    request: NextRequest
  ) {
    try {
      const authClient =
        await createClient();
  
      const {
        data: { user },
        error: authError,
      } =
        await authClient.auth.getUser();
  
      if (
        authError ||
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
        (await request.json()) as {
          apartmentId?: string;
          latitude?: number;
          longitude?: number;
          originalAddress?: string;
          matchedAddress?: string;
          accuracy?:
            | "exact"
            | "approximate";
        };
  
      const apartmentId =
        body.apartmentId?.trim();
  
      if (!apartmentId) {
        return NextResponse.json(
          {
            message:
              "단지 ID가 없습니다.",
          },
          {
            status: 400,
          }
        );
      }
  
      if (
        !isValidCoordinate(
          body.latitude,
          body.longitude
        )
      ) {
        return NextResponse.json(
          {
            message:
              "저장할 좌표가 올바르지 않습니다.",
          },
          {
            status: 400,
          }
        );
      }
  
      const {
        data: existing,
        error: readError,
      } =
        await supabaseAdmin
          .from("apartments")
          .select(
            "id, latitude, longitude, data"
          )
          .eq(
            "id",
            apartmentId
          )
          .maybeSingle();
  
      if (readError) {
        throw readError;
      }
  
      if (!existing) {
        return NextResponse.json(
          {
            message:
              "단지를 찾지 못했습니다.",
          },
          {
            status: 404,
          }
        );
      }
  
      if (
        isValidCoordinate(
          existing.latitude,
          existing.longitude
        )
      ) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          message:
            "이미 저장된 위치가 있어 변경하지 않았습니다.",
        });
      }
  
      const currentData =
        isRecord(existing.data)
          ? existing.data
          : {};
  
      const latitude =
        body.latitude as number;
  
      const longitude =
        body.longitude as number;
  
      const nextData = {
        ...currentData,
        latitude,
        longitude,
        locationGeocodeMeta: {
          originalAddress:
            body.originalAddress?.trim() ??
            "",
          matchedAddress:
            body.matchedAddress?.trim() ??
            "",
          accuracy:
            body.accuracy ===
            "approximate"
              ? "approximate"
              : "exact",
          updatedAt:
            new Date().toISOString(),
          source:
            "admin-bulk-geocode",
        },
      };
  
      const {
        error: updateError,
      } =
        await supabaseAdmin
          .from("apartments")
          .update({
            latitude,
            longitude,
            data: nextData,
          })
          .eq(
            "id",
            apartmentId
          );
  
      if (updateError) {
        throw updateError;
      }
  
      return NextResponse.json({
        ok: true,
        latitude,
        longitude,
        message:
          "단지 위치가 저장되었습니다.",
      });
    } catch (error) {
      console.error(
        "단지 위치 자동 보완 저장 오류:",
        error
      );
  
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "단지 위치 저장 중 오류가 발생했습니다.",
        },
        {
          status: 500,
        }
      );
    }
  }
  