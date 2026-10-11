const mongoose = require("mongoose");

const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");

const FOODE_COMMISSION_PER_ORDER = 10;

// =====================================================
// DATE HELPERS — INDIA TIME
// =====================================================

const getIndiaDateParts = (date = new Date()) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(date);

    const get = (type) =>
        parts.find((part) => part.type === type)?.value;

    return {
        year: Number(get("year")),
        month: Number(get("month")),
        day: Number(get("day")),
    };
};

// Convert an India calendar date to UTC Date
const indiaDateToUTC = (
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0
) => {
    // IST = UTC + 5:30
    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            hour - 5,
            minute - 30,
            second
        )
    );
};

// =====================================================
// CURRENT WEEK
// Monday → Sunday
// =====================================================

const getCurrentWeekRange = () => {
    const now = new Date();

    const india = getIndiaDateParts(now);

    const currentDate = indiaDateToUTC(
        india.year,
        india.month,
        india.day
    );

    const dayOfWeek = currentDate.getUTCDay();

    // Sunday = 0
    const daysFromMonday =
        dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(currentDate);

    monday.setUTCDate(
        monday.getUTCDate() - daysFromMonday
    );

    const sunday = new Date(monday);

    sunday.setUTCDate(
        sunday.getUTCDate() + 7
    );

    return {
        start: indiaDateToUTC(
            monday.getUTCFullYear(),
            monday.getUTCMonth() + 1,
            monday.getUTCDate()
        ),

        end: indiaDateToUTC(
            sunday.getUTCFullYear(),
            sunday.getUTCMonth() + 1,
            sunday.getUTCDate()
        ),
    };
};

// =====================================================
// CURRENT MONTH
// =====================================================

const getCurrentMonthRange = () => {
    const india = getIndiaDateParts();

    const start = indiaDateToUTC(
        india.year,
        india.month,
        1
    );

    let nextYear = india.year;
    let nextMonth = india.month + 1;

    if (nextMonth === 13) {
        nextMonth = 1;
        nextYear++;
    }

    const end = indiaDateToUTC(
        nextYear,
        nextMonth,
        1
    );

    return {
        start,
        end,
        year: india.year,
        month: india.month,
    };
};

// =====================================================
// GET ORDERS BETWEEN DATES
// =====================================================

const getDeliveredOrders = async (start, end) => {
    return Order.find({
        status: "DELIVERED",

        deliveredAt: {
            $gte: start,
            $lt: end,
        },
    })
        .select(
            "restaurant total deliveredAt createdAt orderNumber"
        )
        .lean();
};

// =====================================================
// CALCULATE ANALYTICS
// =====================================================

const calculateAnalytics = (orders) => {
    const orderCount = orders.length;

    const sales = orders.reduce(
        (sum, order) =>
            sum + Number(order.total || 0),
        0
    );

    const foodEarnings =
        orderCount * FOODE_COMMISSION_PER_ORDER;

    return {
        orders: orderCount,
        sales,
        foodEarnings,
    };
};

// =====================================================
// GET OVERALL ADMIN ANALYTICS
// =====================================================

const getOverview = async (req, res) => {
    try {
        // ==========================================
        // ADMIN CHECK
        // ==========================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        // ==========================================
        // DATE RANGES
        // ==========================================

        const week = getCurrentWeekRange();
        const month = getCurrentMonthRange();

        // ==========================================
        // GET RESTAURANTS
        // ==========================================

        const totalRestaurants =
            await Restaurant.countDocuments({
                isActive: true,
            });

        // ==========================================
        // GET ORDERS
        // ==========================================

        const weekOrders =
            await getDeliveredOrders(
                week.start,
                week.end
            );

        const monthOrders =
            await getDeliveredOrders(
                month.start,
                month.end
            );

        // ==========================================
        // ALL-TIME ORDERS
        // ==========================================

        const allOrders =
            await Order.find({
                status: "DELIVERED",
            })
                .select("total")
                .lean();

        // ==========================================
        // CALCULATE
        // ==========================================

        const weekAnalytics =
            calculateAnalytics(weekOrders);

        const monthAnalytics =
            calculateAnalytics(monthOrders);

        const allTimeAnalytics =
            calculateAnalytics(allOrders);

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            commissionPerOrder:
                FOODE_COMMISSION_PER_ORDER,

            overview: {
                totalRestaurants,

                allTime: allTimeAnalytics,

                thisWeek: weekAnalytics,

                thisMonth: monthAnalytics,
            },
        });

    } catch (error) {
        console.error(
            "Admin Overview Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching admin analytics",
        });
    }
};

// =====================================================
// RESTAURANT-WISE ANALYTICS
// =====================================================

