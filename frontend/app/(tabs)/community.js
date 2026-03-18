import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderDropdown from '../../components/HeaderDropdown';

export default function CommunityScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconBg}>
                            <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>Community</Text>
                    </View>
                    <HeaderDropdown />
                </View>

                {/* Search Box */}
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search in community..."
                        placeholderTextColor="#888"
                    />
                </View>

                {/* Blog Articles List */}
                <Text style={styles.sectionTitle}>Recent Discussions</Text>

                {/* Article Card 1 */}
                <View style={styles.articleCard}>
                    <Text style={styles.articleTitle}>Best practices for organic pest control</Text>
                    <View style={styles.articleImagePlaceholder}>
                        <MaterialCommunityIcons name="bug" size={50} color="#00C853" />
                    </View>
                    <Text style={styles.articleDesc}>Using neem oil and ladybugs has significantly reduced the aphid population in my greenhouse this season. Here's how I did it...</Text>
                    <View style={styles.articleFooter}>
                        <Text style={styles.articleAuthor}>By Jane Doe</Text>
                        <Text style={styles.articleDate}>Oct 24, 2024</Text>
                    </View>
                </View>

                {/* Article Card 2 */}
                <View style={styles.articleCard}>
                    <Text style={styles.articleTitle}>How to handle unseasonal heavy rains</Text>
                    <View style={styles.articleImagePlaceholder}>
                        <MaterialCommunityIcons name="weather-lightning-rainy" size={50} color="#00C853" />
                    </View>
                    <Text style={styles.articleDesc}>With the sudden downpours disrupting our planting schedule, I wanted to share some drainage techniques to prevent root rot in young saplings.</Text>
                    <View style={styles.articleFooter}>
                        <Text style={styles.articleAuthor}>By John Smith</Text>
                        <Text style={styles.articleDate}>Oct 21, 2024</Text>
                    </View>
                </View>

                {/* Article Card 3 */}
                <View style={styles.articleCard}>
                    <Text style={styles.articleTitle}>Has anyone tried the new hydroponic kits?</Text>
                    <View style={styles.articleImagePlaceholder}>
                        <MaterialCommunityIcons name="water-percent" size={50} color="#00C853" />
                    </View>
                    <Text style={styles.articleDesc}>Looking for reviews on the affordable indoor hydroponic setups that have been advertised recently. Are they worth the initial investment for leafy greens?</Text>
                    <View style={styles.articleFooter}>
                        <Text style={styles.articleAuthor}>By Alex Farm</Text>
                        <Text style={styles.articleDate}>Oct 18, 2024</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIconBg: {
        backgroundColor: '#00C853',
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    iconButton: {
        marginLeft: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
    },
    articleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    articleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 12,
        lineHeight: 24,
    },
    articleImagePlaceholder: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    articleDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 16,
    },
    articleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    articleAuthor: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#00C853',
    },
    articleDate: {
        fontSize: 12,
        color: '#888',
    },
});
