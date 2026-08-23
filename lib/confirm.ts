import { Alert, Platform } from "react-native";

/** Promise-based confirm dialog that works on web (window.confirm) and native. */
export function confirmAsync(
  title: string,
  message?: string,
): Promise<boolean> {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(
      typeof window !== "undefined" ? window.confirm(text) : true,
    );
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "OK", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
