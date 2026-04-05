import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar, Alert, useWindowDimensions, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RenderHtml from 'react-native-render-html';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function CropInstructionsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [togglingTaskId, setTogglingTaskId] = useState(null);
    const [isClarifyModalVisible, setIsClarifyModalVisible] = useState(false);
    const [clarifyQuestion, setClarifyQuestion] = useState('');
    const [clarifyResponse, setClarifyResponse] = useState('');
    const [clarifyLoading, setClarifyLoading] = useState(false);
    const [currentClarifyTask, setCurrentClarifyTask] = useState(null);

    const openClarifyModal = (task) => {
        setCurrentClarifyTask(task);
        setClarifyQuestion('');
        setClarifyResponse('');
        setIsClarifyModalVisible(true);
    };

    const handleAskClarification = async () => {
        if (!clarifyQuestion.trim() || !currentClarifyTask) return;
        setClarifyLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/ai/clarify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: clarifyQuestion,
                    context: {
                        title: currentClarifyTask.title,
                        description: currentClarifyTask.description
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                setClarifyResponse(data.response);
            } else {
                Alert.alert('Error', data.error || 'Failed to get clarification.');
            }
        } catch (error) {
            console.error('Clarification error:', error);
            Alert.alert('Error', 'Failed to reach AI service.');
        } finally {
            setClarifyLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCropDetails();
        }
    }, [id]);

    const fetchCropDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/crops/active-crop/${id}`);
            const data = await response.json();
            if (data.success) {
                setCrop(data.data);
            }
        } catch (error) {
            console.error('Error fetching crop details:', error);
            Alert.alert('Error', 'Failed to load crop instructions.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (phaseId, taskId, currentStatus) => {
        if (currentStatus === 'completed' || currentStatus === 'locked') return; 
        setTogglingTaskId(taskId);
        try {
            const response = await fetch(`${API_BASE_URL}/crops/task/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activeCropId: id,
                    phaseId: phaseId,
                    taskId: taskId
                })
            });
            const data = await response.json();

            if (data.success) {
                // Instantly re-fetch crop details to get the exact new calculated state from backend
                // since the backend logic unlocks the next task/phase dynamically
                fetchCropDetails();
            } else {
                Alert.alert('Error', data.error || 'Failed to update task.');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            Alert.alert('Error', 'Failed to update task status.');
        } finally {
            // togglingTaskId gets cleared when fetch finishes
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

    if (!crop) return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.center}><Text>Crop not found.</Text></View>
        </SafeAreaView>
    );

    // Find current active phase for dashboard
    let currentPhase = null;
    let daysLeft = 0;
    if (crop.phases) {
        currentPhase = crop.phases.find(p => p.status === 'in_progress');
        if (currentPhase && currentPhase.expectedEndDate) {
            const diff = new Date(currentPhase.expectedEndDate) - new Date();
            daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
    }

    const renderTask = (task, phaseId) => {
        const isLocked = task.status === 'locked';
        const isCompleted = task.status === 'completed';
        const isPending = task.status === 'pending';

        return (
            <View key={task._id} style={[
                styles.taskCard, 
                isLocked && styles.taskCardLocked,
                isCompleted && styles.taskCardCompleted,
                isPending && styles.taskCardPending
            ]}>
                <View style={styles.taskHeader}>
                    <Text style={[styles.taskTitle, isCompleted && styles.textCompleted]}>
                        Step {task.order}: {task.title}
                    </Text>
                    {isCompleted && <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />}
                    {isLocked && <MaterialCommunityIcons name="lock" size={18} color="#9e9e9e" />}
                </View>

                {(!isLocked || isCompleted) && task.description ? (
                    <View style={styles.htmlContainer}>
                        <RenderHtml
                            contentWidth={width - 80}
                            source={{ html: task.description }}
                            baseStyle={{
                                ...styles.taskDescHtml,
                                color: isCompleted ? '#888' : '#444'
                            }}
                        />
                    </View>
                ) : null}

                {/** Show required materials acting as chips **/}
                {task.requiredMaterials && task.requiredMaterials.length > 0 && !isLocked && (
                    <View style={styles.materialsContainer}>
                        <Text style={styles.materialsLabel}>Required:</Text>
                        <View style={styles.chipsRow}>
                            {task.requiredMaterials.map((mat, i) => (
                                <View key={i} style={styles.chip}><Text style={styles.chipText}>{mat}</Text></View>
                            ))}
                        </View>
                    </View>
                )}

                {/** Ask Clarifications Button **/}
                {!isLocked && (
                    <TouchableOpacity 
                        style={styles.clarifyBtn}
                        onPress={() => openClarifyModal(task)}
                        disabled={togglingTaskId === task._id}
                    >
                        <MaterialCommunityIcons name="chat-question-outline" size={20} color="#0288D1" />
                        <Text style={styles.clarifyBtnText}>Ask Clarifications</Text>
                    </TouchableOpacity>
                )}

                {/** The Main Action Button **/}
                <TouchableOpacity 
                    style={[
                        styles.actionBtn, 
                        isCompleted ? styles.actionBtnCompleted : (isLocked ? styles.actionBtnLocked : styles.actionBtnPending)
                    ]}
                    onPress={() => handleToggleComplete(phaseId, task._id, task.status)}
                    disabled={isCompleted || isLocked || togglingTaskId === task._id}
                >
                    {togglingTaskId === task._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <MaterialCommunityIcons 
                                name={isCompleted ? "check" : (isLocked ? "lock" : "checkbox-marked-circle-outline")} 
                                size={20} 
                                color={isCompleted ? "#4CAF50" : (isLocked ? "#9e9e9e" : "#fff")} 
                            />
                            <Text style={[
                                styles.actionBtnText,
                                isCompleted && styles.actionBtnTextCompleted,
                                isLocked && styles.actionBtnTextLocked
                            ]}>
                                {isCompleted ? "Done" : (isLocked ? "Locked" : "Mark as Done")}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{crop.cropName}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Dashboard Widget */}
                <View style={styles.dashboardCard}>
                    <Text style={styles.dashTitle}>Overall Progress</Text>
                    <Text style={styles.dashPercent}>{crop.completionPercentage || 0}%</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${crop.completionPercentage || 0}%` }]} />
                    </View>
                    {currentPhase && (
                        <View style={styles.dashPhaseInfo}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#0288D1" />
                            <Text style={styles.dashPhaseText}>
                                Phase: {currentPhase.name} • {daysLeft} days left
                            </Text>
                        </View>
                    )}
                </View>

                {/* Workflow Display */}
                <Text style={styles.workflowTitle}>Workflow</Text>
                <Text style={styles.workflowSub}>Complete tasks sequentially to unlock the next steps.</Text>

                {crop.phases && crop.phases.map((phase) => {
                    const isPhaseLocked = phase.status === 'locked';
                    const isPhaseCompleted = phase.status === 'completed';
                    const isPhaseInProgress = phase.status === 'in_progress';

                    return (
                        <View key={phase._id} style={[
                            styles.phaseContainer,
                            isPhaseLocked && styles.phaseContainerLocked,
                            isPhaseCompleted && styles.phaseContainerCompleted,
                            isPhaseInProgress && styles.phaseContainerProgress
                        ]}>
                            <View style={styles.phaseHeader}>
                                <View style={styles.phaseHeaderLeft}>
                                    <View style={[
                                        styles.phaseNumBadge,
                                        isPhaseLocked ? {backgroundColor: '#e0e0e0'} : (isPhaseCompleted ? {backgroundColor: '#E8F5E9'} : {backgroundColor: '#00C853'})
                                    ]}>
                                        <Text style={[
                                            styles.phaseNumText,
                                            isPhaseLocked ? {color: '#757575'} : (isPhaseCompleted ? {color: '#4CAF50'} : {color: '#fff'})
                                        ]}>{phase.order}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.phaseName, isPhaseLocked && {color: '#9e9e9e'}]}>{phase.name}</Text>
                                        <Text style={styles.phaseDuration}>{phase.durationDays} Days Duration</Text>
                                    </View>
                                </View>
                                {isPhaseCompleted && <MaterialCommunityIcons name="check-decagram" size={24} color="#4CAF50" />}
                                {isPhaseLocked && <MaterialCommunityIcons name="lock-outline" size={22} color="#bdbdbd" />}
                            </View>

                            {/* Only show tasks if phase is in progress or completed */}
                            {(!isPhaseLocked) && (
                                <View style={styles.tasksList}>
                                    {phase.tasks.map(task => renderTask(task, phase._id))}
                                </View>
                            )}
                        </View>
                    );
                })}
                <View style={{height: 40}} />
            </ScrollView>

            {/* Clarification Modal */}
            <Modal
                visible={isClarifyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsClarifyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ask Clarifications</Text>
                            <TouchableOpacity onPress={() => setIsClarifyModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {currentClarifyTask && (
                            <Text style={styles.modalSubtitle} numberOfLines={1}>
                                Context: {currentClarifyTask.title}
                            </Text>
                        )}
                        <TextInput
                            style={styles.modalInput}
                            placeholder="What do you want to ask?"
                            placeholderTextColor="#999"
                            value={clarifyQuestion}
                            onChangeText={setClarifyQuestion}
                            multiline
                        />
                        <TouchableOpacity 
                            style={styles.modalSubmitBtn} 
                            onPress={handleAskClarification}
                            disabled={clarifyLoading || !clarifyQuestion.trim()}
                        >
                            {clarifyLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Submit Question</Text>}
                        </TouchableOpacity>
                        
                        {clarifyResponse ? (
                            <View style={styles.modalResponseContainer}>
                                <Text style={styles.modalResponseLabel}>Answer:</Text>
                                <ScrollView style={{maxHeight: 200}}>
                                    <Text style={styles.modalResponseText}>{clarifyResponse}</Text>
                                </ScrollView>
                            </View>
                        ) : null}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f8f4', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    scrollContent: { padding: 16 },
    
    // Dashboard Styles
    dashboardCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 4, shadowColor: '#00C853', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    dashTitle: { fontSize: 16, color: '#555', fontWeight: 'bold' },
    dashPercent: { fontSize: 42, fontWeight: '900', color: '#00C853', marginVertical: 8 },
    progressBarBg: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    progressBarFill: { height: '100%', backgroundColor: '#00C853', borderRadius: 4 },
    dashPhaseInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e1f5fe', padding: 10, borderRadius: 8, marginTop: 4 },
    dashPhaseText: { color: '#0277bd', fontWeight: '600', marginLeft: 8, fontSize: 13 },
    
    workflowTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
    workflowSub: { fontSize: 14, color: '#666', marginBottom: 16 },

    // Phase Styles
    phaseContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    phaseContainerProgress: { borderColor: '#00C853', borderWidth: 2, elevation: 2 },
    phaseContainerLocked: { backgroundColor: '#f5f5f5', opacity: 0.8 },
    phaseContainerCompleted: { backgroundColor: '#fafafa', borderColor: '#E8F5E9' },
    phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    phaseHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    phaseNumBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    phaseNumText: { fontWeight: 'bold', fontSize: 16 },
    phaseName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
    phaseDuration: { fontSize: 12, color: '#888', marginTop: 2 },
    
    tasksList: { padding: 16, paddingTop: 4, backgroundColor: '#fafafa', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    
    // Task Card Styles
    taskCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    taskCardPending: { borderLeftWidth: 4, borderLeftColor: '#00C853' },
    taskCardCompleted: { opacity: 0.75, backgroundColor: '#f9f9f9', borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
    taskCardLocked: { opacity: 0.6, backgroundColor: '#f5f5f5' },
    
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, paddingRight: 8 },
    textCompleted: { textDecorationLine: 'line-through', color: '#777' },
    
    htmlContainer: { marginBottom: 12 },
    taskDescHtml: { fontSize: 14, lineHeight: 22 },
    
    materialsContainer: { marginBottom: 12 },
    materialsLabel: { fontSize: 12, fontWeight: 'bold', color: '#777', marginBottom: 6 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#ffe0b2' },
    chipText: { color: '#e65100', fontSize: 12, fontWeight: '600' },
    
    // Buttons
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginTop: 4 },
    actionBtnPending: { backgroundColor: '#00C853' },
    actionBtnCompleted: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4CAF50' },
    actionBtnLocked: { backgroundColor: '#e0e0e0' },
    
    actionBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
    actionBtnTextCompleted: { color: '#4CAF50' },
    actionBtnTextLocked: { color: '#9e9e9e' },
    
    // Clarification Button & Modal
    clarifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, marginTop: 12, backgroundColor: '#e1f5fe', borderWidth: 1, borderColor: '#81d4fa' },
    clarifyBtnText: { color: '#0288D1', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 16 },
    modalInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 15, color: '#333', minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
    modalSubmitBtn: { backgroundColor: '#0288D1', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalSubmitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalResponseContainer: { marginTop: 20, backgroundColor: '#f1f8e9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#c5e1a5' },
    modalResponseLabel: { fontSize: 14, fontWeight: 'bold', color: '#33691e', marginBottom: 8 },
    modalResponseText: { fontSize: 14, color: '#333', lineHeight: 22 }
});
