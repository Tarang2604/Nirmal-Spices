import nodemailer from 'nodemailer';
import { env } from './env';

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  // nodemailer resolves both A and AAAA records and tries the first address for
  // up to its default 2-minute connectionTimeout before falling back — on hosts
  // that can't route IPv6 (e.g. Render), that stalls OTP/order emails ~2 minutes
  // if an IPv6 address happens to be tried first. Cap each attempt so a bad
  // address fails fast and the working one gets tried within seconds.
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

export const FROM = env.EMAIL_FROM;
export const REPLY_TO = env.EMAIL_REPLY_TO ?? 'support@nirmalspices.in';
