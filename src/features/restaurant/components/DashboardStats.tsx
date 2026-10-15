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
            <View style={styles.card}>
                <Text style={styles.value}>
                    {orders}
                </Text>
                <Text style={styles.label}>
                    Orders today
                </Text>
            </View>

            <View style={styles.card}>
                <Text
                    style={styles.value}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    ₹{revenue.toLocaleString("en-IN")}
                </Text>
                <Text style={styles.label}>
                    Revenue today
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.value} numberOfLines={1}>
                    {rating.toFixed(1)} ★
                </Text>
                <Text style={styles.label}>
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
        gap: 8,
        marginBottom: 20,
    },

    card: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 11,
        minHeight: 76,
        justifyContent: "center",
    },

    // ================================================
    // TEXT
    // ================================================

    value: {
        fontSize: 16,
        fontWeight: "800",
        color: "#17171B",
    },

    label: {
        fontSize: 11,
        color: "#8C8C95",
        marginTop: 3,
    },

});

export default DashboardStats;
