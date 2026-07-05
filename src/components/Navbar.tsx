import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl tracking-[0.2em] text-foreground">NOBLE</span>
          <span className="font-display text-xl tracking-[0.2em] text-brand">DRIVE</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/cars"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            車を探す
          </Link>

          {user ? (
            <>
              <Link
                href="/mypage"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
              >
                マイページ
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  管理
                </Link>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-brand/60 bg-brand px-5 py-2 text-sm font-semibold text-background transition hover:bg-brand-strong"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
