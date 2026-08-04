import { env } from '../config/env';
import { logger } from '../utils/logger';
import axios from 'axios';

function isMsg91Configured(): boolean {
  const key = env.MSG91_AUTH_KEY || '';
  const template = env.MSG91_TEMPLATE_ID || '';
  if (!key || !template) return false;
  if (key.includes('xxxx') || key.includes('your_') || template.includes('xxxx')) return false;
  return true;
}

/**
 * Sends SMS OTP using MSG91 if credentials are configured.
 * Otherwise, falls back to logging the OTP (development / unconfigured).
 */
export async function sendSMSOTP(phone: string, otp: string): Promise<boolean> {
  if (!isMsg91Configured()) {
    logger.info(`[SMS DEV MOCK] OTP for +91${phone}: ${otp}`);
    return true;
  }

  const { MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID } = env;

  try {
    const sender = MSG91_SENDER_ID ?? 'NIRMAL';
    const url = `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${MSG91_AUTH_KEY}`;

    const response = await axios.post(url, {
      OTP: otp,
      sender,
    });

    if (response.data && response.data.type === 'success') {
      logger.info({ phone }, 'MSG91 OTP sent successfully');
      return true;
    }

    logger.error({ response: response.data, phone }, 'MSG91 OTP send failed');
    if (env.NODE_ENV === 'development') {
      logger.info(`[SMS DEV FALLBACK] OTP for +91${phone}: ${otp}`);
      return true;
    }
    return false;
  } catch (err) {
    logger.error({ err, phone }, 'Error sending MSG91 OTP');
    if (env.NODE_ENV === 'development') {
      logger.info(`[SMS DEV FALLBACK] OTP for +91${phone}: ${otp}`);
      return true;
    }
    return false;
  }
}
