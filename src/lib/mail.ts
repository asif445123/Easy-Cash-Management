import nodemailer from "nodemailer";

/**
 * SMTP is read from env vars. For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465,
 * SMTP_USER=<your address>, SMTP_PASS=<a Gmail App Password, NOT your normal
 * Gmail password — generate one at https://myaccount.google.com/apppasswords,
 * which requires 2-Step Verification to be turned on first>.
 */
function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file (not .env.example)."
    );
  }

  const port = Number(SMTP_PORT) || 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for port 465 (SSL), false for 587/others (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "EasyCash";

  try {
    await transporter.sendMail({
      from: `"${siteName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `Reset your ${siteName} password`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your ${siteName} account password. This link expires in 1 hour.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#0E7C4A;color:#fff;border-radius:6px;text-decoration:none;">
              Reset password
            </a>
          </p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    // Re-throw with more context so it's obvious in server logs what failed —
    // e.g. "Invalid login: 535-5.7.8 Username and Password not accepted"
    // almost always means you're using a normal password instead of a Gmail
    // App Password, or 2-Step Verification isn't enabled on the account.
    console.error("nodemailer sendMail failed:", err);
    throw err;
  }
}

/**
 * Sends a "Contact Us" form submission. Recipient is CONTACT_EMAIL if set,
 * otherwise defaults to masifrana445@gmail.com (the admin's email) — set
 * CONTACT_EMAIL in your .env if you ever want this to go somewhere else.
 */
export async function sendContactMessage(name: string, fromEmail: string, message: string) {
  const transporter = getTransporter();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "EasyCash";
  const recipient = process.env.CONTACT_EMAIL || "masifrana445@gmail.com";

  try {
    await transporter.sendMail({
      from: `"${siteName} Contact Form" <${process.env.SMTP_USER}>`,
      to: recipient,
      replyTo: fromEmail,
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>New message from ${siteName}'s Contact Us form</h2>
          <p><strong>From:</strong> ${name} (${fromEmail})</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; border-left: 3px solid #0E7C4A; padding-left: 12px;">${message}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("nodemailer sendMail failed:", err);
    throw err;
  }
}
