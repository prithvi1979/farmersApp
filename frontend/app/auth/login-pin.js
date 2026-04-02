import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function LoginPinScreen() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');
    const [pin, setPin] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!identifier.trim()) {
            Alert.alert('Error', 'Please enter your Phone Number or Name.');
            return;
        }

        if (!pin.trim() || pin.length !== 4) {
            Alert.alert('Error', 'Please enter your 4-digit PIN.');
            return;
        }

        setSubmitting(true);
        try {
            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            
            const payload = {
                identifier: identifier.trim(),
                pin: pin,
                deviceId: deviceId
            };

            const res = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (json.success) {
                // Update Local AsyncStorage Profile
                await AsyncStorage.setItem('@user_profile', JSON.stringify(json.data));
                
                // Navigate back to the authenticated profile view
                router.replace('/(tabs)/profile');
            } else {
                Alert.alert('Login Failed', json.error || 'Invalid credentials.');
            }

        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Network Error', 'Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Login</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="shield-account" size={64} color="#00C853" />
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Log in securely with your credentials</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Registered Phone Number or Name</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account-search-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Ramesh Kumar or 9876543210"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="words"
                            editable={!submitting}
                        />
                    </View>

                    <Text style={styles.label}>Enter your 4-Digit PIN</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="****"
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="number-pad"
                            maxLength={4}
                            secureTextEntry={true}
                            editable={!submitting}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                    onPress={handleLogin}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Secure Login</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    container: {
        flex: 1,
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginTop: 12,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#fafafa',
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111',
    },
    submitButton: {
        backgroundColor: '#00C853',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
