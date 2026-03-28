import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function AskCommunityScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [cropTag, setCropTag] = useState('');
    const [image, setImage] = useState(null); // Will hold the native URI for preview
    const [base64Image, setBase64Image] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        const fetchId = async () => {
            const id = await AsyncStorage.getItem('deviceId');
            setDeviceId(id);
        };
        fetchId();
    }, []);

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("Permission required to access camera roll!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Disabled to prevent the Android "Crop Grid" freeze
                quality: 0.2, // Compress heavily for Mongo base64 storage
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setImage(asset.uri);
                setBase64Image(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
            }
        } catch (error) {
            console.error("Image pick error:", error);
            alert("Error selecting image.");
        }
    };

    const handlePublish = async () => {
        if (!title.trim() || !question.trim()) {
            Alert.alert("Required Fields", "Please provide at least a Title and Description.");
            return;
        }
        if (!deviceId) {
            Alert.alert("Error", "Device ID not found. Please complete the setup/onboarding.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/community/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorId: deviceId,
                    title: title.trim(),
                    question: question.trim(),
                    cropTag: cropTag.trim() || 'General',
                    imageUrl: base64Image
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                router.back();
            } else {
                Alert.alert("Post Failed", data.error || "An unknown error occurred.");
            }
        } catch (error) {
            console.error("Publish error:", error);
            Alert.alert("Network Error", "Could not reach the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="close" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ask Community</Text>
                <TouchableOpacity 
                    style={[styles.publishButton, (!title.trim() || !question.trim() || isSubmitting) && styles.publishButtonDisabled]} 
                    onPress={handlePublish}
                    disabled={!title.trim() || !question.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.publishText}>Publish</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="E.g., What are these spots on my tomatoes?"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                />

                <Text style={styles.label}>Crop Tag (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="E.g., Tomato, Wheat"
                    value={cropTag}
                    onChangeText={setCropTag}
                    maxLength={30}
                />

                <Text style={styles.label}>Description & Details</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the issue or write your question here in detail..."
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Attach Image (Optional)</Text>
                {image ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImage(null); setBase64Image(null); }}>
                            <MaterialCommunityIcons name="close-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImage}>
                        <MaterialCommunityIcons name="camera-plus" size={32} color="#888" />
                        <Text style={styles.imageUploadText}>Tap to add photo</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    publishButton: { backgroundColor: '#00C853', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    publishButtonDisabled: { backgroundColor: '#a5d6a7' },
    publishText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    content: { padding: 16, paddingBottom: 40 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#333' },
    textArea: { minHeight: 120 },
    imageUploadBtn: { backgroundColor: '#f5f5f5', height: 160, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderStyle: 'dashed' },
    imageUploadText: { marginTop: 8, color: '#888', fontSize: 14 },
    imagePreviewContainer: { position: 'relative', width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 }
});
