import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  Platform, StatusBar, Image, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const saved = await AsyncStorage.getItem('@user_profile');
          if (saved) setUser(JSON.parse(saved));
          else setUser(null);
        } catch (e) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }, [])
  );

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('@user_profile');
    setUser(null);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

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

        {user ? (
          /* ── LOGGED IN STATE ── */
          <>
            <View style={styles.profileCard}>
              {user.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
                </View>
              )}
              <Text style={styles.userName}>{user.name || 'Farmer'}</Text>
              <Text style={styles.userEmail}>{user.email || ''}</Text>
              {user.location?.city && (
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#00C853" />
                  <Text style={styles.locationText}>
                    {user.location.city}{user.location.state ? `, ${user.location.state}` : ''}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionsCard}>
              <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/auth/profile-setup')}>
                <MaterialCommunityIcons name="account-edit-outline" size={22} color="#00C853" />
                <Text style={styles.actionText}>Edit Profile</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
                <MaterialCommunityIcons name="logout" size={22} color="#d32f2f" />
                <Text style={[styles.actionText, { color: '#d32f2f' }]}>Sign Out</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ── GUEST / LOGGED OUT STATE ── */
          <>
            <View style={styles.guestCard}>
              <View style={styles.guestIcon}>
                <MaterialCommunityIcons name="account-circle-outline" size={64} color="#ccc" />
              </View>
              <Text style={styles.guestTitle}>You're browsing as a guest</Text>
              <Text style={styles.guestDesc}>
                Sign in to save your farm data, sync across devices, and connect with the community.
              </Text>

              <TouchableOpacity style={styles.googleBtn} onPress={() => router.push('/auth/sign-in')}>
                <MaterialCommunityIcons name="google" size={22} color="#EA4335" style={{ marginRight: 10 }} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
          </>
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
  header: { marginBottom: 24 },
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
  userEmail: { fontSize: 14, color: '#888', marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { fontSize: 13, color: '#555', marginLeft: 4 },

  actionsCard: {
    backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#222', marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#f0f0f0' },

  // Guest card
  guestCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
  },
  guestIcon: { marginBottom: 16 },
  guestTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  guestDesc: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2
  },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#333' }
});
