import type { Slide } from "@/types/media";
import { driveImageUrl, drivePreviewUrl, driveToDirectUrl } from "@/utils/drive";
import { useThemeColor } from "@/hooks/useThemeColor";
import { VideoPlayerCache } from "@/utils/videoPlayerCache";
import { Image } from "expo-image";
import { VideoView, type VideoPlayer } from "expo-video";
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
  /** The slide to show. The parent owns this; swipes report via onIndexChange. */
  index: number;
  onIndexChange: (index: number) => void;
  /** When false, scroll events are ignored (e.g. while hidden behind fullscreen). */
  active?: boolean;
  fullscreen?: boolean;
  playerCache?: VideoPlayerCache;
  onOpenFullscreen?: (index: number) => void;
  onClose?: () => void;
};

type VideoSlideProps = {
  uri: string;
  isLoop: boolean;
  fullscreen: boolean;
  isActive: boolean;
  /** False while this carousel is hidden behind the fullscreen one. */
  carouselActive?: boolean;
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
  carouselActive = true,
  playerCache,
}: VideoSlideProps) {
  const resolvedUri = driveToDirectUrl(uri, { asDownload: true });
  const [observed, setObserved] = useState<{
    player: VideoPlayer;
    ready: boolean;
    loadError: boolean;
  } | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const player = playerCache
    ? playerCache.getOrCreate(resolvedUri, (p) => {
        p.loop = isLoop;
        // Browsers block unmuted autoplay; web viewers can unmute from fullscreen controls.
        p.muted = Platform.OS === "web";
      })
    : null;

  // Until the player emits a status change, derive state from its current status.
  const current =
    observed && observed.player === player
      ? observed
      : {
          ready: player?.status === "readyToPlay",
          loadError: player?.status === "error",
        };
  const { ready, loadError } = current;

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") {
        setObserved({ player, ready: true, loadError: false });
      }
      if (status === "error") {
        setObserved({ player, ready: false, loadError: true });
      }
    });
    return () => sub.remove();
  }, [player, retryNonce]);

  useEffect(() => {
    if (!player) return;
    if (loadError) return;
    if (!isActive) {
      player.pause();
      return;
    }
    // The hidden inline slide shares its player with the fullscreen one, so
    // it leaves playback alone until fullscreen closes.
    if (!carouselActive) return;
    player.play();
    // On web, closing fullscreen removes its <video>; the browser pauses it a
    // moment later and the shared player mirrors that pause here.
    if (Platform.OS !== "web") return;
    const timer = setTimeout(() => player.play(), 100);
    return () => clearTimeout(timer);
  }, [isActive, carouselActive, loadError, player]);

  if (!player) return null;

  // On web, expo-video keeps every <video> mounted on a player in sync by
  // copying each one's seek to the others. Two elements playing at once never
  // agree on currentTime, so they seek each other forever and never become
  // playable (endless spinner in fullscreen). The hidden inline slide
  // therefore drops its <video> while fullscreen owns the player.
  if (Platform.OS === "web" && !carouselActive) {
    return (
      <View style={{ width: "100%", height: "100%", backgroundColor: "black" }} />
    );
  }

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        nativeControls={fullscreen}
        // Without playsinline, iOS Safari takes over the whole screen with its
        // own player the moment a slide autoplays.
        playsInline
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
              setObserved(null);
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
  const backgroundColor = useThemeColor({}, "background");
  const color = useThemeColor({}, "text");
  return (
    <View style={{ width: "100%", height, backgroundColor, padding: 16 }}>
      <ThemedText
        style={{
          fontSize: 20,
          fontWeight: "700",
          color,
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
            color,
            opacity: 0.85,
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

// Web-only CSS scroll snapping. snap-stop: always keeps a fast flick from
// skipping past slides, matching native paging.
const webSnapContainerStyle = { scrollSnapType: "x mandatory" } as object;
const webSnapStyle =
  Platform.OS === "web"
    ? ({ scrollSnapAlign: "start", scrollSnapStop: "always" } as object)
    : null;

const webArrowStyle = {
  position: "absolute" as const,
  top: "50%" as const,
  marginTop: -22,
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  backgroundColor: "rgba(0,0,0,0.45)",
  zIndex: 50,
};

function clampIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, index));
}

