import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LanguageProvider } from '../context/LanguageContext';

export default function RootLayout() {
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
