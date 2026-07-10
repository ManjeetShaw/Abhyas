// Sends transactional emails via Resend (resend.com) — free tier covers
// this app's needs, no SMTP/app-password setup required.

const RESEND_URL = "https://api.resend.com/emails";

async function sendPasswordResetEmail({ to, resetLink }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — skipping email send");
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Resend's shared test domain — works without verifying your own
      // domain. Swap to a verified sender (e.g. noreply@binarybuilds.online)
      // once that domain is verified in the Resend dashboard.
      from: "Abhyas <onboarding@resend.dev>",
      to: [to],
      subject: "Reset your Abhyas password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your Abhyas account password. Click the button below to choose a new one. This link expires in 15 minutes.</p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" style="background:#6c5ce7;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errText}`);
  }

  return { sent: true };
}

module.exports = { sendPasswordResetEmail };
