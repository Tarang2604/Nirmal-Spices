import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { mailer } from '../config/mailer';
import { renderEmailShell } from '../services/email.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/** Helper to escape HTML characters in user input before placing into email templates */
function escapeHtml(text?: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const submitB2BEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    companyName,
    email,
    phone,
    businessType,
    products,
    quantity,
    packaging,
    location,
    message,
  } = req.body;

  const adminEmail = env.ADMIN_EMAIL ?? 'info@nirmalspices.in';

  // Sanitize all inputs for safe HTML insertion
  const safeFirstName = escapeHtml(firstName);
  const safeLastName = escapeHtml(lastName);
  const safeCompanyName = escapeHtml(companyName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeBusinessType = escapeHtml(businessType);
  const safeProducts = escapeHtml(products).replace(/\n/g, '<br/>');
  const safeQuantity = escapeHtml(quantity);
  const safePackaging = escapeHtml(packaging);
  const safeLocation = escapeHtml(location);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  const fullName = `${safeFirstName} ${safeLastName}`.trim();

  const emailHtml = renderEmailShell(`
    <h2 style="color:#C0392B;font-family:Georgia,serif;font-size:22px;margin-bottom:16px">
      New B2B / Bulk Order Enquiry
    </h2>
    <p style="color:#3A3A3C;font-size:14px;line-height:1.5;margin-bottom:20px">
      You have received a new bulk order request from <strong>${safeCompanyName}</strong>.
    </p>

    <div style="background:#FFFFFF;padding:20px;border-radius:12px;border:1px solid #E8D9BE;margin-bottom:20px font-size:14px">
      <h3 style="color:#C0392B;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:12px;border-bottom:1px solid #FAF3E0;padding-bottom:6px">
        Customer Details
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3A3A3C">
        <tr><td style="padding:4px 0;width:40%"><strong>Contact Name:</strong></td><td style="padding:4px 0">${fullName}</td></tr>
        <tr><td style="padding:4px 0"><strong>Company / Business:</strong></td><td style="padding:4px 0">${safeCompanyName}</td></tr>
        <tr><td style="padding:4px 0"><strong>Email:</strong></td><td style="padding:4px 0"><a href="mailto:${safeEmail}" style="color:#C0392B">${safeEmail}</a></td></tr>
        <tr><td style="padding:4px 0"><strong>Phone / WhatsApp:</strong></td><td style="padding:4px 0">${safePhone}</td></tr>
        <tr><td style="padding:4px 0"><strong>Business Type:</strong></td><td style="padding:4px 0">${safeBusinessType}</td></tr>
        <tr><td style="padding:4px 0"><strong>Delivery Location:</strong></td><td style="padding:4px 0">${safeLocation}</td></tr>
      </table>
    </div>

    <div style="background:#FFFFFF;padding:20px;border-radius:12px;border:1px solid #E8D9BE;margin-bottom:20px;font-size:14px">
      <h3 style="color:#C0392B;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:12px;border-bottom:1px solid #FAF3E0;padding-bottom:6px">
        Bulk Requirements
      </h3>
      <p style="margin:4px 0"><strong>Products Required:</strong></p>
      <div style="background:#FAF3E0;padding:12px;border-radius:8px;margin-bottom:12px;color:#1C1C1E">${safeProducts}</div>
      
      <p style="margin:4px 0"><strong>Required Quantity:</strong> ${safeQuantity}</p>
      ${safePackaging ? `<p style="margin:4px 0"><strong>Preferred Packaging:</strong> ${safePackaging}</p>` : ''}
    </div>

    ${
      safeMessage
        ? `
    <div style="background:#FFFFFF;padding:20px;border-radius:12px;border:1px solid #E8D9BE;font-size:14px">
      <h3 style="color:#C0392B;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:0;margin-bottom:12px;border-bottom:1px solid #FAF3E0;padding-bottom:6px">
        Additional Message
      </h3>
      <p style="color:#3A3A3C;margin:0">${safeMessage}</p>
    </div>
    `
        : ''
    }

    <p style="font-size:11px;color:#8A8A8E;margin-top:24px;text-align:center">
      This enquiry was submitted through the Nirmal's Spices B2B Bulk Order form. Click Reply to respond directly to ${safeEmail}.
    </p>
  `);

  // Resend requires a verified domain or onboarding@resend.dev for the 'from' address
  const senderFrom = env.EMAIL_FROM.toLowerCase().includes('@gmail.com')
    ? "Nirmal's Spices <onboarding@resend.dev>"
    : env.EMAIL_FROM;

  try {
    await mailer.sendMail({
      from: senderFrom,
      to: adminEmail,
      replyTo: email,
      subject: `[B2B Enquiry] Bulk Order Request - ${companyName}`,
      html: emailHtml,
    });
    logger.info({ email, companyName }, 'B2B enquiry email successfully sent to admin');
  } catch (err) {
    logger.error({ err, email, companyName }, 'Failed to send B2B enquiry email');
    throw ApiError.internal('Failed to submit bulk order enquiry. Please try again or contact us directly.');
  }

  return sendSuccess(
    res,
    null,
    'Your bulk order enquiry has been submitted successfully. We will contact you soon.',
  );
});
