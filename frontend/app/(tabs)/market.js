import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Image, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderDropdown from '../../components/HeaderDropdown';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

export default function MarketScreen() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Seeds', 'Pesticides', 'Tools', 'Sprays', 'Fertilizers'];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `${API_BASE_URL}/market/products`;
                if (activeCategory !== 'All') {
                    url += `?category=${activeCategory.toLowerCase()}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeCategory]);

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
                    {categories.map((cat, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Product List */}
                <Text style={styles.sectionTitle}>Featured Products</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#00C853" style={{ marginTop: 40 }} />
                ) : products.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No products found in this category.</Text>
                    </View>
                ) : (
                    products.map((product) => (
                        <View key={product._id} style={styles.productCard}>
                            {product.imageUrl ? (
                                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                            ) : (
                                <View style={styles.productImagePlaceholder}>
                                    <MaterialCommunityIcons name="store" size={40} color="#00C853" />
                                </View>
                            )}
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>{product.title}</Text>
                                <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
                                <View style={styles.productRow}>
                                    <Text style={styles.productPrice}>
                                        {product.price.toString().startsWith('$') || product.price.toString().startsWith('₹') ? product.price : `₹${product.price}`}
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.buyButton}
                                        onPress={() => {
                                            if (product.affiliateLink) {
                                                Linking.openURL(product.affiliateLink).catch(err => console.error("Couldn't load page", err));
                                            }
                                        }}
                                    >
                                        <Text style={styles.buyButtonText}>Buy Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}

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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#888',
        marginTop: 12,
        fontSize: 15,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
        resizeMode: 'cover',
    },
});
