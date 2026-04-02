import React, { useState, useEffect, useRef } from 'react';
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
  const [pin, setPin] = useState('');
  const [language, setLanguage] = useState('English');
  const [persona, setPersona] = useState('farmer');
  const [chosenPlants, setChosenPlants] = useState([]);

  const [locLoading, setLocLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Auto-suggest fields
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    // Hydrate existing DB metadata natively
    const loadProfile = async () => {
      try {
        const deviceId = await AsyncStorage.getItem('deviceId');
        if (!deviceId) return;
        const res = await fetch(`${API_BASE_URL}/users/profile/${deviceId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const u = json.data;
          if (u.name) setName(u.name);
          if (u.photoUrl) setPhotoUri(u.photoUrl);
          if (u.location) setLocation(u.location);
          if (u.pin) setPin(u.pin);
          if (u.language) setLanguage(u.language);
          if (u.persona) setPersona(u.persona);
          if (u.chosenPlants) setChosenPlants(u.chosenPlants);
        }
      } catch(err) {
        console.error("Hydration Error:", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadProfile();
  }, []);

  const handleSearchChange = (text) => {
      setSearchQuery(text);
      setShowSuggestions(true);

      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      if (text.trim().length === 0) {
          setSuggestions([]);
          return;
      }

      debounceTimeout.current = setTimeout(async () => {
          setSearching(true);
          try {
              const res = await fetch(`${API_BASE_URL}/crops/search?q=${encodeURIComponent(text)}`);
              if (res.ok) {
                  const json = await res.json();
                  if (json.success) {
                      setSuggestions(json.data);
                  }
              }
          } catch (err) {
              console.log("Search error:", err);
          } finally {
              setSearching(false);
          }
      }, 400);
  };

  const addPlant = (cropName) => {
      if (!chosenPlants.includes(cropName)) {
          setChosenPlants([...chosenPlants, cropName]);
      }
      setSearchQuery('');
      setShowSuggestions(false);
  };

  const removePlant = (cropName) => {
      setChosenPlants(chosenPlants.filter(p => p !== cropName));
  };


  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow photo access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Disabled to prevent the Android "Crop Grid" freeze
      quality: 0.2,
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
      if (pin && pin.length === 4) body.pin = pin;
      if (language) body.language = language;
      if (persona) body.persona = persona;
      if (chosenPlants) body.chosenPlants = chosenPlants;

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
        router.replace('/(tabs)/profile');
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

  if (loadingInitial) {
      return (
        <SafeAreaView style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
            <ActivityIndicator size="large" color="#00C853" />
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={{padding: 8, marginLeft: -8}}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerMainTitle}>Edit Profile Setup</Text>
          <View style={{width: 32}} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
            placeholder="e.g. Prithvi Kumar"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* PIN Security Edit */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Update 4-Digit Security PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="****"
            placeholderTextColor="#aaa"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={true}
          />
        </View>

        {/* Location Tracker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your Location <Text style={styles.optional}>(Optional)</Text></Text>
          {location ? (
            <View style={styles.locationConfirm}>
              <MaterialCommunityIcons name="map-marker-check" size={20} color="#00C853" />
              <Text style={styles.locationText}>
                {location.city}{location.state ? `, ${location.state}` : ''} — Pinned ✓
              </Text>
              <TouchableOpacity onPress={handleGetLocation} style={{marginLeft: 'auto'}}>
                 <MaterialCommunityIcons name="refresh" size={20} color="#666" />
              </TouchableOpacity>
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

        {/* Language Modifier */}
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Application Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {['English', 'Hindi', 'Bengali'].map(lang => (
                    <TouchableOpacity 
                        key={lang} 
                        style={[styles.chip, language === lang && styles.chipActive]}
                        onPress={() => setLanguage(lang)}
                    >
                        <Text style={[styles.chipText, language === lang && styles.chipTextActive]}>
                            {lang}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* Persona Modifier */}
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>My primary role is:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {['farmer', 'gardener', 'plant_lover'].map(role => {
                    const disp = role === 'farmer' ? 'Farmer' : role === 'gardener' ? 'Home Gardener' : 'Apartment Plant Lover';
                    return (
                    <TouchableOpacity 
                        key={role} 
                        style={[styles.chip, persona === role && styles.chipActive]}
                        onPress={() => setPersona(role)}
                    >
                        <Text style={[styles.chipText, persona === role && styles.chipTextActive]}>
                            {disp}
                        </Text>
                    </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        {/* Active Chosen Plants / Search Modifier */}
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>My Tracking Plants</Text>
            
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10}}>
                {chosenPlants.map(plant => (
                    <View key={plant} style={styles.plantBadge}>
                        <Text style={styles.plantBadgeText}>{plant}</Text>
                        <TouchableOpacity onPress={() => removePlant(plant)} style={{marginLeft: 6}}>
                            <MaterialCommunityIcons name="close-circle" size={16} color="#00C853" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search e.g. Tomato to add"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onFocus={() => { if(searchQuery) setShowSuggestions(true); }}
                />
                {searching && <ActivityIndicator size="small" color="#00C853" style={styles.searchActionIcon} />}
            </View>

            {showSuggestions && (searchQuery.length > 0) && (
                <View style={styles.suggestionsCard}>
                    {suggestions.length > 0 ? (
                        suggestions.map((crop, index) => (
                            <TouchableOpacity 
                                key={crop._id || `sugg_${index}`} 
                                style={styles.suggestionItem} 
                                onPress={() => addPlant(crop.name)}
                            >
                                <MaterialCommunityIcons name="leaf" size={16} color="#00C853" style={{ marginRight: 8 }} />
                                <Text style={styles.suggestionText}>{crop.name}</Text>
                            </TouchableOpacity>
                        ))
                    ) : !searching ? (
                        <TouchableOpacity style={styles.suggestionItem} onPress={() => addPlant(searchQuery)}>
                            <Text style={styles.suggestionText}>+ Add "{searchQuery}" manually</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            )}
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Final Updates</Text>}
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
  headerTitleContainer: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  headerMainTitle: {fontSize: 18, fontWeight: 'bold', color: '#111'},
  scroll: { padding: 20, paddingBottom: 60 },
  photoContainer: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#00C853', borderStyle: 'dashed'
  },
  photoLabel: { fontSize: 10, color: '#00C853', marginTop: 4, fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
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
  chipRow: { flexDirection: 'row', paddingVertical: 4 },
  chip: {
      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
      backgroundColor: '#f0f0f0', marginRight: 10, borderWidth: 1, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#e8f5e9', borderColor: '#00C853' },
  chipText: { color: '#666', fontWeight: '500', fontSize: 14 },
  chipTextActive: { color: '#00C853', fontWeight: 'bold' },
  plantBadge: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9',
      borderWidth: 1, borderColor: '#00C853', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6
  },
  plantBadgeText: {color: '#00C853', fontSize: 13, fontWeight: 'bold'},
  searchContainer: {
      flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
      borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchActionIcon: { padding: 4 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
  suggestionsCard: {
      backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee',
      borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderTopWidth: 0,
      marginTop: -4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10,
  },
  suggestionItem: {
      flexDirection: 'row', alignItems: 'center', padding: 14,
      borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  suggestionText: { fontSize: 15, color: '#333' },
  saveBtn: {
    backgroundColor: '#00C853', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 12, marginBottom: 24
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
