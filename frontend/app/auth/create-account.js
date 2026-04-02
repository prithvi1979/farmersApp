import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function CreateAccountScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false, // Disabled to prevent the Android "Crop Grid" freeze
            quality: 0.2,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name.');
            return;
        }
        if (!pin.trim() || pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN setup.');
            return;
        }

        let cleanPhone = phoneNumber.trim().replace(/\D/g, '');
        if (cleanPhone && cleanPhone.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number or leave it blank.');
            return;
        }

        setSubmitting(true);
        try {
            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            let uploadedPhotoUrl = null;

            // 1. Upload Profile Image if provided
            if (imageUri) {
                const formData = new FormData();
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('image', {
                    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
                    name: filename || 'profile.jpg',
                    type,
                });

                try {
                    const uploadRes = await fetch(`${API_BASE_URL}/admin/upload-image`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json',
                        },
                    });
                    const uploadJson = await uploadRes.json();
                    if (uploadJson.success) {
                        uploadedPhotoUrl = uploadJson.url;
                    } else {
                        console.log('Upload image err JSON:', uploadJson);
                        Alert.alert('Warning', 'Could not upload your profile image. Proceeding without it.');
                    }
                } catch (photoErr) {
                    console.log('Upload image catch:', photoErr);
                    Alert.alert('Warning', 'Image server error. Proceeding without picture.');
                }
            }

            // 2. Perform Account Registration
            const payload = {
                name: name.trim(),
                pin: pin,
            };
            if (cleanPhone) payload.phoneNumber = cleanPhone;
            if (uploadedPhotoUrl) payload.photoUrl = uploadedPhotoUrl;

            const res = await fetch(`${API_BASE_URL}/users/register/${deviceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (json.success) {
                // Update Local AsyncStorage Profile
                const existingAuth = await AsyncStorage.getItem('@user_profile');
                let authObj = existingAuth ? JSON.parse(existingAuth) : {};
                authObj.name = json.data.name;
                authObj.phoneNumber = json.data.phoneNumber;
                if (json.data.photoUrl) authObj.photoUrl = json.data.photoUrl;
                
                await AsyncStorage.setItem('@user_profile', JSON.stringify(authObj));
                
                // Navigate back
                router.replace('/(tabs)/profile');
            } else {
                Alert.alert('Registration Failed', json.error || 'Server error occurred.');
            }

        } catch (error) {
            console.error('Registration error:', error);
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
                <Text style={styles.headerTitle}>Create Account</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color="#00C853" />
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Add Profile Photo (Optional)</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Full Name *</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Ramesh Kumar"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!submitting}
                        />
                    </View>

                    <Text style={styles.label}>Phone Number (Optional)</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="phone-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="10-digit mobile number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={10}
                            editable={!submitting}
                        />
                    </View>

                    <Text style={styles.label}>Create 4-Digit PIN *</Text>
                    <Text style={styles.subLabel}>This secures your device login</Text>
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
                    onPress={handleRegister}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Complete Setup</Text>
                    )}
                </TouchableOpacity>

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
    avatarSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#00C853',
        borderStyle: 'dashed',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00C853',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarHint: {
        fontSize: 13,
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
        marginBottom: 6,
    },
    subLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#fafafa',
        paddingHorizontal: 12,
        marginBottom: 20, // Add gap between fields directly here
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
