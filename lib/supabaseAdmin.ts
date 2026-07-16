import { createClient } from "@supabase/supabase-js";

function getSupabaseAdminKey() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!key) {
    throw new Error(
      ".env.local에 SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_SECRET_KEY가 없습니다."
    );
  }

  return key;
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  getSupabaseAdminKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
