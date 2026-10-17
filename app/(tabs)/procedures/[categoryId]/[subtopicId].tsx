import { LoadingScreen } from "@/components/LoadingScreen";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useContent } from "@/context/ContentProvider";
import { useOrientationFullscreen } from "@/hooks/useOrientationFullscreen";
import type { Subtopic } from "@/types/content";
import { VideoPlayerCache } from "@/utils/videoPlayerCache";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import MediaCarousel from "../../../../components/MediaCarousel";

function findSubtopic(
  list: Subtopic[],
  id: string | undefined,
): Subtopic | undefined {
  for (const s of list) {
    if (s.id === id) return s;
    const found = s.children ? findSubtopic(s.children, id) : undefined;
    if (found) return found;
  }
  return undefined;
}

function parseSlideParam(param: string | undefined) {
  const requested = Number(param);
  return Number.isFinite(requested) && requested >= 0 ? Math.floor(requested) : 0;
}

export default function SubtopicDetailScreen() {
  const { categoryId, subtopicId, slide } = useLocalSearchParams<{
    categoryId: string;
    subtopicId: string;
    slide?: string;
  }>();
  const slideParam = Array.isArray(slide) ? slide[0] : slide;
  const router = useRouter();
  const { content, loading } = useContent();
  const subtopic = useMemo(() => {
    const category = content?.categories.find((c) => c.id === categoryId);
    return category ? findSubtopic(category.subtopics, subtopicId) : undefined;
  }, [content, categoryId, subtopicId]);

  const [fullscreen, setFullscreen] = useState(false);
  // The single source of truth for which slide is showing. Both the inline
  // and fullscreen carousels render this index and report swipes back to it.
  const [currentSlideIndex, setCurrentSlideIndex] = useState(() =>
    parseSlideParam(slideParam),
  );
  // Reset to the linked slide when the route changes (e.g. a search result
  // for another slide of this procedure).
  const routeSlideKey = `${subtopicId}:${slideParam}`;
  const [lastRouteSlideKey, setLastRouteSlideKey] = useState(routeSlideKey);
  if (routeSlideKey !== lastRouteSlideKey) {
    setLastRouteSlideKey(routeSlideKey);
    setCurrentSlideIndex(parseSlideParam(slideParam));
  }

  const [playerCache] = useState(() => new VideoPlayerCache());

  // Keep the stored index in range (a ?slide= link can point past the end).
  const slideCount = subtopic?.slides?.length ?? 0;
  if (slideCount > 0 && currentSlideIndex > slideCount - 1) {
    setCurrentSlideIndex(slideCount - 1);
  }
  const currentSlide = subtopic?.slides?.[currentSlideIndex];
  const currentSlideType = currentSlide?.type;

  useEffect(() => {
    // Screen-orientation locking is native-only; on web these reject.
    if (Platform.OS !== "web") {
      ScreenOrientation.unlockAsync().catch(() => {});
    }
    return () => {
      if (Platform.OS !== "web") {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        ).catch(() => {});
      }
      playerCache.releaseAll();
    };
  }, [playerCache]);

  useOrientationFullscreen(currentSlideType, fullscreen, setFullscreen);

  const exitFullscreen = () => setFullscreen(false);

  const openFullscreenAt = (index: number) => {
    setCurrentSlideIndex(index);
    setFullscreen(true);
  };

  if (!content && loading) {
    return (
      <>
        <Stack.Screen options={{ title: "", headerLargeTitle: false }} />
        <LoadingScreen />
      </>
    );
  }

  if (!subtopic) {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
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
    subtopic &&
    (!subtopic.slides || subtopic.slides.length === 0) &&
    (subtopic.children?.length ?? 0) > 0
      ? subtopic
      : undefined;

  if (containerNode) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen
          options={{ title: containerNode.title, headerLargeTitle: false }}
        />
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 8,
          }}
          data={containerNode.children ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/procedures/[categoryId]/[subtopicId]",
                  params: { categoryId, subtopicId: item.id },
                })
              }
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: "rgba(0,0,0,0.05)",
              }}
            >
              <ThemedText type="subtitle">{item.title}</ThemedText>
              {item.description ? (
                <ThemedText>{item.description}</ThemedText>
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <ThemedText>No subitems found.</ThemedText>
          }
        />
      </ThemedView>
    );
  }

  const currentCaption =
    currentSlide && currentSlide.type !== "text"
      ? currentSlide.caption
      : undefined;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: subtopic?.title ?? "Detail",
          headerLargeTitle: false,
        }}
      />
      {subtopic?.slides ? (
        <>
          <View style={{ flex: 1, opacity: fullscreen ? 0 : 1 }}>
            <MediaCarousel
              slides={subtopic.slides}
              index={currentSlideIndex}
              onIndexChange={setCurrentSlideIndex}
              active={!fullscreen}
              playerCache={playerCache}
              onOpenFullscreen={openFullscreenAt}
            />
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator
            >
              {currentCaption ? (
                <View style={{ padding: 16, paddingBottom: 8 }}>
                  <ThemedText style={{ fontSize: 18, lineHeight: 26 }}>
                    {currentCaption}
                  </ThemedText>
                </View>
              ) : null}
              {subtopic.longText ? (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingTop: currentCaption ? 8 : 16,
                  }}
                >
                  <ThemedText
                    style={{ fontSize: 16, lineHeight: 24, opacity: 0.8 }}
                  >
                    {subtopic.longText}
                  </ThemedText>
                </View>
              ) : null}
              {subtopic.children?.length ? (
                <View style={{ padding: 16, gap: 12 }}>
                  <ThemedText type="subtitle">Sub-procedures</ThemedText>
                  {subtopic.children.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      onPress={() =>
                        router.push({
                          pathname: "/procedures/[categoryId]/[subtopicId]",
                          params: { categoryId, subtopicId: child.id },
                        })
                      }
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: "rgba(0,0,0,0.05)",
                      }}
                    >
                      <ThemedText type="defaultSemiBold">{child.title}</ThemedText>
                      {child.description ? (
                        <ThemedText>{child.description}</ThemedText>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          </View>
          <Modal
            visible={fullscreen}
            animationType="none"
            supportedOrientations={[
              "portrait",
              "landscape-left",
              "landscape-right",
            ]}
            onRequestClose={exitFullscreen}
          >
            <StatusBar hidden={fullscreen} />
            <ThemedView style={{ flex: 1, backgroundColor: "black" }}>
              {/* Unmount as soon as fullscreen ends so a dismissing modal
                  can't report rotation scroll events as swipes. */}
              {fullscreen ? (
                <MediaCarousel
                  slides={subtopic.slides}
                  index={currentSlideIndex}
                  onIndexChange={setCurrentSlideIndex}
                  fullscreen
                  playerCache={playerCache}
                  onClose={exitFullscreen}
                />
              ) : null}
            </ThemedView>
          </Modal>
        </>
      ) : (
        <View style={{ padding: 16 }}>
          <ThemedText>No media found for this procedure yet.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}
