import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ReferencesScreen() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <ThemedText type="title">References</ThemedText>
      <ThemedText>Drop PDFs/links here later.</ThemedText>
    </ThemedView>
  );
}


