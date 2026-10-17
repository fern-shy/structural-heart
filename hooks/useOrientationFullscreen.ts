import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

type SlideType = 'image' | 'video' | 'text';

/**
 * Listens for device orientation changes and triggers fullscreen enter/exit.
 * Only media slides (image or video) enter fullscreen, but rotating back to
 * portrait always exits, even if the user swiped onto a text slide.
 */
export function useOrientationFullscreen(
  currentSlideType: SlideType | undefined,
  isFullscreen: boolean,
  setFullscreen: (fullscreen: boolean) => void,
) {
  const canEnter = !!currentSlideType && currentSlideType !== 'text';
  // The listener reads the latest state from here, so it can stay subscribed
  // for the screen's lifetime instead of being swapped out on every toggle,
  // which could drop a rotation event that lands mid-swap.
  const stateRef = useRef({ canEnter, isFullscreen });
  useEffect(() => {
    stateRef.current = { canEnter, isFullscreen };
  }, [canEnter, isFullscreen]);

  useEffect(() => {
    // Orientation-driven fullscreen is a native-only behavior; the web has no
    // device orientation lock and these APIs reject there.
    if (Platform.OS === 'web') return;

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const orientation = event.orientationInfo.orientation;
      const isLandscape =
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      const { canEnter, isFullscreen } = stateRef.current;

      if (isLandscape && !isFullscreen && canEnter) {
        setFullscreen(true);
      } else if (!isLandscape && isFullscreen) {
        setFullscreen(false);
      }
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, [setFullscreen]);
}
