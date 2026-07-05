"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type AuthState } from "../actions";

const initial: AuthState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, initial);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <h1 className="mb-8 text-center font-display text-3xl text-foreground">新規登録</h1>

      <form action={action} className="space-y-4 rounded-2xl border border-line bg-surface p-7">
        {state.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
        )}

        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-wider text-muted">お名前</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-brand"
          />
        </div>

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
          <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-wider text-muted">パスワード（8文字以上）</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-brand"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand py-3 font-semibold text-background transition hover:bg-brand-strong disabled:opacity-40"
        >
          {pending ? "処理中..." : "登録する"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        既にアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-brand transition hover:text-brand-strong">ログイン</Link>
      </p>
    </div>
  );
}
