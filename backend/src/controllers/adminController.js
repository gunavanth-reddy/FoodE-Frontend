const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");

const {
    notifyRestaurantApproved,
    notifyRestaurantRejected,
} = require("../services/notificationService");


// =====================================================
// GET ALL PENDING RESTAURANTS
// =====================================================

const getPendingRestaurants = async (req, res) => {
    try {

        const restaurants =
            await Restaurant.find({
                isApproved: false,
            })
                .populate(
                    "owner",
                    "name email phone"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                restaurants.length,

            restaurants,

        });

    } catch (error) {

        console.error(
            "Get Pending Restaurants Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching pending restaurants",

        });
    }
};


// =====================================================
// APPROVE RESTAURANT
// =====================================================

const approveRestaurant = async (
    req,
    res
) => {
    try {

        const restaurant =
            await Restaurant.findById(
                req.params.id
            );


        if (!restaurant) {

            return res.status(404).json({

                success: false,

                message:
                    "Restaurant not found",

            });
        }


        if (restaurant.isApproved) {

            return res.status(400).json({

                success: false,

                message:
                    "Restaurant is already approved",

            });
        }


        // ==========================================
        // APPROVE
        // ==========================================

        restaurant.isApproved = true;

        restaurant.isActive = true;


        await restaurant.save();


        // ==========================================
        // NOTIFY OWNER
        // ==========================================

        await notifyRestaurantApproved({

            ownerId:
                restaurant.owner,

            restaurantId:
                restaurant._id,

            restaurantName:
                restaurant.name,

        });


        return res.status(200).json({

            success: true,

            message:
                "Restaurant approved successfully",

            restaurant,

        });

    } catch (error) {

        console.error(
            "Approve Restaurant Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while approving restaurant",

        });
    }
};


// =====================================================
// REJECT RESTAURANT
// =====================================================

const rejectRestaurant = async (
    req,
    res
) => {
    try {

        const restaurant =
            await Restaurant.findById(
                req.params.id
            );


        if (!restaurant) {

            return res.status(404).json({

                success: false,

                message:
                    "Restaurant not found",

            });
        }


        // ==========================================
        // REJECT
        // ==========================================

        restaurant.isApproved = false;

        restaurant.isActive = false;


        await restaurant.save();


        // ==========================================
        // NOTIFY OWNER
        // ==========================================

        await notifyRestaurantRejected({

            ownerId:
                restaurant.owner,

            restaurantId:
                restaurant._id,

            restaurantName:
                restaurant.name,

        });


        return res.status(200).json({

            success: true,

            message:
                "Restaurant rejected successfully",

            restaurant,

        });

    } catch (error) {

        console.error(
            "Reject Restaurant Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while rejecting restaurant",

        });
    }
};


// =====================================================
// GET ALL RESTAURANTS
// =====================================================

const getAllRestaurants = async (
    req,
    res
) => {
    try {

        const restaurants =
            await Restaurant.find()
                .populate(
                    "owner",
                    "name email phone"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                restaurants.length,

            restaurants,

        });

    } catch (error) {

        console.error(
            "Get All Restaurants Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching restaurants",

        });
    }
};


// =====================================================
// ACTIVATE / DEACTIVATE RESTAURANT
// =====================================================

const toggleRestaurantStatus = async (
    req,
    res
) => {
    try {

        const restaurant =
            await Restaurant.findById(
                req.params.id
            );


        if (!restaurant) {

            return res.status(404).json({

                success: false,

                message:
                    "Restaurant not found",

            });
        }


        restaurant.isActive =
            !restaurant.isActive;


        await restaurant.save();


        return res.status(200).json({

            success: true,

            message:
                restaurant.isActive
                    ? "Restaurant activated successfully"
                    : "Restaurant deactivated successfully",

            restaurant,

        });

    } catch (error) {

        console.error(
            "Toggle Restaurant Status Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while updating restaurant status",

        });
    }
};


// =====================================================
// GET ALL USERS
// =====================================================

const getAllUsers = async (
    req,
    res
) => {
    try {

        const users =
            await User.find()
                .select(
                    "-password -emailOTP -phoneOTP -resetPasswordOTP"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                users.length,

            users,

        });

    } catch (error) {

        console.error(
            "Get All Users Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching users",

        });
    }
};


// =====================================================
// ACTIVATE / DEACTIVATE USER
// =====================================================

