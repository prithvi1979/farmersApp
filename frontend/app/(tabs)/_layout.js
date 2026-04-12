import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#00C853', // Bright green from design
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: 60 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('home'),
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="home" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    title: t('community'),
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="market"
                options={{
                    title: t('market'),
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="storefront" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="crops"
                options={{
                    title: t('yourCrops'),
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="sprout" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account" size={26} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
