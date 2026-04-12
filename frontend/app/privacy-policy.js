import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentCard}>
                    <Text style={[styles.heading, { marginTop: 0 }]}>Who We Are</Text>
                    <Text style={styles.paragraph}>AgriGrow is a free farming app developed and operated by a small team led by Prithviman Bhattacharjee, based in Silchar, Assam, India.</Text>

                    <Text style={styles.heading}>Information We Collect</Text>
                    <Text style={styles.paragraph}>We may collect the following categories of information when you use AgriGrow:</Text>
                    <Text style={styles.bulletItem}>• Onboarding details such as selected language, whether you identify as a gardener or professional farmer, and the crops you are interested in.</Text>
                    <Text style={styles.bulletItem}>• Technical data such as your IP address, approximate device and browser or app information, logs, cookies, analytics identifiers, and usage activity.</Text>
                    <Text style={styles.bulletItem}>• Account details if you sign in with Google or create an account using your name and phone number.</Text>
                    <Text style={styles.bulletItem}>• Images and related inputs that you upload for crop disease detection and plant health analysis.</Text>
                    <Text style={styles.bulletItem}>• Notification and engagement data if you allow push notifications or interact with ads, analytics, or in-app campaigns.</Text>

                    <Text style={styles.heading}>How We Use Your Information</Text>
                    <Text style={styles.paragraph}>We use information to operate and improve AgriGrow, including to:</Text>
                    <Text style={styles.bulletItem}>• personalize onboarding and show tools, crops, and workflows relevant to your interests;</Text>
                    <Text style={styles.bulletItem}>• support features such as seed calculators, irrigation tools, fertilizer calculators, crop planning, crop tracking, and other farm-support services;</Text>
                    <Text style={styles.bulletItem}>• analyze uploaded crop images and return disease detection results through Gemini;</Text>
                    <Text style={styles.bulletItem}>• maintain security, prevent misuse, troubleshoot issues, and understand how the app is being used;</Text>
                    <Text style={styles.bulletItem}>• send notifications, updates, and service-related messages where allowed; and</Text>
                    <Text style={styles.bulletItem}>• measure performance, ads, and product usage through analytics and related technologies.</Text>

                    <Text style={styles.heading}>Google Sign-In and Gemini</Text>
                    <Text style={styles.paragraph}>You may choose to continue without creating an account, sign in with Google credentials, or create an account manually with your name and phone number.</Text>
                    <Text style={styles.paragraph}>When you upload a crop image for disease detection, the image may be processed using Gemini to generate diagnostic insights and recommendations. AI-based outputs are assistive only and should not be treated as a guaranteed agricultural, scientific, or professional opinion.</Text>

                    <Text style={styles.heading}>Cookies, Analytics, Ads, and Notifications</Text>
                    <Text style={styles.paragraph}>AgriGrow may use cookies, similar technologies, analytics tools, advertising services, and push notifications to understand usage, improve performance, communicate updates, and support product growth. Depending on the device or platform, you may be able to manage some of these permissions or preferences in your browser, device settings, or account settings.</Text>

                    <Text style={styles.heading}>How We Share Information</Text>
                    <Text style={styles.paragraph}>We may share information in limited situations such as:</Text>
                    <Text style={styles.bulletItem}>• with service providers or infrastructure partners that help us operate the app and related features;</Text>
                    <Text style={styles.bulletItem}>• with Google services where you choose Google sign-in or where Gemini is used for disease detection workflows;</Text>
                    <Text style={styles.bulletItem}>• when required by law, regulation, legal process, or a valid government request; and</Text>
                    <Text style={styles.bulletItem}>• to protect the rights, safety, security, or integrity of AgriGrow, our users, or the public.</Text>

                    <Text style={styles.heading}>Data Retention</Text>
                    <Text style={styles.paragraph}>We keep information for as long as reasonably necessary to operate the app, maintain records, improve services, comply with legal obligations, resolve disputes, and enforce our terms. Retention periods may vary depending on the type of data and how the feature is used.</Text>

                    <Text style={styles.heading}>Your Choices</Text>
                    <Text style={styles.paragraph}>You may request access, correction, or deletion of your account or personal data by contacting us. We may need to verify your identity before completing a request.</Text>
                    <Text style={styles.paragraph}>If you do not want to create an account, you can continue using parts of AgriGrow without logging in, although some features may be limited.</Text>

                    <Text style={styles.heading}>Data Security</Text>
                    <Text style={styles.paragraph}>We take reasonable steps to protect information, but no method of storage, transmission, or internet-based processing is completely secure. You use the app and upload content at your own discretion.</Text>

                    <Text style={styles.heading}>Changes to This Policy</Text>
                    <Text style={styles.paragraph}>We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised date.</Text>
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
