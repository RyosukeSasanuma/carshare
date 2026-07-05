import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { formatYen, formatDate } from "@/lib/booking";

export default async function CheckoutSuccessPage(
  props: PageProps<"/checkout/[id]/success">
) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let booking = await prisma.booking.findUnique({
    where: { id },
    include: { car: true, payment: true },
  });
  if (!booking || booking.userId !== user.id) notFound();

  // Stripe決済からの戻りを検証して確定
  if (sessionId && booking.payment?.status !== "paid") {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.bookingId === id) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { bookingId: id },
            data: {
              status: "paid",
              stripePaymentId:
                typeof session.payment_intent === "string" ? session.payment_intent : sessionId,
            },
          }),
          prisma.booking.update({ where: { id }, data: { status: "confirmed" } }),
        ]);
        booking = await prisma.booking.findUnique({
          where: { id },
          include: { car: true, payment: true },
        });
      }
    }
  }

  const paid = booking?.payment?.status === "paid";

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      {paid ? (
        <>
          <div className="text-6xl">🎉</div>
          <h1 className="mt-5 font-display text-3xl text-foreground">予約が確定しました</h1>
          <p className="mt-3 text-muted">ご予約ありがとうございます。当日をお楽しみに。</p>
        </>
      ) : (
        <>
          <div className="text-6xl">⏳</div>
          <h1 className="mt-5 font-display text-3xl text-foreground">お支払いを確認しています</h1>
          <p className="mt-3 text-muted">
            決済が完了していない可能性があります。マイページからご確認ください。
          </p>
        </>
      )}

      {booking && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-line bg-surface p-6 text-left">
          <p className="font-display text-lg text-foreground">{booking.car.name}</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">利用期間</span>
              <span className="text-foreground">{formatDate(booking.startDate)} 〜 {formatDate(booking.endDate)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-muted">合計</span>
              <span className="font-display text-lg text-brand">{formatYen(booking.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/mypage" className="rounded-full bg-brand px-8 py-3 font-semibold text-background transition hover:bg-brand-strong">
          予約一覧へ
        </Link>
        <Link href="/cars" className="rounded-full border border-line px-8 py-3 font-semibold text-foreground transition hover:border-brand/50">
          他の車を見る
        </Link>
      </div>
    </div>
  );
}
