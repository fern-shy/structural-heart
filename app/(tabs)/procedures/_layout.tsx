import { Stack } from 'expo-router';

export default function ProceduresLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0B4DFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 28, fontWeight: '800' },
        // Disable large titles here to prevent content from sliding under the header
        headerLargeTitle: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Procedures' }} />
    </Stack>
  );
}


