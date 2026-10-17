import { HeaderBackButton } from "@/components/HeaderBackButton";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function ProceduresLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0B4DFF" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontSize: 28, fontWeight: "800" },
        headerLargeTitle: false,
        // Web-only: replace the missing native-stack back PNG with a vector icon.
        ...(Platform.OS === "web"
          ? { headerLeft: () => <HeaderBackButton tint="#fff" /> }
          : {}),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Procedures" }} />
    </Stack>
  );
}
