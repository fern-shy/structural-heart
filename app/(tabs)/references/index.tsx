import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  authorCopy,
  authors,
  changelog,
  contactCopy,
  contactEmail,
  guideTagline,
  legalCopy,
} from "@/constants/references";
import { useThemePreference } from "@/context/ThemePreferenceProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import Constants from "expo-constants";
import type { ReactNode } from "react";
import { Linking, ScrollView, Switch, View } from "react-native";

function Section({
  title,
  paragraphs = [],
  children,
}: {
  title: string;
  paragraphs?: string[];
  children?: ReactNode;
}) {
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
      {paragraphs.map((paragraph) => (
        <ThemedText key={paragraph} style={{ fontSize: 16, lineHeight: 24 }}>
          {paragraph}
        </ThemedText>
      ))}
      {children}
    </View>
  );
}

const appVersion = Constants.expoConfig?.version;

export default function ReferencesScreen() {
  const { scheme, setScheme } = useThemePreference();
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
        <ThemedText style={{ fontSize: 18, lineHeight: 26, paddingTop: 12 }}>
          {guideTagline}
        </ThemedText>
        <Section title="Appearance">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <ThemedText style={{ fontSize: 16 }}>
              Dark mode
            </ThemedText>
            <Switch
              accessibilityLabel="Dark mode"
              value={scheme === "dark"}
              onValueChange={(on) => setScheme(on ? "dark" : "light")}
              trackColor={{ true: "#0B4DFF" }}
              thumbColor="#ffffff"
            />
          </View>
        </Section>
        <Section title="Author">
          <ThemedText type="defaultSemiBold">{authors}</ThemedText>
          {authorCopy.map((paragraph) => (
            <ThemedText key={paragraph} style={{ fontSize: 16, lineHeight: 24 }}>
              {paragraph}
            </ThemedText>
          ))}
        </Section>
        <View style={{ gap: 12 }}>
          <ThemedText type="subtitle" style={{ paddingHorizontal: 4 }}>
            Changelog
          </ThemedText>
          {changelog.map((release) => (
            <Section
              key={release.version}
              title={`${release.version} · ${release.date}`}
              paragraphs={release.items.map((item) => `• ${item}`)}
            />
          ))}
          {appVersion ? (
            <ThemedText
              style={{ fontSize: 14, opacity: 0.6, paddingHorizontal: 4 }}
            >
              You are on version {appVersion}.
            </ThemedText>
          ) : null}
        </View>
        <Section title="Contact" paragraphs={contactCopy}>
          <ThemedText
            type="link"
            accessibilityRole="link"
            onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
          >
            {contactEmail}
          </ThemedText>
        </Section>
        <Section title="Legal" paragraphs={legalCopy} />
      </ScrollView>
    </ThemedView>
  );
}
