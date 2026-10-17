import type { Slide } from "@/types/media";
import { driveImageUrl, drivePreviewUrl, driveToDirectUrl } from "@/utils/drive";
import { VideoPlayerCache } from "@/utils/videoPlayerCache";
import { Image } from "expo-image";
import { VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DimensionValue,
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DriveVideoFrame from "./DriveVideoFrame";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

type Props = {
  slides: Slide[];
  startIndex?: number;
  syncToIndex?: number;
  fullscreen?: boolean;
  playerCache?: VideoPlayerCache;
  onOpenFullscreen?: (index: number) => void;
  onIndexChange?: (index: number) => void;
  onClose?: () => void;
};

type VideoSlideProps = {
  uri: string;
  isLoop: boolean;
  fullscreen: boolean;
  isActive: boolean;
  playerCache?: VideoPlayerCache;
};

export function VideoSlide(props: VideoSlideProps) {
  // On web, Google Drive videos can't stream in an HTML5 <video>; use Drive's
  // preview iframe instead. Native (and non-Drive URLs) use the player below.
  const webPreviewUrl =
    Platform.OS === "web" ? drivePreviewUrl(props.uri) : null;
  if (webPreviewUrl) {
    return <DriveVideoFrame url={webPreviewUrl} />;
  }
  return <NativeVideoSlide {...props} />;
}

function NativeVideoSlide({
  uri,
  isLoop,
  fullscreen,
  isActive,
  playerCache,
}: VideoSlideProps) {
  const resolvedUri = driveToDirectUrl(uri, { asDownload: true });
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  const player = playerCache
    ? playerCache.getOrCreate(resolvedUri, (p) => {
        p.loop = isLoop;
        // Browsers block unmuted autoplay; web viewers can unmute from fullscreen controls.
        p.muted = Platform.OS === "web";
      })
    : null;

  useEffect(() => {
    if (!player) return;

    if (player.status === "readyToPlay") {
      setReady(true);
      setLoadError(false);
    } else if (player.status === "error") {
      setLoadError(true);
    }

    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") {
        setReady(true);
        setLoadError(false);
      }
      if (status === "error") {
        setReady(false);
        setLoadError(true);
      }
    });
    return () => sub.remove();
  }, [player, retryNonce]);

  useEffect(() => {
    if (!player) return;
    if (loadError) return;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, loadError, player]);

  if (!player) return null;

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        nativeControls={fullscreen}
      />
      {!ready && !loadError && (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      {loadError && (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            paddingHorizontal: 24,
          }}
        >
          <ThemedText
            style={{ color: "#fff", textAlign: "center", marginBottom: 12 }}
          >
            Video failed to load.
          </ThemedText>
          <TouchableOpacity
            onPress={() => {
              setReady(false);
              setLoadError(false);
              playerCache?.release(resolvedUri);
              setRetryNonce((n) => n + 1);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function ImageSlide({ uri }: { uri: string }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const resolvedUri = driveImageUrl(uri);
  const sourceUri = retryNonce
    ? `${resolvedUri}${resolvedUri.includes("?") ? "&" : "?"}retry=${retryNonce}`
    : resolvedUri;

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
      <Image
        source={{ uri: sourceUri }}
        cachePolicy="memory-disk"
        contentFit="contain"
        onLoadStart={() => {
          setLoading(true);
          setHasError(false);
        }}
        onLoad={() => {
          setLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
        style={{ width: "100%", height: "100%", backgroundColor: "black" }}
      />
      {loading && !hasError ? (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : null}
      {hasError ? (
        <View
          style={{
            ...absoluteFill,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            paddingHorizontal: 24,
          }}
        >
          <ThemedText
            style={{ color: "#fff", textAlign: "center", marginBottom: 12 }}
          >
            Image failed to load.
          </ThemedText>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setHasError(false);
              setRetryNonce((n) => n + 1);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export function TextSlide({
  title,
  content,
  height,
}: {
  title: string;
  content: string;
  height: DimensionValue;
}) {
  return (
    <View
      style={{ width: "100%", height, backgroundColor: "#1a1a2e", padding: 16 }}
    >
      <ThemedText
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#fff",
          marginBottom: 12,
        }}
      >
        {title}
      </ThemedText>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <ThemedText
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {content}
        </ThemedText>
      </ScrollView>
    </View>
  );
}

export const MEDIA_HEIGHT = 300;

const absoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

function clampIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

export default function MediaCarousel({
  slides,
  startIndex = 0,
  syncToIndex,
  fullscreen = false,
  playerCache,
  onOpenFullscreen,
  onIndexChange,
  onClose,
}: Props) {
  const { width, height: windowHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(() => clampIndex(startIndex, slides.length));
  const indexRef = useRef(index);
  const widthRef = useRef(width);
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;
  // Ignore scroll events while rotation swaps the page width. The old pixel
  // offset divided by the new width lands on a different slide.
  const suppressScrollRef = useRef(true);
  const lastExternalIndex = useRef<number | undefined>(undefined);

  const pendingExternalScroll = useRef(false);
  if (syncToIndex !== undefined && syncToIndex !== lastExternalIndex.current) {
    lastExternalIndex.current = syncToIndex;
    const next = clampIndex(syncToIndex, slides.length);
    if (next !== indexRef.current) pendingExternalScroll.current = true;
    indexRef.current = next;
    if (index !== next) setIndex(next);
  }

  const widthChanged = widthRef.current !== width;
  if (widthChanged) {
    widthRef.current = width;
    suppressScrollRef.current = true;
  }

  useEffect(() => {
    suppressScrollRef.current = true;
    const frame = requestAnimationFrame(() => {
      if (slides.length === 0) return;
      listRef.current?.scrollToOffset({
        offset: indexRef.current * widthRef.current,
        animated: false,
      });
    });
    const timer = setTimeout(() => {
      suppressScrollRef.current = false;
    }, 450);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [width, slides.length]);

  useEffect(() => {
    if (!pendingExternalScroll.current) return;
    pendingExternalScroll.current = false;
    suppressScrollRef.current = true;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: indexRef.current * widthRef.current,
        animated: false,
      });
    });
    const timer = setTimeout(() => {
      suppressScrollRef.current = false;
    }, 450);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [syncToIndex, slides.length]);

  const commitFromOffset = (offset: number, pageWidth: number) => {
    if (suppressScrollRef.current || pageWidth <= 0 || slides.length === 0) return;
    // A rotation event can report the previous page width. Ignore it.
    if (Math.abs(pageWidth - widthRef.current) > 1) return;
    const next = clampIndex(Math.round(offset / pageWidth), slides.length);
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    onIndexChangeRef.current?.(next);
  };

  const goTo = (nextIndex: number) => {
    const next = clampIndex(nextIndex, slides.length);
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    onIndexChangeRef.current?.(next);
    listRef.current?.scrollToOffset({
      offset: next * widthRef.current,
      animated: true,
    });
  };

  const containerHeight = fullscreen ? windowHeight : MEDIA_HEIGHT;

  return (
    <View style={{ width: "100%", height: containerHeight }}>
      <FlatList
        ref={listRef as any}
        key={Math.round(width)}
        data={slides}
        horizontal
        pagingEnabled
        snapToInterval={width}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        initialScrollIndex={slides.length > 0 ? indexRef.current : undefined}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        keyExtractor={(item) => item.id}
        windowSize={5}
        maxToRenderPerBatch={3}
        onMomentumScrollEnd={(e) => {
          commitFromOffset(
            e.nativeEvent.contentOffset.x,
            e.nativeEvent.layoutMeasurement.width,
          );
        }}
        onScrollEndDrag={(e) => {
          const velocity = e.nativeEvent.velocity?.x ?? 0;
          if (Math.abs(velocity) > 0.05) return;
          commitFromOffset(
            e.nativeEvent.contentOffset.x,
            e.nativeEvent.layoutMeasurement.width,
          );
        }}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.index * widthRef.current,
            animated: false,
          });
        }}
        style={{ flex: 1 }}
        renderItem={({ item, index: itemIndex }) => {
          if (item.type === "text") {
            return (
              <View style={{ width, height: containerHeight }}>
                <TextSlide
                  title={item.title}
                  content={item.content}
                  height={containerHeight}
                />
              </View>
            );
          }

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (!fullscreen && onOpenFullscreen)
                  onOpenFullscreen(itemIndex);
              }}
              style={{ width, height: containerHeight }}
            >
              {item.type === "image" ? (
                <ImageSlide uri={item.uri} />
              ) : (
                <VideoSlide
                  uri={item.uri}
                  isLoop={item.isLoop ?? true}
                  fullscreen={fullscreen}
                  isActive={itemIndex === index}
                  playerCache={playerCache}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
      {slides.length > 1 ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: fullscreen ? Math.max(insets.bottom, 12) : 10,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.55)",
            }}
          >
            <TouchableOpacity
              onPress={() => goTo(index - 1)}
              disabled={index <= 0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Previous slide"
            >
              <ThemedText style={{ color: index <= 0 ? "rgba(255,255,255,0.35)" : "#fff", fontSize: 18 }}>
                ‹
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {index + 1} / {slides.length} · Swipe
            </ThemedText>
            <TouchableOpacity
              onPress={() => goTo(index + 1)}
              disabled={index >= slides.length - 1}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Next slide"
            >
              <ThemedText
                style={{
                  color: index >= slides.length - 1 ? "rgba(255,255,255,0.35)" : "#fff",
                  fontSize: 18,
                }}
              >
                ›
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
      {fullscreen && onClose ? (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={{
            position: "absolute",
            top: insets.top + 12,
            right: 16,
            padding: 12,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 24,
            zIndex: 100,
          }}
        >
          <IconSymbol size={28} name="xmark.circle.fill" color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
