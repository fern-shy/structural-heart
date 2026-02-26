import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef } from 'react';

type SlideType = 'image' | 'video' | 'text';

/**
 * Listens for device orientation changes and triggers fullscreen enter/exit
 * when the current slide contains media (image or video).
 * Text-only slides are ignored.
 */
export function useOrientationFullscreen(
  currentSlideType: SlideType | undefined,
  onEnterFullscreen: () => void,
  onExitFullscreen: () => void,
  isFullscreen: boolean,
) {
  const isFullscreenRef = useRef(isFullscreen);
  isFullscreenRef.current = isFullscreen;

  useEffect(() => {
    if (!currentSlideType || currentSlideType === 'text') return;

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      const orientation = event.orientationInfo.orientation;
      const isLandscape =
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

      if (isLandscape && !isFullscreenRef.current) {
        onEnterFullscreen();
      } else if (!isLandscape && isFullscreenRef.current) {
        onExitFullscreen();
      }
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, [currentSlideType, onEnterFullscreen, onExitFullscreen]);
}
