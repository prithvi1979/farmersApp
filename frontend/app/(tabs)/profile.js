import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  Platform, StatusBar, Image, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

// Map crop names to icons (fallback for missing images)
const CROP_ICON_MAP = {
  tomato: 'fruit-cherries', apple: 'food-apple', mango: 'food-apple',
  wheat: 'grain', rice: 'grain', corn: 'corn', maize: 'corn',
  potato: 'food', carrot: 'carrot', onion: 'food', chili: 'pepper-hot',
  pepper: 'pepper-hot', cucumber: 'food', spinach: 'leaf', lettuce: 'leaf',
  cabbage: 'leaf', brinjal: 'food', eggplant: 'food', default: 'sprout'
};

const getCropIcon = (name = '') => {
  const key = name.toLowerCase();
  for (const k of Object.keys(CROP_ICON_MAP)) {
    if (key.includes(k)) return CROP_ICON_MAP[k];
  }
  return CROP_ICON_MAP.default;
};

const PERSONA_ICON_MAP = {
  farmer: 'tractor', gardener: 'sprout', 'home gardener': 'home',
  commercial: 'storefront-outline', default: 'account-hard-hat'
};

const getPersonaIcon = (persona = '') => {
  const key = (persona || '').toLowerCase();
  for (const k of Object.keys(PERSONA_ICON_MAP)) {
    if (key.includes(k)) return PERSONA_ICON_MAP[k];
  }
  return PERSONA_ICON_MAP.default;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);   // OAuth profile (name, photo, email)
  const [onboardData, setOnboardData] = useState(null); // chosenPlants, persona from backend
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          // Load auth profile from local cache
          const saved = await AsyncStorage.getItem('@user_profile');
          if (saved) setAuthUser(JSON.parse(saved));
          else setAuthUser(null);

          // ── Cache-first for onboarding data ──
          // 1. Show cached data instantly if available
          const cachedOnboard = await AsyncStorage.getItem('@onboard_data');
          if (cachedOnboard) {
            setOnboardData(JSON.parse(cachedOnboard));
            setLoading(false); // show UI immediately from cache
          }

          // 2. Always refresh from backend in background (silently)
          const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
          const res = await fetch(`${API_BASE_URL}/users/profile/${deviceId}`);
          const json = await res.json();
          if (json.success) {
            setOnboardData(json.data);
            // Update cache with fresh data
            await AsyncStorage.setItem('@onboard_data', JSON.stringify(json.data));
          }
        } catch (e) {
          console.log('Profile load error:', e.message);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('@user_profile');
    setAuthUser(null);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const persona = onboardData?.persona || authUser?.persona;
  const chosenPlants = onboardData?.chosenPlants || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00C853" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {authUser ? (
          /* ── LOGGED IN: Avatar card ── */
          <View style={styles.profileCard}>
            {authUser.photoUrl ? (
              <Image source={{ uri: authUser.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(authUser.name)}</Text>
              </View>
            )}
            <Text style={styles.userName}>{authUser.name || 'Farmer'}</Text>
            <Text style={styles.userEmail}>{authUser.email || ''}</Text>
            {(authUser.location?.city || onboardData?.location?.city) && (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#00C853" />
                <Text style={styles.locationText}>
                  {authUser.location?.city || onboardData?.location?.city}
                  {(authUser.location?.state || onboardData?.location?.state)
                    ? `, ${authUser.location?.state || onboardData?.location?.state}` : ''}
                </Text>
              </View>
            )}
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/auth/profile-setup')}>
                <MaterialCommunityIcons name="account-edit-outline" size={16} color="#00C853" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <MaterialCommunityIcons name="logout" size={16} color="#d32f2f" />
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ── GUEST STATE ── */
          <View style={styles.guestCard}>
            <View style={styles.guestIcon}>
              <MaterialCommunityIcons name="account-circle-outline" size={60} color="#ccc" />
            </View>
            <Text style={styles.guestTitle}>You're browsing as a guest</Text>
            <Text style={styles.guestDesc}>
              Sign in to save your farm data and sync across devices.
            </Text>
            <TouchableOpacity style={styles.googleBtn} onPress={() => router.push('/auth/sign-in')}>
              <MaterialCommunityIcons name="google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PREFERRED CROPS ── */}
        {chosenPlants.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Preferred Crops</Text>
            <View style={styles.cropsGrid}>
              {chosenPlants.map((plant, i) => (
                <View key={i} style={styles.cropItem}>
                  <View style={styles.cropIconBg}>
                    <MaterialCommunityIcons
                      name={getCropIcon(plant)}
                      size={28}
                      color="#2E7D32"
                    />
                  </View>
                  <Text style={styles.cropName} numberOfLines={1}>{plant}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── PERSONA / START A CROP ── */}
        {persona && (
          <View style={styles.personaCard}>
            <View style={styles.personaHeader}>
              <View style={styles.personaIconBg}>
                <MaterialCommunityIcons name={getPersonaIcon(persona)} size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.personaLabel}>You are a</Text>
                <Text style={styles.personaTitle}>{persona}</Text>
              </View>
            </View>
            <Text style={styles.personaDesc}>
              Ready to grow? Track your crops phase by phase and get AI-powered instructions from seed to harvest.
            </Text>
            <TouchableOpacity style={styles.startCropBtn} onPress={() => router.push('/start-crop')}>
              <MaterialCommunityIcons name="seed-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.startCropBtnText}>Start a Crop</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#f6f8f4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111' },

  // Logged-in profile card
  profileCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  avatarInitials: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { fontSize: 13, color: '#555', marginLeft: 4 },
  profileActions: { flexDirection: 'row', marginTop: 16, gap: 12 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f5e9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8
  },
  editBtnText: { color: '#00C853', fontWeight: '600', marginLeft: 6, fontSize: 13 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fdecea', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8
  },
  signOutBtnText: { color: '#d32f2f', fontWeight: '600', marginLeft: 6, fontSize: 13 },

  // Guest card
  guestCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
  },
  guestIcon: { marginBottom: 12 },
  guestTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  guestDesc: { fontSize: 13, color: '#777', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2
  },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#333' },

  // Generic card
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#111', marginBottom: 16 },

  // Crops grid
  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cropItem: { alignItems: 'center', width: 68 },
  cropIconBg: {
    width: 60, height: 60, borderRadius: 14,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    marginBottom: 6
  },
  cropName: { fontSize: 11, color: '#555', fontWeight: '500', textAlign: 'center' },

  // Persona card
  personaCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  personaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  personaIconBg: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  personaLabel: { fontSize: 12, color: '#888' },
  personaTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', textTransform: 'capitalize' },
  personaDesc: { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 16 },
  startCropBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#00C853', borderRadius: 12, paddingVertical: 14
  },
  startCropBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
