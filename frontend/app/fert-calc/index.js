import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

import { crops as CROPS } from './data';

export default function FertCalcScreen() {
    const router = useRouter();
    const [mode, setMode] = useState('field'); // 'field' | 'garden'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCropId, setSelectedCropId] = useState('');
    const [area, setArea] = useState('');
    const [unit, setUnit] = useState('Acre'); // 'Acre' | 'Hectare' | 'Sq.m'

    const filteredCrops = CROPS.filter(crop =>
        crop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={24} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search crops..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.gridContainer}>
                        {filteredCrops.map((crop) => (
                            <TouchableOpacity
                                key={crop.id}
                                style={[
                                    styles.gridItem,
                                    { backgroundColor: crop.color },
                                    selectedCropId === crop.id && styles.gridItemActive
                                ]}
                                onPress={() => setSelectedCropId(crop.id)}
                            >
                                <MaterialCommunityIcons
                                    name={crop.icon}
                                    size={36}
                                    color={selectedCropId === crop.id ? '#00C853' : '#555'}
                                />
                                <Text style={[
                                    styles.gridItemText,
                                    selectedCropId === crop.id && styles.gridItemTextActive
                                ]}>
                                    {crop.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Enter Land Area */}
                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Enter Land Area</Text>

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
                            params: { cropId: selectedCropId, area: area, unit: unit }
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
