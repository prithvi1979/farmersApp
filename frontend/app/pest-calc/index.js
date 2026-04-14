import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CropAutofillInput from '../../components/CropAutofillInput';

const PESTICIDES = {
    imidacloprid: { name: 'Imidacloprid', type: 'insecticide', dose_per_liter: 0.5, unit: 'ml' },
    chlorpyrifos: { name: 'Chlorpyrifos', type: 'insecticide', dose_per_liter: 2, unit: 'ml' },
    mancozeb: { name: 'Mancozeb', type: 'fungicide', dose_per_liter: 2, unit: 'g' },
    lambda_cyhalothrin: { name: 'Lambda Cyhalothrin', type: 'insecticide', dose_per_liter: 0.5, unit: 'ml' },
    neem_oil: { name: 'Neem Oil', type: 'organic', dose_per_liter: 5, unit: 'ml' }
};

const PROBLEMS = ['Aphids', 'Leaf spot', 'Stem borer', 'Whitefly'];
const TANK_SIZES = ['15', '16', '20'];
const AREA_UNITS = ['Acre', 'Hectare', 'Sq Meter'];

export default function PesticideCalculatorScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Form State
    const [selectedCropName, setSelectedCropName] = useState('');
    const [selectedProblem, setSelectedProblem] = useState('');

    // Pesticide specific state
    const [selectedPesticide, setSelectedPesticide] = useState(null);
    const [pesticideModalVisible, setPesticideModalVisible] = useState(false);

    // Numeric inputs
    const [tankSize, setTankSize] = useState('16');
    const [fieldArea, setFieldArea] = useState('1');
    const [areaUnit, setAreaUnit] = useState('Acre');
    const [sprayerCoverage, setSprayerCoverage] = useState('0.1');

    const handleCalculate = () => {
        if (!selectedPesticide || !fieldArea || !sprayerCoverage) {
            // Minimal validation before proceeding
            return;
        }

        // Pass parameters to results screen
        router.push({
            pathname: '/pest-calc/results',
            params: {
                cropName: selectedCropName,
                pestName: PESTICIDES[selectedPesticide].name,
                dose: PESTICIDES[selectedPesticide].dose_per_liter,
                doseUnit: PESTICIDES[selectedPesticide].unit,
                tankSize,
                fieldArea,
                areaUnit,
                sprayerCoverage
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pesticide Calculator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 40, 60) }]} showsVerticalScrollIndicator={false}>

                {/* 1. Crop Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Select Crop</Text>
                    <CropAutofillInput
                        placeholder="Type to search e.g. Rice"
                        accentColor="#00C853"
                        onSelect={(crop) => setSelectedCropName(crop.name)}
                        onCustom={(name) => setSelectedCropName(name)}
                        onClear={() => setSelectedCropName('')}
                    />
                </View>

                {/* 2. Problem Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Target Problem <Text style={styles.optionalText}>(Optional)</Text></Text>
                    <View style={styles.wrapContainer}>
                        {PROBLEMS.map((prob) => (
                            <TouchableOpacity
                                key={prob}
                                style={[styles.wrapChip, selectedProblem === prob && styles.chipActive]}
                                onPress={() => setSelectedProblem(prob === selectedProblem ? '' : prob)}
                            >
                                <Text style={[styles.chipText, selectedProblem === prob && styles.chipTextActive]}>
                                    {prob}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 3. Pesticide Selection */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>3. Select Pesticide</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setPesticideModalVisible(true)}
                    >
                        <Text style={[styles.dropdownText, !selectedPesticide && { color: '#888' }]}>
                            {selectedPesticide ? PESTICIDES[selectedPesticide].name : 'Choose a pesticide...'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={24} color="#555" />
                    </TouchableOpacity>
                    {selectedPesticide && (
                        <View style={styles.doseInfoContainer}>
                            <MaterialCommunityIcons name="information-outline" size={16} color="#00C853" />
                            <Text style={styles.doseInfoText}>
                                Recommended: <Text style={{ fontWeight: 'bold' }}>{PESTICIDES[selectedPesticide].dose_per_liter} {PESTICIDES[selectedPesticide].unit}</Text> per liter
                            </Text>
                        </View>
                    )}
                </View>

                {/* 4. Equipment & Area Setup */}
                <View style={[styles.section, styles.card]}>
                    <Text style={styles.sectionTitle}>4. Equipment & Field Details</Text>

                    {/* Tank Size */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Sprayer Tank Size (Liters)</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                                keyboardType="numeric"
                                value={tankSize}
                                onChangeText={setTankSize}
                                placeholder="e.g. 16"
                            />
                            {TANK_SIZES.map(size => (
                                <TouchableOpacity
                                    key={size}
                                    style={[styles.smallChip, tankSize === size && styles.chipActive]}
                                    onPress={() => setTankSize(size)}
                                >
                                    <Text style={[styles.chipText, tankSize === size && styles.chipTextActive]}>{size}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Field Area */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Area to Spray</Text>
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

                    {/* Sprayer Coverage */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>One Full Tank Covers ({areaUnit}s)</Text>
                        <Text style={styles.helperText}>Typical 16L knapsack covers ~0.1 acre.</Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={sprayerCoverage}
                            onChangeText={setSprayerCoverage}
                            placeholder="e.g. 0.1"
                        />
                    </View>
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    style={[styles.calculateButton, (!selectedPesticide || !fieldArea) && styles.calculateButtonDisabled]}
                    onPress={handleCalculate}
                    disabled={!selectedPesticide || !fieldArea}
                >
                    <Text style={styles.calculateButtonText}>Calculate Mix</Text>
                    <MaterialCommunityIcons name="calculator-variant-outline" size={24} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

            </ScrollView>

            {/* Pesticide Selection Modal */}
            <Modal
                visible={pesticideModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setPesticideModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Pesticide</Text>
                            <TouchableOpacity onPress={() => setPesticideModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#111" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {Object.entries(PESTICIDES).map(([key, pest]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setSelectedPesticide(key);
                                        setPesticideModalVisible(false);
                                    }}
                                >
                                    <View>
                                        <Text style={styles.modalOptionTitle}>{pest.name}</Text>
                                        <Text style={styles.modalOptionDesc}>Dose: {pest.dose_per_liter} {pest.unit} / Liter</Text>
                                    </View>
                                    {selectedPesticide === key && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#00C853" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 12,
    },
    optionalText: {
        fontSize: 13,
        fontWeight: 'normal',
        color: '#888',
    },
    horizontalScroll: {
        paddingRight: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
    },
    wrapContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    wrapChip: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chipActive: {
        backgroundColor: '#00C853',
        borderColor: '#00C853',
    },
    chipText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#fff',
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fafafa',
    },
    dropdownText: {
        fontSize: 15,
        color: '#111',
    },
    doseInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    doseInfoText: {
        fontSize: 13,
        color: '#2E7D32',
        marginLeft: 6,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    helperText: {
        fontSize: 12,
        color: '#777',
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
        paddingVertical: 12,
        fontSize: 15,
        backgroundColor: '#fafafa',
        color: '#111',
    },
    smallChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 8,
    },
    unitSelector: {
        flexDirection: 'row',
    },
    unitButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRightWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 12,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    modalOptionDesc: {
        fontSize: 13,
        color: '#666',
    }
});
