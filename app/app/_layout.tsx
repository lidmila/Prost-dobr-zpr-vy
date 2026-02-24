import { useCallback } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';

export default function RootLayout() {
  const { colors, isDark } = useTheme();

  const handleNotificationTap = useCallback((articleId: string) => {
    router.push(`/article/${articleId}`);
  }, []);

  useNotifications({ onNotificationTap: handleNotificationTap });

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="article/[id]"
          options={{
            title: 'Článek',
            headerBackTitle: 'Zpět',
          }}
        />
      </Stack>
    </>
  );
}
