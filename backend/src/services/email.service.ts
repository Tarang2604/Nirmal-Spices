import { mailer, FROM, REPLY_TO } from '../config/mailer';
import { logger } from '../utils/logger';
import { IOrder } from '../models/Order';
import { env } from '../config/env';
import { getOrCreateStoreSettings } from '../models/StoreSettings';

// ── Shared branded shell (header + footer) for every outbound email ───

/** Wraps template-specific content with a consistent Nirmal's Spices header/footer. */
export function renderEmailShell(innerHtml: string): string {
  const logoUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/email-logo.png`;
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
      <div style="text-align:center;padding-bottom:20px;margin-bottom:24px;border-bottom:2px solid #E8D9BE">
        <img src="${logoUrl}" alt="Nirmal's Spices" width="140" style="display:block;margin:0 auto;height:auto;border:0" />
        <div style="font-family:Inter,sans-serif;font-size:10px;color:#8A8A8E;text-transform:uppercase;letter-spacing:1.5px;margin-top:8px">
          Pure &amp; Authentic Indian Spices
        </div>
      </div>

      ${innerHtml}

      <div style="text-align:center;padding-top:24px;margin-top:32px;border-top:1px solid #E8D9BE">
        <p style="font-family:Inter,sans-serif;font-size:12px;color:#8A8A8E;margin:0 0 8px">
          Nirmal's Spices &middot; Harda, Madhya Pradesh, India
        </p>
        <p style="font-family:Inter,sans-serif;font-size:12px;color:#8A8A8E;margin:0 0 12px">
          WhatsApp: <a href="https://wa.me/919770057005" style="color:#C0392B;text-decoration:none">+91 97700 57005</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:support@nirmalspices.in" style="color:#C0392B;text-decoration:none">support@nirmalspices.in</a>
        </p>
        <p style="font-family:Inter,sans-serif;font-size:11px;color:#B0AFAD;margin:0">
          &copy; ${new Date().getFullYear()} Nirmal's Spices. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

// ── Welcome ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      replyTo: REPLY_TO,
      subject: "Welcome to Nirmal's Spices",
      html: renderEmailShell(`
        <h1 style="color:#C0392B;font-family:Georgia,serif;font-size:28px;margin-bottom:8px">
          Welcome, ${name}!
        </h1>
        <p style="color:#3A3A3C;font-size:15px;line-height:1.7">
          Thank you for joining <strong>Nirmal's Spices</strong> — your gateway to 43 varieties of
          pure, authentic Indian spices sourced directly from Harda, Madhya Pradesh.
        </p>
        <a href="${process.env.CLIENT_URL}/shop" style="display:inline-block;margin-top:24px;background:#C0392B;color:white;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px">
          Start Shopping →
        </a>
        <p style="margin-top:32px;color:#8A8A8E;font-size:13px">
          Questions? Reply to this email or WhatsApp us at +91 9770057005.
        </p>
      `),
    });
    logger.info({ email }, 'Welcome email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send welcome email');
  }
}

// ── OTP ─────────────────────────────────────────────────────────────

function isSmtpConfigured(): boolean {
  const host = env.SMTP_HOST || '';
  const user = env.SMTP_USER || '';
  const pass = env.SMTP_PASS || '';
  if (!host || !user || !pass) return false;
  if (user.includes('your_') || pass.includes('your_') || pass.includes('xxxx')) return false;
  return true;
}

export async function sendOTPEmail(email: string, otp: string, type: string): Promise<boolean> {
  const actionLabel = type === 'reset-password' ? 'password reset' : 'verification';

  if (!isSmtpConfigured()) {
    logger.info(`[EMAIL DEV MOCK] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      subject: `Your Nirmal's Spices OTP: ${otp}`,
      html: renderEmailShell(`
        <h2 style="color:#C0392B;font-family:Georgia,serif">One-Time Password</h2>
        <p style="color:#3A3A3C;font-size:15px">
          Use the following OTP for your ${actionLabel}. It expires in <strong>15 minutes</strong>.
        </p>
        <div style="background:#C0392B;color:white;font-size:36px;font-weight:800;letter-spacing:12px;text-align:center;padding:24px;border-radius:12px;margin:24px 0">
          ${otp}
        </div>
        <p style="color:#8A8A8E;font-size:13px">
          If you did not request this, you can safely ignore this email.
        </p>
      `),
    });
    logger.info({ email, type }, 'OTP email sent');
    return true;
  } catch (err) {
    logger.error({ err, email }, 'Failed to send OTP email');
    if (env.NODE_ENV === 'development') {
      logger.info(`[EMAIL DEV FALLBACK] OTP for ${email}: ${otp}`);
      return true;
    }
    return false;
  }
}

// ── Password Reset ──────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      subject: "Reset your Nirmal's Spices password",
      html: renderEmailShell(`
        <h2 style="color:#C0392B;font-family:Georgia,serif">Reset Your Password</h2>
        <p style="color:#3A3A3C;font-size:15px;line-height:1.7">
          We received a request to reset your password. Click the button below to set a new password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;margin-top:20px;background:#C0392B;color:white;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#8A8A8E;font-size:13px">
          If you did not request a password reset, please ignore this email or contact us immediately.
        </p>
      `),
    });
    logger.info({ email }, 'Password reset email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send password reset email');
  }
}

