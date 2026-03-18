import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PLANTS_DATA = {
    Apartment: [
        { id: '1', name: 'Aloe Vera', icon: 'leaf' },
        { id: '2', name: 'Mint', icon: 'leaf-maple' },
        { id: '3', name: 'Petunia', icon: 'flower' },
        { id: '4', name: 'Basil', icon: 'seed' },
        { id: '5', name: 'Snake Plant', icon: 'grass' },
    ],
    Gardener: [
        { id: '1', name: 'Tomato', icon: 'food-apple' },
        { id: '2', name: 'Marigold', icon: 'flower' },
        { id: '3', name: 'Chili', icon: 'pepper-hot' },
        { id: '4', name: 'Rose', icon: 'flower-rose' },
        { id: '5', name: 'Brinjal', icon: 'food-croissant' },
    ],
    Professional: [
        { id: '1', name: 'Wheat', icon: 'barley' },
        { id: '2', name: 'Rice', icon: 'grass' },
        { id: '3', name: 'Cotton', icon: 'cloud' },
        { id: '4', name: 'Sugarcane', icon: 'bamboo' },
        { id: '5', name: 'Corn', icon: 'corn' },
    ]
};

export default function PlantsScreen() {
    const router = useRouter();
    const { persona } = useLocalSearchParams();
    const [selectedPlants, setSelectedPlants] = useState([]);

    // Default to Gardener if params are missing for some reason
    const plantsList = PLANTS_DATA[persona] || PLANTS_DATA['Gardener'];

    const handleTogglePlant = (plantId) => {
        setSelectedPlants(prev => {
            if (prev.includes(plantId)) {
                return prev.filter(id => id !== plantId);
            }
            if (prev.length < 4) {
                return [...prev, plantId];
            }
            return prev; // Max 4 reached
        });
    };

    const handleFinish = () => {
        const selectedData = plantsList.filter(p => selectedPlants.includes(p.id));
        console.log("Onboarding Complete", {
            persona,
            plants: selectedData
        });
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.progressText}>Step 3 of 3</Text>
                    </View>

                    <Text style={styles.title}>What are you growing?</Text>
                    <Text style={styles.subtitle}>Select up to 4 items.</Text>

                    <View style={styles.grid}>
                        {plantsList.map((plant) => {
                            const isSelected = selectedPlants.includes(plant.id);
                            return (
                                <TouchableOpacity
                                    key={plant.id}
                                    style={[styles.plantCard, isSelected && styles.plantCardActive]}
                                    onPress={() => handleTogglePlant(plant.id)}
                                >
                                    <View style={[styles.iconWrapper, isSelected && styles.iconWrapperActive]}>
                                        <MaterialCommunityIcons
                                            name={plant.icon}
                                            size={40}
                                            color={isSelected ? '#ffffff' : '#4caf50'}
                                        />
                                    </View>
                                    <Text style={[styles.plantName, isSelected && styles.plantNameActive]}>
                                        {plant.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.finishButton, selectedPlants.length === 0 && styles.finishButtonDisabled]}
                        onPress={handleFinish}
                        disabled={selectedPlants.length === 0}
                    >
                        <Text style={styles.finishText}>Finish Setup</Text>
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
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4caf50',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1b5e20',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    plantCard: {
        width: '47%',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e8f5e9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 8,
    },
    plantCardActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f1f8e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconWrapperActive: {
        backgroundColor: '#4caf50',
    },
    plantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    plantNameActive: {
        color: '#1b5e20',
    },
    footer: {
        padding: 24,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    finishButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 18,
        borderRadius: 16,
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
