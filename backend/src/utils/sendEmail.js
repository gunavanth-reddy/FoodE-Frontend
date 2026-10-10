const nodemailer = require("nodemailer");

let transporter;

function getEmailConfig() {
  // Preferred FoodE-specific variables. Legacy SMTP variables remain as a fallback.
  const user = process.env.FOODE_EMAIL || process.env.SMTP_USER;
  const pass = process.env.FOODE_EMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE ?? (port === 465)).toLowerCase() === "true";

  if (!user || !pass) {
    throw new Error(
      "Email credentials are missing. Set FOODE_EMAIL and FOODE_EMAIL_APP_PASSWORD in backend/.env."
    );
  }

  return { user, pass, host, port, secure };
}

function getTransporter() {
  if (transporter) return transporter;

  const { user, pass, host, port, secure } = getEmailConfig();
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Email recipient, subject, and message are required.");
  }

  const { user } = getEmailConfig();
  const from = process.env.FOODE_FROM_EMAIL || `FoodE <${user}>`;

  return getTransporter().sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

async function verifyEmailTransport() {
  // Ensure configuration is validated before attempting SMTP authentication.
  getEmailConfig();
  return getTransporter().verify();
}

module.exports = { sendEmail, verifyEmailTransport };
