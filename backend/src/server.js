
require("dotenv").config();

// =====================================================
// APP
// =====================================================

const app = require("./app");
const connectDB = require("./config/db");

// =====================================================
// SERVER CONFIG
// =====================================================

const PORT = process.env.PORT || 5000;

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    // Verify MongoDB environment variable exists
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Check your backend/.env file."
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Start Express only after database connection succeeds
    app.listen(PORT, "0.0.0.0", () => {
      console.log("Firebase Admin should be initialized by its config module.");
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 API available at http://localhost:${PORT}/api`);
      console.log(
        `📊 Admin Analytics available at http://localhost:${PORT}/api/admin/analytics`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
