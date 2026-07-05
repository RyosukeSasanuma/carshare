"use client";

import { useActionState, useState } from "react";
import { createBooking, type BookingState } from "@/app/cars/actions";

const initial: BookingState = {};

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  return Math.max(1, Math.floor((e - s) / 86400000));
}

export function BookingWidget({
  carId,
  pricePerDay,
  isLoggedIn,
  defaultStart,
  defaultEnd,
}: {
  carId: string;
  pricePerDay: number;
  isLoggedIn: boolean;
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const [state, action, pending] = useActionState(createBooking, initial);
  const [start, setStart] = useState(defaultStart ?? "");
  const [end, setEnd] = useState(defaultEnd ?? "");

  const today = new Date().toISOString().slice(0, 10);
  const days = daysBetween(start, end);
  const total = days * pricePerDay;

  return (
    <form action={action} className="rounded-2xl border border-line bg-surface p-6">
      <p>
        <span className="font-display text-3xl text-brand">¥{pricePerDay.toLocaleString("ja-JP")}</span>
        <span className="text-sm text-muted"> / 日</span>
      </p>

      <input type="hidden" name="carId" value={carId} />

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">利用開始日</label>
          <input
            type="date"
            name="start"
            required
            value={start}
            min={today}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">返却日</label>
          <input
            type="date"
            name="end"
            required
            value={end}
            min={start || today}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-brand"
          />
        </div>
      </div>

      {days > 0 && (
        <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>¥{pricePerDay.toLocaleString("ja-JP")} × {days}日</span>
            <span>¥{total.toLocaleString("ja-JP")}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-foreground">合計</span>
            <span className="font-display text-xl text-brand">¥{total.toLocaleString("ja-JP")}</span>
          </div>
        </div>
      )}

      {state.error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || days === 0}
        className="mt-5 w-full rounded-full bg-brand py-3 font-semibold text-background transition hover:bg-brand-strong disabled:opacity-40"
      >
        {pending ? "処理中..." : isLoggedIn ? "予約に進む" : "ログインして予約"}
      </button>
      {!isLoggedIn && (
        <p className="mt-2.5 text-center text-xs text-muted">
          予約にはログインが必要です
        </p>
      )}
    </form>
  );
}
