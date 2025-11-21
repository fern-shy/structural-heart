import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import content from '../../../data/content';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    return content.categories.flatMap((c) =>
      c.subtopics.map((s) => ({
        id: `${c.id}:${s.id}`,
        title: s.title,
        description: s.description,
        categoryId: c.id,
        subtopicId: s.id,
      }))
    );
  }, []);

  const fuse = useMemo(() => new Fuse(items, { keys: ['title', 'description'], threshold: 0.3 }), [items]);
  const results = query ? fuse.search(query).map((r) => r.item) : items.slice(0, 12);

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48, paddingTop: 8 }}
        ListHeaderComponent={
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search procedures"
            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', marginBottom: 12 }}
          />
        }
        data={results}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: '/(tabs)/procedures/[categoryId]/[subtopicId]',
              params: { categoryId: item.categoryId, subtopicId: item.subtopicId },
            }}
            asChild
          >
            <TouchableOpacity style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              {item.description ? <ThemedText>{item.description}</ThemedText> : null}
            </TouchableOpacity>
          </Link>
        )}
      />
    </ThemedView>
  );
}


