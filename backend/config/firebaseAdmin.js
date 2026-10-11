
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Path to Firebase service-account credentials
const serviceAccountPath = path.resolve(
    __dirname,
    "firebase-service-account.json"
);

// Check whether the credentials file exists
if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
        `Firebase service account not found: ${serviceAccountPath}`
    );
}

// Load service-account credentials
const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
);

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
}

module.exports = admin;
