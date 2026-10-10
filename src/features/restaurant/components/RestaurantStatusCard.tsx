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

interface RestaurantStatusCardProps {
    restaurantName?: string;
    location?: string;
    isOpen: boolean;
    onToggle: () => void;
}


// =====================================================
// COMPONENT
// =====================================================

const RestaurantStatusCard: React.FC<
    RestaurantStatusCardProps
> = ({
    restaurantName = "Your Restaurant",
    location = "SRM AP • Neerukonda",
    isOpen,
    onToggle,
}) => {

    return (
        <View style={styles.card}>

            {/* =========================================
                RESTAURANT INFORMATION
            ========================================= */}

            <View style={styles.topRow}>

                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>
                        🍽️
                    </Text>
                </View>


                <View style={styles.infoContainer}>

                    <Text
                        style={styles.restaurantName}
                        numberOfLines={1}
                    >
                        {restaurantName}
                    </Text>

                    <Text
                        style={styles.location}
                        numberOfLines={1}
                    >
                        {location}
                    </Text>

                </View>


                {/* STATUS */}

                <View
                    style={[
                        styles.statusPill,
                        isOpen
                            ? styles.openPill
                            : styles.closedPill,
                    ]}
                >

                    <View
                        style={[
                            styles.statusDot,
                            isOpen
                                ? styles.openDot
                                : styles.closedDot,
                        ]}
                    />

                    <Text style={styles.statusText}>
                        {isOpen ? "Open" : "Closed"}
                    </Text>

                </View>

            </View>


            {/* =========================================
                DIVIDER
            ========================================= */}

            <View style={styles.divider} />


            {/* =========================================
                STATUS CONTROL
            ========================================= */}

            <View style={styles.bottomRow}>

                <View style={styles.statusInfo}>

                    <Text style={styles.label}>
                        Restaurant status
                    </Text>

                    <Text style={styles.description}>
                        {isOpen
                            ? "Currently accepting orders"
                            : "Orders are currently paused"}
                    </Text>

                </View>


                {/* =====================================
                    TOGGLE
                ===================================== */}

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onToggle}
                    accessibilityRole="switch"
                    accessibilityState={{
                        checked: isOpen,
                    }}
                    style={[
                        styles.toggle,
                        isOpen
                            ? styles.toggleOn
                            : styles.toggleOff,
                    ]}
                >

                    <View
                        style={[
                            styles.toggleCircle,
                            isOpen
                                ? styles.circleOn
                                : styles.circleOff,
                        ]}
                    />

                </TouchableOpacity>

            </View>

        </View>
    );
};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    card: {
        backgroundColor: "#17171B",
        borderRadius: 24,
        padding: 18,
        marginBottom: 28,
    },


    // ================================================
    // TOP ROW
    // ================================================

    topRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    logoContainer: {
        width: 52,
        height: 52,
        borderRadius: 17,
        backgroundColor: "#2A2A30",
        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        fontSize: 24,
    },

    infoContainer: {
        flex: 1,
        marginLeft: 13,
        marginRight: 8,
    },

    restaurantName: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "800",
    },

    location: {
        color: "#96969F",
        fontSize: 12,
        marginTop: 4,
    },


    // ================================================
    // STATUS PILL
    // ================================================

    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
    },

    openPill: {
        backgroundColor: "#173523",
    },

    closedPill: {
        backgroundColor: "#3A2020",
    },

    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 5,
    },

    openDot: {
        backgroundColor: "#22C55E",
    },

    closedDot: {
        backgroundColor: "#EF4444",
    },

    statusText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },


    // ================================================
    // DIVIDER
    // ================================================

    divider: {
        height: 1,
        backgroundColor: "#2A2A30",
        marginVertical: 17,
    },


    // ================================================
    // BOTTOM ROW
    // ================================================

    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    statusInfo: {
        flex: 1,
        marginRight: 15,
    },

    label: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },

    description: {
        color: "#85858E",
        fontSize: 11,
        marginTop: 4,
    },


    // ================================================
    // TOGGLE
    // ================================================

    toggle: {
        width: 50,
        height: 29,
        borderRadius: 20,
        padding: 3,
        justifyContent: "center",
    },

    toggleOn: {
        backgroundColor: "#FF7A00",
    },

    toggleOff: {
        backgroundColor: "#3A3A40",
    },

    toggleCircle: {
        width: 23,
        height: 23,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },

    circleOn: {
        alignSelf: "flex-end",
    },

    circleOff: {
        alignSelf: "flex-start",
    },

});


export default RestaurantStatusCard;
