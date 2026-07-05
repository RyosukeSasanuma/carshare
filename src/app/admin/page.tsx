import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatYen, formatDate } from "@/lib/booking";
import { toggleCarActive } from "./actions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [cars, bookings] = await Promise.all([
    prisma.car.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({
      include: { car: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand">Admin</p>
          <h1 className="mt-2 font-display text-3xl text-foreground">管理ダッシュボード</h1>
        </div>
        <Link href="/admin/cars/new" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-brand-strong">
          + 車両を追加
        </Link>
      </div>

      {/* 車両管理 */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-lg text-foreground">車両一覧（{cars.length}台）</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">車両</th>
                <th className="px-4 py-3 font-medium">エリア</th>
                <th className="px-4 py-3 font-medium">料金/日</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={car.imageUrl} alt={car.name} className="h-10 w-14 rounded object-cover" />
                      <span className="font-medium text-foreground">{car.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{car.location}</td>
                  <td className="px-4 py-3 text-foreground">{formatYen(car.pricePerDay)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${car.isActive ? "border border-brand/40 bg-brand/10 text-brand" : "border border-line bg-white/5 text-muted"}`}>
                      {car.isActive ? "公開中" : "非公開"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/cars/${car.id}/edit`} className="text-brand transition hover:text-brand-strong">編集</Link>
                      <form action={toggleCarActive}>
                        <input type="hidden" name="id" value={car.id} />
                        <button type="submit" className="text-muted transition hover:text-foreground">
                          {car.isActive ? "非公開に" : "公開に"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 予約一覧 */}
      <section>
        <h2 className="mb-4 font-display text-lg text-foreground">最近の予約</h2>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">車両</th>
                <th className="px-4 py-3 font-medium">利用者</th>
                <th className="px-4 py-3 font-medium">期間</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">状態</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">予約はまだありません</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{b.car.name}</td>
                    <td className="px-4 py-3 text-muted">{b.user.name}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(b.startDate)}〜{formatDate(b.endDate)}</td>
                    <td className="px-4 py-3 text-foreground">{formatYen(b.totalPrice)}</td>
                    <td className="px-4 py-3 text-muted">{b.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
