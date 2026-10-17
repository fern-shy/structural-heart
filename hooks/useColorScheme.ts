import { useColorScheme as useRNColorScheme } from "react-native";

/** RN 0.86 can return `unspecified`; theme maps only have light/dark. */
export function useColorScheme(): "light" | "dark" {
  return useRNColorScheme() === "dark" ? "dark" : "light";
}
