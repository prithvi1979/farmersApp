import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderDropdown from '../../components/HeaderDropdown';

export default function MarketScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconBg}>
                            <MaterialCommunityIcons name="storefront" size={30} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>Market</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconButton}>
                            <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
                        </TouchableOpacity>
                        <HeaderDropdown />
                    </View>
                </View>

                {/* Search Box */}
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for seeds, tools, fertilizers..."
                        placeholderTextColor="#888"
                    />
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesWrapper} contentContainerStyle={styles.categoriesContainer}>
                    {['Seeds', 'Pesticides', 'Tools', 'Sprays', 'Fertilizers'].map((cat, index) => (
                        <TouchableOpacity key={index} style={[styles.categoryTab, index === 0 && styles.categoryTabActive]}>
                            <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Product List */}
                <Text style={styles.sectionTitle}>Featured Products</Text>

                {/* Product Card 1 */}
                <View style={styles.productCard}>
                    <View style={styles.productImagePlaceholder}>
                        <MaterialCommunityIcons name="seed" size={40} color="#00C853" />
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>Premium Tomato Seeds</Text>
                        <Text style={styles.productDesc}>High yield, disease resistant variety suitable for all weather.</Text>
                        <View style={styles.productRow}>
                            <Text style={styles.productPrice}>$4.99</Text>
                            <TouchableOpacity style={styles.buyButton}>
                                <Text style={styles.buyButtonText}>Buy Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Product Card 2 */}
                <View style={styles.productCard}>
                    <View style={styles.productImagePlaceholder}>
                        <MaterialCommunityIcons name="spray" size={40} color="#00C853" />
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>Organic Pest Spray</Text>
                        <Text style={styles.productDesc}>Eco-friendly spray to protect plants from common insects.</Text>
                        <View style={styles.productRow}>
                            <Text style={styles.productPrice}>$12.50</Text>
                            <TouchableOpacity style={styles.buyButton}>
                                <Text style={styles.buyButtonText}>Buy Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Product Card 3 */}
                <View style={styles.productCard}>
                    <View style={styles.productImagePlaceholder}>
                        <MaterialCommunityIcons name="shovel" size={40} color="#00C853" />
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>Heavy Duty Shovel</Text>
                        <Text style={styles.productDesc}>Durable steel shovel for digging, planting and soil turning.</Text>
                        <View style={styles.productRow}>
                            <Text style={styles.productPrice}>$24.99</Text>
                            <TouchableOpacity style={styles.buyButton}>
                                <Text style={styles.buyButtonText}>Buy Now</Text>
                            </TouchableOpacity>
                        </View>
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginBottom: 20,
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
    categoriesWrapper: {
        marginBottom: 24,
    },
    categoriesContainer: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        height: 38,
        justifyContent: 'center',
    },
    categoryTabActive: {
        backgroundColor: '#00C853',
        borderColor: '#00C853',
    },
    categoryText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
    },
    productDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 8,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00C853',
    },
    buyButton: {
        backgroundColor: '#00C853',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
