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

import {
  buildIndexNowUrls,
  submitIndexNow,
} from "../../../../../lib/indexNow";

type JsonRecord = Record<
  string,
  unknown
>;

type SaveApartmentRequest = {
  mode:
    | "create"
    | "edit";

  editingSlug?: string;

  payload: {
    slug: string;
    name: string;
    brand?: string | null;
    builder?: string | null;

    city?: string | null;
    district?: string | null;
    region?: string | null;

    status?: string | null;
    type?: string | null;

    hero_image?: string | null;

    latitude?: number | null;
    longitude?: number | null;

    data: JsonRecord;
  };
};

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

function toRecord(
  value: unknown
): JsonRecord {
  return isRecord(value)
    ? value
    : {};
}

function hasPositiveNumber(
  value: unknown
) {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

/**
 * priceInfo 안에 실제로 사용할 수 있는 가격이 있는지 확인합니다.
 *
 * 새 관리자 데이터가 빈 priceInfo를 보내는 경우,
 * 기존 청약홈 가격을 덮어쓰지 않게 하기 위해 사용합니다.
 */
function hasUsefulPriceInfo(
  value: unknown
) {
  if (!isRecord(value)) {
    return false;
  }

  if (
    hasPositiveNumber(
      value.minimumPrice
    ) ||
    hasPositiveNumber(
      value.maximumPrice
    ) ||
    hasPositiveNumber(
      value.averagePricePerPyeong
    )
  ) {
    return true;
  }

  if (
    !Array.isArray(
      value.units
    ) ||
    value.units.length ===
      0
  ) {
    return false;
  }

  return value.units.some(
    (unit) => {
      if (!isRecord(unit)) {
        return false;
      }

      const hasArea =
        typeof unit.area ===
          "string" &&
        unit.area.trim()
          .length > 0;

      const hasUnitPrice =
        hasPositiveNumber(
          unit.minPrice
        ) ||
        hasPositiveNumber(
          unit.maxPrice
        );

      const hasTypes =
        Array.isArray(
          unit.types
        ) &&
        unit.types.some(
          (type) => {
            if (
              !isRecord(type)
            ) {
              return false;
            }

            return (
              (typeof type.typeName ===
                "string" &&
                type.typeName
                  .trim()
                  .length >
                  0) ||
              hasPositiveNumber(
                type.minPrice
              ) ||
              hasPositiveNumber(
                type.maxPrice
              )
            );
          }
        );

      return (
        hasArea ||
        hasUnitPrice ||
        hasTypes
      );
    }
  );
}

function mergeNestedRecord(
  existingValue: unknown,
  incomingValue: unknown
) {
  return {
    ...toRecord(
      existingValue
    ),
    ...toRecord(
      incomingValue
    ),
  };
}

/**
 * 기존 단지 데이터와 관리자 수정 데이터를 병합합니다.
 *
 * 기존에 청약홈에서 가져온 subscription, applyHome,
 * priceInfo, 자동수집 식별값 등은 새 데이터에 없더라도 유지합니다.
 */
function mergeApartmentData(
  existingValue: unknown,
  incomingValue: unknown
): JsonRecord {
  const existingData =
    toRecord(
      existingValue
    );

  const incomingData =
    toRecord(
      incomingValue
    );

  const existingPriceInfo =
    existingData.priceInfo;

  const incomingPriceInfo =
    incomingData.priceInfo;

  const mergedData: JsonRecord = {
    ...existingData,
    ...incomingData,

    projectInfo:
      mergeNestedRecord(
        existingData.projectInfo,
        incomingData.projectInfo
      ),

    locationInfo:
      mergeNestedRecord(
        existingData.locationInfo,
        incomingData.locationInfo
      ),

    priceDetail:
      mergeNestedRecord(
        existingData.priceDetail,
        incomingData.priceDetail
      ),

    images:
      mergeNestedRecord(
        existingData.images,
        incomingData.images
      ),
  };

  /**
   * 관리자가 평형별 가격을 실제 입력하거나 수정한 경우에는
   * 새 priceInfo를 저장합니다.
   *
   * 관리자 화면에서 priceInfo가 비어 전달된 경우에는
   * 기존 청약홈 priceInfo를 그대로 보존합니다.
   */
  if (
    hasUsefulPriceInfo(
      incomingPriceInfo
    )
  ) {
    mergedData.priceInfo =
      incomingPriceInfo;
  } else if (
    hasUsefulPriceInfo(
      existingPriceInfo
    )
  ) {
    mergedData.priceInfo =
      existingPriceInfo;
  } else if (
    incomingPriceInfo !==
    undefined
  ) {
    mergedData.priceInfo =
      incomingPriceInfo;
  }

  /**
   * 변경이력도 새 데이터가 빈 배열이면 기존 기록을 보존합니다.
   */
  const incomingHistory =
    incomingData.conditionHistory;

  const existingHistory =
    existingData.conditionHistory;

  if (
    Array.isArray(
      incomingHistory
    ) &&
    incomingHistory.length >
      0
  ) {
    mergedData.conditionHistory =
      incomingHistory;
  } else if (
    Array.isArray(
      existingHistory
    )
  ) {
    mergedData.conditionHistory =
      existingHistory;
  }

  return mergedData;
}

async function notifySavedApartment({
  slug,
  region,
  isPublished,
}: {
  slug: string;
  region?: string | null;
  isPublished: boolean;
}) {
  if (!isPublished) {
    return;
  }

  const result =
    await submitIndexNow(
      buildIndexNowUrls({
        slug,
        region,
      })
    );

  if (
    !result.skipped &&
    result.submitted ===
      0
  ) {
    console.error(
      "관리자 저장 후 IndexNow 전송 실패:",
      result
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * 현재 로그인한 사용자를 확인합니다.
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

    const body =
      (await request.json()) as
        SaveApartmentRequest;

    const {
      mode,
      editingSlug,
      payload,
    } = body;

    if (
      mode !== "create" &&
      mode !== "edit"
    ) {
      return NextResponse.json(
        {
          message:
            "잘못된 저장 방식입니다.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !payload?.slug?.trim() ||
      !payload?.name?.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "단지명과 URL 주소가 필요합니다.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isRecord(
        payload.data
      )
    ) {
      return NextResponse.json(
        {
          message:
            "저장할 단지 데이터 형식이 올바르지 않습니다.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      mode === "edit" &&
      !editingSlug
    ) {
      return NextResponse.json(
        {
          message:
            "수정할 단지의 기존 URL 주소가 없습니다.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 기존 단지 수정
     */
    if (
      mode === "edit"
    ) {
      const {
        data:
          existingApartment,
        error:
          existingError,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .select(
            `
              id,
              slug,
              name,
              is_published,
              source,
              applyhome_id,
              is_auto_created,
              manual_override,
              data
            `
          )
          .eq(
            "slug",
            editingSlug
          )
          .maybeSingle();

      if (
        existingError
      ) {
        console.error(
          "기존 단지 조회 오류:",
          existingError
        );

        return NextResponse.json(
          {
            message:
              existingError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (
        !existingApartment
      ) {
        return NextResponse.json(
          {
            message:
              "수정할 단지를 찾을 수 없습니다.",
          },
          {
            status: 404,
          }
        );
      }

      const isApplyHomeApartment =
        existingApartment.source ===
          "applyhome" ||
        Boolean(
          existingApartment.applyhome_id
        ) ||
        Boolean(
          existingApartment.is_auto_created
        );

      const mergedData =
        mergeApartmentData(
          existingApartment.data,
          payload.data
        );

      /*
       * 청약홈 자동등록 단지를 관리자가 수정하면
       * 이후 동기화에서 상태·계약조건·수동 입력값을
       * 덮어쓰지 않도록 수동 수정 플래그를 남깁니다.
       */
      if (
        isApplyHomeApartment
      ) {
        mergedData.manualOverride =
          true;
      }

      const updatePayload: JsonRecord = {
        ...payload,

        /*
         * 기존 데이터와 신규 데이터를 병합합니다.
         */
        data:
          mergedData,

        /*
         * 관리자 수정화면에서는 공개 상태를 바꾸지 않습니다.
         */
        is_published:
          existingApartment.is_published,

        updated_at:
          new Date().toISOString(),
      };

      if (
        isApplyHomeApartment
      ) {
        updatePayload.manual_override =
          true;
      }

      const {
        data:
          updatedApartment,
        error:
          updateError,
      } =
        await supabaseAdmin
          .from(
            "apartments"
          )
          .update(
            updatePayload
          )
          .eq(
            "id",
            existingApartment.id
          )
          .select(
            `
              id,
              slug,
              name,
              status,
              is_published,
              data
            `
          )
          .single();

      if (
        updateError
      ) {
        console.error(
          "단지 수정 오류:",
          updateError
        );

        return NextResponse.json(
          {
            message:
              updateError.message,
          },
          {
            status: 500,
          }
        );
      }

      await notifySavedApartment({
        slug:
          updatedApartment.slug,
        region:
          typeof mergedData.cityName ===
            "string"
            ? mergedData.cityName
            : payload.city ??
              payload.region,
        isPublished:
          Boolean(
            updatedApartment.is_published
          ),
      });

      return NextResponse.json({
        message:
          "단지 정보가 수정되었습니다.",

        apartment:
          updatedApartment,
      });
    }

    /*
     * 신규 단지 등록
     */
    const createdData =
      toRecord(
        payload.data
      );

    const {
      data:
        createdApartment,
      error:
        createError,
    } =
      await supabaseAdmin
        .from(
          "apartments"
        )
        .insert({
          ...payload,

          data: {
            ...createdData,
            source:
              createdData.source ??
              "manual",
            isAutoCreated:
              false,
          },

          source:
            "manual",

          is_auto_created:
            false,

          manual_override:
            true,

          is_published:
            false,
        })
        .select(
          `
            id,
            slug,
            name,
            status,
            is_published,
            data
          `
        )
        .single();

    if (
      createError
    ) {
      console.error(
        "신규 단지 등록 오류:",
        createError
      );

      return NextResponse.json(
        {
          message:
            createError.code ===
            "23505"
              ? "같은 URL 주소의 단지가 이미 등록되어 있습니다."
              : createError.message,
        },
        {
          status:
            createError.code ===
            "23505"
              ? 409
              : 500,
        }
      );
    }

    /*
     * 관리자 신규 단지는 기본적으로 비공개로 저장되므로
     * 공개 전에는 IndexNow에 전송하지 않습니다.
     * 공개 처리 API에서 전송해야 합니다.
     */
    if (
      createdApartment.is_published
    ) {
      await notifySavedApartment({
        slug:
          createdApartment.slug,
        region:
          typeof createdData.cityName ===
            "string"
            ? createdData.cityName
            : payload.city ??
              payload.region,
        isPublished: true,
      });
    }

    return NextResponse.json({
      message:
        "신규 단지가 등록되었습니다.",

      apartment:
        createdApartment,
    });
  } catch (error) {
    console.error(
      "관리자 단지 저장 API 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "단지 저장 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}
