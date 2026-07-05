import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatYen, formatDate } from "@/lib/booking";
import { cancelBooking } from "./actions";

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: "支払い待ち", className: "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300" },
  confirmed: { text: "予約確定", className: "border border-brand/40 bg-brand/10 text-brand" },
  cancelled: { text: "キャンセル済み", className: "border border-line bg-white/5 text-muted" },
  completed: { text: "利用完了", className: "border border-sky-500/30 bg-sky-500/10 text-sky-300" },
};

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { car: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brand">My Page</p>
        <h1 className="mt-2 font-display text-3xl text-foreground">マイページ</h1>
        <p className="mt-2 text-sm text-muted">{user.name} さん（{user.email}）</p>
      </div>

      <h2 className="mb-4 font-display text-lg text-foreground">予約履歴</h2>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <p className="text-muted">まだ予約がありません</p>
          <Link href="/cars" className="mt-5 inline-block rounded-full bg-brand px-8 py-2.5 font-semibold text-background transition hover:bg-brand-strong">
            車を探す
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => {
            const status = STATUS_LABEL[b.status] ?? STATUS_LABEL.pending;
            const canCancel = b.status === "pending" || b.status === "confirmed";
            return (
              <li key={b.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex flex-col gap-4 p-5 sm:flex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.car.imageUrl} alt={b.car.name} className="h-32 w-full rounded-lg object-cover sm:h-24 sm:w-36" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/cars/${b.carId}`} className="font-display text-lg text-foreground transition hover:text-brand">
                          {b.car.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted">
                          {formatDate(b.startDate)} 〜 {formatDate(b.endDate)}（{b.days}日間）
                        </p>
                        <p className="mt-1.5 font-display text-lg text-brand">{formatYen(b.totalPrice)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                        {status.text}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {b.status === "pending" && (
                        <Link
                          href={`/checkout/${b.id}`}
                          className="rounded-full bg-brand px-5 py-1.5 text-sm font-semibold text-background transition hover:bg-brand-strong"
                        >
                          支払いへ進む
                        </Link>
                      )}
                      {canCancel && (
                        <form action={cancelBooking}>
                          <input type="hidden" name="bookingId" value={b.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-line px-5 py-1.5 text-sm font-medium text-muted transition hover:border-red-500/40 hover:text-red-400"
                          >
                            キャンセル
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
