import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, StatusBar, Alert, Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow photo access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: false
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission was not granted. You can set it later from profile settings.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;

      // Reverse geocode to get city/state
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = geo[0]?.city || geo[0]?.subregion || '';
      const state = geo[0]?.region || '';

      setLocation({ lat: latitude, lng: longitude, city, state });
    } catch (err) {
      Alert.alert('Location Error', 'Could not get your location. Please try again.');
    } finally {
      setLocLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
      let uploadedPhotoUrl = null;

      // Check if photoUri is new (local file) and upload it
      if (photoUri && !photoUri.startsWith('http')) {
        const formData = new FormData();
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
          uri: Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri,
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
          }
        } catch (photoErr) {
          console.log('Upload error (proceeding without picture):', photoErr);
        }
      }

      const body = {};
      if (name.trim()) body.name = name.trim();
      if (location) {
        body.location = {
          lat: location.lat,
          lng: location.lng,
          city: location.city,
          state: location.state
        };
      }
      if (uploadedPhotoUrl) body.photoUrl = uploadedPhotoUrl;
      // We can also let them edit language or persona in the future, body handles it neatly

      const res = await fetch(`${API_BASE_URL}/users/profile/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();

      if (json.success) {
        // Update locally cached profile
        const saved = await AsyncStorage.getItem('@user_profile');
        const profile = saved ? JSON.parse(saved) : {};
        if (json.data.photoUrl) profile.photoUrl = json.data.photoUrl;
        if (json.data.name) profile.name = json.data.name;
        if (json.data.location) profile.location = json.data.location;

        await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', json.error || 'Failed to save profile');
      }
    } catch (err) {
        console.error('Save profile err:', err);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself. Everything here is optional.</Text>

        {/* Profile Photo */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="camera-plus-outline" size={36} color="#00C853" />
              <Text style={styles.photoLabel}>Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Prithvi"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your Location <Text style={styles.optional}>(Optional)</Text></Text>
          {location ? (
            <View style={styles.locationConfirm}>
              <MaterialCommunityIcons name="map-marker-check" size={20} color="#00C853" />
              <Text style={styles.locationText}>
                {location.city}{location.state ? `, ${location.state}` : ''} — Pinned ✓
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation} disabled={locLoading}>
              {locLoading ? (
                <ActivityIndicator size="small" color="#00C853" />
              ) : (
                <>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#00C853" />
                  <Text style={styles.locationBtnText}>Pinpoint My Location</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Save / Skip */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save & Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#f6f8f4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  scroll: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#777', lineHeight: 20, marginBottom: 32 },
  photoContainer: { alignItems: 'center', marginBottom: 32 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#00C853', borderStyle: 'dashed'
  },
  photoLabel: { fontSize: 10, color: '#00C853', marginTop: 4, fontWeight: '600' },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  optional: { fontWeight: 'normal', color: '#999' },
  input: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#111', borderWidth: 1, borderColor: '#e0e0e0'
  },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8f5e9', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#00C853'
  },
  locationBtnText: { marginLeft: 10, color: '#00C853', fontWeight: '600', fontSize: 15 },
  locationConfirm: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f5e9', borderRadius: 12, padding: 14
  },
  locationText: { marginLeft: 10, color: '#2E7D32', fontWeight: '600', fontSize: 14 },
  saveBtn: {
    backgroundColor: '#00C853', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 16
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  skipBtn: { alignItems: 'center' },
  skipText: { color: '#999', fontSize: 14 }
});
