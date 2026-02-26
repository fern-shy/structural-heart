import type { Slide } from '@/types/media';
import { driveToDirectUrl } from '@/utils/drive';
import { VideoPlayerCache } from '@/utils/videoPlayerCache';
import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DimensionValue,
  FlatList,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

type Props = {
  slides: Slide[];
  startIndex?: number;
  fullscreen?: boolean;
  playerCache?: VideoPlayerCache;
  onOpenFullscreen?: (index: number) => void;
  onIndexChange?: (index: number) => void;
  onClose?: () => void;
};

function VideoSlide({
  uri,
  isLoop,
  fullscreen,
  isActive,
  playerCache,
}: {
  uri: string;
  isLoop: boolean;
  fullscreen: boolean;
  isActive: boolean;
  playerCache?: VideoPlayerCache;
}) {
  const resolvedUri = driveToDirectUrl(uri, { asDownload: true });
  const [ready, setReady] = useState(false);

  const player = playerCache
    ? playerCache.getOrCreate(resolvedUri, (p) => {
        p.loop = isLoop;
        p.muted = false;
      })
    : null;

  useEffect(() => {
    if (!player) return;

    if (player.status === 'readyToPlay') {
      setReady(true);
    }

    const sub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') setReady(true);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (!player) return;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  if (!player) return null;

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        nativeControls={fullscreen}
      />
      {!ready && (
        <View
          style={{
            ...absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

function TextSlide({ title, content, height }: { title: string; content: string; height: DimensionValue }) {
  return (
    <View style={{ width: '100%', height, backgroundColor: '#1a1a2e', padding: 16 }}>
      <ThemedText style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
        {title}
      </ThemedText>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <ThemedText style={{ fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.9)' }}>
          {content}
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const MEDIA_HEIGHT = 300;

const absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export default function MediaCarousel({
  slides,
  startIndex = 0,
  fullscreen = false,
  playerCache,
  onOpenFullscreen,
  onIndexChange,
  onClose,
}: Props) {
  const { width, height: windowHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(startIndex);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (listRef.current && slides.length > 0) {
      listRef.current.scrollToIndex({ index, animated: false });
    }
  }, [width, index, slides.length]);

  const containerHeight = fullscreen ? windowHeight : MEDIA_HEIGHT;

  return (
    <View style={{ width: '100%', height: containerHeight }}>
      <FlatList
        ref={listRef as any}
        data={slides}
        horizontal
        pagingEnabled
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        keyExtractor={(item) => item.id}
        windowSize={5}
        maxToRenderPerBatch={3}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        style={{ flex: 1 }}
        renderItem={({ item, index: itemIndex }) => {
          if (item.type === 'text') {
            return (
              <View style={{ width, height: containerHeight }}>
                <TextSlide title={item.title} content={item.content} height={containerHeight} />
              </View>
            );
          }

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (!fullscreen && onOpenFullscreen) onOpenFullscreen(itemIndex);
              }}
              style={{ width, height: containerHeight }}
            >
              {item.type === 'image' ? (
                <Image
                  source={{ uri: driveToDirectUrl(item.uri, { asDownload: false }) }}
                  contentFit="contain"
                  style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                />
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
      {fullscreen && onClose ? (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={{
            position: 'absolute',
            top: insets.top + 12,
            right: 16,
            padding: 12,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
