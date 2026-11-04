import { useContent } from "@/context/ContentProvider";
import { TouchableOpacity, View } from "react-native";
import { LoadingScreen } from "./LoadingScreen";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

/**
 * Shown when there's no content to display: the first load failed and nothing
 * is cached on the device yet (e.g. first launch while offline).
 */
export function ContentUnavailable() {
  const { loading, refresh } = useContent();
  if (loading) return <LoadingScreen message="Loading procedures…" />;

  return (
    <ThemedView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 12,
      }}
    >
      <ThemedText type="subtitle" style={{ textAlign: "center" }}>
        Sorry, we couldn&apos;t load the procedures.
      </ThemedText>
      <ThemedText style={{ textAlign: "center", opacity: 0.8 }}>
        Check your internet connection and try again.
      </ThemedText>
      <View style={{ marginTop: 4 }}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={refresh}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: "#0B4DFF",
          }}
        >
          <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
            Retry
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
