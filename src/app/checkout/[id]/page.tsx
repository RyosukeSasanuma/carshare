import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStripeEnabled } from "@/lib/stripe";
import { formatYen, formatDate } from "@/lib/booking";
import { PayButton } from "@/components/PayButton";

export default async function CheckoutPage(props: PageProps<"/checkout/[id]">) {
  const { id } = await props.params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { car: true, payment: true },
  });
  if (!booking || booking.userId !== user.id) notFound();

  if (booking.status === "confirmed" || booking.payment?.status === "paid") {
    redirect(`/checkout/${id}/success`);
  }
  if (booking.status === "cancelled") {
    redirect("/mypage");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-brand">Checkout</p>
      <h1 className="mb-6 mt-2 font-display text-3xl text-foreground">お支払い</h1>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex gap-4 border-b border-line p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={booking.car.imageUrl} alt={booking.car.name} className="h-20 w-28 rounded-lg object-cover" />
          <div>
            <p className="text-xs uppercase tracking-wider text-brand">{booking.car.brand}</p>
            <p className="mt-0.5 font-display text-lg text-foreground">{booking.car.name}</p>
            <p className="mt-1 text-xs text-muted">{booking.car.location}</p>
          </div>
        </div>

        <div className="space-y-2.5 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">利用期間</span>
            <span className="text-foreground">{formatDate(booking.startDate)} 〜 {formatDate(booking.endDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">日数</span>
            <span className="text-foreground">{booking.days}日間</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{formatYen(booking.car.pricePerDay)} × {booking.days}日</span>
            <span className="text-foreground">{formatYen(booking.totalPrice)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <span className="font-medium text-foreground">合計</span>
            <span className="font-display text-xl text-brand">{formatYen(booking.totalPrice)}</span>
          </div>
        </div>

        <div className="border-t border-line p-5">
          <PayButton bookingId={booking.id} mock={!isStripeEnabled()} />
          <Link href={`/cars/${booking.carId}`} className="mt-3 block text-center text-sm text-muted transition hover:text-foreground">
            キャンセルして戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
