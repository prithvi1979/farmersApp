import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function AssistantScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState([
        { id: '1', text: "Hello! I'm your AgriGrow AI assistant. How can I help your farm today?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        const getDeviceId = async () => {
            const id = await AsyncStorage.getItem('deviceId');
            setDeviceId(id);
        };
        getDeviceId();
    }, []);

    const handleSend = async () => {
        if (!inputText.trim() || !deviceId) return;

        const userMsgText = inputText.trim();
        const userMsg = { id: Date.now().toString(), text: userMsgText, sender: 'user' };
        
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        Keyboard.dismiss();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deviceId: deviceId,
                    message: userMsgText
                })
            });

            const data = await response.json();
            if (data.success) {
                const aiMsg = { id: (Date.now() + 1).toString(), text: data.response, sender: 'ai' };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                const errorMsg = { id: (Date.now() + 1).toString(), text: "Sorry, I had trouble processing that. " + (data.error || ""), sender: 'ai' };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = { id: (Date.now() + 1).toString(), text: "Network error. Please try again later.", sender: 'ai' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <MaterialCommunityIcons name="robot-outline" size={24} color="#00C853" />
                    <Text style={styles.headerTitle}>AgriGrow Assistant</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.chatContainer}
                    showsVerticalScrollIndicator={false}
                />
                
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ask about your crops..."
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!isLoading && !!deviceId}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]} 
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading || !deviceId}
                    >
                        {isLoading ? (
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
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#111',
    },
    container: {
        flex: 1,
    },
    chatContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#00C853',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: Platform.OS === 'android' ? 32 : 12, // Adds space for Android bottom nav
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 52, // Taller default height
        maxHeight: 150, // Allows it to expand more over multiple lines
        fontSize: 15,
        color: '#333',
    },
    sendButton: {
        backgroundColor: '#00C853',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: '#a5d6a7',
    }
});
