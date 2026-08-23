import { LoadingScreen } from '@/components/LoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContent } from '@/context/ContentProvider';
import { Link } from 'expo-router';
import { FlatList, TouchableOpacity, View } from 'react-native';

export default function ProceduresIndex() {
  const { content, loading } = useContent();
  const categories = content?.categories ?? [];

  if (!content && loading) {
    return <LoadingScreen message="Loading procedures…" />;
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}
        data={categories}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <ThemedText>No procedures available yet.</ThemedText>
          </View>
        }
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: '/procedures/[categoryId]', params: { categoryId: item.id } }}
            asChild
          >
            <TouchableOpacity style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText>{item.subtitle}</ThemedText>
            </TouchableOpacity>
          </Link>
        )}
      />
    </ThemedView>
  );
}


