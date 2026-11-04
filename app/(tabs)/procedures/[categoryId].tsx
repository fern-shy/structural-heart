import { ContentUnavailable } from '@/components/ContentUnavailable';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContent } from '@/context/ContentProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, TouchableOpacity, View } from 'react-native';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { content, loading } = useContent();
  const cardColor = useThemeColor({}, 'card');
  const category = content?.categories.find((c) => c.id === categoryId);

  if (!content && loading) {
    return <LoadingScreen />;
  }
  if (!content) return <ContentUnavailable />;

  if (!category) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Category not found.</ThemedText>
        <Link href="/procedures">
          <ThemedText type="link">Back to Procedures</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: category.title }} />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}
        data={category.subtopics}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: '/procedures/[categoryId]/[subtopicId]',
              params: { categoryId: category.id, subtopicId: item.id },
            }}
            asChild
          >
            <TouchableOpacity style={{ padding: 16, borderRadius: 12, backgroundColor: cardColor }}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              {item.description ? <ThemedText>{item.description}</ThemedText> : null}
            </TouchableOpacity>
          </Link>
        )}
      />
    </ThemedView>
  );
}


