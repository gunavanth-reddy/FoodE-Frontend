const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

const loadServiceAccount = () => {
    // Preferred for Render/production: store the complete service-account JSON
    // in the FIREBASE_SERVICE_ACCOUNT environment variable.
    const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (envValue) {
        try {
            const parsed = JSON.parse(envValue);
            if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
                throw new Error("Service-account JSON is missing required fields");
            }
            return parsed;
        } catch (error) {
            throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${error.message}`);
        }
    }

    // Optional local development fallback. Never commit this file.
    const serviceAccountPath = path.resolve(
        __dirname,
        "../../config/firebase-service-account.json"
    );

    if (fs.existsSync(serviceAccountPath)) {
        return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    }

    throw new Error(
        "Firebase credentials are missing. Set FIREBASE_SERVICE_ACCOUNT in the environment " +
        "or provide config/firebase-service-account.json for local development."
    );
};

const serviceAccount = loadServiceAccount();
const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({ credential: cert(serviceAccount) });

console.log("Firebase Admin initialized successfully");

module.exports = {
    app,
    messaging: getMessaging(app),
};
