"use client";

import { useActionState } from "react";
import { pay, type CheckoutState } from "@/app/checkout/actions";

const initial: CheckoutState = {};

export function PayButton({ bookingId, mock }: { bookingId: string; mock: boolean }) {
  const [state, action, pending] = useActionState(pay, initial);

  return (
    <form action={action}>
      <input type="hidden" name="bookingId" value={bookingId} />
      {state.error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand py-3.5 font-semibold text-background transition hover:bg-brand-strong disabled:opacity-40"
      >
        {pending ? "処理中..." : "支払いを確定する"}
      </button>
      {mock && (
        <p className="mt-2.5 text-center text-xs text-muted">
          ※ Stripe未設定のためテスト決済（自動成立）で処理されます
        </p>
      )}
    </form>
  );
}
