import { Resend } from 'resend';
import { env } from './env';

export const resend = new Resend(env.RESEND_API_KEY);

export const FROM = env.EMAIL_FROM;
export const REPLY_TO = env.EMAIL_REPLY_TO ?? 'support@nirmalspices.in';
