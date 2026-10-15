import "server-only";

import {
  redirect,
} from "next/navigation";

import {
  getAdminAuth,
} from "./adminAuth";

export async function requireAdmin() {
  const auth =
    await getAdminAuth();

  if (!auth.ok) {
    if (auth.status === 503) {
      throw new Error(
        "ADMIN_EMAIL 또는 ADMIN_EMAILS 환경변수가 설정되지 않았습니다."
      );
    }

    redirect(
      auth.status === 403
        ? "/login?error=forbidden"
        : "/login"
    );
  }

  return {
    supabase:
      auth.supabase,
    user:
      auth.user,
  };
}
