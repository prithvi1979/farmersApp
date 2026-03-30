import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function CropsScreen() {
    const router = useRouter();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCrops = async () => {
        try {
            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            const res = await fetch(`${API_BASE_URL}/crops/active/${deviceId}`);
            const json = await res.json();
            
            if (json.success) {
                setCrops(json.data);
            }
        } catch (error) {
            console.error('Error fetching crops:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCrops();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCrops();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Your Crops</Text>
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#00C853" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Crops</Text>
                <TouchableOpacity onPress={() => router.push('/start-crop')} style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={24} color="#00C853" />
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C853']} />}
            >
                {crops.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="sprout-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Active Crops</Text>
                        <Text style={styles.emptyDesc}>You haven't started any crops yet. Tap the + icon to begin your farming journey!</Text>
                        <TouchableOpacity style={styles.startCropBtn} onPress={() => router.push('/start-crop')}>
                            <Text style={styles.startCropBtnText}>Start a Crop</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    crops.map((crop) => (
                        <View key={crop._id} style={styles.cropCard}>
                            <View style={styles.cropHeader}>
                                <View style={styles.cropIconBg}>
                                    <MaterialCommunityIcons name="leaf" size={24} color="#00C853" />
                                </View>
                                <View style={styles.cropInfo}>
                                    <Text style={styles.cropName}>{crop.cropName || 'Crop'}</Text>
                                    <Text style={styles.cropStarted}>
                                        Started: {new Date(crop.startDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, crop.status === 'inactive' && { backgroundColor: '#ffebee' }]}>
                                    <Text style={[styles.statusText, crop.status === 'inactive' && { color: '#d32f2f' }]}>
                                        {crop.status === 'inactive' ? 'Inactive' : 'Active'}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Workflow Progress Dashboard Snippet */}
                            {crop.status !== 'inactive' && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressTitle}>Progress</Text>
                                        <Text style={styles.progressPercent}>{crop.completionPercentage || 0}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${crop.completionPercentage || 0}%` }]} />
                                    </View>
                                    {crop.currentPhaseName && crop.currentPhaseName !== 'N/A' && (
                                        <Text style={styles.phaseInfoText}>
                                            Current Phase: <Text style={{fontWeight: 'bold', color: '#333'}}>{crop.currentPhaseName}</Text> ({crop.daysRemaining} days left)
                                        </Text>
                                    )}
                                </View>
                            )}

                            <View style={styles.divider} />
                            
                            {crop.status === 'inactive' ? (
                                <Text style={[styles.taskHeader, { color: '#d32f2f', fontSize: 13, lineHeight: 18, fontStyle: 'italic' }]}>
                                    You can soon start your crop after we create a customised task to do list for you
                                </Text>
                            ) : (
                                <Text style={styles.taskHeader}>
                                    {crop.dueTasks && crop.dueTasks.length > 0 ? `${crop.dueTasks.length} Tasks Pending Right Now` : 'Looking good! No pending tasks.'}
                                </Text>
                            )}

                            {crop.status !== 'inactive' && crop.dueTasks && crop.dueTasks.map(task => (
                                <View key={task._id || task.taskId} style={styles.taskRow}>
                                    <MaterialCommunityIcons name="circle-outline" size={18} color="#f57c00" />
                                    <View style={styles.taskDetails}>
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        {task.phaseName && <Text style={styles.taskPhase}>Phase: {task.phaseName}</Text>}
                                    </View>
                                </View>
                            ))}
                            
                            {crop.status !== 'inactive' && (
                                <TouchableOpacity 
                                    style={styles.seeInstructionsBtn}
                                    onPress={() => router.push(`/crop-instructions/${crop._id}`)}
                                >
                                    <Text style={styles.seeInstructionsBtnText}>Workflow & Instructions</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f8f4', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#444', marginTop: 16, marginBottom: 8 },
    emptyDesc: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    startCropBtn: { backgroundColor: '#00C853', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
    startCropBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cropCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cropHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cropIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cropInfo: { flex: 1 },
    cropName: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
    cropStarted: { fontSize: 12, color: '#666' },
    statusBadge: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, color: '#0288D1', fontWeight: 'bold' },
    progressContainer: { marginTop: 16, backgroundColor: '#fafafa', padding: 12, borderRadius: 12 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressTitle: { fontSize: 13, color: '#555', fontWeight: 'bold' },
    progressPercent: { fontSize: 13, color: '#00C853', fontWeight: 'bold' },
    progressBarBg: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
    progressBarFill: { height: '100%', backgroundColor: '#00C853' },
    phaseInfoText: { fontSize: 12, color: '#666' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    taskHeader: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 12 },
    taskRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, backgroundColor: '#fafafa', padding: 12, borderRadius: 8 },
    taskDetails: { marginLeft: 12, flex: 1 },
    taskTitle: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 4 },
    taskPhase: { fontSize: 12, color: '#888' },
    seeInstructionsBtn: { flexDirection: 'row', backgroundColor: '#00C853', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    seeInstructionsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginRight: 8 }
});
