import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  // Log verification info to server console for easy testing/debugging
  console.log(`\n========================================`);
  console.log(`📧 Outbound Mail Request to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`========================================\n`);

  if (!gmailUser || !gmailPass) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set in environment variables.");
    console.warn("Email delivery falling back to server log mode.");
    return { success: true, mode: "log" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Tourism Seasons" <${gmailUser}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Nodemailer send email error:", error);
    return { success: false, error: (error as Error).message };
  }
}

export function generateVerificationHtml(code: string, title: string = "Verify Your Email") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Tourism Seasons</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Travel & Seasonal Guides</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
        <h3 style="color: #1e293b; margin-top: 0;">${title}</h3>
        <p style="color: #475569; font-size: 14px;">Your 6-digit verification security code is:</p>
        
        <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #2791F5; background-color: #f0f7ff; padding: 14px 20px; border-radius: 10px; display: inline-block; margin: 16px 0; border: 1px border-blue-200;">
          ${code}
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
          This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 11px;">
        &copy; ${new Date().getFullYear()} Tourism Seasons. All rights reserved.
      </div>
    </div>
  `;
}
