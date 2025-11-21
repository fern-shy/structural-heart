import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// Reanimated is configured via the Worklets Babel plugin; no direct import needed here

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  // Apply brand blue header color similar to Echo Tools
  const tweaked = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: '#0B4DFF',
      background: theme.colors.background,
      card: '#0B4DFF',
      text: '#ffffff',
    },
  } as typeof theme;

  return (
    <ThemeProvider value={tweaked}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
