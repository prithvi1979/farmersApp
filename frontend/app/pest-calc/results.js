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

export default function PesticideResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse parameters
    const pestName = params.pestName || 'Selected Pesticide';
    const dose = parseFloat(params.dose) || 0; // Dose per liter
    const doseUnit = params.doseUnit || 'ml';
    const tankSize = parseFloat(params.tankSize) || 16;
    const fieldArea = parseFloat(params.fieldArea) || 1;
    const areaUnit = params.areaUnit || 'Acre';
    const sprayerCoverage = parseFloat(params.sprayerCoverage) || 0.1;

    // --- Calculations based on strict user logic ---

    // STEP 1 - Tanks Needed
    const tanksNeededRaw = fieldArea / sprayerCoverage;
    // We display the exact math but usually mix whole tanks:
    const tanksNeeded = Math.ceil(tanksNeededRaw);

    // STEP 2 - Pesticide per Tank
    const dosePerTank = tankSize * dose;

    // STEP 3 - Total Pesticide Required
    // Using rounded up tanks to ensure they have enough for the last partial tank if needed
    const totalPesticide = tanksNeeded * dosePerTank;

    // Formatting helper
    const formatNumber = (num) => Number.isInteger(num) ? num.toString() : num.toFixed(2);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mix & Spray Guide</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Section 1 — Spray Plan */}
                <View style={[styles.card, styles.planCard]}>
                    <Text style={styles.sectionTitle}>1. Spray Plan</Text>
                    <View style={styles.planGrid}>
                        <View style={styles.planItem}>
                            <Text style={styles.planLabel}>Area to spray</Text>
                            <Text style={styles.planValue}>{fieldArea} {areaUnit}</Text>
                        </View>
                        <View style={styles.planItem}>
                            <Text style={styles.planLabel}>Tank size</Text>
                            <Text style={styles.planValue}>{tankSize} L</Text>
                        </View>
                        <View style={styles.planItem}>
                            <Text style={styles.planLabel}>Coverage per tank</Text>
                            <Text style={styles.planValue}>{sprayerCoverage} {areaUnit}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalTanksRow}>
                        <Text style={styles.totalTanksLabel}>Total tanks required:</Text>
                        <Text style={styles.totalTanksValue}>{tanksNeeded}</Text>
                    </View>
                </View>

                {/* Section 2 — Mixing Instruction */}
                <View style={[styles.card, styles.primaryCard]}>
                    <Text style={styles.sectionTitle}>2. Mixing Instruction</Text>
                    <View style={styles.mixIconContainer}>
                        <MaterialCommunityIcons name="flask-outline" size={40} color="#00C853" />
                        <MaterialCommunityIcons name="plus" size={24} color="#888" style={{ marginHorizontal: 8 }} />
                        <MaterialCommunityIcons name="water-outline" size={40} color="#00C853" />
                    </View>
                    <Text style={styles.mixInstructionText}>
                        Mix <Text style={styles.highlightText}>{formatNumber(dosePerTank)} {doseUnit} {pestName}</Text> in each <Text style={styles.highlightText}>{tankSize}L</Text> tank water.
                    </Text>
                </View>

                {/* Section 3 — Total Pesticide Needed */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>3. Total Pesticide Needed</Text>
                    <View style={styles.totalPestRow}>
                        <MaterialCommunityIcons name="bottle-tonic-outline" size={32} color="#111" />
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.totalPestLabel}>Total required:</Text>
                            <Text style={styles.totalPestValue}>{formatNumber(totalPesticide)} {doseUnit}</Text>
                        </View>
                    </View>

                    {/* Optional Bonus Info */}
                    <View style={styles.buySuggestion}>
                        <MaterialCommunityIcons name="shopping-outline" size={20} color="#0288D1" />
                        <Text style={styles.buySuggestionText}>
                            Buy at least: <Text style={{ fontWeight: 'bold' }}>{totalPesticide > 100 ? Math.ceil(totalPesticide / 100) * 100 : Math.ceil(totalPesticide / 50) * 50} {doseUnit}</Text> bottle.
                        </Text>
                    </View>
                </View>

                {/* Section 4 — Safety Instructions */}
                <Text style={[styles.sectionTitle, { marginLeft: 4, marginTop: 8 }]}>4. Safety Instructions</Text>
                <View style={styles.safetyGrid}>
                    <SafetyItem icon="weather-sunset-up" text="Spray in morning or evening" />
                    <SafetyItem icon="account-hard-hat" text="Wear gloves and mask" />
                    <SafetyItem icon="weather-pouring" text="Do not spray during rain" color="#D32F2F" />
                    <SafetyItem icon="dog" text="Keep away from animals" />
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

const SafetyItem = ({ icon, text, color = "#F57C00" }) => (
    <View style={styles.safetyItem}>
        <View style={[styles.safetyIconBg, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.safetyText}>{text}</Text>
    </View>
);

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
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
        letterSpacing: 0.2,
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
    planCard: {
        borderTopWidth: 4,
        borderTopColor: '#0288D1', // Blue accent
    },
    planGrid: {
        marginBottom: 16,
    },
    planItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    planLabel: {
        fontSize: 15,
        color: '#666',
    },
    planValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 16,
    },
    totalTanksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    totalTanksLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalTanksValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0288D1',
    },
    primaryCard: {
        backgroundColor: '#e8f5e9',
        borderWidth: 1,
        borderColor: '#c8e6c9',
        alignItems: 'center',
    },
    mixIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 32,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mixInstructionText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        lineHeight: 26,
    },
    highlightText: {
        fontWeight: 'bold',
        color: '#2E7D32',
        fontSize: 20,
    },
    totalPestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalPestLabel: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    totalPestValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    buySuggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e1f5fe',
        padding: 12,
        borderRadius: 8,
    },
    buySuggestionText: {
        fontSize: 14,
        color: '#0277bd',
        marginLeft: 8,
    },
    safetyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    safetyItem: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    safetyIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    safetyText: {
        fontSize: 13,
        color: '#444',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '500',
    },
    doneButton: {
        backgroundColor: '#111',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
