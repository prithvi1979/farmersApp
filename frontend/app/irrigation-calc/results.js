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

export default function IrrigationResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse parameters
    const cropName = params.cropName || 'Selected Crop';
    const fieldArea = parseFloat(params.fieldArea) || 0;
    const areaUnit = params.areaUnit || 'Acre';
    const waterReq = parseFloat(params.waterReq) || 0; // mm
    const pumpRate = parseFloat(params.pumpRate) || 1; // Liters per hour
    const methodName = params.methodName || 'Flood';
    const methodFactor = parseFloat(params.methodFactor) || 1.0;

    // --- Calculations ---

    // Step 1: Convert all areas to Hectares for math
    let areaInHectares = fieldArea;
    if (areaUnit === 'Acre') {
        areaInHectares = fieldArea * 0.404686;
    } else if (areaUnit === 'Sq Meter') {
        areaInHectares = fieldArea / 10000;
    }

    // Step 2: Calculate Seasonal Water volume
    // 1 hectare = 10,000 sq meters. 1 mm of water over 1 sq meter = 1 liter.
    // So 1 hectare covered in 1 mm of water = 10,000 liters.
    // Multiply by the method factor (Drip uses less water than Flood)
    const seasonalWaterRaw = areaInHectares * waterReq * 10000 * methodFactor;
    const seasonalWaterLiters = seasonalWaterRaw > 0 ? seasonalWaterRaw : 0;

    // Step 3: Calculate Water PER Irrigation Stage
    // Assuming 5 standard growth stages for simplicity (Crown root, Tillering, Booting, Flowering, Grain filling)
    const STAGES = 5;
    const perStageWaterLiters = seasonalWaterLiters / STAGES;

    // Step 4: Calculate pump runtime PER STAGE
    const pumpRuntimeHoursRaw = perStageWaterLiters / pumpRate;
    const pumpRuntimeHours = pumpRuntimeHoursRaw > 0 ? pumpRuntimeHoursRaw : 0;

    // Daily Suggestion Logic (Splitting long runtimes into 5hr chunks)
    let dailySuggestion = null;
    if (pumpRuntimeHours > 5) {
        const days = Math.ceil(pumpRuntimeHours / 5);
        const hoursPerDay = (pumpRuntimeHours / days).toFixed(1);
        dailySuggestion = `${hoursPerDay} hours/day for ${days} days`;
    }

    // Formatting helper
    const formatNumber = (num) => {
        return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Irrigation Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Summary of Inputs */}
                <View style={[styles.card, styles.summaryCard]}>
                    <View style={styles.summaryItem}>
                        <MaterialCommunityIcons name="crop" size={20} color="#666" style={{ marginBottom: 4 }} />
                        <Text style={styles.summaryLabel}>Field</Text>
                        <Text style={styles.summaryValue}>{fieldArea} {areaUnit}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.summaryItem}>
                        <MaterialCommunityIcons name="waves" size={20} color="#666" style={{ marginBottom: 4 }} />
                        <Text style={styles.summaryLabel}>Target</Text>
                        <Text style={styles.summaryValue}>{waterReq} mm</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.summaryItem}>
                        <MaterialCommunityIcons name="water-pump" size={20} color="#666" style={{ marginBottom: 4 }} />
                        <Text style={styles.summaryLabel}>Pump</Text>
                        <Text style={styles.summaryValue}>{formatNumber(pumpRate)} L/h</Text>
                    </View>
                </View>

                {/* 2. Seasonal & Stage Water Needed */}
                <Text style={styles.sectionTitle}>Irrigation Water Requirements</Text>

                {/* Total Seasonal Box */}
                <View style={[styles.card, { padding: 16, marginBottom: 12, backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderWidth: 1 }]}>
                    <Text style={{ fontSize: 13, color: '#0369a1', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' }}>
                        Total Seasonal Water
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0c4a6e' }}>
                            {formatNumber(seasonalWaterLiters)}
                        </Text>
                        <Text style={{ fontSize: 16, color: '#0284c7', marginLeft: 6, fontWeight: '500' }}>
                            Liters
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#0284c7', marginTop: 4 }}>
                        Using {methodName} method
                    </Text>
                </View>

                {/* Per Stage Box (Hero) */}
                <View style={[styles.card, styles.heroCardWater]}>
                    <Text style={{ fontSize: 14, color: '#0277bd', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                        WATER PER IRRIGATION STAGE
                    </Text>
                    <View style={styles.heroRow}>
                        <MaterialCommunityIcons name="water" size={42} color="#0288D1" style={styles.heroIcon} />
                        <View>
                            <Text style={styles.heroNumberBlue}>{formatNumber(perStageWaterLiters)}</Text>
                            <Text style={styles.heroUnitBlue}>Liters</Text>
                        </View>
                    </View>
                    <Text style={styles.heroSubText}>
                        Apply this volume 5 times throughout the season.
                    </Text>
                </View>

                {/* 3. Pump Runtime (Hero Section) */}
                <Text style={styles.sectionTitle}>Pump Schedule</Text>
                <View style={[styles.card, styles.heroCardTime]}>
                    <Text style={styles.heroTitle}>Run Pump For</Text>
                    <View style={styles.heroResultRow}>
                        <MaterialCommunityIcons name="timer-outline" size={32} color="#F57C00" style={styles.heroIcon} />
                        <Text style={styles.heroNumberOrange}>{formatNumber(pumpRuntimeHours)}</Text>
                        <Text style={styles.heroUnitOrange}>Hours</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#d84315', marginTop: -8, marginBottom: 12, fontWeight: '500' }}>
                        PER IRRIGATION STAGE
                    </Text>

                    {/* Daily Suggestion Banner */}
                    {dailySuggestion && (
                        <View style={styles.dailySuggestionBox}>
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#F57C00" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.dailySuggestionLabel}>Daily irrigation suggestion:</Text>
                                <Text style={styles.dailySuggestionValue}>{dailySuggestion}</Text>
                            </View>
                        </View>
                    )}
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 12,
        marginTop: 4,
        letterSpacing: 0.2,
    },
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    dividerVertical: {
        width: 1,
        backgroundColor: '#eee',
        marginHorizontal: 4,
    },
    heroCardWater: {
        backgroundColor: '#e1f5fe', // Light blue
        borderWidth: 1,
        borderColor: '#b3e5fc',
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    heroIcon: {
        marginRight: 12,
    },
    heroNumberBlue: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#0288D1',
    },
    heroUnitBlue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0288D1',
        marginTop: -4,
    },
    heroSubText: {
        fontSize: 14,
        color: '#0277bd',
        textAlign: 'center',
        marginTop: 4,
    },
    heroCardTime: {
        backgroundColor: '#fff8e1', // Light amber
        borderWidth: 1,
        borderColor: '#ffecb3',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 16,
        color: '#F57C00',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroResultRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroNumberOrange: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#111',
    },
    heroUnitOrange: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F57C00',
        marginLeft: 8,
    },
    dailySuggestionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe082',
        padding: 12,
        borderRadius: 8,
        width: '100%',
    },
    dailySuggestionLabel: {
        fontSize: 13,
        color: '#d84315',
        marginBottom: 2,
    },
    dailySuggestionValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d84315',
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
