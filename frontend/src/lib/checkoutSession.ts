/**
 * Razorpay's default integration (a JS `handler` callback, no `callback_url`)
 * is supposed to stay entirely in-page. But for payment methods like
 * Netbanking, or when a browser blocks Razorpay's iframe/third-party cookies
 * (Safari ITP, some ad-blockers), it falls back to a full top-level redirect
 * to the bank and back to this page — wiping any state that only lives in
 * React `useState`. These helpers persist just enough to sessionStorage to
 * recover from that: which order/step the shopper was on, so a reload
 * resumes instead of dropping them back to a blank step-1 checkout.
 */

const WIZARD_KEY = 'nirmal_checkout_wizard';
const PENDING_PAYMENT_KEY = 'nirmal_checkout_pending_payment';

export interface CheckoutWizardState {
  step: 'address' | 'shipping' | 'payment' | 'review';
  tempAddress: any;
  guestEmail: string;
  guestPhone: string;
  // Reused across a reload so a retried payment attempt lands on the same
  // order (via the backend's idempotency-key guard) instead of creating a duplicate.
  idempotencyKey: string;
}

export interface PendingPayment {
  orderId: string;
  razorpayOrderId: string;
  guestEmail?: string;
}

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/availability errors — resilience is best-effort.
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const getWizardState = () => safeGet<CheckoutWizardState>(WIZARD_KEY);
export const saveWizardState = (state: CheckoutWizardState) => safeSet(WIZARD_KEY, state);
export const clearWizardState = () => safeRemove(WIZARD_KEY);

export const getPendingPayment = () => safeGet<PendingPayment>(PENDING_PAYMENT_KEY);
export const savePendingPayment = (state: PendingPayment) => safeSet(PENDING_PAYMENT_KEY, state);
export const clearPendingPayment = () => safeRemove(PENDING_PAYMENT_KEY);
