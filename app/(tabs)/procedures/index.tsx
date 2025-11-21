import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { FlatList, TouchableOpacity, View } from 'react-native';
import content from '../../../data/content';

export default function ProceduresIndex() {
  const categories = content.categories;

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}
        data={categories}
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


