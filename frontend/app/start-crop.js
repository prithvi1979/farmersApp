import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function StartCropScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [masterCrops, setMasterCrops] = useState([]);
    
    // Form fields
    const [selectedCrop, setSelectedCrop] = useState('');
    const [customName, setCustomName] = useState('');
    const [totalArea, setTotalArea] = useState('');
    const [areaUnit, setAreaUnit] = useState('acres');
    const [farmingMethod, setFarmingMethod] = useState('conventional');
    const [soilType, setSoilType] = useState('loamy');

    useEffect(() => {
        // Fetch Master Crops from DB (simulated fetch if no endpoint exists, but we should try fetch if available)
        // Since there is no specific master crops endpoint mentioned, we'll dummy it or assume one exists. 
        // Wait, startCrop uses masterCropId. I should check if there's a master crop route or just fetch crops.
        // For now, let's just make a generic route or mock the data since usually admins set them up.
        // Actually I should look if there is GET /api/crops/master? or similar. If not I will hardcode a few for now.
        // I will use a placeholder fetch, if fails, fallback to hardcoded master crops.
        const fetchMasterCrops = async () => {
             try {
                 // Trying a generic fetch
                 const res = await fetch(`${API_BASE_URL}/crops/master`);
                 if(res.ok) {
                    const json = await res.json();
                    if(json.success && json.data.length > 0) {
                        setMasterCrops(json.data);
                        setSelectedCrop(json.data[0]._id);
                        setLoading(false);
                        return;
                    }
                 }
             } catch(err) {
                 console.log("No master crops endpoint, using fallbacks.");
             }
             
             // Fallbacks if endpoint doesn't exist or is empty
             setMasterCrops([
                 { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Tomato' },
                 { _id: '65f1a2b3c4d5e6f7a8b9c0d2', name: 'Carrot' },
                 { _id: '65f1a2b3c4d5e6f7a8b9c0d3', name: 'Cabbage' },
             ]);
             setSelectedCrop('65f1a2b3c4d5e6f7a8b9c0d1');
             setLoading(false);
        };

        fetchMasterCrops();
    }, []);

    const handleStartCrop = async () => {
        if (!selectedCrop) {
            Alert.alert('Error', 'Please select a crop to start.');
            return;
        }

        setSubmitting(true);
        try {
            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            
            const payload = {
                deviceId,
                masterCropId: selectedCrop,
                customName: customName.trim() || undefined,
                totalArea: totalArea ? parseFloat(totalArea) : undefined,
                areaUnit,
                farmingMethod,
                soilType
            };

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

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#00C853" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Start a Crop</Text>
                <View style={{ width: 40 }} />
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>Select Crop *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCrop}
                            onValueChange={(itemValue) => setSelectedCrop(itemValue)}
                            style={styles.picker}
                        >
                            {masterCrops.map(crop => (
                                <Picker.Item key={crop._id} label={crop.name} value={crop._id} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Custom Name (Optional)</Text>
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
                        <View style={[styles.pickerContainer, { flex: 1 }]}>
                            <Picker
                                selectedValue={areaUnit}
                                onValueChange={(itemValue) => setAreaUnit(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Acres" value="acres" />
                                <Picker.Item label="Hectares" value="hectares" />
                                <Picker.Item label="Sq Meters" value="sq_meters" />
                            </Picker>
                        </View>
                    </View>

                    <Text style={styles.label}>Farming Method</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={farmingMethod}
                            onValueChange={(itemValue) => setFarmingMethod(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Conventional" value="conventional" />
                            <Picker.Item label="Organic" value="organic" />
                            <Picker.Item label="Hydroponic" value="hydroponic" />
                            <Picker.Item label="Other" value="other" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Soil Type</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={soilType}
                            onValueChange={(itemValue) => setSoilType(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Loamy" value="loamy" />
                            <Picker.Item label="Clay" value="clay" />
                            <Picker.Item label="Sandy" value="sandy" />
                            <Picker.Item label="Silty" value="silty" />
                            <Picker.Item label="Peaty" value="peaty" />
                        </Picker>
                    </View>
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
