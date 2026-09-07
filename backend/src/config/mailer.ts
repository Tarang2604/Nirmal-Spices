import { env } from './env';

let resendInstance: import('resend').Resend | null = null;
async function getResend() {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!resendInstance) {
    const { Resend } = await import('resend');
    resendInstance = new Resend(env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export const mailer = {
  sendMail: async ({ from, to, subject, html, replyTo }: SendMailOptions) => {
    const resend = await getResend();
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
