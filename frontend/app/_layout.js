import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
    return (
        <View style={styles.container}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5faeb', // Very light earthy/green tint
    },
});
