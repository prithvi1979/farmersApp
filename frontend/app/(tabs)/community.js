import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderDropdown from '../../components/HeaderDropdown';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function CommunityScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchPosts = async () => {
                setLoading(true);
                try {
                    const devId = await AsyncStorage.getItem('deviceId');
                    const query = devId ? `?deviceId=${devId}` : '';
                    const response = await fetch(`${API_BASE_URL}/community/posts${query}`);
                    const data = await response.json();
                    if (data.success) {
                        setPosts(data.data);
                    }
                } catch (error) {
                    console.error('Fetch posts error:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPosts();
        }, [])
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoIconBg}>
                        <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
                    </View>
                    <Text style={styles.logoText}>{t('community')}</Text>
                </View>
                <HeaderDropdown />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('searchInCommunity')}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('recentDiscussions')}</Text>
                    <TouchableOpacity style={styles.askButton} onPress={() => router.push('/community/ask')}>
                        <MaterialCommunityIcons name="pencil-plus" size={20} color="#fff" />
                        <Text style={styles.askButtonText}>{t('ask')}</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#00C853" style={{ marginTop: 40 }} />
                ) : posts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="comment-text-multiple-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>{t('noDiscussions')}</Text>
                    </View>
                ) : (
                    posts.map((post) => (
                        <TouchableOpacity 
                            key={post._id} 
                            style={styles.articleCard}
                            onPress={() => router.push(`/community/${post._id}`)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.articleTitle} numberOfLines={2}>{post.title}</Text>
                            
                            {post.imageUrl ? (
                                <Image source={{ uri: post.imageUrl }} style={styles.articleImage} />
                            ) : (
                                <View style={styles.articleImagePlaceholder}>
                                    <MaterialCommunityIcons name="sprout" size={50} color="#00C853" />
                                </View>
                            )}
                            
                            <Text style={styles.articleDesc} numberOfLines={3}>{post.question}</Text>
                            
                            <View style={styles.articleFooter}>
                                <View style={styles.authorRow}>
                                    <MaterialCommunityIcons name="account-circle" size={16} color="#00C853" />
                                    <Text style={styles.articleAuthor}>{post.authorName}</Text>
                                </View>
                                <View style={styles.footerRight}>
                                    {post.cropTag && (
                                        <Text style={styles.cropTag}>{post.cropTag}</Text>
                                    )}
                                    <Text style={styles.articleDate}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f8f4', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 20 },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIconBg: { backgroundColor: '#00C853', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 24, borderWidth: 1, borderColor: '#eee' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: '#333' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    askButton: { backgroundColor: '#00C853', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    askButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { color: '#888', marginTop: 12, fontSize: 15 },
    articleCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    articleTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 12, lineHeight: 24 },
    articleImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12, resizeMode: 'cover' },
    articleImagePlaceholder: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    articleDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
    articleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
    authorRow: { flexDirection: 'row', alignItems: 'center' },
    articleAuthor: { fontSize: 12, fontWeight: 'bold', color: '#00C853', marginLeft: 4 },
    footerRight: { flexDirection: 'row', alignItems: 'center' },
    cropTag: { backgroundColor: '#e8f5e9', color: '#00C853', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
    articleDate: { fontSize: 12, color: '#888' },
});
