import { useNavigation, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

/**
 * Web-safe header back button. React Navigation's native-stack renders its back
 * chevron from a bundled PNG that isn't emitted to the web build (it 404s and
 * appears blank). We use a plain Unicode arrow (system font) rather than an icon
 * font, which avoids any web font-loading/404 issues entirely.
 * Only renders when there is somewhere to go back to.
 */
export function HeaderBackButton({ tint = "#fff" }: { tint?: string }) {
  const router = useRouter();
  const navigation = useNavigation();

  if (!navigation.canGoBack()) return null;

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 12,
        gap: 4,
      }}
    >
      <Text style={{ color: tint, fontSize: 24, lineHeight: 26 }}>←</Text>
      <Text style={{ color: tint, fontSize: 17 }}>Back</Text>
    </Pressable>
  );
}
