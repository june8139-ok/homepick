"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA]">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-3xl font-black">
          HomePick Admin
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          관리자만 로그인 가능합니다.
        </p>

        <input
          className="mt-8 w-full rounded-xl border p-3"
          placeholder="이메일"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="mt-4 w-full rounded-xl border p-3"
          placeholder="비밀번호"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-[#132238] py-3 font-bold text-white hover:bg-emerald-600"
        >
          {loading
            ? "로그인 중..."
            : "로그인"}
        </button>
      </form>
    </main>
  );
}