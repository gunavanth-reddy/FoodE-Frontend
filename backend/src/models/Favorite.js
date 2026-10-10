const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // FAVORITE RESTAURANT
    // ==========================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    // ==========================================
    // FAVORITE FOOD
    // ==========================================

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// ONE FAVORITE ENTRY PER USER + RESTAURANT
// ==========================================

favoriteSchema.index(
  {
    user: 1,
    restaurant: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      restaurant: {
        $exists: true,
        $ne: null,
      },
    },
  }
);


// ==========================================
// ONE FAVORITE ENTRY PER USER + FOOD
// ==========================================

favoriteSchema.index(
  {
    user: 1,
    food: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      food: {
        $exists: true,
        $ne: null,
      },
    },
  }
);


// ==========================================
// VALIDATE FAVORITE TYPE
// ==========================================

favoriteSchema.pre("validate", function (next) {
  const hasRestaurant = !!this.restaurant;
  const hasFood = !!this.food;

  if (
    (hasRestaurant && hasFood) ||
    (!hasRestaurant && !hasFood)
  ) {
    return next(
      new Error(
        "Favorite must contain either a restaurant or a food item"
      )
    );
  }

  next();
});


module.exports = mongoose.model(
  "Favorite",
  favoriteSchema
);