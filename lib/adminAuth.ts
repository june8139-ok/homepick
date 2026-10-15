import "server-only";

import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import {
  createClient,
} from "./supabase/server";

type AdminAuthSuccess = {
  ok: true;
  user: User;
  supabase: SupabaseClient;
};

type AdminAuthFailure = {
  ok: false;
  status: 401 | 403 | 503;
  message: string;
};

export type AdminAuthResult =
  | AdminAuthSuccess
  | AdminAuthFailure;

function getConfiguredAdminEmails() {
  const raw =
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "";

  return raw
    .split(",")
    .map((email) =>
      email
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

export async function getAdminAuth(): Promise<AdminAuthResult> {
  const adminEmails =
    getConfiguredAdminEmails();

  if (adminEmails.length === 0) {
    console.error(
      "ADMIN_EMAIL 또는 ADMIN_EMAILS 환경변수가 설정되지 않았습니다."
    );

    return {
      ok: false,
      status: 503,
      message:
        "관리자 인증 설정이 완료되지 않았습니다.",
    };
  }

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
    return {
      ok: false,
      status: 401,
      message:
        "관리자 로그인이 필요합니다.",
    };
  }

  const userEmail =
    user.email
      ?.trim()
      .toLowerCase() ?? "";

  if (
    !userEmail ||
    !adminEmails.includes(
      userEmail
    )
  ) {
    console.warn(
      "관리자 권한이 없는 로그인 사용자의 접근을 차단했습니다.",
      {
        userId: user.id,
        email: userEmail || null,
      }
    );

    return {
      ok: false,
      status: 403,
      message:
        "관리자 권한이 없습니다.",
    };
  }

  return {
    ok: true,
    user,
    supabase,
  };
}
