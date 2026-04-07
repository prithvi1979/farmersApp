import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

// Web Client ID — used by the native SDK to request user's ID token
const GOOGLE_WEB_CLIENT_ID = '485834597416-9v1mmn16ij5silseee9iln6cjnq6drkc.apps.googleusercontent.com';

// Configure once at module level (not inside component)
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
  scopes: ['profile', 'email'],
});

export default function SignInScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Check Google Play Services availability
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Opens the native Google account picker — no browser, no URI scheme
      const signInResult = await GoogleSignin.signIn();

      // Extract the ID token (works with both v13 and v14 of the package)
      const idToken =
        signInResult?.data?.idToken ||
        signInResult?.idToken ||
        null;

      if (!idToken) {
        throw new Error('Google sign-in completed but no ID token was returned.');
      }

      // Send the ID token to our backend to verify and create/link the user
      const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, deviceId })
      });
      const json = await res.json();

      if (json.success) {
        await AsyncStorage.setItem('@user_profile', JSON.stringify(json.data));
        router.replace('/(tabs)/profile');
      } else {
        Alert.alert('Sign-In Error', json.error || 'Could not sign in. Please try again.');
      }

    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — silent, no alert needed
      } else if (err.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Please Wait', 'Sign-in is already in progress.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Not Available', 'Google Play Services is required for Google Sign-In.');
      } else {
        console.error('Google Sign-In Error:', err);
        Alert.alert('Sign-In Failed', err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <MaterialCommunityIcons name="sprout" size={64} color="#00C853" />
          </View>
        </View>

        <Text style={styles.title}>Welcome to AgriGrow</Text>
        <Text style={styles.subtitle}>
          Sign in with Google to save your farm data, track your crops, and connect with the farming community.
        </Text>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.6 }]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <>
              <MaterialCommunityIcons name="google" size={22} color="#EA4335" style={{ marginRight: 12 }} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>

        {/* Guest mode */}
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()}>
          <Text style={styles.skipText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#f6f8f4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
  },
  illustrationContainer: { alignItems: 'center', marginBottom: 32 },
  illustrationCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center'
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    minHeight: 54, marginBottom: 16,
  },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#333' },
  disclaimer: { fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 16, marginTop: 8 },
  skipBtn: { marginTop: 24, alignItems: 'center' },
  skipText: { fontSize: 14, color: '#00C853', fontWeight: '600' }
});
