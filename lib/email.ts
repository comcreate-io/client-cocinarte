import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ============ INTERFACES ============

export interface CampaignRecipient {
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface CampaignEmailOptions {
  recipient: CampaignRecipient;
  subject: string;
  html: string;
}

export interface CampaignProgress {
  total: number;
  sent: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  errors: Array<{ email: string; error: string }>;
  status: "running" | "completed" | "failed";
}

// ============ CONFIG ============

export const CAMPAIGN_CONFIG = {
  BATCH_SIZE: 5,
  DELAY_BETWEEN_BATCHES_MS: 3000,
};

// ============ FUNCTIONS ============

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}

// Send test email for templates
interface SendTestEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendTestEmail({ to, subject, html }: SendTestEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"Cocinarte PDX" <${from}>`,
    to,
    subject: `[TEST] ${subject}`,
    html,
  };

  return transporter.sendMail(mailOptions);
}

// Personalize email content with recipient data
export function personalizeEmailContent(
  html: string,
  recipient: CampaignRecipient
): string {
  return html
    .replace(/{{first_name}}/gi, recipient.first_name || "Friend")
    .replace(/{{last_name}}/gi, recipient.last_name || "")
    .replace(/{{email}}/gi, recipient.email)
    .replace(
      /{{full_name}}/gi,
      `${recipient.first_name || ""} ${recipient.last_name || ""}`.trim() || "Friend"
    );
}

// ============ ADMIN NOTIFICATIONS ============

const ADMIN_NOTIFICATION_EMAIL = "diego@comcreate.org";

export type AdminNotificationType =
  | "signup"
  | "login"
  | "booking"
  | "booking_cancellation"
  | "contact_form"
  | "party_request"
  | "private_event"
  | "payment_completed"
  | "payment_refund"
  | "gift_card_purchase"
  | "gift_card_redeem"
  | "gift_card_use"
  | "consent_signed"
  | "consent_revoked"
  | "invoice_paid"
  | "coupon_used";

interface AdminNotificationData {
  [key: string]: string | number | boolean | undefined | null;
}

export async function sendAdminNotification(
  type: AdminNotificationType,
  data: AdminNotificationData
): Promise<{ success: boolean; error?: string }> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const typeLabels: Record<AdminNotificationType, string> = {
    signup: "🎉 New User Signup",
    login: "🔐 User Login",
    booking: "📅 New Class Booking",
    booking_cancellation: "❌ Booking Cancelled",
    contact_form: "📬 Contact Form Submission",
    party_request: "🎂 Birthday Party Request",
    private_event: "🎊 Private Event Request",
    payment_completed: "💰 Payment Completed",
    payment_refund: "💸 Payment Refunded",
    gift_card_purchase: "🎁 Gift Card Purchased",
    gift_card_redeem: "🎟️ Gift Card Redeemed",
    gift_card_use: "💳 Gift Card Used",
    consent_signed: "✍️ Consent Form Signed",
    consent_revoked: "🚫 Consent Revoked",
    invoice_paid: "📄 Invoice Paid",
    coupon_used: "🏷️ Coupon Used",
  };

  const subject = `[Cocinarte] ${typeLabels[type]}`;

  // Build HTML content from data
  const dataRows = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #555;">${label}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${value}</td></tr>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${typeLabels[type]}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #D97706; margin: 0 0 20px 0; font-size: 24px;">${typeLabels[type]}</h1>
        <p style="color: #666; margin-bottom: 20px;">A user action was performed on Cocinarte:</p>
        <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 8px; overflow: hidden;">
          ${dataRows}
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
          Timestamp: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST
        </p>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Cocinarte Notifications" <${from}>`,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Admin Notification] Sent: ${type}`);
    return { success: true };
  } catch (error) {
    console.error(`[Admin Notification] Failed: ${type}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send a single campaign email
export async function sendCampaignEmail({
  recipient,
  subject,
  html,
}: CampaignEmailOptions): Promise<{ success: boolean; error?: string }> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  // Personalize subject and content
  const personalizedSubject = personalizeEmailContent(subject, recipient);
  const personalizedHtml = personalizeEmailContent(html, recipient);

  const mailOptions = {
    from: `"Cocinarte PDX" <${from}>`,
    to: recipient.email,
    subject: personalizedSubject,
    html: personalizedHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
