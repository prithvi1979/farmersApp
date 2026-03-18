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

// Accurate Crop Water Database (Seasonal mm)
const CROPS = [
    { id: 'rice', name: 'Rice', icon: 'rice', water_mm: 1200 },
    { id: 'wheat', name: 'Wheat', icon: 'barley', water_mm: 500 },
    { id: 'maize', name: 'Maize', icon: 'corn', water_mm: 600 },
    { id: 'cotton', name: 'Cotton', icon: 'cannabis', water_mm: 900 },
    { id: 'tomato', name: 'Tomato', icon: 'food-apple', water_mm: 500 },
    { id: 'potato', name: 'Potato', icon: 'food-croissant', water_mm: 600 },
    { id: 'onion', name: 'Onion', icon: 'onion', water_mm: 450 },
];

const AREA_UNITS = ['Acre', 'Hectare', 'Sq Meter'];
const IRRIGATION_METHODS = [
    { id: 'flood', name: 'Flood', factor: 1.0 },
    { id: 'sprinkler', name: 'Sprinkler', factor: 0.75 },
    { id: 'drip', name: 'Drip', factor: 0.5 },
];

export default function IrrigationCalculatorScreen() {
    const router = useRouter();

    // Form State
    const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);

    // Field Area
    const [fieldArea, setFieldArea] = useState('1');
    const [areaUnit, setAreaUnit] = useState('Hectare');

    // Water requirement depth (mm)
    const [waterReq, setWaterReq] = useState(CROPS[0].water_mm.toString());

    // Irrigation Method
    const [selectedMethod, setSelectedMethod] = useState(IRRIGATION_METHODS[0]);

    // Pump Flow Rate (L/hr)
    const [pumpRate, setPumpRate] = useState('20000');

    // Update water req when a new crop is selected
    const handleCropSelect = (crop) => {
        setSelectedCrop(crop);
        setWaterReq(crop.water_mm.toString());
    };

    const handleCalculate = () => {
        if (!fieldArea || !waterReq || !pumpRate) return;

        router.push({
            pathname: '/irrigation-calc/results',
            params: {
                cropName: selectedCrop.name,
                fieldArea,
                areaUnit,
                waterReq,
                methodName: selectedMethod.name,
                methodFactor: selectedMethod.factor,
                pumpRate
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Irrigation Calculator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Crop Selection */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>1. Target Crop</Text>
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
                                        color={selectedCrop.id === crop.id ? "#fff" : "#0288D1"}
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
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                                keyboardType="numeric"
                                value={fieldArea}
                                onChangeText={setFieldArea}
                                placeholder="e.g. 1"
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

                {/* 3. Water Requirement */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>3. Water Requirement Depth</Text>
                    <Text style={styles.helperText}>
                        Default depth needed per cycle for <Text style={{ fontWeight: 'bold', color: '#111' }}>{selectedCrop.name}</Text>. You can adjust this based on local soil moisture.
                    </Text>

                    <View style={styles.rateInputContainer}>
                        <TextInput
                            style={styles.rateInput}
                            keyboardType="numeric"
                            value={waterReq}
                            onChangeText={setWaterReq}
                            placeholder="e.g. 50"
                        />
                        <View style={styles.rateUnitContainer}>
                            <Text style={styles.rateUnitText}>mm</Text>
                        </View>
                    </View>
                </View>

                {/* 5. Pump Specifications */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>5. Pump Capacity</Text>
                    <Text style={styles.helperText}>
                        What is the flow rate of your main water pump?
                    </Text>

                    <View style={[styles.rateInputContainer, { borderColor: '#e1f5fe' }]}>
                        <TextInput
                            style={styles.rateInput}
                            keyboardType="numeric"
                            value={pumpRate}
                            onChangeText={setPumpRate}
                            placeholder="e.g. 20000"
                        />
                        <View style={[styles.rateUnitContainer, { backgroundColor: '#e1f5fe' }]}>
                            <Text style={[styles.rateUnitText, { color: '#0277bd' }]}>Liters / hour</Text>
                        </View>
                    </View>
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    style={[styles.calculateButton, (!fieldArea || !waterReq || !pumpRate) && styles.calculateButtonDisabled]}
                    onPress={handleCalculate}
                    disabled={!fieldArea || !waterReq || !pumpRate}
                >
                    <Text style={styles.calculateButtonText}>Calculate Runtime</Text>
                    <MaterialCommunityIcons name="water-pump" size={24} color="#fff" style={{ marginLeft: 8 }} />
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
        backgroundColor: '#e1f5fe', // Light blue selection
        borderColor: '#0288D1',
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e1f5fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBgActive: {
        backgroundColor: '#0288D1',
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
        // marginBottom: 8,
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
        backgroundColor: '#e1f5fe',
        borderColor: '#0288D1',
    },
    unitText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },
    unitTextActive: {
        color: '#0288D1',
        fontWeight: 'bold',
    },
    helperText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    methodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    methodButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#fafafa',
    },
    methodButtonActive: {
        borderColor: '#0288D1',
        backgroundColor: '#e1f5fe',
    },
    methodText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    methodTextActive: {
        color: '#0288D1',
        fontWeight: 'bold',
    },
    rateInputContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderWidth: 2,
        borderColor: '#e1f5fe', // Subtle blue border
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
        backgroundColor: '#e1f5fe', // Light blue unit
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateUnitText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0277bd',
    },
    calculateButton: {
        backgroundColor: '#0288D1', // Primary Blue
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#0288D1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    calculateButtonDisabled: {
        backgroundColor: '#81d4fa',
        shadowOpacity: 0,
        elevation: 0,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