const getRestaurantAnalytics = async (
    req,
    res
) => {
    try {
        // ==========================================
        // ADMIN CHECK
        // ==========================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        // ==========================================
        // DATE RANGES
        // ==========================================

        const week = getCurrentWeekRange();
        const month = getCurrentMonthRange();

        // ==========================================
        // RESTAURANTS
        // ==========================================

        const restaurants =
            await Restaurant.find({
                isActive: true,
            })
                .select(
                    "_id name logo owner"
                )
                .populate(
                    "owner",
                    "name phone"
                )
                .lean();

        // ==========================================
        // MONTH ORDERS
        // ==========================================

        const monthOrders =
            await Order.find({
                status: "DELIVERED",

                deliveredAt: {
                    $gte: month.start,
                    $lt: month.end,
                },
            })
                .select(
                    "restaurant total deliveredAt"
                )
                .lean();

        // ==========================================
        // WEEK ORDERS
        // ==========================================

        const weekOrders =
            await Order.find({
                status: "DELIVERED",

                deliveredAt: {
                    $gte: week.start,
                    $lt: week.end,
                },
            })
                .select(
                    "restaurant total deliveredAt"
                )
                .lean();

        // ==========================================
        // RESTAURANT ANALYTICS
        // ==========================================

        const analytics =
            restaurants.map((restaurant) => {

                const restaurantId =
                    restaurant._id.toString();

                const restaurantMonthOrders =
                    monthOrders.filter(
                        (order) =>
                            order.restaurant?.toString() ===
                            restaurantId
                    );

                const restaurantWeekOrders =
                    weekOrders.filter(
                        (order) =>
                            order.restaurant?.toString() ===
                            restaurantId
                    );

                return {
                    restaurant: {
                        id: restaurant._id,
                        name: restaurant.name,
                        logo: restaurant.logo,
                    },

                    owner: restaurant.owner
                        ? {
                              id:
                                  restaurant.owner._id,
                              name:
                                  restaurant.owner.name,
                              phone:
                                  restaurant.owner.phone,
                          }
                        : null,

                    thisWeek:
                        calculateAnalytics(
                            restaurantWeekOrders
                        ),

                    thisMonth:
                        calculateAnalytics(
                            restaurantMonthOrders
                        ),
                };
            });

        return res.status(200).json({
            success: true,

            commissionPerOrder:
                FOODE_COMMISSION_PER_ORDER,

            restaurants: analytics,
        });

    } catch (error) {
        console.error(
            "Restaurant Analytics Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching restaurant analytics",
        });
    }
};

// =====================================================
// SINGLE RESTAURANT ANALYTICS
// =====================================================

const getSingleRestaurantAnalytics =
    async (req, res) => {
        try {
            // ==========================================
            // ADMIN CHECK
            // ==========================================

            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required",
                });
            }

            const {
                restaurantId,
            } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    restaurantId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid restaurant ID",
                });
            }

            // ==========================================
            // RESTAURANT
            // ==========================================

            const restaurant =
                await Restaurant.findById(
                    restaurantId
                )
                    .select(
                        "_id name logo owner"
                    )
                    .populate(
                        "owner",
                        "name phone"
                    )
                    .lean();

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Restaurant not found",
                });
            }

            // ==========================================
            // CURRENT MONTH
            // ==========================================

            const month =
                getCurrentMonthRange();

            const orders =
                await Order.find({
                    restaurant:
                        restaurantId,

                    status: "DELIVERED",

                    deliveredAt: {
                        $gte: month.start,
                        $lt: month.end,
                    },
                })
                    .select(
                        "orderNumber total deliveredAt"
                    )
                    .sort({
                        deliveredAt: 1,
                    })
                    .lean();

            // ==========================================
            // MONTH TOTAL
            // ==========================================

            const monthly =
                calculateAnalytics(orders);

            // ==========================================
            // WEEKLY BREAKDOWN
            //
            // Week 1 = 1-7
            // Week 2 = 8-14
            // Week 3 = 15-21
            // Week 4 = 22-28
            // Week 5 = remaining days
            // ==========================================

            const weeks = [];

            const daysInMonth =
                new Date(
                    month.year,
                    month.month,
                    0
                ).getDate();

            let weekNumber = 1;

            for (
                let startDay = 1;
                startDay <= daysInMonth;
                startDay += 7
            ) {
                const endDay =
                    Math.min(
                        startDay + 6,
                        daysInMonth
                    );

                const weekStart =
                    indiaDateToUTC(
                        month.year,
                        month.month,
                        startDay
                    );

                const weekEnd =
                    endDay === daysInMonth
                        ? indiaDateToUTC(
                              month.year,
                              month.month + 1,
                              1
                          )
                        : indiaDateToUTC(
                              month.year,
                              month.month,
                              endDay + 1
                          );

                const weekOrders =
                    orders.filter(
                        (order) => {

                            const date =
                                new Date(
                                    order.deliveredAt
                                );

                            return (
                                date >=
                                    weekStart &&
                                date <
                                    weekEnd
                            );
                        }
                    );

                weeks.push({
                    week: weekNumber,

                    from: startDay,

                    to: endDay,

                    ...calculateAnalytics(
                        weekOrders
                    ),
                });

                weekNumber++;
            }

            // ==========================================
            // RESPONSE
            // ==========================================

            return res.status(200).json({
                success: true,

                commissionPerOrder:
                    FOODE_COMMISSION_PER_ORDER,

                restaurant: {
                    id: restaurant._id,
                    name: restaurant.name,
                    logo: restaurant.logo,
                },

                owner: restaurant.owner
                    ? {
                          id:
                              restaurant.owner._id,
                          name:
                              restaurant.owner.name,
                          phone:
                              restaurant.owner.phone,
                      }
                    : null,

                monthly,

                weeks,
            });

        } catch (error) {
            console.error(
                "Single Restaurant Analytics Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Server error while fetching restaurant analytics",
            });
        }
    };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getOverview,
    getRestaurantAnalytics,
    getSingleRestaurantAnalytics,
};