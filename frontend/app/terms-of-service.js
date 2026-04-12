import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsOfServiceScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentCard}>
                    <Text style={[styles.heading, { marginTop: 0 }]}>Acceptance of Terms</Text>
                    <Text style={styles.paragraph}>By accessing or using AgriGrow, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use the app.</Text>

                    <Text style={styles.heading}>About the Service</Text>
                    <Text style={styles.paragraph}>AgriGrow is a free app that offers farming-related tools and support features, including onboarding preferences, crop planning, crop tracking, seed calculators, irrigation tools, fertilizer calculators, AI-assisted crop disease detection, and related agricultural workflows.</Text>

                    <Text style={styles.heading}>Accounts and Access</Text>
                    <Text style={styles.paragraph}>You may use parts of AgriGrow without creating an account. You may also choose to log in with Google credentials or create an account using your name and phone number.</Text>
                    <Text style={styles.paragraph}>You are responsible for the accuracy of the information you provide and for maintaining the security of your account or login access.</Text>

                    <Text style={styles.heading}>Use of AI Features</Text>
                    <Text style={styles.paragraph}>AgriGrow allows users to upload crop images and uses Gemini to help detect disease or crop issues. AI-generated outputs are provided for informational and support purposes only.</Text>
                    <Text style={styles.paragraph}>You should use your own judgment and, where needed, consult qualified agricultural professionals before making farming, financial, treatment, or crop-management decisions based on app outputs.</Text>

                    <Text style={styles.heading}>Acceptable Use</Text>
                    <Text style={styles.paragraph}>You agree not to:</Text>
                    <Text style={styles.bulletItem}>• use the app for unlawful, harmful, fraudulent, or abusive purposes;</Text>
                    <Text style={styles.bulletItem}>• upload content you do not have the right to use or share;</Text>
                    <Text style={styles.bulletItem}>• interfere with the app, its infrastructure, or other users' access;</Text>
                    <Text style={styles.bulletItem}>• attempt to reverse engineer, copy, scrape, or misuse the service beyond normal personal or business use; or</Text>
                    <Text style={styles.bulletItem}>• rely on AgriGrow as a substitute for professional advice where expert review is needed.</Text>

                    <Text style={styles.heading}>Availability and Changes</Text>
                    <Text style={styles.paragraph}>We may update, improve, suspend, or remove any feature of AgriGrow at any time. We do not guarantee that the app or every feature will always be available, uninterrupted, or error-free.</Text>

                    <Text style={styles.heading}>Intellectual Property</Text>
                    <Text style={styles.paragraph}>The AgriGrow app, branding, design, text, layout, and related materials are owned by or licensed to the AgriGrow team unless otherwise stated. These Terms do not grant you ownership of the service or its intellectual property.</Text>

                    <Text style={styles.heading}>Disclaimers</Text>
                    <Text style={styles.paragraph}>AgriGrow is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we do not make guarantees about accuracy, reliability, suitability, crop outcomes, yield, disease diagnosis accuracy, or uninterrupted availability.</Text>

                    <Text style={styles.heading}>Limitation of Liability</Text>
                    <Text style={styles.paragraph}>To the extent permitted by applicable law, AgriGrow and its team will not be liable for indirect, incidental, special, consequential, or business losses arising from your use of the app, reliance on AI outputs, or inability to use the service.</Text>

                    <Text style={styles.heading}>Termination</Text>
                    <Text style={styles.paragraph}>We may suspend or terminate access if we believe there has been misuse of the app, a violation of these Terms, or conduct that creates legal, technical, or safety risk.</Text>

                    <Text style={styles.heading}>Governing Law</Text>
                    <Text style={styles.paragraph}>These Terms & Conditions are governed by applicable laws of Assam, India, without prejudice to any mandatory legal rights that may apply to you under local law.</Text>

                    <Text style={styles.heading}>Contact</Text>
                    <Text style={styles.paragraph}>For questions about these Terms & Conditions, contact AgriGrow at prithvimanb@gmail.com.</Text>
                </View>
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
        paddingBottom: 40,
    },
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginTop: 20,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#444',
        lineHeight: 24,
        marginBottom: 8,
    },
    bulletItem: {
        fontSize: 15,
        color: '#444',
        lineHeight: 24,
        marginBottom: 4,
        paddingLeft: 8,
    }
});
