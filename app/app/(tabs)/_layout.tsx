import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Zprávy',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Hledat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Oblíbené',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Nastavení',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
