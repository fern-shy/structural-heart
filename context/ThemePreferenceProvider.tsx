import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Appearance, Platform } from "react-native";

export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "structural-heart:color-scheme";

type ThemePreference = {
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  /** False until the saved choice has been read from storage. */
  loaded: boolean;
};

const ThemePreferenceContext = createContext<ThemePreference>({
  scheme: "light",
  setScheme: () => {},
  loaded: true,
});

/**
 * The app's light/dark setting. It defaults to light and only changes through
 * the toggle on the References tab; the device's system setting is ignored.
 */
export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "dark") setSchemeState("dark");
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // Keep native system UI (keyboard, alerts, switches) in step with the app.
    // Not supported on web, where the app's own colors are all that matter.
    if (Platform.OS !== "web") Appearance.setColorScheme(scheme);
  }, [scheme]);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  return (
    <ThemePreferenceContext.Provider value={{ scheme, setScheme, loaded }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
