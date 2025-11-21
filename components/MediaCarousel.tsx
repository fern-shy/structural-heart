import type { Slide } from '@/types/media';
import { driveToDirectUrl } from '@/utils/drive';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

type Props = {
  slides: Slide[];
  startIndex?: number;
  fullscreen?: boolean;
  onOpenFullscreen?: (index: number) => void;
  onClose?: () => void;
};

export default function MediaCarousel({ slides, startIndex = 0, fullscreen = false, onOpenFullscreen, onClose }: Props) {
  const { width } = Dimensions.get('window');
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(startIndex);

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
              <Video
                source={{ uri: driveToDirectUrl(item.uri, { asDownload: true }) }}
                style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={item.isLoop ?? true}
                useNativeControls={fullscreen}
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
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 16, right: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}>
          <IconSymbol size={22} name="xmark.circle.fill" color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}


