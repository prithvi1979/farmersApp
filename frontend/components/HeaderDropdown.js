import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HeaderDropdown() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsVisible(!isVisible);
    };

    const handleNavigation = (path) => {
        setIsVisible(false);
        router.push(path);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
                <MaterialCommunityIcons name="dots-vertical" size={32} color="#333" />
            </TouchableOpacity>

            {isVisible && (
                <View style={styles.dropdown}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/privacy-policy')}>
                        <Text style={styles.menuText}>Privacy policy</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/terms-of-service')}>
                        <Text style={styles.menuText}>Terms of service</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/contact-us')}>
                        <Text style={styles.menuText}>Contact us</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 100, // Ensure it stays on top of other elements
        elevation: 100,
    },
    iconButton: {
        padding: 4,
    },
    dropdown: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        width: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#eee',
        paddingVertical: 8,
    },
    menuItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 8,
    },
});
