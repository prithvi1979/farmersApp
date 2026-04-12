import { Stack } from 'expo-router';
import { View, StyleSheet, Animated } from 'react-native';
import { LanguageProvider } from '../context/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';

// Keep native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
    const splashOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        async function prepare() {
            try {
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
            }, 1000); // 1 second display before fading

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
