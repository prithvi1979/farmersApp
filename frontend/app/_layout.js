import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LanguageProvider } from '../context/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        // Hold the splash for at least 1.5 seconds for a polished experience,
        // then hide it once the layout is fully mounted and ready.
        const timer = setTimeout(() => {
            SplashScreen.hideAsync();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
        </LanguageProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5faeb', // Very light earthy/green tint
    },
});
