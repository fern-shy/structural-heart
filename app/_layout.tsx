import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// Reanimated is configured via the Worklets Babel plugin; no direct import needed here

import { Platform } from 'react-native';

import { ContentProvider } from '@/context/ContentProvider';
import {
  ThemePreferenceProvider,
  useThemePreference,
} from '@/context/ThemePreferenceProvider';

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootNavigator />
    </ThemePreferenceProvider>
  );
}

function RootNavigator() {
  const { scheme: colorScheme, loaded: themeLoaded } = useThemePreference();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Async font loading only occurs in development. Native also waits for the
  // saved theme so dark-mode users don't see a light flash; web renders right
  // away to keep static rendering intact.
  if (!loaded || (!themeLoaded && Platform.OS !== 'web')) {
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
    <ContentProvider>
      <ThemeProvider value={tweaked}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </ContentProvider>
  );
}
