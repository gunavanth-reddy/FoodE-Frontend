require("dotenv").config();
const { sendEmail, verifyEmailTransport } = require("../src/utils/sendEmail");

async function main() {
  try {
    await verifyEmailTransport();
    console.log("SMTP connection successful.");

    const to = process.env.SMTP_TEST_TO || process.env.FOODE_EMAIL || process.env.SMTP_USER;
    if (!to) throw new Error("Set FOODE_EMAIL or SMTP_TEST_TO in backend/.env.");

    await sendEmail({
      to,
      subject: "FoodE email service test",
      text: "Your FoodE backend can send email successfully.",
      html: "<h2 style=\"color:#f47721\">FoodE email service is working!</h2><p>This is a test email.</p>",
    });

    console.log(`Test email sent to ${to}.`);
  } catch (error) {
    console.error("Email test failed:", error.message);
    process.exitCode = 1;
  }
}

main();
