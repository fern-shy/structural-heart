import type { Slide } from "@/types/media";
import { useThemeColor } from "@/hooks/useThemeColor";
import { VideoPlayerCache } from "@/utils/videoPlayerCache";
import {
  SLIDE_LOAD_TIMEOUT_MS,
  SlideErrorBoundary,
  SlideFallback,
  type SlideReportInfo,
} from "./SlideFallback";
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
  /** Identifies the procedure in "Report problem" emails. */
  reportContext?: { procedure: string; path: string };
};

type VideoSlideProps = {
  uri: string;
  isLoop: boolean;
  fullscreen: boolean;
  isActive: boolean;
  /** False while this carousel is hidden behind the fullscreen one. */
  carouselActive?: boolean;
  playerCache?: VideoPlayerCache;
  report?: SlideReportInfo;
};

type VideoState = {
  player: VideoPlayer;
  ready: boolean;
  loadError: boolean;
  problem?: string;
};

export function VideoSlide({
  uri,
  isLoop,
  fullscreen,
  isActive,
  carouselActive = true,
  playerCache,
  report,
}: VideoSlideProps) {
  const [observed, setObserved] = useState<VideoState | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const player = playerCache
    ? playerCache.getOrCreate(uri, (p) => {
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
          problem: undefined,
        };
  const { ready, loadError, problem } = current;

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status, error }) => {
      if (status === "readyToPlay") {
        setObserved({ player, ready: true, loadError: false });
      }
      if (status === "error") {
        setObserved({
          player,
          ready: false,
          loadError: true,
          problem: `Video error: ${error?.message ?? "unknown"}`,
        });
      }
    });
    return () => sub.remove();
  }, [player, retryNonce]);

  // A video that never becomes playable shows the fallback instead of an
  // endless spinner. Only the slide on screen is timed; if it does load late,
  // the readyToPlay event above clears the fallback.
  useEffect(() => {
    if (!player || ready || loadError || !isActive || !carouselActive) return;
    const timer = setTimeout(() => {
      setObserved({
        player,
        ready: false,
        loadError: true,
        problem: `Video still loading after ${SLIDE_LOAD_TIMEOUT_MS / 1000}s`,
      });
    }, SLIDE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [player, ready, loadError, isActive, carouselActive]);

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
        <SlideFallback
          problem={problem ?? "Video failed to load"}
          onRetry={() => {
            setObserved(null);
            playerCache?.release(uri);
            setRetryNonce((n) => n + 1);
          }}
          report={report}
        />
      )}
    </View>
  );
}

export function ImageSlide({
  uri,
  report,
}: {
  uri: string;
  report?: SlideReportInfo;
}) {
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const sourceUri = retryNonce
    ? `${uri}${uri.includes("?") ? "&" : "?"}retry=${retryNonce}`
    : uri;

  useEffect(() => {
    if (!loading || problem) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setProblem(`Image still loading after ${SLIDE_LOAD_TIMEOUT_MS / 1000}s`);
    }, SLIDE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loading, problem, retryNonce]);

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
      <Image
        source={{ uri: sourceUri }}
        cachePolicy="memory-disk"
        contentFit="contain"
        onLoadStart={() => {
          setLoading(true);
          setProblem(null);
        }}
        onLoad={() => {
          setLoading(false);
          setProblem(null);
        }}
        onError={(e) => {
          setLoading(false);
          setProblem(`Image error: ${e.error}`);
        }}
        style={{ width: "100%", height: "100%", backgroundColor: "black" }}
      />
      {loading && !problem ? (
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
      {problem ? (
        <SlideFallback
          problem={problem}
          onRetry={() => {
            setLoading(true);
            setProblem(null);
            setRetryNonce((n) => n + 1);
          }}
          report={report}
        />
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
  reportContext,
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
  // True until the list has been scrolled to its starting slide once.
  // initialScrollIndex alone isn't reliable in Safari, which can leave a
  // freshly opened fullscreen list on the first slide.
  const needsInitialScrollRef = useRef(true);

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
    if (
      !needsInitialScrollRef.current &&
      !layoutChanged &&
      shownIndexRef.current === index
    ) {
      return;
    }
    shownIndexRef.current = index;
    userDragRef.current = false;
    if (slides.length === 0) return;
    const frame = requestAnimationFrame(() => {
      // Cleared here rather than above so a cancelled frame (e.g. React
      // re-running effects in development) still gets its scroll.
      needsInitialScrollRef.current = false;
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
                  if (userDragRef.current) {
                    commitFromOffset(offset, pageWidth);
                    userDragRef.current = false;
                    return;
                  }
                  // The browser moved the list without the user (Safari can
                  // reset a newly opened list to the first slide). Put it
                  // back on the current slide.
                  const target = shownIndexRef.current * width;
                  if (
                    active &&
                    Math.abs(pageWidth - width) <= 1 &&
                    Math.abs(offset - target) > 1
                  ) {
                    listRef.current?.scrollToOffset({
                      offset: target,
                      animated: false,
                    });
                  }
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
          const report: SlideReportInfo | undefined = reportContext && {
            ...reportContext,
            slideNumber: itemIndex + 1,
            slideCount: slides.length,
            slideType: item.type,
            uri: "uri" in item ? item.uri : undefined,
          };

          if (item.type === "text" || item.type === "unavailable") {
            return (
              <View style={[{ width, height: containerHeight }, webSnapStyle]}>
                <SlideErrorBoundary report={report}>
                  {item.type === "text" ? (
                    <TextSlide
                      title={item.title}
                      content={item.content}
                      height={containerHeight}
                    />
                  ) : (
                    <View
                      style={{ width: "100%", height: "100%", backgroundColor: "black" }}
                    >
                      <SlideFallback problem={item.reason} report={report} />
                    </View>
                  )}
                </SlideErrorBoundary>
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
              <SlideErrorBoundary report={report}>
                {item.type === "image" ? (
                  <ImageSlide uri={item.uri} report={report} />
                ) : (
                  <VideoSlide
                    uri={item.uri}
                    isLoop={item.isLoop ?? true}
                    fullscreen={fullscreen}
                    isActive={itemIndex === index}
                    carouselActive={active}
                    playerCache={playerCache}
                    report={report}
                  />
                )}
              </SlideErrorBoundary>
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