const toggleUserStatus = async (
    req,
    res
) => {
    try {

        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found",

            });
        }


        // ==========================================
        // PREVENT SELF-DEACTIVATION
        // ==========================================

        if (
            user._id.toString() ===
            req.user._id.toString()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You cannot deactivate your own account",

            });
        }


        user.isActive =
            user.isActive === undefined
                ? false
                : !user.isActive;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                user.isActive
                    ? "User activated successfully"
                    : "User deactivated successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                isActive:
                    user.isActive,

            },

        });

    } catch (error) {

        console.error(
            "Toggle User Status Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while updating user status",

        });
    }
};


// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

const getDashboardStats = async (
    req,
    res
) => {
    try {

        const totalUsers =
            await User.countDocuments({
                role: "user",
            });


        const totalRestaurantOwners =
            await User.countDocuments({
                role:
                    "restaurant_owner",
            });


        const totalRestaurants =
            await Restaurant.countDocuments();


        const pendingRestaurants =
            await Restaurant.countDocuments({
                isApproved: false,
            });


        const approvedRestaurants =
            await Restaurant.countDocuments({
                isApproved: true,
            });


        const activeRestaurants =
            await Restaurant.countDocuments({
                isApproved: true,
                isActive: true,
            });


        return res.status(200).json({

            success: true,

            stats: {

                totalUsers,

                totalRestaurantOwners,

                totalRestaurants,

                pendingRestaurants,

                approvedRestaurants,

                activeRestaurants,

            },

        });

    } catch (error) {

        console.error(
            "Dashboard Stats Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching dashboard statistics",

        });
    }
};


// =====================================================
// ADMIN ORDER & REVENUE STATISTICS
// =====================================================

const getOrderStats = async (
    req,
    res
) => {
    try {

        // ==========================================
        // GET ALL ORDERS
        // ==========================================

        const orders =
            await Order.find();


        // ==========================================
        // TODAY
        // ==========================================

        const startOfDay =
            new Date();

        startOfDay.setHours(
            0,
            0,
            0,
            0
        );


        const endOfDay =
            new Date();

        endOfDay.setHours(
            23,
            59,
            59,
            999
        );


        // ==========================================
        // TODAY'S ORDERS
        // ==========================================

        const todayOrders =
            orders.filter(
                (order) => {

                    const createdAt =
                        new Date(
                            order.createdAt
                        );

                    return (
                        createdAt >=
                            startOfDay &&
                        createdAt <=
                            endOfDay
                    );

                }
            );


        // ==========================================
        // TOTAL REVENUE
        // ==========================================

        const totalRevenue =
            orders
                .filter(
                    (order) =>
                        order.status !==
                        "CANCELLED"
                )
                .reduce(
                    (total, order) =>
                        total +
                        Number(
                            order.total || 0
                        ),
                    0
                );


        // ==========================================
        // TODAY'S REVENUE
        // ==========================================

        const todayRevenue =
            todayOrders
                .filter(
                    (order) =>
                        order.status !==
                        "CANCELLED"
                )
                .reduce(
                    (total, order) =>
                        total +
                        Number(
                            order.total || 0
                        ),
                    0
                );


        // ==========================================
        // ACTIVE ORDERS
        // ==========================================

        const activeOrders =
            orders.filter(
                (order) =>
                    [
                        "PLACED",
                        "CONFIRMED",
                    ].includes(
                        order.status
                    )
            ).length;


        // ==========================================
        // DELIVERED ORDERS
        // ==========================================

        const deliveredOrders =
            orders.filter(
                (order) =>
                    order.status ===
                    "DELIVERED"
            ).length;


        // ==========================================
        // CANCELLED ORDERS
        // ==========================================

        const cancelledOrders =
            orders.filter(
                (order) =>
                    order.status ===
                    "CANCELLED"
            ).length;


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            stats: {

                orders: {

                    total:
                        orders.length,

                    today:
                        todayOrders.length,

                    active:
                        activeOrders,

                    delivered:
                        deliveredOrders,

                    cancelled:
                        cancelledOrders,

                },

                revenue: {

                    today:
                        todayRevenue,

                    total:
                        totalRevenue,

                },

            },

        });

    } catch (error) {

        console.error(
            "Admin Order Stats Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching order statistics",

        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getPendingRestaurants,

    approveRestaurant,

    rejectRestaurant,

    getAllRestaurants,

    toggleRestaurantStatus,

    getAllUsers,

    toggleUserStatus,

    getDashboardStats,

    getOrderStats,

};