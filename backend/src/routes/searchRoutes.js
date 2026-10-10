const express = require("express");

const router = express.Router();

const {
  searchFood,
  searchRestaurants,
  searchCategories,
  globalSearch,
} = require("../controllers/searchController");


// =====================================================
// GLOBAL SEARCH
// =====================================================

router.get(
  "/",
  globalSearch
);


// =====================================================
// FOOD SEARCH
// =====================================================

router.get(
  "/food",
  searchFood
);


// =====================================================
// RESTAURANT SEARCH
// =====================================================

router.get(
  "/restaurants",
  searchRestaurants
);


// =====================================================
// CATEGORY SEARCH
// =====================================================

router.get(
  "/categories",
  searchCategories
);


module.exports = router;