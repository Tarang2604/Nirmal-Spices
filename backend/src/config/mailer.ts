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
});

export const FROM = env.EMAIL_FROM;
export const REPLY_TO = env.EMAIL_REPLY_TO ?? 'support@nirmalspices.in';
