import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';

export default function RootLayout() {
  const { colors, isDark } = useTheme();

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
