/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Echo Tools-like blue
const tintColorLight = '#0B4DFF';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#3C434A',
    tabIconSelected: tintColorLight,
    card: 'rgba(0,0,0,0.05)',
    progressTrack: '#E2E5E8',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#D5D8DC',
    tabIconSelected: tintColorDark,
    card: 'rgba(255,255,255,0.06)',
    progressTrack: '#2C2F31',
  },
};
