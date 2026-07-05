"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export type CheckoutState = { error?: string };

export async function pay(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const bookingId = String(formData.get("bookingId") ?? "");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true, payment: true },
  });

  if (!booking || booking.userId !== user.id) {
    return { error: "予約が見つかりません" };
  }
  if (booking.status !== "pending" || booking.payment?.status === "paid") {
    redirect(`/checkout/${bookingId}/success`);
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "jpy",
            unit_amount: booking.totalPrice,
            product_data: {
              name: booking.car.name,
              description: `${booking.days}日間のレンタル`,
            },
          },
        },
      ],
      metadata: { bookingId },
      success_url: `${baseUrl}/checkout/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/${bookingId}`,
    });
    if (!session.url) return { error: "決済セッションの作成に失敗しました" };
    redirect(session.url);
  }

  // モック決済（Stripe未設定時）: 即時に支払い成立とみなす
  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { status: "paid", stripePaymentId: `mock_${Date.now()}` },
    }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "confirmed" } }),
  ]);
  redirect(`/checkout/${bookingId}/success`);
}
