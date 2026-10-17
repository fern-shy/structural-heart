import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  authorCopy,
  changelog,
  contactCopy,
  guideTagline,
  legalCopy,
} from "@/constants/references";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ScrollView, View } from "react-native";

function Section({ title, children }: { title: string; children: string[] }) {
  const scheme = useColorScheme();
  const card =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(11,77,255,0.06)";

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 14,
        backgroundColor: card,
        gap: 8,
      }}
    >
      <ThemedText type="subtitle">{title}</ThemedText>
      {children.map((paragraph) => (
        <ThemedText key={paragraph} style={{ fontSize: 16, lineHeight: 24 }}>
          {paragraph}
        </ThemedText>
      ))}
    </View>
  );
}

export default function ReferencesScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        <ThemedText style={{ fontSize: 18, lineHeight: 26, paddingTop: 12 }}>{guideTagline}</ThemedText>
        <Section title="Author" children={authorCopy} />
        <View style={{ gap: 12 }}>
          <ThemedText type="subtitle" style={{ paddingHorizontal: 4 }}>
            Changelog
          </ThemedText>
          {changelog.map((entry) => (
            <Section key={entry.version} title={entry.version} children={entry.items} />
          ))}
        </View>
        <Section title="Contact" children={contactCopy} />
        <Section title="Legal" children={legalCopy} />
      </ScrollView>
    </ThemedView>
  );
}
