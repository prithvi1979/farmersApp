import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelectionScreen() {
    const router = useRouter();
    const { t, switchLanguage } = useLanguage();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const deviceId = await AsyncStorage.getItem('deviceId');
                if (deviceId) {
                    router.replace('/(tabs)');
                } else {
                    setIsChecking(false);
                }
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                setIsChecking(false);
            }
        };
        checkOnboarding();
    }, []);

    const handleSelectLanguage = async (lang) => {
        const langMap = {
            'Bengali': 'bn',
            'Hindi': 'hi',
            'English': 'en',
            'Assamese': 'as'
        };
        const langCode = langMap[lang] || 'en';
        
        await switchLanguage(langCode);
        router.push('/onboarding/persona');
    };

    if (isChecking) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4caf50" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.progressText}>{t('step1Of3')}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{t('chooseLanguage')}</Text>
                    <Text style={styles.subtitle}>{t('chooseLanguageDesc')}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('Bengali')}
                        >
                            <Text style={styles.languageText}>বাংলা</Text>
                            <Text style={styles.languageSubText}>Bengali</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('Hindi')}
                        >
                            <Text style={styles.languageText}>हिन्दी</Text>
                            <Text style={styles.languageSubText}>Hindi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('English')}
                        >
                            <Text style={styles.languageText}>English</Text>
                            <Text style={styles.languageSubText}>English</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('Assamese')}
                        >
                            <Text style={styles.languageText}>অসমীয়া</Text>
                            <Text style={styles.languageSubText}>Assamese</Text>
                        </TouchableOpacity>
                    </View>
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
        padding: 24,
    },
    header: {
        paddingTop: 40, // For simple safe area spacing
        paddingBottom: 20,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4caf50',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1b5e20',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        gap: 16,
    },
    languageCard: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e8f5e9',
    },
    languageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    languageSubText: {
        fontSize: 18,
        color: '#888',
    },
});