export default function MediaCarousel({
  slides,
  index: requestedIndex,
  onIndexChange,
  active = true,
  fullscreen = false,
  playerCache,
  onOpenFullscreen,
  onClose,
}: Props) {
  const { width, height: windowHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const insets = useSafeAreaInsets();
  const index = clampIndex(requestedIndex, slides.length);
  // The page the list is scrolled to (or heading to). It only differs from
  // `index` when the parent changes the index and the list must catch up.
  const shownIndexRef = useRef(index);
  const layoutRef = useRef({ width, active });
  // Set when the user starts a drag, cleared on any programmatic scroll.
  // Rotation and relayout fire scroll-end events too, and their offsets are
  // measured against the old page width, so they must never move the index.
  // On web it is set by touch, wheel, pointer or key input on the list, since
  // a freshly mounted list (e.g. opening fullscreen) can report a scroll at
  // offset 0 before it reaches its initial slide.
  const userDragRef = useRef(false);
  // react-native-web only emits onScroll, so web commits once scrolling settles.
  const webScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (webScrollTimerRef.current) clearTimeout(webScrollTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = (listRef.current as any)?.getScrollableNode?.() as
      | HTMLElement
      | undefined;
    if (!node) return;
    const markUserScroll = () => {
      userDragRef.current = true;
    };
    const events = ["touchstart", "touchmove", "wheel", "pointerdown", "keydown"];
    events.forEach((e) =>
      node.addEventListener(e, markUserScroll, { passive: true }),
    );
    return () =>
      events.forEach((e) => node.removeEventListener(e, markUserScroll));
    // The list remounts when the width changes (see its key).
  }, [width]);

  useEffect(() => {
    const layoutChanged =
      layoutRef.current.width !== width || layoutRef.current.active !== active;
    layoutRef.current = { width, active };
    if (!layoutChanged && shownIndexRef.current === index) return;
    shownIndexRef.current = index;
    userDragRef.current = false;
    if (slides.length === 0) return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: index * width,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [index, width, active, slides.length]);

  const commitFromOffset = (offset: number, pageWidth: number) => {
    if (!active || pageWidth <= 0 || slides.length === 0) return;
    if (!userDragRef.current) return;
    if (Math.abs(pageWidth - width) > 1) return;
    const next = clampIndex(Math.round(offset / pageWidth), slides.length);
    if (next === shownIndexRef.current) return;
    shownIndexRef.current = next;
    onIndexChange(next);
  };

  const containerHeight = fullscreen ? windowHeight : MEDIA_HEIGHT;

  // Web arrows scroll like a swipe, so the settled onScroll commits the index.
  const scrollWebBy = (delta: number) => {
    const next = clampIndex(shownIndexRef.current + delta, slides.length);
    userDragRef.current = true;
    listRef.current?.scrollToOffset({ offset: next * width, animated: true });
  };

  return (
    <View style={{ width: "100%", height: containerHeight }}>
      <FlatList
        ref={listRef as any}
        key={Math.round(width)}
        data={slides}
        horizontal
        // react-native-web's pagingEnabled puts a snap point on every list
        // child, including the virtualization spacers, so flicks can skip
        // slides or snap back to a spacer's edge. Web snaps on each slide
        // instead (see webSnapStyle).
        pagingEnabled={Platform.OS !== "web"}
        snapToInterval={width}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        initialScrollIndex={slides.length > 0 ? index : undefined}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        keyExtractor={(item) => item.id}
        windowSize={5}
        maxToRenderPerBatch={3}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={Platform.OS === "web" ? 16 : undefined}
        onScroll={
          Platform.OS === "web"
            ? (e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const pageWidth = e.nativeEvent.layoutMeasurement.width;
                if (webScrollTimerRef.current) {
                  clearTimeout(webScrollTimerRef.current);
                }
                webScrollTimerRef.current = setTimeout(() => {
                  commitFromOffset(offset, pageWidth);
                  userDragRef.current = false;
                }, 120);
              }
            : undefined
        }
        onScrollBeginDrag={() => {
          userDragRef.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          commitFromOffset(
            e.nativeEvent.contentOffset.x,
            e.nativeEvent.layoutMeasurement.width,
          );
          userDragRef.current = false;
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
            offset: info.index * width,
            animated: false,
          });
        }}
        style={[{ flex: 1 }, Platform.OS === "web" && webSnapContainerStyle]}
        renderItem={({ item, index: itemIndex }) => {
          if (item.type === "text") {
            return (
              <View style={[{ width, height: containerHeight }, webSnapStyle]}>
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
              style={[{ width, height: containerHeight }, webSnapStyle]}
            >
              {item.type === "image" ? (
                <ImageSlide uri={item.uri} />
              ) : (
                <VideoSlide
                  uri={item.uri}
                  isLoop={item.isLoop ?? true}
                  fullscreen={fullscreen}
                  isActive={itemIndex === index}
                  carouselActive={active}
                  playerCache={playerCache}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
      {Platform.OS === "web" && slides.length > 1 ? (
        <>
          {index > 0 ? (
            <TouchableOpacity
              accessibilityLabel="Previous slide"
              onPress={() => scrollWebBy(-1)}
              style={[webArrowStyle, { left: 8 }]}
            >
              <IconSymbol size={28} name="chevron.left" color="#fff" />
            </TouchableOpacity>
          ) : null}
          {index < slides.length - 1 ? (
            <TouchableOpacity
              accessibilityLabel="Next slide"
              onPress={() => scrollWebBy(1)}
              style={[webArrowStyle, { right: 8 }]}
            >
              <IconSymbol size={28} name="chevron.right" color="#fff" />
            </TouchableOpacity>
          ) : null}
        </>
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
