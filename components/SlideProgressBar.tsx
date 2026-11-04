import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";
import { Animated, Platform, View } from "react-native";

const HEIGHT = 3;
// Keeps the indicator easy to see on procedures with many slides.
const MIN_INDICATOR_WIDTH = 8;

/**
 * A thin track under the header with a sliding marker for the current slide.
 * The marker is 1/count of the track (never narrower than MIN_INDICATOR_WIDTH)
 * and glides to its new spot whenever the slide changes.
 */
export function SlideProgressBar({
  index,
  count,
}: {
  index: number;
  count: number;
}) {
  const trackColor = useThemeColor({}, "progressTrack");
  const indicatorColor = useThemeColor({}, "tint");
  const [trackWidth, setTrackWidth] = useState(0);
  const [position] = useState(() => new Animated.Value(index));

  useEffect(() => {
    Animated.timing(position, {
      toValue: index,
      duration: 200,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [index, position]);

  if (count < 2) return null;

  const indicatorWidth = Math.max(trackWidth / count, MIN_INDICATOR_WIDTH);
  const step = (trackWidth - indicatorWidth) / (count - 1);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Slide ${index + 1} of ${count}`}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={index + 1}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      style={{
        height: HEIGHT,
        width: "100%",
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      {trackWidth > 0 ? (
        <Animated.View
          style={{
            width: indicatorWidth,
            height: HEIGHT,
            borderRadius: HEIGHT / 2,
            backgroundColor: indicatorColor,
            transform: [
              {
                translateX: position.interpolate({
                  inputRange: [0, count - 1],
                  outputRange: [0, step * (count - 1)],
                }),
              },
            ],
          }}
        />
      ) : null}
    </View>
  );
}
