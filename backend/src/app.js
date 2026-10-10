// =====================================================
// FOODE EXPRESS APP
// =====================================================

const express = require("express");
const cors = require("cors");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const deliverySlotRoutes = require("./routes/deliverySlotRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const searchRoutes = require("./routes/searchRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// =====================================================
// ADMIN ANALYTICS
// =====================================================

const adminAnalyticsRoutes = require(
  "./routes/adminAnalyticsRoutes"
);

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(
  cors()
);

app.use(
  express.json()
);

// =====================================================
// API ROUTES
// =====================================================

// -----------------------------------------------------
// AUTH
// -----------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);

// -----------------------------------------------------
// RESTAURANTS
// -----------------------------------------------------

app.use(
  "/api/restaurants",
  restaurantRoutes
);

// -----------------------------------------------------
// CATEGORIES
// -----------------------------------------------------

app.use(
  "/api/categories",
  categoryRoutes
);

// -----------------------------------------------------
// FOODS
// -----------------------------------------------------

app.use(
  "/api/foods",
  foodRoutes
);

// -----------------------------------------------------
// CART
// -----------------------------------------------------

app.use(
  "/api/cart",
  cartRoutes
);

// -----------------------------------------------------
// DELIVERY SLOTS
// -----------------------------------------------------

app.use(
  "/api/delivery-slots",
  deliverySlotRoutes
);

// -----------------------------------------------------
// ORDERS
// -----------------------------------------------------

app.use(
  "/api/orders",
  orderRoutes
);

// -----------------------------------------------------
// REVIEWS
// -----------------------------------------------------

app.use(
  "/api/reviews",
  reviewRoutes
);

// -----------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------

app.use(
  "/api/notifications",
  notificationRoutes
);

// -----------------------------------------------------
// FAVORITES
// -----------------------------------------------------
app.use("/api/favorites", favoriteRoutes);

// -----------------------------------------------------
// SEARCH
// -----------------------------------------------------
app.use("/api/search", searchRoutes);

// -----------------------------------------------------
// PAYMENTS
// -----------------------------------------------------
app.use("/api/payments", paymentRoutes);

// -----------------------------------------------------
// ADMIN
// -----------------------------------------------------
app.use("/api/admin", adminRoutes);

// -----------------------------------------------------
// ADMIN ANALYTICS
// -----------------------------------------------------

app.use(
  "/api/admin/analytics",
  adminAnalyticsRoutes
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "FoodE Backend Running",
    });
  }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = app;app