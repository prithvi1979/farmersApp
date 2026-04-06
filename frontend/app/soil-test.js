import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { Picker } from '@react-native-picker/picker'; // You might need to install @react-native-picker/picker if not already, using react-native simple picker or custom UI instead to be safe without new dependencies.

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

const steps = [
    { title: "Introduction", icon: "flask-outline" },
    { title: "pH Test", icon: "test-tube" },
    { title: "Texture (Jar Test)", icon: "layers" },
    { title: "Drainage Test", icon: "water" },
    { title: "Organic Matter", icon: "leaf" },
    { title: "NPK Levels", icon: "flask" },
    { title: "Report Card", icon: "file-document" }
];

export default function SoilTestScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [deviceId, setDeviceId] = useState('');
    const [soilData, setSoilData] = useState({
        ph: null,
        texture: 'loam',
        drainageTime: 'ideal',
        organicMatter: 'medium',
        npk: { nitrogen: 'medium', phosphorus: 'medium', potassium: 'medium' }
    });

    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const init = async () => {
            const id = await AsyncStorage.getItem('deviceId');
            if (id) {
                setDeviceId(id);
                // Try fetching existing test data
                try {
                    const res = await fetch(`${API_BASE_URL}/users/profile/${id}`);
                    const json = await res.json();
                    if (json.success && json.data.soilTest) {
                        setSoilData({ ...soilData, ...json.data.soilTest });
                    }
                } catch (e) {
                    console.log('Could not fetch existing soil test.');
                }
            }
        };
        init();
    }, []);

    const saveAndNext = async () => {
        if (!deviceId) return;
        setLoading(true);

        try {
            // Save to backend
            const res = await fetch(`${API_BASE_URL}/users/profile/${deviceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soilTest: soilData })
            });

            if (currentStep === 5) {
                // If we finished step 5 (NPK), generate AI report
                const reportRes = await fetch(`${API_BASE_URL}/ai/soil-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ soilTest: soilData })
                });
                
                const reportJson = await reportRes.json();
                if (reportJson.success) {
                    setReportData(reportJson.data);
                    setCurrentStep(6);
                } else {
                    Alert.alert("Error", reportJson.error || "Failed to generate AI report.");
                }
            } else {
                // Just go to next step
                setCurrentStep(currentStep + 1);
            }
        } catch (e) {
            console.error("Save error:", e);
            Alert.alert("Error", "Could not save your test data. Check internet.");
        } finally {
            setLoading(false);
        }
    };

    // --- Custom Picker/Selector Component to avoid native dependency pitfalls ---
    const CustomSelector = ({ label, options, selectedValue, onSelect }) => (
        <View style={styles.selectorContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.optionsRow}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[styles.optionNav, selectedValue === opt.value && styles.optionNavSelected]}
                        onPress={() => onSelect(opt.value)}
                    >
                        <Text style={[styles.optionText, selectedValue === opt.value && styles.optionTextSelected]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <View style={styles.cardInfo}>
                        <View style={styles.introHeader}>
                            <MaterialCommunityIcons name="flask-outline" size={48} color="#795548" />
                            <Text style={styles.introTitle}>{t('welcomeSoilTest')}</Text>
                        </View>
                        <Text style={styles.introDesc}>{t('soilIntroDesc')}</Text>
                        <View style={styles.checklist}>
                            <Text style={styles.checkItem}>{t('soilCheck1')}</Text>
                            <Text style={styles.checkItem}>{t('soilCheck2')}</Text>
                            <Text style={styles.checkItem}>{t('soilCheck3')}</Text>
                            <Text style={styles.checkItem}>{t('soilCheck4')}</Text>
                            <Text style={styles.checkItem}>{t('soilCheck5')}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setCurrentStep(1)}>
                            <Text style={styles.actionBtnText}>{t('startTest1')}</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                );
            case 1:
                return (
                    <View style={styles.cardInfo}>
                        <Text style={styles.testTitle}>{t('phTest')}</Text>
                        <Text style={styles.testInstruction}>{t('phInst1')}</Text>
                        <Text style={styles.testInstruction}>{t('phInst2')}</Text>
                        <Text style={styles.testInstruction}>{t('phInst3')}</Text>
                        <Text style={styles.testInstruction}>{t('phInst4')}</Text>
                        
                        <View style={styles.divider} />
                        
                        <CustomSelector 
                            label={t('whatResult')}
                            options={[
                                { label: 'Acidic (< 6.5)', value: 5.5 },
                                { label: 'Neutral (~7)', value: 7.0 },
                                { label: 'Alkaline (> 7.5)', value: 8.0 }
                            ]}
                            selectedValue={soilData.ph}
                            onSelect={(val) => setSoilData({ ...soilData, ph: val })}
                        />
                        
                        <TouchableOpacity style={[styles.actionBtn, !soilData.ph && styles.disabledBtn]} onPress={saveAndNext} disabled={!soilData.ph || loading}>
                            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.actionBtnText}>{t('saveNext')}</Text>}
                        </TouchableOpacity>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.cardInfo}>
                        <Text style={styles.testTitle}>{t('textureTest')}</Text>
                        <Text style={styles.testInstruction}>{t('textureInst')}</Text>
                        
                        <View style={styles.divider} />
                        
                        <CustomSelector 
                            label={t('yourTexture')}
                            options={[
                                { label: 'Sandy', value: 'sand' },
                                { label: 'Clay', value: 'clay' },
                                { label: 'Loamy (Balanced)', value: 'loam' },
                                { label: 'Silty', value: 'silt' }
                            ]}
                            selectedValue={soilData.texture}
                            onSelect={(val) => setSoilData({ ...soilData, texture: val })}
                        />
                        
                        <TouchableOpacity style={styles.actionBtn} onPress={saveAndNext} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.actionBtnText}>Save & Next</Text>}
                        </TouchableOpacity>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.cardInfo}>
                        <Text style={styles.testTitle}>{t('drainageTest')}</Text>
                        <Text style={styles.testInstruction}>{t('drainageInst')}</Text>
                        
                        <View style={styles.divider} />
                        
                        <CustomSelector 
                            label={t('drainageTime')}
                            options={[
                                { label: '< 30 Min (Fast)', value: 'fast' },
                                { label: '30m - 2h (Ideal)', value: 'ideal' },
                                { label: '> 2 Hrs (Slow)', value: 'slow' }
                            ]}
                            selectedValue={soilData.drainageTime}
                            onSelect={(val) => setSoilData({ ...soilData, drainageTime: val })}
                        />
                        
                        <TouchableOpacity style={styles.actionBtn} onPress={saveAndNext} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.actionBtnText}>Save & Next</Text>}
                        </TouchableOpacity>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.cardInfo}>
                        <Text style={styles.testTitle}>{t('organicMatter')}</Text>
                        <Text style={styles.testInstruction}>{t('organicInst')}</Text>
                        
                        <View style={styles.divider} />
                        
                        <CustomSelector 
                            label={t('visualAssessment')}
                            options={[
                                { label: 'Low / Poor', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High / Rich', value: 'high' }
                            ]}
                            selectedValue={soilData.organicMatter}
                            onSelect={(val) => setSoilData({ ...soilData, organicMatter: val })}
                        />
                        
                        <TouchableOpacity style={styles.actionBtn} onPress={saveAndNext} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.actionBtnText}>Save & Next</Text>}
                        </TouchableOpacity>
                    </View>
                );
            case 5:
                return (
                    <View style={styles.cardInfo}>
                        <Text style={styles.testTitle}>{t('npkKit')}</Text>
                        <Text style={styles.testInstruction}>{t('npkInst')}</Text>
                        
                        <View style={styles.divider} />
                        
                        <CustomSelector 
                            label={t('nitrogen')}
                            options={[
                                { label: 'Low', value: 'low' }, { label: 'Med', value: 'medium' }, { label: 'High', value: 'high' }
                            ]}
                            selectedValue={soilData.npk.nitrogen}
                            onSelect={(val) => setSoilData({ ...soilData, npk: { ...soilData.npk, nitrogen: val } })}
                        />
                        <View style={{ height: 10 }} />
                        <CustomSelector 
                            label={t('phosphorus')}
                            options={[
                                { label: 'Low', value: 'low' }, { label: 'Med', value: 'medium' }, { label: 'High', value: 'high' }
                            ]}
                            selectedValue={soilData.npk.phosphorus}
                            onSelect={(val) => setSoilData({ ...soilData, npk: { ...soilData.npk, phosphorus: val } })}
                        />
                         <View style={{ height: 10 }} />
                        <CustomSelector 
                            label={t('potassium')}
                            options={[
                                { label: 'Low', value: 'low' }, { label: 'Med', value: 'medium' }, { label: 'High', value: 'high' }
                            ]}
                            selectedValue={soilData.npk.potassium}
                            onSelect={(val) => setSoilData({ ...soilData, npk: { ...soilData.npk, potassium: val } })}
                        />
                        
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF8F00' }]} onPress={saveAndNext} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.actionBtnText}>{t('generateReport')}</Text>}
                        </TouchableOpacity>
                    </View>
                );
            case 6:
                return (
                    <View style={styles.reportCard}>
                        {reportData ? (
                            <>
                                <View style={styles.reportHeader}>
                                    <View>
                                        <Text style={styles.reportDate}>{t('reportDate')} {new Date().toLocaleDateString()}</Text>
                                        <Text style={styles.reportTitle}>{t('reportTitle')}</Text>
                                    </View>
                                    <View style={styles.scoreCircle}>
                                        <Text style={styles.scoreText}>{reportData.score}</Text>
                                        <Text style={styles.scoreSub}>/100</Text>
                                    </View>
                                </View>

                                <View style={styles.metricsGrid}>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>pH Level</Text>
                                        <Text style={styles.metricVal}>{soilData.ph}</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Texture</Text>
                                        <Text style={[styles.metricVal, {textTransform:'capitalize'}]}>{soilData.texture}</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Organic</Text>
                                        <Text style={[styles.metricVal, {textTransform:'capitalize'}]}>{soilData.organicMatter}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />
                                
                                <Text style={styles.sectionHeading}>{t('recommendedCrops')}</Text>
                                <View style={styles.tagsContainer}>
                                    {reportData.cropsToGrow?.map((crop, i) => (
                                        <View key={'ok-'+i} style={styles.tagGood}>
                                            <Text style={styles.tagGoodText}>✅ {crop}</Text>
                                        </View>
                                    ))}
                                </View>

                                {reportData.cropsToAvoid && reportData.cropsToAvoid.length > 0 && (
                                    <>
                                        <Text style={[styles.sectionHeading, { marginTop: 16 }]}>{t('cropsToAvoid')}</Text>
                                        <View style={styles.tagsContainer}>
                                            {reportData.cropsToAvoid.map((crop, i) => (
                                                <View key={'bad-'+i} style={styles.tagBad}>
                                                    <Text style={styles.tagBadText}>{crop}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                )}

                                <View style={styles.divider} />

                                <Text style={styles.sectionHeading}>{t('fertilizerPlan')}</Text>
                                {reportData.fertilizerPlan?.map((plan, i) => (
                                    <View key={i} style={styles.planRow}>
                                        <Text style={styles.planPeriod}>{plan.period}:</Text>
                                        <Text style={styles.planAction}>{plan.action}</Text>
                                    </View>
                                ))}

                                <View style={styles.divider} />
                                
                                <Text style={styles.sectionHeading}>{t('aiInsight')}</Text>
                                <Text style={styles.aiInsightText}>{reportData.recommendation}</Text>

                                <TouchableOpacity style={[styles.actionBtn, { marginTop: 20 }]} onPress={() => router.push('/(tabs)')}>
                                    <Text style={styles.actionBtnText}>{t('done')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#00C853" />
                                <Text style={{ marginTop: 12, color: '#666' }}>{t('generatingReport')}</Text>
                            </View>
                        )}
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('soilTestModule')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Stepper Progress */}
            {currentStep > 0 && currentStep < 6 && (
                <View style={styles.stepperContainer}>
                    <Text style={styles.stepText}>{t('step')} {currentStep} {t('of')} 5</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(currentStep / 5) * 100}%` }]} />
                    </View>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
                {renderStepContent()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    stepperContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    stepText: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#00C853',
    },
    scrollArea: {
        padding: 16,
        paddingBottom: 40,
    },
    cardInfo: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    introHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3E2723',
        marginTop: 12,
    },
    introDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    checklist: {
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    checkItem: {
        fontSize: 13,
        color: '#2E7D32',
        marginBottom: 8,
        fontWeight: '500',
    },
    testTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
    },
    testInstruction: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 20,
    },
    selectorContainer: {
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionNav: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fafafa',
    },
    optionNavSelected: {
        borderColor: '#00C853',
        backgroundColor: '#e8f5e9',
    },
    optionText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#00C853',
        fontWeight: 'bold',
    },
    actionBtn: {
        backgroundColor: '#00C853',
        flexDirection: 'row',
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 6,
    },
    disabledBtn: {
        backgroundColor: '#aaa',
    },
    
    // --- Report Card Styles
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        borderLeftWidth: 6,
        borderColor: '#8BC34A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    reportDate: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    reportTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
    },
    scoreCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F1F8E9',
        borderWidth: 2,
        borderColor: '#8BC34A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#33691E',
    },
    scoreSub: {
        fontSize: 9,
        color: '#689F38',
        marginTop: -2,
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metricItem: {
        backgroundColor: '#fafafa',
        padding: 12,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    metricLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
    },
    metricVal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagGood: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagGoodText: {
        color: '#2E7D32',
        fontSize: 13,
        fontWeight: 'bold',
    },
    tagBad: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    tagBadText: {
        color: '#C62828',
        fontSize: 13,
    },
    planRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    planPeriod: {
        width: 70,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
    },
    planAction: {
        flex: 1,
        fontSize: 13,
        color: '#333',
    },
    aiInsightText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
        fontStyle: 'italic',
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderColor: '#FFb300'
    }
});
