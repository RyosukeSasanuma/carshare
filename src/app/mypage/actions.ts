"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function cancelBooking(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId") ?? "");

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });
  if (!booking || booking.userId !== user.id) throw new Error("予約が見つかりません");
  if (booking.status === "cancelled" || booking.status === "completed") return;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: "cancelled" } });
    if (booking.payment?.status === "paid") {
      await tx.payment.update({ where: { bookingId }, data: { status: "refunded" } });
    }
  });

  revalidatePath("/mypage");
}
