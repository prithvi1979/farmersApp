import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar, Alert, Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

// PASTE YOUR GOOGLE WEB CLIENT ID HERE
const GOOGLE_WEB_CLIENT_ID = '485834597416-9v1mmn16ij5silseee9iln6cjnq6drkc.apps.googleusercontent.com';

export default function SignInScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication.accessToken);
    } else if (response?.type === 'error') {
      Alert.alert('Sign In Failed', 'Google sign-in was cancelled or failed. Please try again.');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken) => {
    try {
      setLoading(true);
      const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, deviceId })
      });
      const json = await res.json();

      if (json.success) {
        // Save auth state to AsyncStorage
        await AsyncStorage.setItem('@user_profile', JSON.stringify(json.data));
        router.replace('/auth/profile-setup');
      } else {
        Alert.alert('Error', json.error || 'Sign-in failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error(err);
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
          Sign in to save your farm data, track your crops, and connect with the farming community.
        </Text>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.oauthBtn, styles.googleBtn, (!request || loading) && { opacity: 0.6 }]}
          onPress={() => { setLoading(true); promptAsync(); }}
          disabled={!request || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' }}
                style={styles.oauthIcon}
              />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>

        {/* Skip / Guest mode */}
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
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    minHeight: 54
  },
  googleBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  oauthIcon: { width: 22, height: 22, marginRight: 12 },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#333' },
  disclaimer: { fontSize: 11, color: '#999', textAlign: 'center', lineHeight: 16, marginTop: 8 },
  skipBtn: { marginTop: 24, alignItems: 'center' },
  skipText: { fontSize: 14, color: '#00C853', fontWeight: '600' }
});
