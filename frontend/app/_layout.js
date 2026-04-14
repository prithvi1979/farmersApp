import { Stack } from 'expo-router';
import { View, StyleSheet, Animated } from 'react-native';
import { LanguageProvider } from '../context/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
    const splashOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        async function prepare() {
            try {
                // Background sync of the crop dictionary for fast local autofill
                const syncDictionary = async () => {
                    try {
                        const res = await fetch('https://farmersapp-333z.onrender.com/api/crops/dictionary/all');
                        const json = await res.json();
                        if (json.success && json.data) {
                            await AsyncStorage.setItem('@crop_dictionary', JSON.stringify(json.data));
                        }
                    } catch (err) {
                        console.log('Background dictionary sync failed:', err);
                    }
                };
                
                // Fire and forget the sync (don't block the app loading)
                syncDictionary();

                // Mimic initial load/preparation (e.g., loading fonts, auth check)
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            // Hide the native OS splash screen. 
            // Our custom overlay is fully opaque, so the transition is seamless.
            SplashScreen.hideAsync().catch(() => {});

            // Wait a moment then fade out the custom splash screen
            const timer = setTimeout(() => {
                Animated.timing(splashOpacity, {
                    toValue: 0,
                    duration: 500, // 500ms fade transition
                    useNativeDriver: true,
                }).start(() => setAnimationComplete(true));
            }, 2000); // 2 seconds display before fading

            return () => clearTimeout(timer);
        }
    }, [appIsReady, splashOpacity]);

    return (
        <LanguageProvider>
            <View style={styles.container}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: 'transparent' },
                    }}
                />
            </View>

            {/* Custom Splash Screen Overlay */}
            {!isSplashAnimationComplete && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            opacity: splashOpacity,
                            zIndex: 999,
                            backgroundColor: '#1a3d1a', // Match theme background color
                        }
                    ]}
                >
                    <Animated.Image
                        source={require('../assets/AGRIGROW-splash.png')}
                        style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'contain',
                        }}
                    />
                </Animated.View>
            )}
        </LanguageProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5faeb', // Very light earthy/green tint
    },
});
