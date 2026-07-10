import { env } from '../config/env';
import { logger } from '../utils/logger';
import axios from 'axios';

/**
 * Sends SMS OTP using MSG91 if credentials are configured.
 * Otherwise, falls back to logging the OTP to console (for development).
 */
export async function sendSMSOTP(phone: string, otp: string): Promise<boolean> {
  const { MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID } = env;

  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    logger.info(`[SMS DEV MOCK] OTP for +91${phone}: ${otp}`);
    return true;
  }

  try {
    const sender = MSG91_SENDER_ID ?? 'NIRMAL';
    // MSG91 OTP API URL
    const url = `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${MSG91_AUTH_KEY}`;
    
    const response = await axios.post(url, {
      OTP: otp,
      sender: sender
    });

    if (response.data && response.data.type === 'success') {
      logger.info({ phone }, 'MSG91 OTP sent successfully');
      return true;
    } else {
      logger.error({ response: response.data, phone }, 'MSG91 OTP send failed');
      return false;
    }
  } catch (err) {
    logger.error({ err, phone }, 'Error sending MSG91 OTP');
    return false;
  }
}
