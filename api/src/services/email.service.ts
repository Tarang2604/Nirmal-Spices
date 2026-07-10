import { resend, FROM, REPLY_TO } from '../config/mailer';
import { logger } from '../utils/logger';
import { IOrder } from '../models/Order';

// ── Welcome ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      reply_to: REPLY_TO,
      subject: "Welcome to Nirmal's Spices! 🌶️",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
          <h1 style="color:#C0392B;font-family:Georgia,serif;font-size:28px;margin-bottom:8px">
            Welcome, ${name}! 🎉
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
        </div>
      `,
    });
    logger.info({ email }, 'Welcome email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send welcome email');
  }
}

// ── OTP ──────────────────────────────────────────────────────────────

export async function sendOTPEmail(email: string, otp: string, type: string): Promise<void> {
  const actionLabel = type === 'reset-password' ? 'password reset' : 'verification';
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your Nirmal's Spices OTP: ${otp}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
          <h2 style="color:#C0392B;font-family:Georgia,serif">One-Time Password</h2>
          <p style="color:#3A3A3C;font-size:15px">
            Use the following OTP for your ${actionLabel}. It expires in <strong>5 minutes</strong>.
          </p>
          <div style="background:#C0392B;color:white;font-size:36px;font-weight:800;letter-spacing:12px;text-align:center;padding:24px;border-radius:12px;margin:24px 0">
            ${otp}
          </div>
          <p style="color:#8A8A8E;font-size:13px">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    logger.info({ email, type }, 'OTP email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send OTP email');
  }
}

// ── Password Reset ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Reset your Nirmal's Spices password",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
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
        </div>
      `,
    });
    logger.info({ email }, 'Password reset email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send password reset email');
  }
}

// ── Order Confirmation ────────────────────────────────────────────────

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
          <span style="color:#8A8A8E;font-size:13px">${item.weight} × ${item.qty}</span>
        </td>
        <td style="text-align:right;padding:10px 0;border-bottom:1px solid #E8E0D0;font-weight:700">
          ₹${(item.price * item.qty).toLocaleString('en-IN')}
        </td>
      </tr>
    `,
    )
    .join('');

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      reply_to: REPLY_TO,
      subject: `Order Confirmed! #${order._id} — Nirmal's Spices`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
          <h1 style="color:#C0392B;font-family:Georgia,serif;font-size:26px">
            🎉 Order Confirmed!
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
                <td style="text-align:right;color:#8A8A8E">${order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</td>
              </tr>
              ${order.discount > 0 ? `<tr><td style="padding:8px 0;color:#27AE60">Discount</td><td style="text-align:right;color:#27AE60">-₹${order.discount}</td></tr>` : ''}
              <tr>
                <td style="padding:12px 0;font-weight:700;font-size:16px">Total</td>
                <td style="text-align:right;font-weight:800;font-size:16px;color:#C0392B">₹${order.total.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          <a href="${process.env.CLIENT_URL}/account/orders/${order._id}" style="display:inline-block;background:#C0392B;color:white;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px">
            Track Your Order
          </a>
          <p style="margin-top:24px;color:#8A8A8E;font-size:13px">
            Need help? WhatsApp: +91 9770057005 | Email: support@nirmalspices.in
          </p>
        </div>
      `,
    });
    logger.info({ email, orderId: order._id }, 'Order confirmation email sent');
  } catch (err) {
    logger.error({ err, email }, 'Failed to send order confirmation email');
  }
}

// ── Order Status Update ───────────────────────────────────────────────

export async function sendOrderStatusEmail(
  email: string,
  orderId: string,
  status: string,
  trackingNumber?: string,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    dispatched: `Your order has been dispatched! 🚚${trackingNumber ? ` Tracking: <strong>${trackingNumber}</strong>` : ''}`,
    'out-for-delivery': "Your order is out for delivery today! 🎉",
    delivered: "Your order has been delivered. Enjoy your spices! 🌶️",
    cancelled: "Your order has been cancelled. Refund (if any) will be processed in 5–7 days.",
  };

  const message = statusMessages[status] ?? `Your order status: ${status}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)} — Nirmal's Spices`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
          <h2 style="color:#C0392B;font-family:Georgia,serif">Order Update</h2>
          <p style="color:#3A3A3C;font-size:15px;line-height:1.7">${message}</p>
          <a href="${process.env.CLIENT_URL}/account/orders/${orderId}" style="display:inline-block;margin-top:20px;background:#C0392B;color:white;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700">
            View Order
          </a>
        </div>
      `,
    });
  } catch (err) {
    logger.error({ err, email, orderId }, 'Failed to send order status email');
  }
}

// ── Newsletter Welcome ────────────────────────────────────────────────

export async function sendNewsletterWelcome(
  email: string,
  unsubToken: string,
): Promise<void> {
  const unsubUrl = `${process.env.CLIENT_URL}/api/newsletter/unsubscribe?token=${unsubToken}`;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're subscribed to Nirmal's Spices! 🌶️",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FAF3E0;padding:32px;border-radius:16px">
          <h2 style="color:#C0392B;font-family:Georgia,serif">Thanks for subscribing!</h2>
          <p style="color:#3A3A3C;font-size:15px;line-height:1.7">
            You'll receive exclusive offers, new arrivals, and spice tips from our Harda kitchen.
          </p>
          <p style="margin-top:32px;color:#8A8A8E;font-size:12px">
            <a href="${unsubUrl}" style="color:#8A8A8E">Unsubscribe</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    logger.error({ err, email }, 'Failed to send newsletter welcome');
  }
}
