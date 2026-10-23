import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


// =====================================================
// TYPES
// =====================================================

export type OrderStatus =
    | "PLACED"
    | "CONFIRMED"
    | "DELIVERED";

export interface RecentOrder {
    id: string;
    customer: string;
    items: string;
    deliverySlotLabel?: string;
    amount: number;
    status: OrderStatus;
}

interface RecentOrdersProps {
    orders: RecentOrder[];
    onOrderPress?: (order: RecentOrder) => void;
    onViewAllPress?: () => void;
}


// =====================================================
// COMPONENT
// =====================================================

const RecentOrders: React.FC<RecentOrdersProps> = ({
    orders,
    onOrderPress,
    onViewAllPress,
}) => {
    return (
        <View style={styles.container}>

            {/* =========================================
                SECTION HEADER
            ========================================= */}

            <View style={styles.header}>

                <Text style={styles.title}>
                    Recent Orders
                </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onViewAllPress}
                >
                    <Text style={styles.viewAll}>
                        View all
                    </Text>
                </TouchableOpacity>

            </View>


            {/* =========================================
                EMPTY STATE
            ========================================= */}

            {orders.length === 0 ? (

                <View style={styles.emptyCard}>

                    <Text style={styles.emptyIcon}>
                        🛒
                    </Text>

                    <Text style={styles.emptyTitle}>
                        No orders yet
                    </Text>

                    <Text style={styles.emptyText}>
                        New orders will appear here.
                    </Text>

                </View>

            ) : (

                <View style={styles.ordersContainer}>

                    {orders.map((order) => (

                        <TouchableOpacity
                            key={order.id}
                            activeOpacity={0.85}
                            onPress={() =>
                                onOrderPress?.(order)
                            }
                            style={styles.orderCard}
                        >

                            {/* =================================
                                ORDER TOP
                            ================================= */}

                            <View style={styles.orderTop}>

                                <View
                                    style={
                                        styles.orderIcon
                                    }
                                >
                                    <Text>
                                        🍽️
                                    </Text>
                                </View>


                                <View
                                    style={
                                        styles.orderInfo
                                    }
                                >

                                    <Text
                                        style={
                                            styles.orderId
                                        }
                                    >
                                        {order.id}
                                    </Text>

                                    <Text
                                        style={
                                            styles.customerName
                                        }
                                    >
                                        {order.customer}
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.amount
                                    }
                                >
                                    ₹
                                    {order.amount.toLocaleString(
                                        "en-IN"
                                    )}
                                </Text>

                            </View>


                            {/* =================================
                                ITEMS
                            ================================= */}

                            <Text
                                style={
                                    styles.items
                                }
                                numberOfLines={1}
                            >
                                {order.items}
                            </Text>

                            {order.deliverySlotLabel ? (
                                <Text style={styles.deliverySlot}>
                                    Delivery slot: {order.deliverySlotLabel}
                                </Text>
                            ) : null}


                            {/* =================================
                                BOTTOM
                            ================================= */}

                            <View
                                style={
                                    styles.orderBottom
                                }
                            >

                                <View
                                    style={[
                                        styles.status,
                                        getStatusStyle(
                                            order.status
                                        ),
                                    ]}
                                >

                                    <View
                                        style={[
                                            styles.statusDot,
                                            getStatusDotStyle(
                                                order.status
                                            ),
                                        ]}
                                    />

                                    <Text
                                        style={
                                            styles.statusText
                                        }
                                    >
                                        {getStatusLabel(
                                            order.status
                                        )}
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.arrow
                                    }
                                >
                                    →
                                </Text>

                            </View>

                        </TouchableOpacity>

                    ))}

                </View>

            )}

        </View>
    );
};


// =====================================================
// STATUS HELPERS
// =====================================================

const getStatusLabel = (
    status: OrderStatus
): string => {

    switch (status) {

        case "PLACED":
            return "New Order";

        case "CONFIRMED":
            return "Confirmed";

        case "DELIVERED":
            return "Delivered";

        default:
            return status;
    }
};


const getStatusStyle = (
    status: OrderStatus
) => {

    switch (status) {

        case "PLACED":
            return styles.placedStatus;

        case "CONFIRMED":
            return styles.confirmedStatus;

        case "DELIVERED":
            return styles.deliveredStatus;

        default:
            return styles.defaultStatus;
    }
};


const getStatusDotStyle = (
    status: OrderStatus
) => {

    switch (status) {

        case "PLACED":
            return styles.placedDot;

        case "CONFIRMED":
            return styles.confirmedDot;

        case "DELIVERED":
            return styles.deliveredDot;

        default:
            return styles.defaultDot;
    }
};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        marginBottom: 28,
    },


    // ================================================
    // HEADER
    // ================================================

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    title: {
        fontSize: 19,
        fontWeight: "800",
        color: "#17171B",
    },

    viewAll: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FF7A00",
    },


    // ================================================
    // ORDERS
    // ================================================

    ordersContainer: {
        gap: 11,
    },

    orderCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 19,
        padding: 15,
    },

    orderTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    orderIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#F5F5F7",
        alignItems: "center",
        justifyContent: "center",
    },

    orderInfo: {
        flex: 1,
        marginLeft: 11,
    },

    orderId: {
        fontSize: 13,
        fontWeight: "800",
        color: "#17171B",
    },

    customerName: {
        fontSize: 11,
        color: "#909099",
        marginTop: 3,
    },

    amount: {
        fontSize: 15,
        fontWeight: "800",
        color: "#17171B",
    },

    items: {
        fontSize: 12,
        color: "#707079",
        marginTop: 13,
    },

    deliverySlot: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6F6F78',
        marginTop: 6,
    },


    // ================================================
    // BOTTOM
    // ================================================

    orderBottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 13,
    },


    // ================================================
    // STATUS
    // ================================================

    status: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },

    statusText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#55555D",
    },

    placedStatus: {
        backgroundColor: "#FFF1E6",
    },

    confirmedStatus: {
        backgroundColor: "#EAF2FF",
    },

    deliveredStatus: {
        backgroundColor: "#EAF8EF",
    },

    defaultStatus: {
        backgroundColor: "#F3F3F4",
    },


    placedDot: {
        backgroundColor: "#FF7A00",
    },

    confirmedDot: {
        backgroundColor: "#4285F4",
    },

    deliveredDot: {
        backgroundColor: "#22A55A",
    },

    defaultDot: {
        backgroundColor: "#888888",
    },


    // ================================================
    // ARROW
    // ================================================

    arrow: {
        fontSize: 18,
        color: "#B0B0B7",
    },


    // ================================================
    // EMPTY STATE
    // ================================================

    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 19,
        paddingVertical: 30,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyIcon: {
        fontSize: 30,
        marginBottom: 10,
    },

    emptyTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#17171B",
    },

    emptyText: {
        fontSize: 12,
        color: "#909099",
        marginTop: 5,
    },

});


export default RecentOrders;
