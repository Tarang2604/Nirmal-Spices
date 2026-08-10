import nodemailer, { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import dns from 'dns';
import { env } from './env';

let transportPromise: Promise<Transporter<SMTPTransport.SentMessageInfo>> | null = null;

async function buildTransport(): Promise<Transporter<SMTPTransport.SentMessageInfo>> {
  const options: SMTPTransport.Options & { servername?: string } = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };

  // nodemailer resolves both A and AAAA records for the SMTP host and can spend
  // its full connectionTimeout on an address before falling back to the next —
  // on hosts that can't actually route IPv6 (e.g. Render), that stalled OTP/order
  // emails ~2 minutes even with connectionTimeout capped, because the hang was a
  // platform-level unreachable route, not a slow-but-alive attempt. Resolving to
  // a literal IPv4 address ourselves skips nodemailer's dual A/AAAA resolution
  // entirely (it only re-resolves when given a hostname); servername keeps TLS
  // hostname verification working against the real host.
  try {
    const addresses = await dns.promises.resolve4(env.SMTP_HOST);
    if (addresses[0]) {
      options.host = addresses[0];
      options.servername = env.SMTP_HOST;
    }
  } catch {
    // Fall back to hostname-based connection if the IPv4 lookup itself fails
  }

  return nodemailer.createTransport(options);
}

function getTransport() {
  if (!transportPromise) transportPromise = buildTransport();
  return transportPromise;
}

export const mailer = {
  sendMail: async (message: Parameters<Transporter['sendMail']>[0]) => {
    const transport = await getTransport();
    return transport.sendMail(message);
  },
};

export const FROM = env.EMAIL_FROM;
export const REPLY_TO = env.EMAIL_REPLY_TO ?? 'support@nirmalspices.in';
