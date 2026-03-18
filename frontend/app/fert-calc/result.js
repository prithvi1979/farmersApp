import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { crops, fertilizers } from './data';

export default function FertCalcResultScreen() {
    const router = useRouter();
    const { cropId = 'rice', area = '1', unit = 'Acre', selectedFertilizers = '' } = useLocalSearchParams();

    const crop = crops.find(c => c.id === cropId) || crops[0];
    const numArea = parseFloat(area) || 1;

    let areaInHa = numArea;
    if (unit === 'Acre') areaInHa = numArea * 0.404686;
    else if (unit === 'Sq.m') areaInHa = numArea / 10000;

    const req_N = crop.recommended.N * areaInHa;
    const req_P = crop.recommended.P * areaInHa;
    const req_K = crop.recommended.K * areaInHa;

    // Use fertilizer data from JSON
    const dap_needed_kg = (req_P / fertilizers.dap.P) * 100;
    const n_from_dap = dap_needed_kg * (fertilizers.dap.N / 100);

    const mop_needed_kg = (req_K / fertilizers.mop.K) * 100;

    const remaining_N = req_N - n_from_dap;
    const urea_needed_kg = remaining_N > 0 ? (remaining_N / fertilizers.urea.N) * 100 : 0;

    const dapBags = Math.ceil(dap_needed_kg / fertilizers.dap.bagSizeKg) || 0;
    const mopBags = Math.ceil(mop_needed_kg / fertilizers.mop.bagSizeKg) || 0;
    const ureaBags = Math.ceil(urea_needed_kg / fertilizers.urea.bagSizeKg) || 0;
    const totalBags = dapBags + mopBags + ureaBags;

    // Helper to format weights: switch to grams for tiny amounts (< 1.0kg)
    const formatWeight = (kgValue) => {
        if (kgValue === 0) return '0 kg';
        if (kgValue < 1) {
            return `${Math.round(kgValue * 1000)} g`;
        }
        return `${kgValue.toFixed(1)} kg`;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calculation Result</Text>
                <View style={{ width: 24 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Intro Section */}
                <View style={styles.introContainer}>
                    <MaterialCommunityIcons name="check-decagram" size={48} color="#00C853" style={{ marginBottom: 8 }} />
                    <Text style={styles.introTitle}>Analysis Complete!</Text>
                    <Text style={styles.introSubtitle}>Based on your inputs, here is your farm's custom fertilizer plan.</Text>
                </View>

                {/* Section 1: Nutrient Requirement */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="molecule" size={24} color="#00C853" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Section 1: Nutrient Requirement</Text>
                    </View>
                    <Text style={styles.sectionContext}>For {numArea} {unit} {crop.name}:</Text>

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Nitrogen required</Text>
                        <Text style={styles.dataValue}>{formatWeight(req_N)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Phosphorus required</Text>
                        <Text style={styles.dataValue}>{formatWeight(req_P)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Potassium required</Text>
                        <Text style={styles.dataValue}>{formatWeight(req_K)}</Text>
                    </View>
                </View>

                {/* Section 2: Fertilizer Quantity */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="sack-outline" size={24} color="#FF9800" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Section 2: Fertilizer Quantity</Text>
                    </View>

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Urea needed</Text>
                        <Text style={styles.dataValue}>{formatWeight(urea_needed_kg)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>DAP needed</Text>
                        <Text style={styles.dataValue}>{formatWeight(dap_needed_kg)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>MOP needed</Text>
                        <Text style={styles.dataValue}>{formatWeight(mop_needed_kg)}</Text>
                    </View>

                    <Text style={styles.subHeading}>Number of Bags Needed:</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.bagBadge}>
                            <Text style={styles.bagBadgeLabel}>Urea (45kg)</Text>
                            <Text style={styles.bagBadgeValue}>{ureaBags} bags</Text>
                        </View>
                        <View style={styles.bagBadge}>
                            <Text style={styles.bagBadgeLabel}>DAP (50kg)</Text>
                            <Text style={styles.bagBadgeValue}>{dapBags} bags</Text>
                        </View>
                        <View style={styles.bagBadge}>
                            <Text style={styles.bagBadgeLabel}>MOP (50kg)</Text>
                            <Text style={styles.bagBadgeValue}>{mopBags} bags</Text>
                        </View>
                    </View>
                </View>

                {/* Section 3: Application Schedule */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="calendar-clock" size={24} color="#2196F3" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Section 3: Application Schedule</Text>
                    </View>

                    <View style={styles.timelineContainer}>
                        {/* Timeline Item 1 */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineLine} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineStage}>Basal</Text>
                                <Text style={styles.timelineDesc}>(at planting)</Text>
                            </View>
                            <Text style={styles.timelineValue}>50%</Text>
                        </View>

                        {/* Timeline Item 2 */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineLine} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineStage}>Tillering</Text>
                            </View>
                            <Text style={styles.timelineValue}>25%</Text>
                        </View>

                        {/* Timeline Item 3 */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, styles.timelineDotLast]} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineStage}>Flowering</Text>
                            </View>
                            <Text style={styles.timelineValue}>25%</Text>
                        </View>
                    </View>
                </View>

                {/* Section 4: Safety Notes */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#E53935" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Section 4: Safety Notes</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <MaterialCommunityIcons name="circle-small" size={24} color="#E53935" />
                        <Text style={styles.bulletText}>Do not apply before rain</Text>
                    </View>
                    <View style={styles.bulletRow}>
                        <MaterialCommunityIcons name="circle-small" size={24} color="#E53935" />
                        <Text style={styles.bulletText}>Irrigate after broadcasting</Text>
                    </View>
                    <View style={styles.bulletRow}>
                        <MaterialCommunityIcons name="circle-small" size={24} color="#E53935" />
                        <Text style={styles.bulletText}>Avoid contact with leaves (if granular)</Text>
                    </View>
                </View>

                {/* Cost Estimation */}
                <View style={styles.costCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="currency-inr" size={24} color="#4CAF50" style={styles.cardIcon} />
                        <Text style={styles.cardTitle}>Cost Estimation</Text>
                    </View>

                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Total Bags Needed</Text>
                        <Text style={styles.dataValue}>{totalBags} Bags</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Price per Bag (Avg)</Text>
                        <Text style={styles.dataValue}>₹ ?</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: '#c8e6c9', height: 2 }]} />
                    <View style={styles.dataRow}>
                        <Text style={styles.totalLabel}>Estimated Total Cost</Text>
                        <Text style={styles.totalValue}>₹ ?</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => router.replace('/')}
                >
                    <Text style={styles.doneButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
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
    introContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    introSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    costCard: {
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
    },
    sectionContext: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    dataLabel: {
        fontSize: 15,
        color: '#555',
        fontWeight: '500',
    },
    dataValue: {
        fontSize: 16,
        color: '#111',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    subHeading: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    bagBadge: {
        flex: 1,
        backgroundColor: '#fff3e0',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffe0b2',
    },
    bagBadgeLabel: {
        fontSize: 12,
        color: '#F57C00',
        fontWeight: '600',
        marginBottom: 4,
    },
    bagBadgeValue: {
        fontSize: 15,
        color: '#E65100',
        fontWeight: 'bold',
    },
    timelineContainer: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        position: 'relative',
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#2196F3',
        marginRight: 16,
        marginTop: 4,
        zIndex: 2,
    },
    timelineDotLast: {
        backgroundColor: '#00C853',
    },
    timelineLine: {
        position: 'absolute',
        top: 20,
        left: 7,
        width: 2,
        height: 48,
        backgroundColor: '#e0e0e0',
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
    },
    timelineStage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    timelineDesc: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    timelineValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
        marginLeft: -4,
        marginTop: 1,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    bottomBar: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: Platform.OS === 'android' ? 32 : Platform.OS === 'ios' ? 32 : 16,
    },
    doneButton: {
        backgroundColor: '#4a4a4a',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
