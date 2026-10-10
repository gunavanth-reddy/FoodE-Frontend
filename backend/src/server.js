// =====================================================
// ENVIRONMENT
// =====================================================

const dotenv = require("dotenv");

dotenv.config();

// =====================================================
// APP
// =====================================================

const app = require("./app");

// =====================================================
// DATABASE
// =====================================================

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
    // ================================================
    // CONNECT TO MONGODB
    // ================================================

    await connectDB();

    // ================================================
    // START EXPRESS SERVER
    // ================================================

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `🚀 Server is running on port ${PORT}`
        );

        console.log(
          `📱 API available at http://localhost:${PORT}/api`
        );

        console.log(
          `📊 Admin Analytics available at http://localhost:${PORT}/api/admin/analytics`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);
  }
};

// =====================================================
// START SERVER
// =====================================================

startServer();