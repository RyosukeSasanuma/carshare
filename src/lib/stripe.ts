import Stripe from "stripe";

let cached: Stripe | null = null;

/** Stripeシークレットキーが設定されていればインスタンスを返す。未設定ならnull（モード=モック）。 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
