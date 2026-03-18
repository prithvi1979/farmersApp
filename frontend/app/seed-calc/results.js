import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SeedResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse parameters
    const cropName = params.cropName || 'Selected Crop';
    const fieldArea = parseFloat(params.fieldArea) || 0;
    const areaUnit = params.areaUnit || 'Acre';
    const seedRate = parseFloat(params.seedRate) || 0; // kg per hectare
    const spacing = params.spacing || 'N/A';
    const depth = params.depth || 'N/A';

    // --- Calculations ---

    // Step 1: Convert all areas to Hectares for math
    let areaInHectares = fieldArea;
    if (areaUnit === 'Acre') {
        areaInHectares = fieldArea * 0.404686;
    } else if (areaUnit === 'Sq Meter') {
        areaInHectares = fieldArea / 10000;
    }

    // Step 2: Multiply by seed rate (kg/hectare)
    const requiredSeedKgRaw = areaInHectares * seedRate;

    // Safety check - if area was 0, return 0
    const requiredSeedKg = requiredSeedKgRaw > 0 ? requiredSeedKgRaw : 0;

    // Calculate bags (Assuming standard 50kg bags as asked)
    const totalBagsRaw = requiredSeedKg / 50;
    const totalBags = Math.ceil(totalBagsRaw); // Always round up so farmer doesn't run short

    // Formatting helper
    const formatNumber = (num) => Number.isInteger(num) ? num.toString() : num.toFixed(1);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seed Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Summary of Inputs */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Crop</Text>
                        <Text style={styles.summaryValue}>{cropName}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Area</Text>
                        <Text style={styles.summaryValue}>{fieldArea} {areaUnit}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Rate</Text>
                        <Text style={styles.summaryValue}>{seedRate} kg/ha</Text>
                    </View>
                </View>

                {/* 2. Total Seed Required (Hero Section) */}
                <View style={[styles.card, styles.heroCard]}>
                    <Text style={styles.heroTitle}>Seed Required</Text>
                    <View style={styles.heroResultRow}>
                        <MaterialCommunityIcons name="seed" size={40} color="#00C853" style={styles.heroIcon} />
                        <Text style={styles.heroNumber}>{formatNumber(requiredSeedKg)}</Text>
                        <Text style={styles.heroUnit}>kg</Text>
                    </View>
                    <Text style={styles.heroSubText}>
                        That's for <Text style={{ fontWeight: 'bold', color: '#111' }}>{formatNumber(areaInHectares)} Hectares</Text> total.
                    </Text>
                </View>

                {/* 3. Recommended Purchase */}
                <View style={[styles.card, styles.purchaseCard]}>
                    <View style={styles.purchaseIconBg}>
                        <MaterialCommunityIcons name="shopping-outline" size={28} color="#FF8F00" />
                    </View>
                    <View style={styles.purchaseContent}>
                        <Text style={styles.purchaseTitle}>Recommended Purchase</Text>
                        <Text style={styles.purchaseNumber}>{totalBags} bags</Text>
                        <Text style={styles.purchaseDesc}>(assuming standard 50 kg bags)</Text>
                    </View>
                </View>

                {/* 4. Planting Tips (Pro Tips) */}
                <Text style={styles.sectionTitle}>Planting Tips for {cropName}</Text>
                <View style={styles.tipsGrid}>
                    <View style={[styles.card, styles.tipCard]}>
                        <MaterialCommunityIcons name="format-line-spacing" size={28} color="#0288D1" style={styles.tipIcon} />
                        <Text style={styles.tipLabel}>Row Spacing</Text>
                        <Text style={styles.tipValue}>{spacing}</Text>
                    </View>
                    <View style={[styles.card, styles.tipCard]}>
                        <MaterialCommunityIcons name="arrow-down-thick" size={28} color="#795548" style={styles.tipIcon} />
                        <Text style={styles.tipLabel}>Planting Depth</Text>
                        <Text style={styles.tipValue}>{depth}</Text>
                    </View>
                </View>

                {/* Done Button */}
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => router.navigate('/(tabs)')}
                >
                    <Text style={styles.doneButtonText}>Finish & Return Home</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111',
    },
    dividerVertical: {
        width: 1,
        backgroundColor: '#eee',
        marginHorizontal: 8,
    },
    heroCard: {
        alignItems: 'center',
        backgroundColor: '#e8f5e9', // Light green
        borderWidth: 1,
        borderColor: '#c8e6c9',
        paddingVertical: 32,
    },
    heroTitle: {
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroResultRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
    },
    heroIcon: {
        marginRight: 12,
        alignSelf: 'center',
    },
    heroNumber: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#111',
    },
    heroUnit: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#555',
        marginLeft: 8,
    },
    heroSubText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
    purchaseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e1', // Light amber
        padding: 16,
        borderWidth: 1,
        borderColor: '#ffecb3',
    },
    purchaseIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ffe082',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    purchaseContent: {
        flex: 1,
    },
    purchaseTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F57C00',
        marginBottom: 4,
    },
    purchaseNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    purchaseDesc: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    tipsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tipCard: {
        width: '48%',
        alignItems: 'center',
        paddingVertical: 24,
    },
    tipIcon: {
        marginBottom: 12,
        opacity: 0.9,
    },
    tipLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    tipValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    doneButton: {
        backgroundColor: '#111',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
