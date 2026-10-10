# FoodE backend — email OTP integration

This backend includes SRM AP email OTP verification for registration, mobile-number/password login, and forgot-password OTP routes.

## 1. Keep secrets in your local `.env`

The ZIP intentionally excludes `.env` and `node_modules`. Keep your own local `.env` and configure the following values:

```env
FOODE_EMAIL=your-sender@gmail.com
FOODE_EMAIL_APP_PASSWORD=your-16-character-google-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

`FOODE_EMAIL` must be the same Google account that generated the App Password. Use an App Password, not your regular Gmail password. The email service prefers these `FOODE_*` variables; `SMTP_USER` and `SMTP_PASS` are supported only as a legacy fallback. Do not share `.env` or commit it.

## 2. Install dependencies

From the backend directory:

```powershell
npm install
```

`nodemailer` and `express-rate-limit` are included in `package.json` and `package-lock.json`.

## 3. Test SMTP

```powershell
node scripts/testEmail.js
```

The test sends a message to `SMTP_TEST_TO` if configured; otherwise it sends to `FOODE_EMAIL` (or legacy `SMTP_USER`). A successful test confirms SMTP authentication and one test send only.

## 4. Auth routes

- `POST /api/auth/send-email-otp` — send registration OTP to `@srmap.edu.in`.
- `POST /api/auth/resend-email-otp` — resend registration OTP with a cooldown.
- `POST /api/auth/verify-email` — verify registration OTP.
- `POST /api/auth/register` — create a customer only if email verification is valid; fields: `name`, `email`, `phone`, `password`.
- `POST /api/auth/login` — mobile number + password.
- `POST /api/auth/forgot-password` — send reset OTP to a registered, verified SRM AP email.
- `POST /api/auth/verify-reset-otp` — verify reset OTP.
- `POST /api/auth/reset-password` — body: `email`, `otp`, `newPassword`.

OTPs are hashed in MongoDB, expire after five minutes, and have a five-attempt limit. Passwords are bcrypt-hashed. Public registration always assigns the `user` role.

## 5. Important launch notes

- Email delivery depends on valid SMTP credentials and the provider's quota. Gmail SMTP does not guarantee 1,000 messages per day or 1,000 simultaneous deliveries. Confirm provider limits before public launch.
- The frontend should call `/send-email-otp`, then `/verify-email`, then `/register` using the same verified email.
- Forgot-password UI should collect the registered `@srmap.edu.in` email, OTP, and new password.
- Test against a development database before production.
- The `.env` file and `node_modules` are intentionally not included in this ZIP.
