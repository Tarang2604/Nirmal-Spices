import { Request, Response } from 'express';
import { Newsletter } from '../models/Newsletter';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { mailer } from '../config/mailer';
import { sendNewsletterWelcome, renderEmailShell } from '../services/email.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ── SUBMIT CONTACT FORM ──────────────────────────────────────────────
export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, subject, orderId, message } = req.body;

  const adminEmail = env.ADMIN_EMAIL ?? 'info@nirmalspices.in';

  // Send email to admin
  try {
    await mailer.sendMail({
      from: env.EMAIL_FROM,
      to: adminEmail,
      subject: `[Contact Form] ${subject}: Message from ${firstName} ${lastName || ''}`,
      html: renderEmailShell(`
        <h2 style="color:#C0392B;font-family:Georgia,serif">New Contact Form Message</h2>
        <p style="color:#3A3A3C;font-size:14px"><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
        <p style="color:#3A3A3C;font-size:14px"><strong>Email:</strong> ${email}</p>
        <p style="color:#3A3A3C;font-size:14px"><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p style="color:#3A3A3C;font-size:14px"><strong>Subject:</strong> ${subject}</p>
        ${orderId ? `<p style="color:#3A3A3C;font-size:14px"><strong>Order ID:</strong> #${orderId}</p>` : ''}
        <div style="background:#FFF;padding:16px;border-left:4px solid #C0392B;border-radius:4px;margin-top:16px">
          <strong style="color:#3A3A3C">Message:</strong><br>
          <p style="white-space:pre-wrap;color:#3A3A3C;font-size:14px">${message}</p>
        </div>
      `),
    });
    logger.info({ email, subject }, 'Contact form email sent to admin');
  } catch (err) {
    logger.error({ err }, 'Failed to send contact form email to admin');
    throw ApiError.internal('Failed to submit contact enquiry. Please try again.');
  }

  return sendSuccess(res, null, 'Your message has been sent successfully. We will contact you soon.');
});

// ── NEWSLETTER SUBSCRIBE ─────────────────────────────────────────────
export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  
  if (subscriber) {
    if (subscriber.isActive) {
      throw ApiError.conflict('You are already subscribed to our newsletter');
    }
    subscriber.isActive = true;
    await subscriber.save();
  } else {
    subscriber = await Newsletter.create({ email });
  }

  // Send newsletter confirmation email
  void sendNewsletterWelcome(subscriber.email, subscriber.unsubToken);

  return sendSuccess(res, null, 'Thank you for subscribing to our newsletter! 🌶️');
});

// ── NEWSLETTER UNSUBSCRIBE ───────────────────────────────────────────
export const unsubscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    throw ApiError.badRequest('Unsubscribe token is required');
  }

  const subscriber = await Newsletter.findOne({ unsubToken: token });
  if (!subscriber || !subscriber.isActive) {
    return sendSuccess(res, null, 'You have been unsubscribed successfully (already inactive)');
  }

  subscriber.isActive = false;
  await subscriber.save();

  return sendSuccess(res, null, 'You have been unsubscribed from our mailing list successfully');
});
