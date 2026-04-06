import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function MandiCheckerScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    // Auto-suggest fields
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Submission and Results
    const [loadingResult, setLoadingResult] = useState(false);
    const [mandiResult, setMandiResult] = useState(null); // { mandiName, price, date }

    // Debounce search
    const debounceTimeout = useRef(null);

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        setMandiResult(null); // Clear previous result
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
        setShowSuggestions(false);
    };

    const handleCheckPrice = async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Error', 'Please select or enter a crop name first.');
            return;
        }

        setLoadingResult(true);
        setMandiResult(null);

        try {
            // 1. Get Location Permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please grant location permissions to find your nearest Mandi.');
                setLoadingResult(false);
                return;
            }

            // 2. Get Geolocation
            const locationData = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = locationData.coords;

            // 3. Reverse Geocode to get a readable string
            const reversed = await Location.reverseGeocodeAsync({ latitude, longitude });
            let locationString = `${latitude}, ${longitude}`;
            if (reversed && reversed.length > 0) {
                const addy = reversed[0];
                locationString = [addy.city, addy.region, addy.country].filter(Boolean).join(', ');
            }

            // 4. Hit Our Backend Gemini Wrapper
            const response = await fetch(`${API_BASE_URL}/ai/mandi-price`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop: searchQuery.trim(),
                    location: locationString
                })
            });

            const json = await response.json();

            if (json.success && json.data) {
                setMandiResult(json.data);
            } else {
                Alert.alert('Analysis Failed', json.error || 'Could not fetch mandi details for this crop.');
            }

        } catch (error) {
            console.error('Error fetching mandi price:', error);
            Alert.alert('Error', 'Could not reach the pricing server.');
        } finally {
            setLoadingResult(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('mandiPriceChecker')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.formCard}>
                    <View style={styles.iconHeader}>
                        <View style={styles.iconBg}>
                            <MaterialCommunityIcons name="currency-inr" size={32} color="#00C853" />
                        </View>
                        <Text style={styles.cardTitle}>{t('liveAiPricing')}</Text>
                        <Text style={styles.cardSub}>{t('poweredByGemini')}</Text>
                    </View>

                    <Text style={styles.label}>{t('cropName')}</Text>
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t('typeCrop')}
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            onFocus={() => { if(searchQuery) setShowSuggestions(true); }}
                        />
                        {searching && <ActivityIndicator size="small" color="#00C853" style={styles.searchActionIcon} />}
                        {searchQuery.length > 0 && !searching && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setMandiResult(null); }} style={styles.searchActionIcon}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Auto-suggest dropdown menu */}
                    {showSuggestions && (searchQuery.length > 0) && (
                        <View style={styles.suggestionsCard}>
                            {suggestions.length > 0 ? (
                                suggestions.map((crop, index) => (
                                    <TouchableOpacity 
                                        key={crop._id || `sugg_${index}`} 
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
                                        <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>You can still check its price!</Text>
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    )}

                    <TouchableOpacity 
                        style={[styles.submitButton, loadingResult && { opacity: 0.7 }]} 
                        onPress={handleCheckPrice}
                        disabled={loadingResult}
                    >
                        {loadingResult ? (
                            <View style={styles.buttonContentRow}>
                                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>{t('analyzingWeb')}</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContentRow}>
                                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>{t('checkPrice')}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {mandiResult && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons name="check-decagram" size={24} color="#00C853" />
                            <Text style={styles.resultTitle}>{t('dataAnalyzed')}</Text>
                        </View>
                        
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{t('nearestMarket')}</Text>
                            <Text style={styles.dataValue}>{mandiResult.mandiName}</Text>
                        </View>
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{t('spotPrice')}</Text>
                            <Text style={styles.priceHighlight}>{mandiResult.price}</Text>
                        </View>
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{t('verifiedOn')}</Text>
                            <Text style={styles.dataValue}>{mandiResult.date}</Text>
                        </View>

                        <Text style={styles.disclaimerText}>{t('resultSourced')}</Text>
                    </View>
                )}

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
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 2,
    },
    iconHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
    },
    cardSub: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
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
        marginTop: -4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'absolute',
        top: 180,
        left: 20,
        right: 20,
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
    submitButton: {
        backgroundColor: '#00C853',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#c8e6c9',
        paddingBottom: 12,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginLeft: 8,
    },
    dataRow: {
        marginBottom: 14,
    },
    dataLabel: {
        fontSize: 13,
        color: '#4caf50',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dataValue: {
        fontSize: 16,
        color: '#111',
        fontWeight: '500',
    },
    priceHighlight: {
        fontSize: 24,
        color: '#00C853',
        fontWeight: '900',
    },
    disclaimerText: {
        fontSize: 11,
        color: '#81c784',
        fontStyle: 'italic',
        marginTop: 12,
        textAlign: 'center',
    }
});
