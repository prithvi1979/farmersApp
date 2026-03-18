import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Helper component for Nutrient selection
const NutrientSelector = ({ label, value, onChange }) => {
    return (
        <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>{label}</Text>
            <View style={styles.nutrientOptions}>
                {['Low', 'Medium', 'High'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[
                            styles.nutrientLevelBtn,
                            value === level && styles.nutrientLevelBtnActive,
                            value === level && level === 'Low' && { backgroundColor: '#FFCC80', borderColor: '#FB1' },
                            value === level && level === 'Medium' && { backgroundColor: '#FFF59D', borderColor: '#FDD835' },
                            value === level && level === 'High' && { backgroundColor: '#A5D6A7', borderColor: '#4CAF50' },
                        ]}
                        onPress={() => onChange(level)}
                    >
                        <Text style={[
                            styles.nutrientLevelText,
                            value === level && styles.nutrientLevelTextActive
                        ]}>
                            {level}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default function FertCalcStep2Screen() {
    const router = useRouter();
    const { cropId, area, unit } = useLocalSearchParams();

    // Soil Fertility state
    const [nitrogen, setNitrogen] = useState('');
    const [phosphorus, setPhosphorus] = useState('');
    const [potassium, setPotassium] = useState('');

    // Fertilizer Type multi-select state
    const [selectedFertilizers, setSelectedFertilizers] = useState([]);

    // Optional Cost Input state
    const [showCost, setShowCost] = useState(false);
    const [bagWeight, setBagWeight] = useState('50'); // default 50kg
    const [pricePerBag, setPricePerBag] = useState('');

    const toggleFertilizer = (id) => {
        if (selectedFertilizers.includes(id)) {
            setSelectedFertilizers(selectedFertilizers.filter(f => f !== id));
        } else {
            setSelectedFertilizers([...selectedFertilizers, id]);
        }
    };

    const handleSetAllMedium = () => {
        setNitrogen('Medium');
        setPhosphorus('Medium');
        setPotassium('Medium');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fertilizer Calculator</Text>
                    <View style={{ width: 24 }} /> {/* Spacer */}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* Step Indicator */}
                    <Text style={styles.stepText}>Step 2 of 2</Text>

                    {/* Soil Fertility Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Soil Fertility</Text>
                        <Text style={styles.optionalBadge}>Recommended</Text>
                    </View>

                    <View style={styles.card}>
                        <NutrientSelector label="Nitrogen (N)" value={nitrogen} onChange={setNitrogen} />
                        <View style={styles.divider} />
                        <NutrientSelector label="Phosphorus (P)" value={phosphorus} onChange={setPhosphorus} />
                        <View style={styles.divider} />
                        <NutrientSelector label="Potassium (K)" value={potassium} onChange={setPotassium} />

                        <TouchableOpacity style={styles.dontKnowBtn} onPress={handleSetAllMedium}>
                            <MaterialCommunityIcons name="information-outline" size={18} color="#00C853" style={{ marginRight: 6 }} />
                            <Text style={styles.dontKnowText}>Don’t know? Choose Medium.</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Select Fertilizer Type */}
                    <Text style={styles.sectionTitle}>Select Fertilizer Type</Text>
                    <Text style={styles.sectionSubtitle}>You can select multiple</Text>

                    <View style={styles.fertilizerGrid}>
                        {['Urea', 'DAP', 'MOP', 'NPK 20-20-20'].map((fert) => {
                            const isSelected = selectedFertilizers.includes(fert);
                            return (
                                <TouchableOpacity
                                    key={fert}
                                    style={[
                                        styles.fertBtn,
                                        isSelected && styles.fertBtnActive
                                    ]}
                                    onPress={() => toggleFertilizer(fert)}
                                >
                                    <View style={styles.checkboxContainer}>
                                        <MaterialCommunityIcons
                                            name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                            size={24}
                                            color={isSelected ? "#00C853" : "#ccc"}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.fertText,
                                        isSelected && styles.fertTextActive
                                    ]}>{fert}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Optional Cost Input */}
                    <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Cost Estimation</Text>

                    <TouchableOpacity
                        style={styles.costToggleCard}
                        onPress={() => setShowCost(!showCost)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.costToggleRow}>
                            <View style={styles.iconBg}>
                                <MaterialCommunityIcons name="currency-inr" size={24} color="#fff" />
                            </View>
                            <Text style={styles.costToggleText}>Do you want cost estimation?</Text>
                            <View style={[styles.switch, showCost && styles.switchActive]}>
                                <View style={[styles.switchKnob, showCost && styles.switchKnobActive]} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {showCost && (
                        <View style={styles.costInputsContainer}>
                            <View style={styles.inputGroupWrapper}>
                                <Text style={styles.inputLabel}>Bag weight (kg)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={bagWeight}
                                    onChangeText={setBagWeight}
                                    keyboardType="numeric"
                                    placeholder="50"
                                />
                            </View>

                            <View style={styles.inputGroupWrapper}>
                                <Text style={styles.inputLabel}>Price per bag</Text>
                                <View style={styles.priceInputWrapper}>
                                    <View style={styles.currencySymbolWrapper}>
                                        <MaterialCommunityIcons name="currency-inr" size={20} color="#555" />
                                    </View>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={pricePerBag}
                                        onChangeText={setPricePerBag}
                                        keyboardType="numeric"
                                        placeholder="e.g. 1200"
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                </ScrollView>

                {/* Bottom Action */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[
                            styles.calcButton,
                            selectedFertilizers.length === 0 && styles.calcButtonDisabled
                        ]}
                        onPress={() => {
                            // Proceed to Results Screen
                            router.push({
                                pathname: '/fert-calc/result',
                                params: {
                                    cropId,
                                    area,
                                    unit,
                                    selectedFertilizers: selectedFertilizers.join(',')
                                }
                            });
                        }}
                        disabled={selectedFertilizers.length === 0}
                    >
                        <MaterialCommunityIcons name="calculator-variant" size={24} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.calcButtonText}>Calculate Requirement</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
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
        padding: 20,
        paddingBottom: 40,
    },
    stepText: {
        fontSize: 14,
        color: '#00C853',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
        marginTop: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: -4,
        marginBottom: 16,
    },
    optionalBadge: {
        backgroundColor: '#e3f2fd',
        color: '#1976D2',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 24,
    },
    nutrientRow: {
        flexDirection: 'column',
        marginBottom: 12,
    },
    nutrientLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    nutrientOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    nutrientLevelBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    nutrientLevelBtnActive: {
        borderWidth: 2,
    },
    nutrientLevelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    nutrientLevelTextActive: {
        color: '#222',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    dontKnowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e8f5e9',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    dontKnowText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    fertilizerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    fertBtn: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
    },
    fertBtnActive: {
        borderColor: '#00C853',
        backgroundColor: '#f6fdf6',
    },
    checkboxContainer: {
        marginRight: 10,
    },
    fertText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        flex: 1,
    },
    fertTextActive: {
        color: '#111',
    },
    costToggleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        marginBottom: 16,
    },
    costToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF9800',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    costToggleText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e0e0e0',
        padding: 2,
        justifyContent: 'center',
    },
    switchActive: {
        backgroundColor: '#00C853',
    },
    switchKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    switchKnobActive: {
        transform: [{ translateX: 22 }],
    },
    costInputsContainer: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 24,
    },
    inputGroupWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111',
    },
    priceInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    currencySymbolWrapper: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    priceInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111',
    },
    bottomBar: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: Platform.OS === 'android' ? 32 : Platform.OS === 'ios' ? 32 : 16,
    },
    calcButton: {
        backgroundColor: '#00C853',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    calcButtonDisabled: {
        backgroundColor: '#c8e6c9',
    },
    calcButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
