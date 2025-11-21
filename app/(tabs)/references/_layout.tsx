import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ReferencesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0B4DFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 28, fontWeight: '800' },
        headerLargeTitle: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'References' }} />
    </Stack>
  );
}