// ── Order Confirmation ──────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  email: string,
  order: IOrder,
): Promise<void> {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E8E0D0">
          <strong>${item.name}</strong><br>
          <span style="color:#8A8A8E;font-size:13px">${item.weight} &times; ${item.qty}</span>
        </td>
        <td style="text-align:right;padding:10px 0;border-bottom:1px solid #E8E0D0;font-weight:700">
          &#8377;${(item.price * item.qty).toLocaleString('en-IN')}
        </td>
      </tr>
    `,
    )
    .join('');

  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      replyTo: REPLY_TO,
      subject: `Order Confirmed! #${order._id} — Nirmal's Spices`,
      html: renderEmailShell(`
        <h1 style="color:#C0392B;font-family:Georgia,serif;font-size:26px">
          Order Confirmed
        </h1>
        <p style="color:#3A3A3C;font-size:15px">
          Thank you for your order. We'll deliver your spices in 3–5 business days.
        </p>
        <div style="background:white;border-radius:12px;padding:20px;margin:24px 0">
          <p style="font-size:13px;color:#8A8A8E;margin-bottom:4px">Order ID</p>
          <strong style="color:#C0392B">#${order._id}</strong>
          <table style="width:100%;margin-top:16px;border-collapse:collapse">
            ${itemsHtml}
            <tr>
              <td style="padding:8px 0;color:#8A8A8E">Shipping</td>
              <td style="text-align:right;color:#8A8A8E">${order.shipping === 0 ? 'FREE' : `&#8377;${order.shipping}`}</td>
            </tr>
            ${order.discount > 0 ? `<tr><td style="padding:8px 0;color:#27AE60">Discount</td><td style="text-align:right;color:#27AE60">-&#8377;${order.discount}</td></tr>` : ''}
            <tr>
              <td style="padding:12px 0;font-weight:700;font-size:16px">Total</td>
              <td style="text-align:right;font-weight:800;font-size:16px;color:#C0392B">&#8377;${order.total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>
        <a href="${process.env.CLIENT_URL}/account/orders/${order._id}" style="display:inline-block;background:#C0392B;color:white;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px">
          Track Your Order
        </a>
        <p style="margin-top:24px;color:#8A8A8E;font-size:13px">
          Need help? WhatsApp: +91 9770057005 | Email: support@nirmalspices.in
        </p>
      `),
    });
    logger.info({ email, orderId: order._id }, 'Order confirmation email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send order confirmation email');
  }
}

// ── Order Status Update ─────────────────────────────────────────────

export async function sendOrderStatusEmail(
  email: string,
  orderId: string,
  status: string,
  trackingNumber?: string,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    dispatched: `Your order has been dispatched.${trackingNumber ? ` Tracking: <strong>${trackingNumber}</strong>` : ''}`,
    'out-for-delivery': 'Your order is out for delivery today.',
    delivered: 'Your order has been delivered. Enjoy your spices.',
    cancelled: 'Your order has been cancelled. Refund (if any) will be processed in 5–7 days.',
  };

  const message = statusMessages[status] ?? `Your order status: ${status}`;

  // Only invite a public review after a good outcome (delivered) — never on
  // cancelled/refunded, where soliciting a public review risks negative feedback.
  let reviewCta = '';
  if (status === 'delivered') {
    try {
      const settings = await getOrCreateStoreSettings();
      if (settings.googleReviewUrl) {
        reviewCta = `
          <p style="color:#3A3A3C;font-size:14px;margin-top:24px">
            Enjoyed your order? A quick review helps us a lot.
          </p>
          <a href="${settings.googleReviewUrl}" style="display:inline-block;margin-top:8px;background:#FFFFFF;color:#C0392B;border:1px solid #C0392B;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700">
            Leave us a Google Review
          </a>
        `;
      }
    } catch (err) {
      logger.warn({ err, orderId }, 'Could not load store settings for review CTA');
    }
  }

  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      subject: `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)} — Nirmal's Spices`,
      html: renderEmailShell(`
        <h2 style="color:#C0392B;font-family:Georgia,serif">Order Update</h2>
        <p style="color:#3A3A3C;font-size:15px;line-height:1.7">${message}</p>
        <a href="${process.env.CLIENT_URL}/account/orders/${orderId}" style="display:inline-block;margin-top:20px;background:#C0392B;color:white;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700">
          View Order
        </a>
        ${reviewCta}
      `),
    });
  } catch (err) {
    logger.error({ err, email, orderId }, 'Failed to send order status email');
  }
}

// ── Newsletter Welcome ──────────────────────────────────────────────

export async function sendNewsletterWelcome(
  email: string,
  unsubToken: string,
): Promise<void> {
  const backendBase =
    process.env.API_PUBLIC_URL?.replace(/\/$/, '') ||
    (env.NODE_ENV === 'production' ? env.CLIENT_URL.replace(/\/$/, '') : `http://localhost:${env.PORT}`);
  const unsubUrl = `${backendBase}/api/contact/newsletter/unsubscribe?token=${unsubToken}`;
  try {
    await mailer.sendMail({
      from: FROM,
      to: email,
      subject: "You're subscribed to Nirmal's Spices",
      html: renderEmailShell(`
        <h2 style="color:#C0392B;font-family:Georgia,serif">Thanks for subscribing!</h2>
        <p style="color:#3A3A3C;font-size:15px;line-height:1.7">
          You'll receive exclusive offers, new arrivals, and spice tips from our Harda kitchen.
        </p>
        <p style="margin-top:32px;color:#8A8A8E;font-size:12px">
          <a href="${unsubUrl}" style="color:#8A8A8E">Unsubscribe</a>
        </p>
      `),
    });
  } catch (err) {
    logger.error({ err, email }, 'Failed to send newsletter welcome');
  }
}
