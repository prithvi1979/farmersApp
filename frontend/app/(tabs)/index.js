import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, ImageBackground, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import HeaderDropdown from '../../components/HeaderDropdown';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  Change this to your machine's local IP when backend goes live online
const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

// Category colour fallbacks for library cards with no image
const LIBRARY_CATEGORY_COLORS = {
    diseases: '#b71c1c',
    pests: '#4a148c',
    general: '#1565c0',
    techniques: '#e65100',
    fertilizers: '#33691e',
    irrigation: '#006064',
    seeds: '#2e7d32',
    weather: '#0277bd',
    market: '#4e342e',
    'government-schemes': '#37474f',
};

export default function HomeScreen() {
    const router = useRouter();

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    const [diagnosing, setDiagnosing] = useState(false);
    const [diagnosisResult, setDiagnosisResult] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [activeCrops, setActiveCrops] = useState([]);
    const [dueTasks, setDueTasks] = useState([]);
    const [randomTask, setRandomTask] = useState(null);
    const [hasAnyTasksConfigured, setHasAnyTasksConfigured] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [newsArticles, setNewsArticles] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [newsModalVisible, setNewsModalVisible] = useState(false);
    const [libraryArticles, setLibraryArticles] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(true);
    const [selectedLibraryArticle, setSelectedLibraryArticle] = useState(null);
    const [libraryModalVisible, setLibraryModalVisible] = useState(false);

    const calculateDays = (startDateString) => {
        if (!startDateString) return 1;
        const start = new Date(startDateString);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    };

    const getRandomTask = (tasksArray) => {
        if (!tasksArray || tasksArray.length === 0) return null;
        return tasksArray[Math.floor(Math.random() * tasksArray.length)];
    };

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Try loading from local cache first for instant hydration
                const cachedWeather = await AsyncStorage.getItem('@cached_weather');
                if (cachedWeather) {
                    try {
                        setWeather(JSON.parse(cachedWeather));
                        setWeatherLoading(false);
                    } catch (e) {
                         console.error('Error parsing cached weather', e);
                    }
                }

                // Try fetching weather by saved device profile first, fallback to IP
                const deviceId = await AsyncStorage.getItem('deviceId');
                const endpoint = deviceId 
                    ? `${API_BASE_URL}/weather/${deviceId}` 
                    : `${API_BASE_URL}/weather/by-ip`;

                const res = await fetch(endpoint);
                const json = await res.json();
                if (json.success) {
                    setWeather(json.data);
                    await AsyncStorage.setItem('@cached_weather', JSON.stringify(json.data));
                }
            } catch (err) {
                console.log('Weather fetch error:', err.message);
            } finally {
                setWeatherLoading(false);
            }
        };

        const fetchNews = async () => {
            try {
                const deviceId = await AsyncStorage.getItem('deviceId');
                const url = deviceId
                    ? `${API_BASE_URL}/content/news?deviceId=${deviceId}`
                    : `${API_BASE_URL}/content/news`;
                const res = await fetch(url);
                const json = await res.json();
                if (json.success && json.data) {
                    setNewsArticles(json.data);
                }
            } catch (err) {
                console.log('News fetch error:', err.message);
            } finally {
                setNewsLoading(false);
            }
        };

        const fetchLibrary = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/content/library`);
                const json = await res.json();
                if (json.success && json.data) {
                    setLibraryArticles(json.data.slice(0, 4));
                }
            } catch (err) {
                console.log('Library fetch error:', err.message);
            } finally {
                setLibraryLoading(false);
            }
        };

        fetchWeather();
        fetchNews();
        fetchLibrary();
    }, []);

    const fetchCropsData = async () => {
        try {
            // Try loading from local cache for instant hydration
            const cachedCrops = await AsyncStorage.getItem('@cached_crops_data');
            if (cachedCrops) {
                try {
                    const parsedData = JSON.parse(cachedCrops);
                    setActiveCrops(parsedData.activeCrops);
                    setDueTasks(parsedData.allDueTasks);
                    setHasAnyTasksConfigured(parsedData.anyTasks);
                    setRandomTask(getRandomTask(parsedData.allDueTasks));
                    setLoadingTasks(false);
                } catch (e) {
                    console.error('Error parsing cached crops', e);
                    setLoadingTasks(true);
                }
            } else {
                setLoadingTasks(true);
            }

            const deviceId = await AsyncStorage.getItem('deviceId') || 'default-device-id';
            // Clear old cached data to avoid showing stale data from old schema
            await AsyncStorage.removeItem('@cached_crops_data');
            const res = await fetch(`${API_BASE_URL}/crops/active/${deviceId}`);
            const json = await res.json();
            
            if (json.success) {
                setActiveCrops(json.data);
                
                // Extract all due tasks from all crops
                let allDueTasks = [];
                let anyTasks = false;
                
                json.data.forEach(crop => {
                    // New schema: a crop has tasks configured if it has phases with tasks (indicated by status being 'active')
                    if (crop.status === 'active') anyTasks = true;
                    if (crop.dueTasks) {
                        const cropTasks = crop.dueTasks.map(t => ({
                            ...t, 
                            cropName: crop.cropName, 
                            activeCropId: crop._id,
                            startDate: crop.startDate
                        }));
                        allDueTasks = [...allDueTasks, ...cropTasks];
                    }
                });
                
                setDueTasks(allDueTasks);
                setHasAnyTasksConfigured(anyTasks);
                setRandomTask(getRandomTask(allDueTasks));

                // Save fresh data to local cache
                await AsyncStorage.setItem('@cached_crops_data', JSON.stringify({
                    activeCrops: json.data,
                    allDueTasks,
                    anyTasks
                }));
            }
        } catch (error) {
            console.error('Error fetching crops for home:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCropsData();
            // Load user profile for the avatar
            AsyncStorage.getItem('@user_profile').then(saved => {
                if (saved) setUserProfile(JSON.parse(saved));
                else setUserProfile(null);
            });
        }, [])
    );

    const handleCompleteTask = async (activeCropId, taskId) => {
        try {
            // Optimistically update UI
            setDueTasks(prev => prev.filter(t => t.taskId !== taskId));

            const response = await fetch(`${API_BASE_URL}/crops/task/complete`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeCropId, taskId })
            });
            const json = await response.json();
            
            if (!json.success) {
                // Revert on failure
                fetchCropsData();
            }
        } catch (error) {
            console.error("Error completing task:", error);
            fetchCropsData();
        }
    };

    const handleScanNow = async () => {
        try {
            // Request camera permissions first
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your camera!");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Disabled to prevent the Android "Crop Grid" freeze
                quality: 0.2, // Extremely low quality safely prevents ImagePicker crashes
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const base64Image = asset.base64;
                const mimeType = asset.mimeType || 'image/jpeg';

                setDiagnosing(true);
                
                // Send to backend
                const response = await fetch(`${API_BASE_URL}/ai/diagnose`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: base64Image,
                        mimeType: mimeType
                    })
                });

                const json = await response.json();
                
                if (json.success) {
                    setDiagnosisResult(json.data);
                    setModalVisible(true);
                } else {
                    alert('Diagnosis Failed: ' + (json.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error("Scanning error:", error);
            alert("Error taking photo. Please try again.");
        } finally {
            setDiagnosing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    {/* Left: Agrigrow Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconBg}>
                            <MaterialCommunityIcons name="sprout" size={28} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.logoText}>AgriGrow</Text>
                            <Text style={styles.logoSubText}>
                                {userProfile?.name ? `Hello, ${userProfile.name.split(' ')[0]}!` : 'Your Smart Farm Companion'}
                            </Text>
                        </View>
                    </View>

                    {/* Right: Dropdown menu & Avatar */}
                    <View style={styles.headerRightContainer}>
                        <TouchableOpacity style={styles.avatarWrapper} onPress={() => {
                            if (userProfile?.name) {
                                router.push('/(tabs)/profile');
                            } else {
                                router.push('/auth/create-account');
                            }
                        }}>
                            {userProfile?.photoUrl ? (
                                <Image
                                    source={{ uri: userProfile.photoUrl }}
                                    style={styles.headerAvatar}
                                />
                            ) : userProfile?.name ? (
                                <View style={styles.avatarInitialsBg}>
                                    <Text style={styles.avatarInitials}>
                                        {userProfile.name.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <View style={[styles.avatarInitialsBg, { backgroundColor: '#e0e0e0', width: 36, height: 36, borderRadius: 18 }]}>
                                        <MaterialCommunityIcons name="account-outline" size={20} color="#666" />
                                    </View>
                                    <Text style={{ fontSize: 9, color: '#00C853', fontWeight: 'bold', marginTop: 2 }}>Sign Up</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <HeaderDropdown />
                    </View>
                </View>

                {/* AI Assistant Banner Button */}
                <TouchableOpacity style={styles.assistantBanner} onPress={() => router.push('/assistant')} activeOpacity={0.85}>
                    <View style={styles.assistantBannerLeft}>
                        <View style={styles.assistantIconCircle}>
                            <MaterialCommunityIcons name="robot" size={26} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.assistantBannerTitle}>AI Agronomy Assistant</Text>
                            <Text style={styles.assistantBannerSub}>Ask anything about your crops</Text>
                        </View>
                    </View>
                    <View style={styles.assistantBannerArrow}>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#00C853" />
                    </View>
                </TouchableOpacity>

                {/* Tools */}
                <View style={styles.toolsRow}>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/seed-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="seed" size={24} color="#00C853" />
                        </View>
                        <Text style={styles.toolText} numberOfLines={1} adjustsFontSizeToFit>SEED CALC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/fert-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="calculator" size={24} color="#00C853" />
                        </View>
                        <Text style={styles.toolText} numberOfLines={1} adjustsFontSizeToFit>FERT CALC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/pest-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="bug" size={24} color="#00C853" />
                        </View>
                        <Text style={styles.toolText} numberOfLines={1} adjustsFontSizeToFit>PEST DOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/irrigation-calc')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="water" size={24} color="#0288D1" />
                        </View>
                        <Text style={styles.toolText} numberOfLines={1} adjustsFontSizeToFit>IRRIGATION</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/soil-test')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toolIconContainer}>
                            <MaterialCommunityIcons name="flask-outline" size={24} color="#795548" />
                        </View>
                        <Text style={styles.toolText} numberOfLines={1} adjustsFontSizeToFit>SOIL TEST</Text>
                    </TouchableOpacity>
                </View>

                {/* Daily Widgets — side by side */}
                <View style={styles.widgetsRow}>

                    {/* Weather Widget */}
                    <View style={styles.weatherWidgetCard}>
                        <View style={styles.widgetHeaderRow}>
                            <Text style={styles.weatherWidgetTitle} numberOfLines={1} adjustsFontSizeToFit>
                                {weather?.city && weather?.state ? `${weather.city}, ${weather.state}` : (weather?.city || 'Weather')}
                            </Text>
                            <MaterialCommunityIcons
                                name={weather?.icon || 'weather-partly-cloudy'}
                                size={20}
                                color="#0288D1"
                            />
                        </View>
                        {weatherLoading ? (
                            <ActivityIndicator size="small" color="#0288D1" style={{ marginVertical: 6 }} />
                        ) : (
                            <>
                                <Text style={styles.weatherWidgetTemp}>
                                    {weather ? `${weather.temp}°C` : '28°C'}
                                </Text>
                                <Text style={styles.weatherWidgetDesc} numberOfLines={1}>
                                    {weather
                                        ? weather.description.charAt(0).toUpperCase() + weather.description.slice(1)
                                        : 'Sunny'}
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="water-percent" size={12} color="#64B5F6" />
                                        <Text style={{ fontSize: 10, color: '#64B5F6', marginLeft: 2 }}>{weather?.humidity ?? '--'}%</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="weather-windy" size={12} color="#64B5F6" />
                                        <Text style={{ fontSize: 10, color: '#64B5F6', marginLeft: 2 }}>{weather?.windSpeed ?? '--'} m/s</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Today's Work Widget */}
                    <View style={styles.widgetCard}>
                        <View style={styles.widgetHeaderRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.widgetTitle}>Today's Work</Text>
                                {dueTasks.length > 0 && <View style={[styles.notificationDot, { marginLeft: 6 }]} />}
                            </View>
                            {dueTasks.length > 1 && (
                                <TouchableOpacity onPress={() => setRandomTask(getRandomTask(dueTasks))} style={{ padding: 4 }}>
                                    <MaterialCommunityIcons name="refresh" size={16} color="#00C853" />
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {loadingTasks ? (
                            <ActivityIndicator size="small" color="#00C853" style={{ marginVertical: 10 }} />
                        ) : (activeCrops.length > 0 && activeCrops.every(c => c.status === 'inactive')) ? (
                            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={28} color="#888" />
                                <Text style={{ fontSize: 13, color: '#555', marginTop: 4, textAlign: 'center' }}>
                                    your CROP instructions are getting ready
                                </Text>
                            </View>
                        ) : (activeCrops.length === 0 || !hasAnyTasksConfigured) ? (
                            <>
                                <TouchableOpacity style={styles.taskRow} onPress={() => router.push('/start-crop')}>
                                    <MaterialCommunityIcons name="sprout" size={16} color="#00C853" />
                                    <Text style={styles.taskText}>Start a crop</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.taskRow} onPress={() => router.push('/fert-calc')}>
                                    <MaterialCommunityIcons name="calculator" size={16} color="#0288D1" />
                                    <Text style={styles.taskText}>Check Agri calc</Text>
                                </TouchableOpacity>
                            </>
                        ) : !randomTask ? (
                            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#ccc" />
                                <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>All done for today!</Text>
                            </View>
                        ) : (
                            <View style={styles.randomTaskCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 11, color: '#888', fontWeight: 'bold' }} numberOfLines={1}>
                                        {randomTask.cropName?.toUpperCase()}
                                    </Text>
                                    <View style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ fontSize: 10, color: '#00C853', fontWeight: 'bold' }}>
                                            Day {calculateDays(randomTask.startDate)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.taskRow, { marginTop: 8, marginBottom: 0 }]}>
                                    <MaterialCommunityIcons name="leaf-circle-outline" size={20} color="#00C853" />
                                    <Text style={[styles.taskText, { fontSize: 13, fontWeight: '600' }]} numberOfLines={2}>
                                        {randomTask.title}
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {!loadingTasks && activeCrops.length > 0 && dueTasks.length > 1 && (
                            <TouchableOpacity onPress={() => router.push('/(tabs)/crops')}>
                                <Text style={{ fontSize: 11, color: '#00C853', textAlign: 'center', marginTop: 6 }}>View {dueTasks.length} pending tasks</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

                {/* Tall Action Widgets — side by side */}
                <View style={styles.widgetsRow}>
                    {/* Diagnostic Tall Card */}
                    <TouchableOpacity 
                        style={styles.tallActionCard} 
                        onPress={handleScanNow} 
                        disabled={diagnosing}
                        activeOpacity={0.9}
                    >
                        <ImageBackground 
                            source={require('../../assets/images/uploaded_diagnostic_leaf.jpg')} 
                            style={styles.tallActionBgImage}
                            imageStyle={{ borderRadius: 16, resizeMode: 'cover' }}
                        >
                            <View style={[styles.tallActionOverlay, { backgroundColor: 'rgba(0,0,0,0.3)', padding: 10 }]}>
                                {/* Swap: Big Scan Now button at the TOP */}
                                <View style={[styles.heroButtonLarge, { backgroundColor: '#386A32', alignSelf: 'flex-start' }]}>
                                    {diagnosing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="camera" size={20} color="#fff" style={{ marginRight: 6 }} />
                                            <Text style={styles.heroButtonLargeText}>Scan Now</Text>
                                        </>
                                    )}
                                </View>
                                
                                {/* Bottom section: Title and Badge Swap */}
                                <View style={{ marginTop: 'auto' }}>
                                    <View style={styles.heroBadge}>
                                        <Text style={styles.heroBadgeText}>DIAGNOSTIC</Text>
                                    </View>
                                    <Text style={[styles.tallActionTitle, { marginTop: 8 }]}>Identify plant illness instantly.</Text>
                                </View>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>

                    {/* Start a Crop Tall Card */}
                    <TouchableOpacity 
                        style={styles.tallActionCard} 
                        onPress={() => router.push('/start-crop')}
                        activeOpacity={0.9}
                    >
                        <ImageBackground 
                            source={require('../../assets/images/cherry_tomatoes_bg.png')} 
                            style={styles.tallActionBgImage}
                            imageStyle={{ borderRadius: 16 }}
                        >
                            <View style={[styles.tallActionOverlay, { backgroundColor: 'rgba(0,0,0,0.35)', padding: 10 }]}>
                                {/* Swap: Big Start Crop button at the TOP */}
                                <View style={[styles.heroButtonLarge, { backgroundColor: '#D84315', alignSelf: 'flex-start' }]}>
                                    <MaterialCommunityIcons name="seed-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.heroButtonLargeText}>Start Crop</Text>
                                </View>

                                {/* Bottom section: Title and Badge Swap */}
                                <View style={{ marginTop: 'auto' }}>
                                    <View style={[styles.heroBadge, { backgroundColor: '#E64A19' }]}>
                                        <Text style={styles.heroBadgeText}>NEW CROP</Text>
                                    </View>
                                    <Text style={[styles.tallActionTitle, { marginTop: 8 }]}>Add a new crop to your farm.</Text>
                                </View>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>

                {/* Farming News */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>🌾 Farming News</Text>
                    {newsArticles.length > 0 && (
                        <Text style={styles.newsPersonalizedBadge}>Personalized</Text>
                    )}
                </View>

                {newsLoading ? (
                    <View style={styles.newsLoadingContainer}>
                        <ActivityIndicator size="small" color="#00C853" />
                        <Text style={styles.newsLoadingText}>Fetching latest news...</Text>
                    </View>
                ) : newsArticles.length === 0 ? (
                    <View style={styles.newsEmptyContainer}>
                        <MaterialCommunityIcons name="newspaper-variant-outline" size={36} color="#ccc" />
                        <Text style={styles.newsEmptyText}>No news articles yet.{`\n`}Check back soon!</Text>
                    </View>
                ) : (
                    newsArticles.map((article) => (
                        <TouchableOpacity
                            key={article._id}
                            style={styles.newsCard}
                            onPress={() => { setSelectedArticle(article); setNewsModalVisible(true); }}
                            activeOpacity={0.85}
                        >
                            {article.imageUrl ? (
                                <Image
                                    source={{ uri: article.imageUrl }}
                                    style={styles.newsImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.newsImagePlaceholder}>
                                    <MaterialCommunityIcons name="newspaper-variant-outline" size={26} color="#aaa" />
                                </View>
                            )}
                            <View style={styles.newsContent}>
                                {article.category && (
                                    <View style={styles.newsCategoryBadge}>
                                        <Text style={styles.newsCategoryText}>{article.category}</Text>
                                    </View>
                                )}
                                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                                <Text style={styles.newsExcerpt} numberOfLines={2}>
                                    {article.description?.replace(/<[^>]*>/g, '') || ''}
                                </Text>
                                <Text style={styles.newsMeta}>
                                    {article.source ? `${article.source} · ` : ''}
                                    {new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 8 }} />

                {/* Library */}
                <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>📚 Library</Text>
                    <Text style={styles.viewAllText}>Explore</Text>
                </View>

                {libraryLoading ? (
                    <View style={styles.newsLoadingContainer}>
                        <ActivityIndicator size="small" color="#00C853" />
                        <Text style={styles.newsLoadingText}>Loading library...</Text>
                    </View>
                ) : libraryArticles.length === 0 ? (
                    <View style={styles.newsEmptyContainer}>
                        <MaterialCommunityIcons name="bookshelf" size={36} color="#ccc" />
                        <Text style={styles.newsEmptyText}>No articles yet.{`\n`}Check back soon!</Text>
                    </View>
                ) : (
                    <View style={styles.libraryGrid}>
                        {libraryArticles.map((article) => (
                            <TouchableOpacity
                                key={article._id}
                                style={styles.libraryCard}
                                activeOpacity={0.85}
                                onPress={() => { setSelectedLibraryArticle(article); setLibraryModalVisible(true); }}
                            >
                                {article.imageUrl ? (
                                    <Image
                                        source={{ uri: article.imageUrl }}
                                        style={StyleSheet.absoluteFillObject}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.libraryImageBg, { backgroundColor: LIBRARY_CATEGORY_COLORS[article.category] || '#388E3C' }]} />
                                )}
                                {/* Dark overlay for text legibility */}
                                <View style={styles.libraryOverlay} />
                                {article.readTimeMinutes && (
                                    <View style={styles.libraryReadTimeBadge}>
                                        <Text style={styles.libraryReadTimeText}>{article.readTimeMinutes} min</Text>
                                    </View>
                                )}
                                <Text style={styles.libraryCardText} numberOfLines={2}>{article.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Diagnostic Result Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="leaf" size={24} color="#00C853" />
                                <Text style={styles.modalTitle}>Diagnosis Result</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            {diagnosisResult && (
                                <View style={styles.modalBody}>
                                    <Text style={styles.resultLabel}>Issue Detected:</Text>
                                    <Text style={[
                                        styles.resultDisease, 
                                        { color: (diagnosisResult.disease || '').toLowerCase() === 'healthy' ? '#00C853' : '#d32f2f' }
                                    ]}>
                                        {diagnosisResult.disease || 'Unknown'}
                                    </Text>
                                    
                                    <View style={styles.divider} />
                                    
                                    <Text style={styles.resultLabel}>Recommended Care:</Text>
                                    <Text style={styles.resultCure}>
                                        {diagnosisResult.cure || 'No treatment recommendations available.'}
                                    </Text>
                                </View>
                            )}
                            
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCloseButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* News Article Detail Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={newsModalVisible}
                    onRequestClose={() => setNewsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="newspaper-variant" size={22} color="#00C853" />
                                <Text style={[styles.modalTitle, { fontSize: 15, flex: 1, marginHorizontal: 8 }]} numberOfLines={2}>
                                    {selectedArticle?.title}
                                </Text>
                                <TouchableOpacity onPress={() => setNewsModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedArticle?.imageUrl && (
                                    <Image
                                        source={{ uri: selectedArticle.imageUrl }}
                                        style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }}
                                        resizeMode="cover"
                                    />
                                )}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    {selectedArticle?.category && (
                                        <View style={styles.newsCategoryBadge}>
                                            <Text style={styles.newsCategoryText}>{selectedArticle.category}</Text>
                                        </View>
                                    )}
                                    <Text style={[styles.newsMeta, { marginLeft: 'auto' }]}>
                                        {selectedArticle?.source ? `${selectedArticle.source} · ` : ''}
                                        {selectedArticle && new Date(selectedArticle.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 14, color: '#333', lineHeight: 22 }}>
                                    {selectedArticle?.description?.replace(/<[^>]*>/g, '') || ''}
                                </Text>
                                {selectedArticle?.content ? (
                                    <Text style={{ fontSize: 14, color: '#555', lineHeight: 22, marginTop: 12 }}>
                                        {selectedArticle.content}
                                    </Text>
                                ) : null}
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.modalCloseButton, { marginTop: 16 }]}
                                onPress={() => setNewsModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Library Article Detail Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={libraryModalVisible}
                    onRequestClose={() => setLibraryModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { maxHeight: '92%' }]}>
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="book-open-variant" size={22} color="#00C853" />
                                <Text style={[styles.modalTitle, { fontSize: 15, flex: 1, marginHorizontal: 8 }]} numberOfLines={2}>
                                    {selectedLibraryArticle?.title}
                                </Text>
                                <TouchableOpacity onPress={() => setLibraryModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedLibraryArticle?.imageUrl && (
                                    <Image
                                        source={{ uri: selectedLibraryArticle.imageUrl }}
                                        style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }}
                                        resizeMode="cover"
                                    />
                                )}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                    {selectedLibraryArticle?.category && (
                                        <View style={styles.newsCategoryBadge}>
                                            <Text style={styles.newsCategoryText}>{selectedLibraryArticle.category.toUpperCase()}</Text>
                                        </View>
                                    )}
                                    {selectedLibraryArticle?.readTimeMinutes && (
                                        <View style={[styles.newsCategoryBadge, { backgroundColor: '#e3f2fd' }]}>
                                            <Text style={[styles.newsCategoryText, { color: '#0277BD' }]}>⏱ {selectedLibraryArticle.readTimeMinutes} min read</Text>
                                        </View>
                                    )}
                                    {selectedLibraryArticle?.author && (
                                        <Text style={styles.newsMeta}>By {selectedLibraryArticle.author}</Text>
                                    )}
                                </View>
                                {selectedLibraryArticle?.summary ? (
                                    <Text style={{ fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12, fontStyle: 'italic' }}>
                                        {selectedLibraryArticle.summary}
                                    </Text>
                                ) : null}
                                <View style={[styles.divider, { marginBottom: 12 }]} />
                                <Text style={{ fontSize: 14, color: '#333', lineHeight: 22 }}>
                                    {selectedLibraryArticle?.content?.replace(/<[^>]*>/g, '') || ''}
                                </Text>
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.modalCloseButton, { marginTop: 16 }]}
                                onPress={() => setLibraryModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f8f4', // Off-white/light gray background
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
        marginBottom: 6,
        paddingTop: 4,
        paddingBottom: 4,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        marginRight: 6,
    },
    logoIconBg: {
        backgroundColor: '#00C853',
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarInitialsBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#00C853',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
    },
    logoSubText: {
        fontSize: 10,
        color: '#888',
        marginTop: 1,
    },
    // New prominent Assistant Banner
    assistantBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e8f5e9',
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    assistantBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    assistantIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00C853',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    assistantBannerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111',
    },
    assistantBannerSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    assistantBannerArrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    cropItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    cropImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eee', // fallback
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    cropText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    cropTextActive: {
        color: '#111',
        fontWeight: 'bold',
    },
    widgetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    widgetCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    widgetHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    widgetTitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    notificationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00C853',
    },
    temperature: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    weatherDesc: {
        fontSize: 12,
        color: '#888',
    },
    // ── Compact weather widget (side-by-side) ────────────────────
    weatherWidgetCard: {
        flex: 1,
        backgroundColor: '#e3f2fd',
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 4,
        shadowColor: '#0288D1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    weatherWidgetTitle: {
        fontSize: 13,
        color: '#0277BD',
        fontWeight: '600',
    },
    weatherWidgetTemp: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#01579B',
        marginBottom: 2,
        marginTop: 4,
    },
    weatherWidgetDesc: {
        fontSize: 12,
        color: '#0288D1',
        marginBottom: 2,
    },
    weatherWidgetLow: {
        fontSize: 11,
        color: '#64B5F6',
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    taskTextDone: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        textDecorationLine: 'line-through',
    },
    taskText: {
        fontSize: 12,
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    randomTaskCard: {
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 12,
        padding: 8,
        marginTop: 2,
    },
    tallActionCard: {
        width: '48%',
        height: 240,
        marginBottom: 28,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tallActionBgImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    tallActionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
    },
    heroBadge: {
        backgroundColor: '#B58E29', // Golden brown
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    heroBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    tallActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 22,
        marginTop: 12,
    },
    heroButton: {
        flexDirection: 'row',
        backgroundColor: '#386A32', // Darker forest green
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 'auto',
    },
    heroButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    heroButtonLargeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    heroButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tallActionIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tallActionTitleDark: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    tallActionDescDark: {
        fontSize: 12,
        color: '#555',
        lineHeight: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    viewAllText: {
        fontSize: 13,
        color: '#00C853',
        fontWeight: 'bold',
    },
    newsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    newsImage: {
        width: 72,
        height: 72,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    newsImagePlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    newsContent: {
        flex: 1,
    },
    newsCategoryBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    newsCategoryText: {
        fontSize: 10,
        color: '#388E3C',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    newsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
        lineHeight: 18,
    },
    newsExcerpt: {
        fontSize: 12,
        color: '#777',
        lineHeight: 16,
        marginBottom: 5,
    },
    newsMeta: {
        fontSize: 11,
        color: '#aaa',
        fontStyle: 'italic',
    },
    newsPersonalizedBadge: {
        fontSize: 11,
        color: '#00C853',
        fontWeight: '600',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    newsLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    newsLoadingText: {
        fontSize: 13,
        color: '#888',
        marginLeft: 8,
    },
    newsEmptyContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    newsEmptyText: {
        fontSize: 13,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    toolsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    toolCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 2,
        marginHorizontal: 3,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toolIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    toolText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#444',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    libraryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    libraryCard: {
        width: '48%',
        height: 140,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    libraryImageBg: {
        ...StyleSheet.absoluteFillObject,
    },
    libraryCardText: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    libraryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.32)',
    },
    libraryReadTimeBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    libraryReadTimeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    // ── Modal Styles ────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    modalBody: {
        marginBottom: 24,
    },
    resultLabel: {
        fontSize: 13,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultDisease: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 16,
    },
    resultCure: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    modalCloseButton: {
        backgroundColor: '#00C853',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
