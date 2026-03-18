import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderDropdown from '../../components/HeaderDropdown';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoIconBg}>
                            <MaterialCommunityIcons name="account" size={30} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>Profile</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.assistantButton}>
                            <MaterialCommunityIcons name="robot-outline" size={20} color="#00C853" style={{ marginRight: 6 }} />
                            <Text style={styles.assistantButtonText}>Assistant</Text>
                        </TouchableOpacity>
                        <HeaderDropdown />
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.accountCard}>
                    <View style={styles.accountInfoRow}>
                        <View style={styles.profileImagePlaceholder}>
                            <MaterialCommunityIcons name="account-circle" size={60} color="#ccc" />
                        </View>
                        <View style={styles.accountTextContainer}>
                            <Text style={styles.accountTitle}>Your Account</Text>
                            <Text style={styles.accountDesc}>Sign in to save your farm data, connect with community, and shop.</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.signInButton}>
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                {/* Your Interests */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Your Interests</Text>
                    <View style={styles.interestsGrid}>
                        <View style={styles.interestItem}>
                            <View style={styles.interestImagePlaceholder}>
                                <MaterialCommunityIcons name="fruit-cherries" size={32} color="#555" />
                            </View>
                        </View>
                        <View style={styles.interestItem}>
                            <View style={styles.interestImagePlaceholder}>
                                <MaterialCommunityIcons name="carrot" size={32} color="#555" />
                            </View>
                        </View>
                        <View style={styles.interestItem}>
                            <View style={styles.interestImagePlaceholder}>
                                <MaterialCommunityIcons name="leaf" size={32} color="#555" />
                            </View>
                        </View>
                        <View style={styles.interestItem}>
                            <View style={styles.interestImagePlaceholder}>
                                <MaterialCommunityIcons name="pepper-hot" size={32} color="#555" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Gardener Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>You are a gardener</Text>
                    <Text style={styles.cardDesc}>Ready to start growing your own food? We've got you covered with tips from seed to harvest.</Text>
                    <TouchableOpacity style={styles.startGardenButton}>
                        <MaterialCommunityIcons name="sprout-outline" size={20} color="#00C853" style={{ marginRight: 8 }} />
                        <Text style={styles.startGardenButtonText}>Start a garden</Text>
                    </TouchableOpacity>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
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
        marginRight: 12,
    },
    assistantButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00C853',
    },
    iconButton: {
        marginLeft: 4,
    },
    accountCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    accountInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    accountTextContainer: {
        flex: 1,
    },
    accountTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    accountDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    signInButton: {
        backgroundColor: '#00C853',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        width: '100%',
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
    },
    cardDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 16,
    },
    interestsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    interestItem: {
        width: '22%',
        aspectRatio: 1,
    },
    interestImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    startGardenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00C853',
        borderRadius: 12,
        paddingVertical: 12,
        backgroundColor: '#e8f5e9',
    },
    startGardenButtonText: {
        color: '#00C853',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
