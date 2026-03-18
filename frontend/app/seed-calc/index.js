import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Seed Info Data (seed rates in kg per hectare)
const CROPS = [
    { id: 'wheat', name: 'Wheat', icon: 'barley', defaultRate: 100, spacing: '20-22 cm', depth: '4-5 cm' },
    { id: 'rice', name: 'Rice', icon: 'rice', defaultRate: 25, spacing: '20-25 cm', depth: '2-3 cm' },
    { id: 'corn', name: 'Corn', icon: 'corn', defaultRate: 20, spacing: '60-70 cm', depth: '4-6 cm' },
    { id: 'soybean', name: 'Soybean', icon: 'seed-outline', defaultRate: 65, spacing: '45-60 cm', depth: '3-4 cm' },
    { id: 'cotton', name: 'Cotton', icon: 'cannabis', defaultRate: 15, spacing: '90-100 cm', depth: '3-5 cm' },
];

const AREA_UNITS = ['Acre', 'Hectare', 'Sq Meter'];

export default function SeedCalculatorScreen() {
    const router = useRouter();

    // Form State
    const [selectedCrop, setSelectedCrop] = useState(CROPS[0]); // Default to Wheat

    // Numeric inputs
    const [fieldArea, setFieldArea] = useState('2');
    const [areaUnit, setAreaUnit] = useState('Acre');

    // Seed rate is initially populated by the crop selection but editable
    const [manualSeedRate, setManualSeedRate] = useState(CROPS[0].defaultRate.toString());

    // Update seed rate when a new crop is selected
    const handleCropSelect = (crop) => {
        setSelectedCrop(crop);
        setManualSeedRate(crop.defaultRate.toString());
    };

    const handleCalculate = () => {
        if (!fieldArea || !manualSeedRate) return;

        router.push({
            pathname: '/seed-calc/results',
            params: {
                cropId: selectedCrop.id,
                cropName: selectedCrop.name,
                fieldArea,
                areaUnit,
                seedRate: manualSeedRate,
                spacing: selectedCrop.spacing,
                depth: selectedCrop.depth
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seed Rate Calculator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Crop Selection */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>1. Select Crop</Text>
                    <View style={styles.cropGrid}>
                        {CROPS.map((crop) => (
                            <TouchableOpacity
                                key={crop.id}
                                style={[styles.cropCard, selectedCrop.id === crop.id && styles.cropCardActive]}
                                onPress={() => handleCropSelect(crop)}
                            >
                                <View style={[styles.iconBg, selectedCrop.id === crop.id && styles.iconBgActive]}>
                                    <MaterialCommunityIcons
                                        name={crop.icon}
                                        size={28}
                                        color={selectedCrop.id === crop.id ? "#fff" : "#00C853"}
                                    />
                                </View>
                                <Text style={[styles.cropText, selectedCrop.id === crop.id && styles.cropTextActive]}>
                                    {crop.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 2. Field Area */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>2. Field Area</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Total planting area</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                                keyboardType="numeric"
                                value={fieldArea}
                                onChangeText={setFieldArea}
                                placeholder="e.g. 2"
                            />
                            <View style={styles.unitSelector}>
                                {AREA_UNITS.map((unit, idx) => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[
                                            styles.unitButton,
                                            areaUnit === unit && styles.unitButtonActive,
                                            idx === 0 && { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
                                            idx === AREA_UNITS.length - 1 && { borderTopRightRadius: 8, borderBottomRightRadius: 8, borderRightWidth: 1 }
                                        ]}
                                        onPress={() => setAreaUnit(unit)}
                                    >
                                        <Text style={[styles.unitText, areaUnit === unit && styles.unitTextActive]}>{unit}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* 3. Expected Seed Rate */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>3. Expected Seed Rate</Text>
                    <Text style={styles.helperText}>
                        Standard recommended rate for <Text style={{ fontWeight: 'bold', color: '#111' }}>{selectedCrop.name}</Text>. You can edit this if your soil type or planting method requires a different density.
                    </Text>

                    <View style={styles.rateInputContainer}>
                        <TextInput
                            style={styles.rateInput}
                            keyboardType="numeric"
                            value={manualSeedRate}
                            onChangeText={setManualSeedRate}
                            placeholder="e.g. 100"
                        />
                        <View style={styles.rateUnitContainer}>
                            <Text style={styles.rateUnitText}>kg / hectare</Text>
                        </View>
                    </View>
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    style={[styles.calculateButton, (!fieldArea || !manualSeedRate) && styles.calculateButtonDisabled]}
                    onPress={handleCalculate}
                    disabled={!fieldArea || !manualSeedRate}
                >
                    <Text style={styles.calculateButtonText}>Calculate Seed Needed</Text>
                    <MaterialCommunityIcons name="calculator-variant-outline" size={24} color="#fff" style={{ marginLeft: 8 }} />
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
    section: {
        marginBottom: 20,
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
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
    },
    cropGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cropCard: {
        width: '31%',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    cropCardActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#00C853',
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBgActive: {
        backgroundColor: '#00C853',
    },
    cropText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },
    cropTextActive: {
        color: '#111',
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#fafafa',
        color: '#111',
        fontWeight: 'bold',
    },
    unitSelector: {
        flexDirection: 'row',
    },
    unitButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRightWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: '#fafafa',
    },
    unitButtonActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#00C853',
    },
    unitText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },
    unitTextActive: {
        color: '#00C853',
        fontWeight: 'bold',
    },
    helperText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    rateInputContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderWidth: 2,
        borderColor: '#e8f5e9', // Subtle green border by default
        borderRadius: 12,
        overflow: 'hidden',
    },
    rateInput: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        backgroundColor: '#fafafa',
    },
    rateUnitContainer: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateUnitText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    calculateButton: {
        backgroundColor: '#00C853',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    calculateButtonDisabled: {
        backgroundColor: '#A5D6A7',
        shadowOpacity: 0,
        elevation: 0,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
