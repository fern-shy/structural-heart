import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOrientationFullscreen } from '@/hooks/useOrientationFullscreen';
import { VideoPlayerCache } from '@/utils/videoPlayerCache';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import MediaCarousel from '../../../../components/MediaCarousel';
import content from '../../../../data/content';

export default function SubtopicDetailScreen() {
  const { categoryId, subtopicId } = useLocalSearchParams<{ categoryId: string; subtopicId: string }>();
  const router = useRouter();
  const { subtopic, parent } = useMemo(() => {
    const category = content.categories.find((c) => c.id === categoryId);
    const direct = category?.subtopics.find((s) => s.id === subtopicId);
    if (direct) return { subtopic: direct, parent: undefined as undefined | typeof direct };
    const container = category?.subtopics.find((s) => s.children?.some((c) => c.id === subtopicId));
    const child = container?.children?.find((c) => c.id === subtopicId);
    return { subtopic: child, parent: container };
  }, [categoryId, subtopicId]);

  const [fullscreen, setFullscreen] = useState<{ index: number } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const playerCacheRef = useRef<VideoPlayerCache | null>(null);
  if (!playerCacheRef.current) {
    playerCacheRef.current = new VideoPlayerCache();
  }

  const handleIndexChange = useCallback((index: number) => {
    setCurrentSlideIndex(index);
  }, []);

  const currentSlide = subtopic?.slides?.[currentSlideIndex];
  const currentSlideType = currentSlide?.type;

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    const cache = playerCacheRef.current;
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      cache?.releaseAll();
    };
  }, []);

  const enterFullscreen = useCallback(() => {
    setFullscreen({ index: currentSlideIndex });
  }, [currentSlideIndex]);

  const exitFullscreen = useCallback(() => {
    setFullscreen(null);
  }, []);

  useOrientationFullscreen(
    currentSlideType,
    enterFullscreen,
    exitFullscreen,
    !!fullscreen,
  );

  if (!subtopic) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Subtopic not found.</ThemedText>
        <Link href={`/procedures/${categoryId}`}>
          <ThemedText type="link">Back to Category</ThemedText>
        </Link>
        <Link href="/procedures">
          <ThemedText type="link">Back to Procedures</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  // Identify a container node that holds children (either the selected item, or its parent)
  const containerNode =
    subtopic && (!subtopic.slides || subtopic.slides.length === 0) && (subtopic.children?.length ?? 0) > 0
      ? subtopic
      : undefined;

  if (containerNode) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen options={{ title: containerNode.title, headerLargeTitle: false }} />
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}

          data={containerNode.children ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/procedures/[categoryId]/[subtopicId]',
                  params: { categoryId, subtopicId: item.id },
                })
              }
              style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <ThemedText type="subtitle">{item.title}</ThemedText>
              {item.description ? <ThemedText>{item.description}</ThemedText> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<ThemedText>No subitems found. Check data/content.ts.</ThemedText>}
        />
      </ThemedView>
    );
  }

  const currentCaption = currentSlide && currentSlide.type !== 'text' ? currentSlide.caption : undefined;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: subtopic?.title ?? 'Detail', headerLargeTitle: false }} />
      {subtopic?.slides ? (
        <>
          <View style={{ flex: 1, opacity: fullscreen ? 0 : 1 }}>
            <MediaCarousel
              slides={subtopic.slides}
              syncToIndex={!fullscreen ? currentSlideIndex : undefined}
              playerCache={playerCacheRef.current!}
              onOpenFullscreen={(index: number) => setFullscreen({ index })}
              onIndexChange={handleIndexChange}
            />
            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator
            >
              {currentCaption ? (
                <View style={{ padding: 16, paddingBottom: 8 }}>
                  <ThemedText style={{ fontSize: 18, lineHeight: 26 }}>{currentCaption}</ThemedText>
                </View>
              ) : null}
              {subtopic.longText ? (
                <View style={{ paddingHorizontal: 16, paddingTop: currentCaption ? 8 : 16 }}>
                  <ThemedText style={{ fontSize: 16, lineHeight: 24, opacity: 0.8 }}>{subtopic.longText}</ThemedText>
                </View>
              ) : null}
            </ScrollView>
          </View>
          <Modal
            visible={!!fullscreen}
            animationType="none"
            supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}
            onRequestClose={exitFullscreen}
          >
            <StatusBar hidden={!!fullscreen} />
            <ThemedView style={{ flex: 1, backgroundColor: 'black' }}>
              <MediaCarousel
                slides={subtopic.slides}
                startIndex={fullscreen?.index ?? 0}
                fullscreen
                playerCache={playerCacheRef.current!}
                onIndexChange={handleIndexChange}
                onClose={exitFullscreen}
              />
            </ThemedView>
          </Modal>
        </>
      ) : (
        <View style={{ padding: 16 }}>
          <ThemedText>No media found. Check data/content.ts.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}


