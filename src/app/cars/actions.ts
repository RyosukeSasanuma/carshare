"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { parseDate, calcDays, calcTotal, isCarAvailable } from "@/lib/booking";

export type BookingState = { error?: string };

export async function createBooking(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const carId = String(formData.get("carId") ?? "");
  const startStr = String(formData.get("start") ?? "");
  const endStr = String(formData.get("end") ?? "");

  const user = await getCurrentUser();
  if (!user) {
    const params = new URLSearchParams({ start: startStr, end: endStr });
    redirect(`/login?next=${encodeURIComponent(`/cars/${carId}?${params}`)}`);
  }

  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (!start || !end || end <= start) {
    return { error: "利用開始日と返却日を正しく選択してください" };
  }

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || !car.isActive) {
    return { error: "この車は現在予約できません" };
  }

  if (!(await isCarAvailable(carId, start, end))) {
    return { error: "選択した期間は既に予約が入っています。別の日程をお試しください。" };
  }

  const days = calcDays(start, end);
  const total = calcTotal(car.pricePerDay, days);

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      carId,
      startDate: start,
      endDate: end,
      days,
      totalPrice: total,
      status: "pending",
      payment: { create: { amount: total, status: "unpaid" } },
    },
  });

  redirect(`/checkout/${booking.id}`);
}
