import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = [
    {
        title: 'Flowers',
        items: [
            { id: 'f1', name: 'Rose', icon: 'flower-tulip' },
            { id: 'f2', name: 'Marigold', icon: 'flower' },
            { id: 'f3', name: 'Hibiscus', icon: 'flower-outline' },
            { id: 'f4', name: 'Sunflower', icon: 'white-balance-sunny' },
            { id: 'f5', name: 'Jasmine', icon: 'flower-poppy' },
            { id: 'f6', name: 'Lotus', icon: 'tree' },
            { id: 'f7', name: 'Tulip', icon: 'flower-tulip-outline' },
            { id: 'f8', name: 'Lily', icon: 'leaf' },
        ]
    },
    {
        title: 'Vegetables',
        items: [
            { id: 'v1', name: 'Tomato', icon: 'food-apple' },
            { id: 'v2', name: 'Potato', icon: 'dots-grid' },
            { id: 'v3', name: 'Onion', icon: 'shape-circle-plus' },
            { id: 'v4', name: 'Brinjal', icon: 'food-croissant' },
            { id: 'v5', name: 'Carrot', icon: 'carrot' },
            { id: 'v6', name: 'Spinach', icon: 'leaf-maple' },
            { id: 'v7', name: 'Cabbage', icon: 'tree-outline' },
            { id: 'v8', name: 'Chili', icon: 'pepper-hot' },
        ]
    },
    {
        title: 'Crops',
        items: [
            { id: 'c1', name: 'Rice', icon: 'grass' },
            { id: 'c2', name: 'Wheat', icon: 'barley' },
            { id: 'c3', name: 'Maize', icon: 'corn' },
            { id: 'c4', name: 'Cotton', icon: 'cloud' },
            { id: 'c5', name: 'Sugarcane', icon: 'bamboo' },
            { id: 'c6', name: 'Jute', icon: 'grass' },
            { id: 'c7', name: 'Soybean', icon: 'seed' },
            { id: 'c8', name: 'Barley', icon: 'barley-off' },
        ]
    }
];

export default function PlantsScreen() {
    const router = useRouter();
    const { persona } = useLocalSearchParams();
    const { t, language } = useLanguage();
    const [selectedPlants, setSelectedPlants] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleTogglePlant = (plant) => {
        setSelectedPlants(prev => {
            const isSelected = prev.some(p => p.id === plant.id);
            if (isSelected) {
                return prev.filter(p => p.id !== plant.id);
            }
            if (prev.length < 8) { // Allow up to 8 items total across all categories
                return [...prev, plant];
            }
            return prev;
        });
    };

    const handleFinish = async () => {
        if (selectedPlants.length === 0) return;
        
        try {
            setIsSaving(true);
            
            // Get or generate deviceId persistently representing this guest profile
            let deviceId = await AsyncStorage.getItem('deviceId');
            if (!deviceId) {
                deviceId = 'device_' + Date.now() + Math.random().toString(36).substring(7);
                await AsyncStorage.setItem('deviceId', deviceId);
            }

            const payload = {
                deviceId,
                language: language || 'en',
                persona: persona || 'Gardener',
                chosenPlants: selectedPlants.map(plant => plant.name)
            };

            const response = await fetch('https://farmersapp-333z.onrender.com/api/users/onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert("Error", data.error || "Failed to save profile");
                setIsSaving(false);
            }

        } catch (error) {
            console.error("Onboarding API Error:", error);
            Alert.alert("Error", "Network error while saving profile. Please check your connection.");
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.progressText}>{t('step3Of3')}</Text>
                    </View>

                    <Text style={styles.title}>{t('whatAreYouGrowing')}</Text>
                    <Text style={styles.subtitle}>{t('selectPlantsToTrack')}</Text>
                    
                    <View style={{backgroundColor: '#e8f5e9', padding: 12, borderRadius: 8, marginBottom: 20, flexDirection: 'row', alignItems: 'center'}}>
                        <MaterialCommunityIcons name="information" size={20} color="#2e7d32" style={{marginRight: 8}} />
                        <Text style={{color: '#2e7d32', fontSize: 13, flex: 1}}>{t('chooseAtLeastOnePlant')}</Text>
                    </View>

                    {CATEGORIES.map(category => (
                        <View key={category.title} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{t('category' + category.title)}</Text>
                            <View style={styles.grid}>
                                {category.items.map((plant) => {
                                    const isSelected = selectedPlants.some(p => p.id === plant.id);
                                    return (
                                        <TouchableOpacity
                                            key={plant.id}
                                            style={[styles.plantCard, isSelected && styles.plantCardActive]}
                                            onPress={() => handleTogglePlant(plant)}
                                        >
                                            <View style={[styles.iconWrapper, isSelected && styles.iconWrapperActive]}>
                                                <MaterialCommunityIcons
                                                    name={plant.icon}
                                                    size={24}
                                                    color={isSelected ? '#ffffff' : '#4caf50'}
                                                />
                                            </View>
                                            <Text 
                                                style={[styles.plantName, isSelected && styles.plantNameActive]}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                            >
                                                {plant.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                    
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.finishButton, selectedPlants.length === 0 && styles.finishButtonDisabled]}
                        onPress={handleFinish}
                        disabled={selectedPlants.length === 0 || isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.finishText}>{t('finishSetup')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4caf50',
        letterSpacing: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1b5e20',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 12,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 12,
        paddingLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 8,
    },
    plantCard: {
        width: '23%', 
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e8f5e9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        marginBottom: 8,
    },
    plantCardActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f8e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconWrapperActive: {
        backgroundColor: '#4caf50',
    },
    plantName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    plantNameActive: {
        color: '#1b5e20',
    },
    footer: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    finishButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    finishButtonDisabled: {
        backgroundColor: '#a5d6a7',
        shadowOpacity: 0,
        elevation: 0,
    },
    finishText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
