import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ContactUsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentCard}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="email-outline" size={48} color="#00C853" />
                    </View>
                    <Text style={styles.title}>Get in Touch</Text>
                    <Text style={styles.paragraph}>If you have any questions or feedback, we would love to hear from you!</Text>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="account-group-outline" size={24} color="#2e7d32" style={styles.icon} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Team</Text>
                            <Text style={styles.contactValue}>AgriGrow Team</Text>
                            <Text style={styles.contactSubValue}>Developed by a small team led by Prithviman Bhattacharjee</Text>
                        </View>
                    </View>

                    <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="email" size={24} color="#2e7d32" style={styles.icon} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Email</Text>
                            <Text style={styles.contactValue}>prithvimanb@gmail.com</Text>
                        </View>
                    </View>

                    <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="phone" size={24} color="#2e7d32" style={styles.icon} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Phone</Text>
                            <Text style={styles.contactValue}>+91 8553243013</Text>
                        </View>
                    </View>

                    <View style={styles.contactRow}>
                        <MaterialCommunityIcons name="map-marker" size={24} color="#2e7d32" style={styles.icon} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Address</Text>
                            <Text style={styles.contactValue}>#53, Netaji Lane, Ghungoor{'\n'}Silchar, Assam, India</Text>
                        </View>
                    </View>
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
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'center',
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 24,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    icon: {
        marginTop: 4,
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        lineHeight: 24,
    },
    contactSubValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        lineHeight: 20,
    }
});
