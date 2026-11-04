import { useThemePreference, type ColorScheme } from "@/context/ThemePreferenceProvider";

/** The app's chosen color scheme (see ThemePreferenceProvider), not the device's. */
export function useColorScheme(): ColorScheme {
  return useThemePreference().scheme;
}
