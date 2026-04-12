import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function PersonaScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const handleSelectPersona = (personaType) => {
        router.push({
            pathname: '/onboarding/plants',
            params: { persona: personaType }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.progressText}>{t('step2Of3')}</Text>
                </View>

                <Text style={styles.title}>{t('tellUsAboutFarm')}</Text>
                <Text style={styles.subtitle}>{t('helpsUsCustomize')}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('whichBestDescribesYou')}</Text>

                    <TouchableOpacity
                        style={styles.personaCard}
                        onPress={() => handleSelectPersona('Apartment')}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="flower-tulip-outline" size={32} color="#2e7d32" />
                        </View>
                        <View style={styles.personaInfo}>
                            <Text style={styles.personaTitle}>{t('personaApartment')}</Text>
                            <Text style={styles.personaDesc}>{t('personaApartmentDesc')}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.personaCard}
                        onPress={() => handleSelectPersona('Gardener')}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="sprout-outline" size={32} color="#2e7d32" />
                        </View>
                        <View style={styles.personaInfo}>
                            <Text style={styles.personaTitle}>{t('personaGardener')}</Text>
                            <Text style={styles.personaDesc}>{t('personaGardenerDesc')}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.personaCard}
                        onPress={() => handleSelectPersona('Professional')}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="tractor" size={32} color="#2e7d32" />
                        </View>
                        <View style={styles.personaInfo}>
                            <Text style={styles.personaTitle}>{t('personaFarmer')}</Text>
                            <Text style={styles.personaDesc}>{t('personaFarmerDesc')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        padding: 24,
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
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    personaCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e8f5e9',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f1f8e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    personaInfo: {
        flex: 1,
    },
    personaTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2e7d32',
        marginBottom: 4,
    },
    personaDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    }
});
