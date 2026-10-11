
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = path.resolve(
    __dirname,
    "../../config/firebase-service-account.json"
);

if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
        `Firebase service account not found: ${serviceAccountPath}`
    );
}

const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
);

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
              credential: cert(serviceAccount),
          });

console.log("Firebase Admin initialized successfully");

module.exports = {
    app,
    messaging: getMessaging(app),
};
