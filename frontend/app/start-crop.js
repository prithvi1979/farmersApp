import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function StartCropScreen() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    
    // Auto-suggest fields
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Form fields
    const [selectedCropId, setSelectedCropId] = useState(''); // If they picked from list
    const [customName, setCustomName] = useState(''); // If they want a custom alias
    const [totalArea, setTotalArea] = useState('');
    const [areaUnit, setAreaUnit] = useState('acres');
    const [farmingMethod, setFarmingMethod] = useState('conventional');
    const [soilType, setSoilType] = useState('loamy');

    // Debounce search
    const debounceTimeout = useRef(null);

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        setSelectedCropId(''); // Reset selected ID because they are typing something new
        setShowSuggestions(true);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (text.trim().length === 0) {
            setSuggestions([]);
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/crops/search?q=${encodeURIComponent(text)}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        setSuggestions(json.data);
                    }
                }
            } catch (err) {
                console.log("Search error:", err);
            } finally {
                setSearching(false);
            }
        }, 400); // 400ms debounce
    };

    const handleSelectSuggestion = (crop) => {
        setSearchQuery(crop.name);
        setSelectedCropId(crop._id);
        setShowSuggestions(false);
    };

    const handleStartCrop = async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Error', 'Please enter a crop name.');
            return;
        }

        setSubmitting(true);
        try {
            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            
            // If they didn't select from the list, we send `customName` and omit `masterCropId`
            const payload = {
                deviceId,
                totalArea: totalArea ? parseFloat(totalArea) : undefined,
                areaUnit,
                farmingMethod,
                soilType
            };

            if (selectedCropId) {
                payload.masterCropId = selectedCropId;
                if (customName.trim()) payload.customName = customName.trim();
            } else {
                // Completely new crop the user just typed out
                payload.customName = searchQuery.trim();
            }

            const response = await fetch(`${API_BASE_URL}/crops/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await response.json();

            if (json.success) {
                Alert.alert('Success', 'Crop started successfully!', [
                    { text: 'OK', onPress: () => router.push('/(tabs)/crops') }
                ]);
            } else {
                Alert.alert('Error', json.error || 'Failed to start crop.');
            }

        } catch (error) {
            console.error('Error starting crop:', error);
            Alert.alert('Error', 'Network request failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Start a Crop</Text>
                <View style={{ width: 40 }} />
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.formCard}>
                    <Text style={styles.label}>Crop Name *</Text>
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Type to search e.g. Tomato"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            onFocus={() => { if(searchQuery) setShowSuggestions(true); }}
                        />
                        {searching && <ActivityIndicator size="small" color="#00C853" style={styles.searchActionIcon} />}
                        {searchQuery.length > 0 && !searching && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedCropId(''); }} style={styles.searchActionIcon}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Auto-suggest dropdown menu */}
                    {showSuggestions && (searchQuery.length > 0) && (
                        <View style={styles.suggestionsCard}>
                            {suggestions.length > 0 ? (
                                suggestions.map(crop => (
                                    <TouchableOpacity 
                                        key={crop._id} 
                                        style={styles.suggestionItem} 
                                        onPress={() => handleSelectSuggestion(crop)}
                                    >
                                        <MaterialCommunityIcons name="leaf" size={16} color="#00C853" style={{ marginRight: 8 }} />
                                        <Text style={styles.suggestionText}>{crop.name}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : !searching ? (
                                <View style={styles.suggestionItem}>
                                    <View>
                                        <Text style={styles.suggestionText}>"{searchQuery}" not found.</Text>
                                        <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Tap Start below to add this as a new crop!</Text>
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    )}

                    <Text style={styles.label}>Custom Alias (Optional)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. Backyard Tomatoes"
                        value={customName}
                        onChangeText={setCustomName}
                    />

                    <Text style={styles.label}>Total Area</Text>
                    <View style={styles.row}>
                        <TextInput 
                            style={[styles.input, { flex: 1, marginRight: 12 }]} 
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                            value={totalArea}
                            onChangeText={setTotalArea}
                        />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipRow, { marginTop: 12 }]}>
                        {['acres', 'hectares', 'sq_meters'].map(unit => (
                            <TouchableOpacity 
                                key={unit} 
                                style={[styles.chip, areaUnit === unit && styles.chipActive]}
                                onPress={() => setAreaUnit(unit)}
                            >
                                <Text style={[styles.chipText, areaUnit === unit && styles.chipTextActive]}>
                                    {unit.replace('_', ' ').toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Farming Method</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {['conventional', 'organic', 'hydroponic', 'other'].map(method => (
                            <TouchableOpacity 
                                key={method} 
                                style={[styles.chip, farmingMethod === method && styles.chipActive]}
                                onPress={() => setFarmingMethod(method)}
                            >
                                <Text style={[styles.chipText, farmingMethod === method && styles.chipTextActive]}>
                                    {method.charAt(0).toUpperCase() + method.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Soil Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                        {['loamy', 'clay', 'sandy', 'silty', 'peaty'].map(soil => (
                            <TouchableOpacity 
                                key={soil} 
                                style={[styles.chip, soilType === soil && styles.chipActive]}
                                onPress={() => setSoilType(soil)}
                            >
                                <Text style={[styles.chipText, soilType === soil && styles.chipTextActive]}>
                                    {soil.charAt(0).toUpperCase() + soil.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                    onPress={handleStartCrop}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Start Crop</Text>
                    )}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
        marginTop: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#fafafa',
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchActionIcon: {
        padding: 4,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    suggestionsCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderTopWidth: 0,
        marginTop: -4, // overlap the input slightly
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    suggestionText: {
        fontSize: 15,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        color: '#333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#fafafa',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chipRow: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#00C853',
    },
    chipText: {
        color: '#666',
        fontWeight: '500',
        fontSize: 14,
    },
    chipTextActive: {
        color: '#00C853',
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#00C853',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
