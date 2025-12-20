import type { Slide } from '@/types/media';
import { driveToDirectUrl } from '@/utils/drive';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

type Props = {
  slides: Slide[];
  startIndex?: number;
  fullscreen?: boolean;
  onOpenFullscreen?: (index: number) => void;
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
};

// Separate component for video slides to use the useVideoPlayer hook correctly
function VideoSlide({ uri, isLoop, fullscreen, isActive }: { uri: string; isLoop: boolean; fullscreen: boolean; isActive: boolean }) {
  const player = useVideoPlayer(driveToDirectUrl(uri, { asDownload: true }), (p) => {
    p.loop = isLoop;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
      contentFit="contain"
      nativeControls={fullscreen}
    />
  );
}

export default function MediaCarousel({ slides, startIndex = 0, fullscreen = false, onOpenFullscreen, onClose, onIndexChange }: Props) {
  const { width } = Dimensions.get('window');
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(startIndex);
  const insets = useSafeAreaInsets();

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  return (
    <View style={{ width: '100%', height: fullscreen ? '100%' : 320, paddingTop: fullscreen ? 0 : 0 }}>
      <FlatList
        ref={listRef as any}
        data={slides}
        horizontal
        pagingEnabled
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item, index: itemIndex }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (!fullscreen && onOpenFullscreen) onOpenFullscreen(itemIndex);
            }}
            style={{ width }}
          >
            {item.type === 'image' ? (
              <Image source={{ uri: driveToDirectUrl(item.uri, { asDownload: false }) }} contentFit="contain" style={{ width: '100%', height: '100%', backgroundColor: 'black' }} />
            ) : (
              <VideoSlide
                uri={item.uri}
                isLoop={item.isLoop ?? true}
                fullscreen={fullscreen}
                isActive={itemIndex === index}
              />
            )}
          </TouchableOpacity>
        )}
      />
      {!fullscreen && slides[index]?.caption ? (
        <View style={{ padding: 12 }}>
          <ThemedText style={{ fontSize: 24, lineHeight: 30 }}>{slides[index].caption}</ThemedText>
        </View>
      ) : null}
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


