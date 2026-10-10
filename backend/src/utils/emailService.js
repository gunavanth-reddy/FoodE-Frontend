const nodemailer = require('nodemailer');

// =========================
// FoodE Email Configuration
// =========================

const email = process.env.FOODE_EMAIL;
const appPassword = process.env.FOODE_EMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: (process.env.SMTP_SECURE || 'true') === 'true',

  auth: {
    user: email,
    pass: appPassword,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

// =========================
// Verify SMTP Connection
// =========================

const verifyEmailConnection = async () => {
  if (!email || !appPassword) {
    throw new Error(
      'Missing FOODE_EMAIL or FOODE_EMAIL_APP_PASSWORD in .env',
    );
  }

  await transporter.verify();
  return true;
};

// =========================
// Send General Email
// =========================

const sendEmail = async ({ to, subject, text, html }) => {
  if (!email || !appPassword) {
    throw new Error(
      'FoodE email credentials are not configured.',
    );
  }

  if (!to || !subject || (!text && !html)) {
    throw new Error(
      'Recipient, subject, and email content are required.',
    );
  }

  const result = await transporter.sendMail({
    from: {
      name: 'FoodE',
      address: email,
    },
    to,
    subject,
    text,
    html,
  });

  if (result.rejected && result.rejected.length > 0) {
    throw new Error('The email provider rejected the recipient.');
  }

  return {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  };
};

// =========================
// Send Six-Digit OTP Email
// =========================

const sendOTPEmail = async (
  to,
  otp,
  purpose = 'verify your email',
) => {
  const code = String(otp);

  if (!/^\d{6}$/.test(code)) {
    throw new Error('OTP must contain exactly 6 digits.');
  }

  const safePurpose = String(purpose)
    .replace(/[<>]/g, '')
    .slice(0, 100);

  return sendEmail({
    to,
    subject: `FoodE - ${safePurpose}`,

    text: [
      'FoodE Verification',
      '',
      `Your verification code is: ${code}`,
      '',
      `Use this code to ${safePurpose}.`,
      'This code expires in 5 minutes.',
      'Do not share this code with anyone.',
      "If you didn't request this code, ignore this email.",
    ].join('\n'),

    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#222">
        <h1 style="color:#f97316">FoodE</h1>
        <h2>Your verification code</h2>
        <p>Use this code to ${safePurpose}.</p>

        <div style="background:#fff4eb;padding:20px;text-align:center;border-radius:12px">
          <strong style="font-size:32px;letter-spacing:8px;color:#f97316">
            ${code}
          </strong>
        </div>

        <p>This code expires in <strong>5 minutes</strong>.</p>
        <p>Do not share this code with anyone.</p>

        <p style="color:#666;font-size:13px">
          If you didn't request this code, you can ignore this email.
        </p>
      </div>
    `,
  });
};

// =========================
// Exports
// =========================

module.exports = {
  transporter,
  verifyEmailConnection,
  sendEmail,
  sendOTPEmail,
};
