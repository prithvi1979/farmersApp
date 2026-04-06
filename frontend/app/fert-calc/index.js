import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CropAutofillInput from '../../components/CropAutofillInput';

const { width } = Dimensions.get('window');

import { fertilizers } from './data'; // Only fertilizer lookup still needed

// NPK defaults (kg/ha) for well-known crops.
// Populated from the existing data.js; any unlisted crop gets GENERIC_NPK.
const NPK_DEFAULTS = {
    rice:          { N: 120, P: 60,  K: 40  },
    wheat:         { N: 100, P: 50,  K: 40  },
    maize:         { N: 150, P: 75,  K: 40  },
    corn:          { N: 150, P: 75,  K: 40  },
    barley:        { N: 60,  P: 30,  K: 20  },
    sorghum:       { N: 100, P: 50,  K: 40  },
    pearl_millet:  { N: 80,  P: 40,  K: 40  },
    bajra:         { N: 80,  P: 40,  K: 40  },
    chickpea:      { N: 20,  P: 40,  K: 20  },
    pigeon_pea:    { N: 25,  P: 50,  K: 20  },
    green_gram:    { N: 20,  P: 40,  K: 20  },
    moong:         { N: 20,  P: 40,  K: 20  },
    black_gram:    { N: 20,  P: 40,  K: 20  },
    urad:          { N: 20,  P: 40,  K: 20  },
    mustard:       { N: 80,  P: 40,  K: 40  },
    groundnut:     { N: 20,  P: 40,  K: 40  },
    soybean:       { N: 30,  P: 60,  K: 40  },
    sunflower:     { N: 60,  P: 60,  K: 40  },
    sesame:        { N: 40,  P: 20,  K: 20  },
    tomato:        { N: 120, P: 60,  K: 60  },
    potato:        { N: 150, P: 80,  K: 100 },
    onion:         { N: 100, P: 50,  K: 50  },
    brinjal:       { N: 100, P: 50,  K: 50  },
    chilli:        { N: 100, P: 50,  K: 50  },
    capsicum:      { N: 100, P: 50,  K: 50  },
    cabbage:       { N: 120, P: 60,  K: 60  },
    cauliflower:   { N: 120, P: 60,  K: 60  },
    okra:          { N: 80,  P: 40,  K: 40  },
    cucumber:      { N: 100, P: 50,  K: 75  },
    watermelon:    { N: 80,  P: 40,  K: 60  },
    carrot:        { N: 60,  P: 30,  K: 40  },
    banana:        { N: 200, P: 60,  K: 200 },
    mango:         { N: 100, P: 50,  K: 100 },
    guava:         { N: 100, P: 40,  K: 60  },
    papaya:        { N: 200, P: 100, K: 200 },
    cotton:        { N: 150, P: 75,  K: 75  },
    sugarcane:     { N: 250, P: 115, K: 115 },
    tea:           { N: 120, P: 60,  K: 120 },
    coffee:        { N: 100, P: 40,  K: 100 },
    jute:          { N: 80,  P: 40,  K: 40  },
    ginger:        { N: 100, P: 50,  K: 100 },
    turmeric:      { N: 120, P: 60,  K: 120 },
    garlic:        { N: 100, P: 50,  K: 50  },
};
const GENERIC_NPK = { N: 80, P: 40, K: 40 };

