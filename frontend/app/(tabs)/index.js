import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import HeaderDropdown from '../../components/HeaderDropdown';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  Change this to your machine's local IP when backend goes live online
const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function HomeScreen() {
    const router = useRouter();

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    const [diagnosing, setDiagnosing] = useState(false);
    const [diagnosisResult, setDiagnosisResult] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [activeCrops, setActiveCrops] = useState([]);
    const [dueTasks, setDueTasks] = useState([]);
    const [hasAnyTasksConfigured, setHasAnyTasksConfigured] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Try fetching weather by saved device profile first, fallback to IP
                const deviceId = await AsyncStorage.getItem('deviceId');
                const endpoint = deviceId 
                    ? `${API_BASE_URL}/weather/${deviceId}` 
                    : `${API_BASE_URL}/weather/by-ip`;

                const res = await fetch(endpoint);
                const json = await res.json();
                if (json.success) {
                    setWeather(json.data);
                }
            } catch (err) {
                console.log('Weather fetch error:', err.message);
            } finally {
                setWeatherLoading(false);
            }
        };
        fetchWeather();

    }, []);

    const fetchCropsData = async () => {
        try {
            setLoadingTasks(true);
            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            const res = await fetch(`${API_BASE_URL}/crops/active/${deviceId}`);
            const json = await res.json();
            
            if (json.success) {
                setActiveCrops(json.data);
                
                // Extract all due tasks from all crops
                let allDueTasks = [];
                let anyTasks = false;
                
                json.data.forEach(crop => {
                    if (crop.totalTasksCount > 0) anyTasks = true;
                    if (crop.dueTasks) {
                        const cropTasks = crop.dueTasks.map(t => ({
                            ...t, 
                            cropName: crop.cropName, 
                            activeCropId: crop._id 
                        }));
                        allDueTasks = [...allDueTasks, ...cropTasks];
                    }
                });
                
                setDueTasks(allDueTasks);
                setHasAnyTasksConfigured(anyTasks);
            }
        } catch (error) {
            console.error('Error fetching crops for home:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCropsData();
        }, [])
    );

    const handleCompleteTask = async (activeCropId, taskId) => {
        try {
            // Optimistically update UI
            setDueTasks(prev => prev.filter(t => t.taskId !== taskId));

            const response = await fetch(`${API_BASE_URL}/crops/task/complete`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeCropId, taskId })
            });
            const json = await response.json();
            
            if (!json.success) {
                // Revert on failure
                fetchCropsData();
            }
        } catch (error) {
            console.error("Error completing task:", error);
            fetchCropsData();
        }
    };

    const handleScanNow = async () => {
        try {
            // Request camera permissions first
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your camera!");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Disabled to prevent the Android "Crop Grid" freeze
                quality: 0.2, // Extremely low quality safely prevents ImagePicker crashes
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const base64Image = asset.base64;
                const mimeType = asset.mimeType || 'image/jpeg';

                setDiagnosing(true);
                
                // Send to backend
                const response = await fetch(`${API_BASE_URL}/ai/diagnose`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: base64Image,
                        mimeType: mimeType
                    })
                });

                const json = await response.json();
                
                if (json.success) {
                    setDiagnosisResult(json.data);
                    setModalVisible(true);
                } else {
                    alert('Diagnosis Failed: ' + (json.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error("Scanning error:", error);
            alert("Error taking photo. Please try again.");
        } finally {
            setDiagnosing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconBg}>
                            <MaterialCommunityIcons name="sprout" size={30} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>AgriGrow</Text>
                        <TouchableOpacity style={styles.assistantButton} onPress={() => router.push('/assistant')}>
                            <MaterialCommunityIcons name="robot-outline" size={20} color="#00C853" style={{ marginRight: 6 }} />
                            <Text style={styles.assistantButtonText}>Assistant</Text>
                        </TouchableOpacity>
                    </View>
                    <HeaderDropdown />
                </View>

                {/* Selected Crops */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropsContainer}>
                    {[
                        { name: 'Tomato', color: '#ffbaba', border: '#00C853', icon: 'fruit-cherries' },
                        { name: 'Carrot', color: '#ffd6a5', border: 'transparent', icon: 'carrot' },
                        { name: 'Cabbage', color: '#d4edda', border: 'transparent', icon: 'leaf' },
                        { name: 'Pepper', color: '#ffeeba', border: 'transparent', icon: 'pepper-hot' },
                    ].map((crop, index) => (
                        <View key={index} style={styles.cropItem}>
                            <View style={[styles.cropImageContainer, { borderColor: crop.border }]}>
                                {/* Using icon as placeholder for realistic images */}
                                <MaterialCommunityIcons name={crop.icon} size={40} color="#555" />
                            </View>
                            <Text style={[styles.cropText, index === 0 && styles.cropTextActive]}>{crop.name}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Daily Widgets — side by side */}
                <View style={styles.widgetsRow}>

                    {/* Weather Widget */}
                    <View style={styles.weatherWidgetCard}>
                        <View style={styles.widgetHeaderRow}>
                            <Text style={styles.weatherWidgetTitle} numberOfLines={1} adjustsFontSizeToFit>
                                {weather?.city && weather?.state ? `${weather.city}, ${weather.state}` : (weather?.city || 'Weather')}
                            </Text>
                            <MaterialCommunityIcons
                                name={weather?.icon || 'weather-partly-cloudy'}
                                size={20}
                                color="#0288D1"
                            />
                        </View>
                        {weatherLoading ? (
                            <ActivityIndicator size="small" color="#0288D1" style={{ marginVertical: 6 }} />
                        ) : (
                            <>
                                <Text style={styles.weatherWidgetTemp}>
                                    {weather ? `${weather.temp}°C` : '28°C'}
                                </Text>
                                <Text style={styles.weatherWidgetDesc} numberOfLines={1}>
                                    {weather
                                        ? weather.description.charAt(0).toUpperCase() + weather.description.slice(1)
                                        : 'Sunny'}
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="water-percent" size={12} color="#64B5F6" />
                                        <Text style={{ fontSize: 10, color: '#64B5F6', marginLeft: 2 }}>{weather?.humidity ?? '--'}%</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="weather-windy" size={12} color="#64B5F6" />
                                        <Text style={{ fontSize: 10, color: '#64B5F6', marginLeft: 2 }}>{weather?.windSpeed ?? '--'} m/s</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Today's Work Widget */}
                    <View style={styles.widgetCard}>
                        <View style={styles.widgetHeaderRow}>
                            <Text style={styles.widgetTitle}>Today's Work</Text>
                            {dueTasks.length > 0 && <View style={styles.notificationDot} />}
                        </View>
                        
                        {loadingTasks ? (
                            <ActivityIndicator size="small" color="#00C853" style={{ marginVertical: 10 }} />
                        ) : (activeCrops.length === 0 || !hasAnyTasksConfigured) ? (
                            <>
                                <TouchableOpacity style={styles.taskRow} onPress={() => router.push('/start-crop')}>
                                    <MaterialCommunityIcons name="sprout" size={16} color="#00C853" />
                                    <Text style={styles.taskText}>Start a crop</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.taskRow} onPress={() => router.push('/fert-calc')}>
                                    <MaterialCommunityIcons name="calculator" size={16} color="#0288D1" />
                                    <Text style={styles.taskText}>Check Agri calc</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.taskRow} onPress={() => router.push('/(tabs)/community')}>
                                    <MaterialCommunityIcons name="account-group" size={16} color="#f57c00" />
                                    <Text style={styles.taskText}>Start a discussion</Text>
                                </TouchableOpacity>
                            </>
                        ) : dueTasks.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#ccc" />
                                <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>All done for today!</Text>
                            </View>
                        ) : (
                            dueTasks.slice(0, 3).map(task => (
                                <View key={task.taskId} style={styles.taskRow}>
                                    <TouchableOpacity onPress={() => handleCompleteTask(task.activeCropId, task.taskId)}>
                                        <MaterialCommunityIcons name="circle-outline" size={18} color="#ccc" />
                                    </TouchableOpacity>
                                    <Text style={styles.taskText} numberOfLines={1}>{task.title}</Text>
                                </View>
                            ))
                        )}
                        
                        {!loadingTasks && activeCrops.length > 0 && dueTasks.length > 3 && (
                            <TouchableOpacity onPress={() => router.push('/(tabs)/crops')}>
                                <Text style={{ fontSize: 11, color: '#00C853', textAlign: 'center', marginTop: 4 }}>+{dueTasks.length - 3} more</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

                {/* Diagnostic Scanner */}
                <View style={styles.diagnosticCard}>
                    <View style={styles.diagnosticContent}>
                        <Text style={styles.diagnosticTitle}>Plant Diagnostic</Text>
                        <Text style={styles.diagnosticDesc}>Take a photo to identify plant illness instantly</Text>
                        <TouchableOpacity style={styles.scanButton} onPress={handleScanNow} disabled={diagnosing}>
                            {diagnosing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.scanButtonText}>Scan Now</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <MaterialCommunityIcons name="head-question-outline" size={80} color="#a5d6a7" style={styles.diagnosticWatermark} />
                </View>

                {/* Start a Crop */}
                <TouchableOpacity style={styles.startCropCard} onPress={() => router.push('/start-crop')}>
                    <View style={styles.startCropIconBg}>
                        <MaterialCommunityIcons name="seed-outline" size={28} color="#00C853" />
                    </View>
                    <View style={styles.startCropContent}>
                        <Text style={styles.startCropTitle}>Start a Crop</Text>
                        <Text style={styles.startCropDesc}>Add a new crop to your farm and track its progress.</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>

                {/* Farming News */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Farming News</Text>
                    <Text style={styles.viewAllText}>View All</Text>
                </View>
                <View style={styles.newsCard}>
                    <View style={styles.newsImagePlaceholder}>
                        <MaterialCommunityIcons name="sprout-outline" size={30} color="#888" />
                    </View>
                    <View style={styles.newsContent}>
                        <Text style={styles.newsTitle}>New irrigation techniques in 2024</Text>
                        <Text style={styles.newsExcerpt}>How smart sensors are saving 40% more water in arid regions...</Text>
                    </View>
                </View>
                <View style={styles.newsCard}>
                    <View style={styles.newsImagePlaceholder}>
                        <MaterialCommunityIcons name="flask-outline" size={30} color="#888" />
                    </View>
                    <View style={styles.newsContent}>
                        <Text style={styles.newsTitle}>The rise of organic fertilizers</Text>
                        <Text style={styles.newsExcerpt}>Why local farms are switching back to natural alternatives this season...</Text>
                    </View>
                </View>

                {/* Tools */}
                <Text style={[styles.sectionTitle, { marginTop: 12, marginBottom: 12 }]}>Tools</Text>
                <View style={styles.toolsRow}>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/seed-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="seed" size={24} color="#00C853" />
                        </View>
                        <Text style={styles.toolText}>SEED CALC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/fert-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="calculator" size={24} color="#00C853" />
                        </View>
                        <Text style={styles.toolText}>FERT CALC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/pest-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="bug" size={24} color="#00C853" />
                        </View>
                        <Text style={styles.toolText}>PEST DOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/irrigation-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="water" size={24} color="#0288D1" />
                        </View>
                        <Text style={styles.toolText}>IRRIGATION</Text>
                    </TouchableOpacity>
                </View>

                {/* Library */}
                <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>Library</Text>
                    <Text style={styles.viewAllText}>Explore</Text>
                </View>
                <View style={styles.libraryGrid}>
                    <View style={styles.libraryCard}>
                        <View style={[styles.libraryImageBg, { backgroundColor: '#4a4a4a' }]} />
                        <Text style={styles.libraryCardText}>Pest Control Guide</Text>
                    </View>
                    <View style={styles.libraryCard}>
                        <View style={[styles.libraryImageBg, { backgroundColor: '#388E3C' }]} />
                        <Text style={styles.libraryCardText}>Irrigation Mastery</Text>
                    </View>
                    <View style={styles.libraryCard}>
                        <View style={[styles.libraryImageBg, { backgroundColor: '#795548' }]} />
                        <Text style={styles.libraryCardText}>Soil Health 101</Text>
                    </View>
                    <View style={styles.libraryCard}>
                        <View style={[styles.libraryImageBg, { backgroundColor: '#2E7D32' }]} />
                        <Text style={styles.libraryCardText}>Harvest Secrets</Text>
                    </View>
                </View>

                {/* Diagnostic Result Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="leaf" size={24} color="#00C853" />
                                <Text style={styles.modalTitle}>Diagnosis Result</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            {diagnosisResult && (
                                <View style={styles.modalBody}>
                                    <Text style={styles.resultLabel}>Issue Detected:</Text>
                                    <Text style={[
                                        styles.resultDisease, 
                                        { color: (diagnosisResult.disease || '').toLowerCase() === 'healthy' ? '#00C853' : '#d32f2f' }
                                    ]}>
                                        {diagnosisResult.disease || 'Unknown'}
                                    </Text>
                                    
                                    <View style={styles.divider} />
                                    
                                    <Text style={styles.resultLabel}>Recommended Care:</Text>
                                    <Text style={styles.resultCure}>
                                        {diagnosisResult.cure || 'No treatment recommendations available.'}
                                    </Text>
                                </View>
                            )}
                            
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCloseButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4', // Off-white/light gray background
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIconBg: {
        backgroundColor: '#00C853',
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    assistantButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 12,
    },
    assistantButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00C853',
    },
    cropsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    cropItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    cropImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eee', // fallback
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    cropText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    cropTextActive: {
        color: '#111',
        fontWeight: 'bold',
    },
    widgetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    widgetCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    widgetHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    widgetTitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    notificationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00C853',
    },
    temperature: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    weatherDesc: {
        fontSize: 12,
        color: '#888',
    },
    // ── Compact weather widget (side-by-side) ────────────────────
    weatherWidgetCard: {
        flex: 1,
        backgroundColor: '#e3f2fd',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#0288D1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    weatherWidgetTitle: {
        fontSize: 13,
        color: '#0277BD',
        fontWeight: '600',
    },
    weatherWidgetTemp: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#01579B',
        marginBottom: 2,
        marginTop: 8,
    },
    weatherWidgetDesc: {
        fontSize: 12,
        color: '#0288D1',
        marginBottom: 2,
    },
    weatherWidgetLow: {
        fontSize: 11,
        color: '#64B5F6',
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTextDone: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        textDecorationLine: 'line-through',
    },
    taskText: {
        fontSize: 12,
        color: '#333',
        marginLeft: 8,
    },
    diagnosticCard: {
        backgroundColor: '#e8f5e9', // Light green background
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
        overflow: 'hidden',
        position: 'relative',
    },
    diagnosticContent: {
        flex: 1,
        zIndex: 2,
    },
    diagnosticTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 6,
    },
    diagnosticDesc: {
        fontSize: 13,
        color: '#555',
        marginBottom: 16,
        lineHeight: 18,
    },
    scanButton: {
        flexDirection: 'row',
        backgroundColor: '#00C853',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    scanButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    diagnosticWatermark: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        opacity: 0.5,
        zIndex: 1,
        transform: [{ scale: 1.2 }],
    },
    startCropCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    startCropIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    startCropContent: {
        flex: 1,
    },
    startCropTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    startCropDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    viewAllText: {
        fontSize: 13,
        color: '#00C853',
        fontWeight: 'bold',
    },
    newsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    newsImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    newsContent: {
        flex: 1,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
    },
    newsExcerpt: {
        fontSize: 12,
        color: '#777',
        lineHeight: 16,
    },
    toolsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    toolCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    toolIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    toolText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#555',
        letterSpacing: 0.5,
    },
    libraryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    libraryCard: {
        width: '48%',
        height: 140,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    libraryImageBg: {
        ...StyleSheet.absoluteFillObject,
    },
    libraryCardText: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    // ── Modal Styles ────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    modalBody: {
        marginBottom: 24,
    },
    resultLabel: {
        fontSize: 13,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultDisease: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 16,
    },
    resultCure: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    modalCloseButton: {
        backgroundColor: '#00C853',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
