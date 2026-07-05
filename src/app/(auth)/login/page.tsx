"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "../actions";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="mb-8 text-center font-display text-3xl text-foreground">ログイン</h1>

      <form action={action} className="space-y-4 rounded-2xl border border-line bg-surface p-7">
        {state.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wider text-muted">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-wider text-muted">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-brand"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand py-3 font-semibold text-background transition hover:bg-brand-strong disabled:opacity-40"
        >
          {pending ? "処理中..." : "ログイン"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="font-medium text-brand transition hover:text-brand-strong">新規登録</Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted/60">
        お試し: user@example.com / user1234
      </p>
    </div>
  );
}
