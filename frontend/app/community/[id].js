import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function ThreadScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        const init = async () => {
            const devId = await AsyncStorage.getItem('deviceId');
            setDeviceId(devId);
            fetchPost();
        };
        init();
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/community/post/${id}`);
            const data = await res.json();
            if (data.success) {
                setPost(data.data);
            }
        } catch (error) {
            console.error("Fetch thread error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !deviceId) return;
        
        setIsSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/community/post/${id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorId: deviceId,
                    text: replyText.trim()
                })
            });
            const data = await response.json();
            if (data.success) {
                setReplyText('');
                Keyboard.dismiss();
                setPost(data.data); // Update with new answers
            }
        } catch (error) {
            console.error("Reply error:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, {justifyContent: 'center'}]}>
                <ActivityIndicator size="large" color="#00C853" />
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><MaterialCommunityIcons name="arrow-left" size={24} color="#111" /></TouchableOpacity>
                </View>
                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                    <Text>Post not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Discussion</Text>
                <View style={{width: 32}} />
            </View>

            <KeyboardAvoidingView 
                style={{flex: 1}} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Original Post */}
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <View style={styles.postAuthorRow}>
                        <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="account" size={20} color="#888" /></View>
                        <Text style={styles.authorName}>{post.authorName}</Text>
                        <Text style={styles.dateText}> • {new Date(post.createdAt).toLocaleDateString()}</Text>
                        {post.cropTag && (
                            <View style={styles.cropTagBadge}>
                                <Text style={styles.cropTagText}>{post.cropTag}</Text>
                            </View>
                        )}
                    </View>
                    
                    {post.imageUrl && (
                        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                    )}
                    
                    <Text style={styles.postBody}>{post.question}</Text>
                    
                    <View style={styles.divider} />
                    <Text style={styles.replyHeader}>Replies ({post.answers?.length || 0})</Text>
                    
                    {/* Answers */}
                    {post.answers && post.answers.map((ans, idx) => (
                        <View key={ans._id || idx.toString()} style={styles.replyCard}>
                            <View style={styles.postAuthorRow}>
                                <View style={[styles.avatarPlaceholder, {width: 28, height: 28, borderRadius: 14}]}><MaterialCommunityIcons name="account" size={16} color="#888" /></View>
                                <Text style={styles.replyAuthor}>{ans.authorName}</Text>
                                <Text style={styles.dateText}> • {new Date(ans.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.replyText}>{ans.text}</Text>
                        </View>
                    ))}
                    
                    {(!post.answers || post.answers.length === 0) && (
                        <Text style={styles.emptyText}>No replies yet. Be the first to help out!</Text>
                    )}
                </ScrollView>
                
                {/* Reply Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Write your answer..."
                        value={replyText}
                        onChangeText={setReplyText}
                        editable={!isSending && !!deviceId}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, (!replyText.trim() || isSending) && styles.sendButtonDisabled]} 
                        onPress={handleReply}
                        disabled={!replyText.trim() || isSending || !deviceId}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <MaterialCommunityIcons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f6f8f4' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', flex: 1, textAlign: 'center' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    postTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 12 },
    postAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
    avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    authorName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    dateText: { fontSize: 12, color: '#888' },
    cropTagBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
    cropTagText: { fontSize: 11, color: '#00C853', fontWeight: 'bold' },
    postImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 16, resizeMode: 'cover' },
    postBody: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 24 },
    divider: { height: 1, backgroundColor: '#ddd', marginBottom: 16 },
    replyHeader: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 16 },
    replyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    replyAuthor: { fontSize: 13, fontWeight: 'bold', color: '#333' },
    replyText: { fontSize: 14, color: '#555', lineHeight: 20, marginTop: 4 },
    emptyText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 24 },
    
    inputContainer: { flexDirection: 'row', padding: 12, paddingBottom: Platform.OS === 'android' ? 32 : 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end' },
    textInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, minHeight: 52, maxHeight: 150, fontSize: 15, color: '#333' },
    sendButton: { backgroundColor: '#00C853', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 },
    sendButtonDisabled: { backgroundColor: '#a5d6a7' }
});
