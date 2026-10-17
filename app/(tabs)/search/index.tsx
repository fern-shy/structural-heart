import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useContent } from "@/context/ContentProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { searchContent, type SearchHit } from "@/lib/content/searchContent";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, TextInput, TouchableOpacity, View } from "react-native";

function matchIn(text: string, query: string) {
  const hay = text.toLowerCase();
  const phrase = query.trim().toLowerCase();
  const phraseAt = phrase ? hay.indexOf(phrase) : -1;
  if (phraseAt >= 0) return { start: phraseAt, length: phrase.length };
  const word = phrase.split(/\s+/).filter(Boolean)[0];
  if (!word) return { start: -1, length: 0 };
  const at = hay.indexOf(word);
  return { start: at, length: at >= 0 ? word.length : 0 };
}

function HighlightedSnippet({
  text,
  start,
  length,
  bold = false,
}: {
  text: string;
  start: number;
  length: number;
  bold?: boolean;
}) {
  const base = {
    fontSize: bold ? 16 : 15,
    lineHeight: bold ? 24 : 22,
    fontWeight: bold ? ("600" as const) : ("400" as const),
  };
  if (length <= 0 || start < 0 || start > text.length) {
    return <ThemedText style={base}>{text}</ThemedText>;
  }
  const end = Math.min(text.length, start + length);
  return (
    <ThemedText style={base}>
      {text.slice(0, start)}
      <ThemedText
        style={{
          ...base,
          fontWeight: "700",
          backgroundColor: "rgba(11,77,255,0.2)",
        }}
      >
        {text.slice(start, end)}
      </ThemedText>
      {text.slice(end)}
    </ThemedText>
  );
}

function ResultRow({ item, query }: { item: SearchHit; query: string }) {
  const scheme = useColorScheme();
  const card =
    scheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const href = item.subtopicId
    ? {
        pathname: "/(tabs)/procedures/[categoryId]/[subtopicId]" as const,
        params: {
          categoryId: item.categoryId,
          subtopicId: item.subtopicId,
          ...(item.slideIndex !== undefined
            ? { slide: String(item.slideIndex) }
            : {}),
        },
      }
    : {
        pathname: "/(tabs)/procedures/[categoryId]" as const,
        params: { categoryId: item.categoryId },
      };
  const showSnippet =
    item.snippet.trim().toLowerCase() !== item.title.trim().toLowerCase();
  const titleMatch = matchIn(item.title, query);

  return (
    <Link href={href} asChild>
      <TouchableOpacity
        style={{ padding: 14, borderRadius: 12, backgroundColor: card, gap: 4 }}
      >
        <HighlightedSnippet
          text={item.title}
          start={titleMatch.start}
          length={titleMatch.length}
          bold
        />
        <ThemedText style={{ opacity: 0.7, fontSize: 13 }}>
          {item.breadcrumb} · {item.kind}
        </ThemedText>
        {showSnippet ? (
          <HighlightedSnippet
            text={item.snippet}
            start={item.matchStart}
            length={item.matchLength}
          />
        ) : null}
      </TouchableOpacity>
    </Link>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { content } = useContent();
  const scheme = useColorScheme();
  const results = useMemo(
    () => searchContent(content, query),
    [content, query],
  );
  const trimmed = query.trim();
  const fieldBg = scheme === "dark" ? "rgba(255,255,255,0.06)" : "#fff";
  const fieldText = scheme === "dark" ? "#ECEDEE" : "#11181C";
  const border = scheme === "dark" ? "#3A3F44" : "#C8CDD2";

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 48,
          paddingTop: 8,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12, gap: 8 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search slides, captions, and notes"
              placeholderTextColor={scheme === "dark" ? "#9BA1A6" : "#687076"}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: fieldBg,
                color: fieldText,
                fontSize: 16,
              }}
            />
            {trimmed ? (
              <ThemedText style={{ opacity: 0.7, fontSize: 13 }}>
                {results.length === 0
                  ? `No slides or notes match “${trimmed}”.`
                  : `${results.length} match${results.length === 1 ? "" : "es"}`}
              </ThemedText>
            ) : (
              <ThemedText
                style={{ opacity: 0.7, fontSize: 15, lineHeight: 22 }}
              ></ThemedText>
            )}
          </View>
        }
        data={trimmed ? results : []}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => <ResultRow item={item} query={trimmed} />}
      />
    </ThemedView>
  );
}
