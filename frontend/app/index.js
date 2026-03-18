import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function LanguageSelectionScreen() {
    const router = useRouter();

    const handleSelectLanguage = (lang) => {
        // In a real app we would save this to context or storage.
        router.push('/onboarding/persona');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.progressText}>Step 1 of 3</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Choose your language</Text>
                    <Text style={styles.subtitle}>Select the language you are most comfortable with.</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('Bengali')}
                        >
                            <Text style={styles.languageText}>বাংলা</Text>
                            <Text style={styles.languageSubText}>Bengali</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('Hindi')}
                        >
                            <Text style={styles.languageText}>हिन्दी</Text>
                            <Text style={styles.languageSubText}>Hindi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.languageCard}
                            onPress={() => handleSelectLanguage('English')}
                        >
                            <Text style={styles.languageText}>English</Text>
                            <Text style={styles.languageSubText}>English</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        paddingTop: 40, // For simple safe area spacing
        paddingBottom: 20,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4caf50',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1b5e20',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        gap: 16,
    },
    languageCard: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e8f5e9',
    },
    languageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    languageSubText: {
        fontSize: 18,
        color: '#888',
    },
});