export default function FertCalcScreen() {
    const router = useRouter();
    const [mode, setMode] = useState('field');
    const [selectedCropId, setSelectedCropId] = useState('');
    const [selectedCropName, setSelectedCropName] = useState('');
    const [area, setArea] = useState('');
    const [unit, setUnit] = useState('Acre');

    const handleCropSelect = (crop) => {
        setSelectedCropId(crop._id || crop.name.toLowerCase());
        setSelectedCropName(crop.name);
    };

    const handleCropClear = () => {
        setSelectedCropId('');
        setSelectedCropName('');
    };

    // Resolve NPK defaults for step2
    const getNpkForCrop = (name) => {
        const key = name.toLowerCase().replace(/[^a-z_]/g, '_').replace(/_+/g, '_');
        return NPK_DEFAULTS[key] || NPK_DEFAULTS[name.toLowerCase()] || GENERIC_NPK;
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
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* Step Indicator */}
                    <Text style={styles.stepText}>Step 1 of 2</Text>
                    <Text style={styles.sectionTitle}>Select Mode</Text>

                    {/* Select Mode */}
                    <View style={styles.modeContainer}>
                        <TouchableOpacity
                            style={[styles.modeButton, mode === 'field' && styles.modeButtonActive]}
                            onPress={() => setMode('field')}
                        >
                            <MaterialCommunityIcons
                                name="tractor"
                                size={32}
                                color={mode === 'field' ? '#fff' : '#00C853'}
                                style={styles.modeIcon}
                            />
                            <Text style={[styles.modeText, mode === 'field' && styles.modeTextActive]}>Field Crop</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeButton, mode === 'garden' && styles.modeButtonActive]}
                            onPress={() => setMode('garden')}
                        >
                            <MaterialCommunityIcons
                                name="sprout"
                                size={32}
                                color={mode === 'garden' ? '#fff' : '#00C853'}
                                style={styles.modeIcon}
                            />
                            <Text style={[styles.modeText, mode === 'garden' && styles.modeTextActive]}>Garden / Single Plant</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Select Crop */}
                    <Text style={styles.sectionTitle}>Select Crop</Text>
                    <CropAutofillInput
                        placeholder="Search any crop e.g. Wheat..."
                        accentColor="#00C853"
                        onSelect={handleCropSelect}
                        onCustom={(name) => handleCropSelect({ _id: null, name })}
                        onClear={handleCropClear}
                    />

                    {/* Enter Land Area */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Enter Land Area</Text>

                    <View style={styles.areaContainer}>
                        <TextInput
                            style={styles.areaInput}
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                            value={area}
                            onChangeText={setArea}
                            placeholderTextColor="#999"
                        />

                        <View style={styles.unitToggleContainer}>
                            {['Acre', 'Hectare', 'Sq.m'].map((u) => (
                                <TouchableOpacity
                                    key={u}
                                    style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                                    onPress={() => setUnit(u)}
                                >
                                    <Text style={[styles.unitButtonText, unit === u && styles.unitButtonTextActive]}>
                                        {u}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </ScrollView>

                {/* Bottom Action */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            (!selectedCropId || !area) && styles.nextButtonDisabled
                        ]}
                        onPress={() => router.push({
                            pathname: '/fert-calc/step2',
                            params: {
                                cropId: selectedCropId,
                                cropName: selectedCropName,
                                area,
                                unit,
                                npkN: getNpkForCrop(selectedCropName).N,
                                npkP: getNpkForCrop(selectedCropName).P,
                                npkK: getNpkForCrop(selectedCropName).K,
                            }
                        })}
                        disabled={!selectedCropId || !area}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 16,
        marginTop: 24,
    },
    modeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modeButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        minHeight: 120, // Big button
    },
    modeButtonActive: {
        backgroundColor: '#00C853',
        borderColor: '#00A040',
    },
    modeIcon: {
        marginBottom: 12,
    },
    modeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        textAlign: 'center',
    },
    modeTextActive: {
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: (width - 40 - 16) / 3, // 3 columns, minus padding and gaps
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    gridItemActive: {
        borderColor: '#00C853',
    },
    gridItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginTop: 8,
    },
    gridItemTextActive: {
        color: '#00C853',
        fontWeight: 'bold',
    },
    areaContainer: {
        flexDirection: 'column',
    },
    areaInput: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        paddingHorizontal: 20,
        paddingVertical: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    unitToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 4,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    unitButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    unitButtonTextActive: {
        color: '#00C853',
        fontWeight: 'bold',
    },
    bottomBar: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: Platform.OS === 'android' ? 32 : Platform.OS === 'ios' ? 32 : 16,
    },
    nextButton: {
        backgroundColor: '#00C853',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    nextButtonDisabled: {
        backgroundColor: '#c8e6c9',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
});
