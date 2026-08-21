import { Resend } from 'resend';
import { env } from './env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// Resend (HTTP API over 443) instead of SMTP — Render blocks outbound SMTP
// ports on free web services, which made raw SMTP unreliable/unusable
// (https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports).
// Keeps the same sendMail({ from, to, subject, html, replyTo }) shape the
// nodemailer-based transport used, so callers didn't need to change.
export const mailer = {
  sendMail: async ({ from, to, subject, html, replyTo }: SendMailOptions) => {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  },
};

export const FROM = env.EMAIL_FROM;
export const REPLY_TO = env.EMAIL_REPLY_TO ?? 'support@nirmalspices.in';
