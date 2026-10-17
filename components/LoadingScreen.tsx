import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ActivityIndicator size="large" color="#0B4DFF" />
      {message ? (
        <View style={{ marginTop: 12 }}>
          <ThemedText>{message}</ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}
