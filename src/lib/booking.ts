import { prisma } from "@/lib/prisma";

// 予約として「有効」に扱うステータス（重複判定の対象）
const ACTIVE_STATUSES = ["pending", "confirmed", "completed"];

/** startDate/endDate（YYYY-MM-DD）から利用日数を計算。同日は1日扱い。 */
export function calcDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

export function calcTotal(pricePerDay: number, days: number): number {
  return pricePerDay * days;
}

/** 文字列(YYYY-MM-DD)をUTC基準のDateに変換。無効なら null。 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

/** 指定期間に既存予約と重複していないか判定。true = 予約可能 */
export async function isCarAvailable(
  carId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      carId,
      status: { in: ACTIVE_STATUSES },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      // 期間が重なる条件: 既存.start < 希望.end かつ 既存.end > 希望.start
      startDate: { lt: end },
      endDate: { gt: start },
    },
    select: { id: true },
  });
  return conflict === null;
}

/** 指定期間で予約可能な車のIDだけに絞り込む */
export async function getUnavailableCarIds(start: Date, end: Date): Promise<Set<string>> {
  const conflicts = await prisma.booking.findMany({
    where: {
      status: { in: ACTIVE_STATUSES },
      startDate: { lt: end },
      endDate: { gt: start },
    },
    select: { carId: true },
  });
  return new Set(conflicts.map((c) => c.carId));
}

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}
