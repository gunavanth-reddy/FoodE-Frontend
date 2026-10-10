import React from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

// =====================================================
// TYPES
// =====================================================

interface DashboardStatsProps {
    orders: number;
    revenue: number;
    rating: number;
    reviewCount: number;
}


// =====================================================
// COMPONENT
// =====================================================

const DashboardStats: React.FC<DashboardStatsProps> = ({
    orders,
    revenue,
    rating,
    reviewCount,
}) => {
    return (
        <View style={styles.container}>

            {/* =========================================
                ORDERS
            ========================================= */}

            <View style={styles.card}>

                <View
                    style={[
                        styles.iconContainer,
                        styles.orangeBackground,
                    ]}
                >
                    <Text style={styles.icon}>
                        🛒
                    </Text>
                </View>

                <Text style={styles.value}>
                    {orders}
                </Text>

                <Text style={styles.label}>
                    Orders
                </Text>

                <Text style={styles.subText}>
                    Today
                </Text>

            </View>


            {/* =========================================
                REVENUE
            ========================================= */}

            <View style={styles.card}>

                <View
                    style={[
                        styles.iconContainer,
                        styles.greenBackground,
                    ]}
                >
                    <Text style={styles.rupee}>
                        ₹
                    </Text>
                </View>

                <Text
                    style={styles.value}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    ₹{revenue.toLocaleString("en-IN")}
                </Text>

                <Text style={styles.label}>
                    Revenue
                </Text>

                <Text style={styles.subText}>
                    Today
                </Text>

            </View>


            {/* =========================================
                RATING
            ========================================= */}

            <View style={styles.card}>

                <View
                    style={[
                        styles.iconContainer,
                        styles.yellowBackground,
                    ]}
                >
                    <Text style={styles.icon}>
                        ⭐
                    </Text>
                </View>

                <Text style={styles.value}>
                    {rating.toFixed(1)}
                </Text>

                <Text style={styles.label}>
                    Rating
                </Text>

                <Text style={styles.subText}>
                    {reviewCount} reviews
                </Text>

            </View>

        </View>
    );
};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 28,
    },

    card: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 19,
        padding: 13,
        minHeight: 145,
    },

    // ================================================
    // ICON
    // ================================================

    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    orangeBackground: {
        backgroundColor: "#FFF0E3",
    },

    greenBackground: {
        backgroundColor: "#E9F8EF",
    },

    yellowBackground: {
        backgroundColor: "#FFF7D9",
    },

    icon: {
        fontSize: 17,
    },

    rupee: {
        fontSize: 17,
        fontWeight: "800",
        color: "#17171B",
    },

    // ================================================
    // TEXT
    // ================================================

    value: {
        fontSize: 18,
        fontWeight: "800",
        color: "#17171B",
    },

    label: {
        fontSize: 11,
        color: "#8C8C95",
        marginTop: 3,
    },

    subText: {
        fontSize: 10,
        color: "#22A55A",
        fontWeight: "700",
        marginTop: 9,
    },

});

export default DashboardStats;
