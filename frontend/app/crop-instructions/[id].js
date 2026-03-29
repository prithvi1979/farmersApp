import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function CropInstructionsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [togglingTaskId, setTogglingTaskId] = useState(null);

    useEffect(() => {
        if (id) {
            fetchCropDetails();
        }
    }, [id]);

    const fetchCropDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/crops/active-crop/${id}`);
            if (response.data.success) {
                setCrop(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching crop details:', error);
            Alert.alert('Error', 'Failed to load crop instructions.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (taskId, currentStatus) => {
        if (currentStatus) return; // Prevent un-completing if not supported
        setTogglingTaskId(taskId);
        try {
            const response = await axios.patch(`${API_BASE_URL}/crops/task/complete`, {
                activeCropId: id,
                taskId: taskId
            });

            if (response.data.success) {
                setCrop(prev => {
                    const newCrop = { ...prev };
                    const taskIndex = newCrop.dailyTasks.findIndex(t => t.taskId === taskId);
                    if (taskIndex > -1) {
                        newCrop.dailyTasks[taskIndex].isCompleted = true;
                        newCrop.dailyTasks[taskIndex].completedAt = new Date();
                    }
                    return newCrop;
                });
            }
        } catch (error) {
            console.error('Error completing task:', error);
            Alert.alert('Error', 'Failed to update task status.');
        } finally {
            setTogglingTaskId(null);
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

    if (!crop) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.center}>
                    <Text>Crop not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{crop.cropName || 'Instructions'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Cultivation Timeline</Text>
                    <Text style={styles.summaryDesc}>Follow these steps to ensure a healthy harvest. Mark each task as completed to track your progress.</Text>
                </View>

                {crop.dailyTasks && crop.dailyTasks.map((task, index) => {
                    const dueDate = new Date(task.dueDate);
                    const isOverdue = dueDate < today && !task.isCompleted;

                    return (
                        <View 
                            key={task.taskId || index} 
                            style={[
                                styles.taskCard, 
                                task.isCompleted && styles.taskCardCompleted,
                                isOverdue && styles.taskCardOverdue
                            ]}
                        >
                            <View style={styles.taskHeader}>
                                <View style={styles.phaseBadge}>
                                    <Text style={styles.phaseText}>{task.phase || 'Daily Care'}</Text>
                                </View>
                                <Text style={styles.dateText}>Due: {dueDate.toLocaleDateString()}</Text>
                            </View>

                            <Text style={[styles.taskTitle, task.isCompleted && styles.textCompleted]}>
                                Day {task.targetDay}: {task.title}
                            </Text>

                            {task.instructions ? (
                                <Text style={styles.taskDesc}>{task.instructions}</Text>
                            ) : null}

                            {isOverdue && (
                                <View style={styles.overdueWarningContainer}>
                                    <MaterialCommunityIcons name="alert-circle" size={16} color="#D32F2F" />
                                    <Text style={styles.overdueWarningText}>Last task as not completed</Text>
                                </View>
                            )}

                            <TouchableOpacity 
                                style={[
                                    styles.actionBtn, 
                                    task.isCompleted ? styles.actionBtnCompleted : styles.actionBtnPending,
                                    isOverdue && !task.isCompleted && styles.actionBtnOverdue
                                ]}
                                onPress={() => handleToggleComplete(task.taskId, task.isCompleted)}
                                disabled={task.isCompleted || togglingTaskId === task.taskId}
                            >
                                {togglingTaskId === task.taskId ? (
                                    <ActivityIndicator size="small" color={isOverdue ? "#fff" : "#fff"} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons 
                                            name={task.isCompleted ? "check-circle" : "circle-outline"} 
                                            size={20} 
                                            color={task.isCompleted ? "#4CAF50" : "#fff"} 
                                        />
                                        <Text style={[
                                            styles.actionBtnText,
                                            task.isCompleted && styles.actionBtnTextCompleted
                                        ]}>
                                            {task.isCompleted ? "Completed" : "Mark as Completed"}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
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
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
    },
    scrollContent: {
        padding: 16,
    },
    summaryCard: {
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    summaryDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#00C853',
    },
    taskCardCompleted: {
        borderLeftColor: '#E0E0E0',
        backgroundColor: '#fafafa',
        opacity: 0.8,
    },
    taskCardOverdue: {
        borderLeftColor: '#D32F2F',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    phaseBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    phaseText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    textCompleted: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    taskDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 16,
    },
    overdueWarningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    overdueWarningText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 13,
        marginLeft: 6,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionBtnPending: {
        backgroundColor: '#00C853',
    },
    actionBtnOverdue: {
        backgroundColor: '#D32F2F',
    },
    actionBtnCompleted: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    actionBtnTextCompleted: {
        color: '#4CAF50',
    }
});
