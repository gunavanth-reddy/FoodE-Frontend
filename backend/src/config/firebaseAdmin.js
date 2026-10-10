const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// FoodE can run without FCM credentials. Push notifications are enabled
// automatically when FIREBASE_SERVICE_ACCOUNT_PATH points to a valid JSON
// service-account file, or when GOOGLE_APPLICATION_CREDENTIALS is configured.

if (!admin.apps.length) {
  let initialized = false;

  try {
    const configuredPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(__dirname, "firebase-service-account.json");

    const resolvedPath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath);

    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = require(resolvedPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
    }
  } catch (error) {
    console.error("FoodE Firebase initialization warning:", error.message);
  }

  if (!initialized) {
    console.log(
      "FoodE: Firebase Admin credentials not configured. FCM push notifications are disabled."
    );
  }
}

module.exports = admin;
