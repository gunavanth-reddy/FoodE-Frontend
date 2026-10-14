# FoodE Backend — Clean Setup

This archive intentionally excludes `node_modules`, `.env`, nested ZIP archives, and Firebase service-account private-key files. Install dependencies and supply your own secrets before running it.

## 1. Install

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` and fill in your actual values:

- `PORT`: backend port (defaults to `5000`)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: long, random secret used to sign login tokens
- `FIREBASE_SERVICE_ACCOUNT`: the complete Firebase Admin service-account JSON, encoded as one JSON string. Do not commit it or share it publicly.

The Firebase service account must belong to the same Firebase project as the mobile app's `google-services.json`. If using Render, add these values in the service's Environment settings instead of uploading `.env`.

## 3. Start

```bash
npm run dev
```

Health check: `GET /`

## 4. Verify push notification setup

1. Start the backend and check for `Firebase Admin initialized successfully`.
2. Sign in on the customer app and confirm its logs show `FoodE: FCM token saved successfully`.
3. Using that customer's Bearer JWT, call `POST /api/notifications/test-fcm` with an empty JSON body.
4. If the API fails, inspect the returned `error` and `errorCode` plus backend logs. If the API says it sent the notification but the device shows nothing, verify Android notification permission, app notification settings, Firebase project matching, and whether the app is foregrounded/backgrounded.
5. Test order confirmation by placing a new order and confirming it from the restaurant owner app. Backend logs should show `FoodE: Sending ORDER_CONFIRMED notification`, followed by the notification service's FCM result.

The API can confirm Firebase accepted a message, but cannot guarantee the operating system displayed it on the device. Device permission, app state, and Firebase configuration also matter.

## Security

Never commit `.env`, service-account JSON, database credentials, JWT secrets, or production tokens. If any credentials in a previously shared archive were real, rotate/revoke them.
