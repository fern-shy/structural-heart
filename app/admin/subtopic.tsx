import {
  AdminScreen,
  Button,
  Card,
  COLORS,
  Field,
  Muted,
  PageTitle,
  Row,
} from "@/components/admin/ui";
import {
  createSlide,
  deleteSlide,
  listSlides,
  persistSlideOrder,
  updateSlide,
  type SlideInput,
  type WithId,
} from "@/lib/content/adminApi";
import type { SlideDoc } from "@/lib/content/schema";
import { confirmAsync } from "@/lib/confirm";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type SlideType = "text" | "image" | "video";

export default function AdminSubtopic() {
  const { categoryId, subtopicId } = useLocalSearchParams<{
    categoryId: string;
    subtopicId: string;
  }>();
  const [items, setItems] = useState<WithId<SlideDoc>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!categoryId || !subtopicId) return;
    setLoading(true);
    setItems(await listSlides(categoryId, subtopicId));
    setLoading(false);
  }, [categoryId, subtopicId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await persistSlideOrder(categoryId!, subtopicId!, next.map((s) => s.id));
  };

  const remove = async (s: WithId<SlideDoc>) => {
    const ok = await confirmAsync("Delete this slide?");
    if (!ok) return;
    await deleteSlide(categoryId!, subtopicId!, s.id);
    await load();
  };

  return (
    <AdminScreen>
      <Stack.Screen options={{ title: "Slides" }} />
      <PageTitle
        title="Slides"
        subtitle="Text, images, and videos shown in the carousel, in order."
      />

      <SlideForm
        key="create"
        mode="create"
        onSubmit={async (input) => {
          await createSlide(categoryId!, subtopicId!, input);
          await load();
        }}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : items.length === 0 ? (
        <Muted>No slides yet. Add one above.</Muted>
      ) : (
        items.map((s, i) =>
          editingId === s.id ? (
            <SlideForm
              key={s.id}
              mode="edit"
              initial={s}
              onCancel={() => setEditingId(null)}
              onSubmit={async (input) => {
                await updateSlide(categoryId!, subtopicId!, s.id, input, s.order);
                setEditingId(null);
                await load();
              }}
            />
          ) : (
            <Card key={s.id}>
              <Row gap={8}>
                <TypeBadge type={s.type} />
                <Text
                  style={{ color: COLORS.text, fontWeight: "600", flex: 1 }}
                  numberOfLines={1}
                >
                  {slideSummary(s)}
                </Text>
              </Row>
              {s.type !== "text" && s.uri ? (
                <Muted>{s.uri}</Muted>
              ) : null}
              <Row gap={8}>
                <Button
                  label="Edit"
                  small
                  variant="secondary"
                  onPress={() => setEditingId(s.id)}
                />
                <Button
                  label="↑"
                  small
                  variant="secondary"
                  disabled={i === 0}
                  onPress={() => move(i, -1)}
                />
                <Button
                  label="↓"
                  small
                  variant="secondary"
                  disabled={i === items.length - 1}
                  onPress={() => move(i, 1)}
                />
                <View style={{ flex: 1 }} />
                <Button
                  label="Delete"
                  small
                  variant="danger"
                  onPress={() => remove(s)}
                />
              </Row>
            </Card>
          ),
        )
      )}
    </AdminScreen>
  );
}

function slideSummary(s: SlideDoc): string {
  if (s.type === "text") return s.title || "(untitled text)";
  return s.caption || "(no caption)";
}

function TypeBadge({ type }: { type: SlideType }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
        {type.toUpperCase()}
      </Text>
    </View>
  );
}

function TypeToggle({
  value,
  onChange,
}: {
  value: SlideType;
  onChange: (t: SlideType) => void;
}) {
  const types: SlideType[] = ["text", "image", "video"];
  return (
    <Row gap={8}>
      {types.map((t) => (
        <Pressable
          key={t}
          onPress={() => onChange(t)}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: value === t ? COLORS.primary : COLORS.cardBorder,
            backgroundColor: value === t ? COLORS.primary : "transparent",
          }}
        >
          <Text style={{ color: COLORS.text, fontWeight: "600" }}>
            {t[0].toUpperCase() + t.slice(1)}
          </Text>
        </Pressable>
      ))}
    </Row>
  );
}

function SlideForm({
  mode,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: WithId<SlideDoc>;
  onSubmit: (input: SlideInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<SlideType>(initial?.type ?? "text");
  const [title, setTitle] = useState(
    initial?.type === "text" ? initial.title : "",
  );
  const [content, setContent] = useState(
    initial?.type === "text" ? initial.content : "",
  );
  const [uri, setUri] = useState(
    initial && initial.type !== "text" ? initial.uri : "",
  );
  const [caption, setCaption] = useState(
    initial && initial.type !== "text" ? (initial.caption ?? "") : "",
  );
  const [isLoop, setIsLoop] = useState(
    initial?.type === "video" ? (initial.isLoop ?? true) : true,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    let input: SlideInput;
    if (type === "text") {
      if (!title.trim() && !content.trim()) {
        setError("Add a title or some text.");
        return;
      }
      input = { type: "text", title: title.trim(), content: content.trim() };
    } else if (type === "image") {
      if (!uri.trim()) {
        setError("Paste an image link.");
        return;
      }
      input = { type: "image", uri: uri.trim(), caption: caption.trim() || undefined };
    } else {
      if (!uri.trim()) {
        setError("Paste a video link.");
        return;
      }
      input = {
        type: "video",
        uri: uri.trim(),
        caption: caption.trim() || undefined,
        isLoop,
      };
    }
    setBusy(true);
    try {
      await onSubmit(input);
      if (mode === "create") {
        setTitle("");
        setContent("");
        setUri("");
        setCaption("");
        setType("text");
      }
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: 15 }}>
        {mode === "create" ? "Add a slide" : "Edit slide"}
      </Text>
      <TypeToggle value={type} onChange={setType} />

      {type === "text" ? (
        <>
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Patient Preparation"
          />
          <Field
            label="Body text"
            value={content}
            onChangeText={setContent}
            multiline
            placeholder="The paragraph(s) shown on the slide"
          />
        </>
      ) : (
        <>
          <Field
            label={type === "image" ? "Image link" : "Video link"}
            value={uri}
            onChangeText={setUri}
            autoCapitalize="none"
            placeholder="Paste a Google Drive share link or a direct URL"
            hint="Google Drive links and Firebase Storage URLs both work."
          />
          <Field
            label="Caption (optional)"
            value={caption}
            onChangeText={setCaption}
            multiline
            placeholder="Text shown beneath the media"
          />
          {type === "video" ? (
            <Row gap={8}>
              <Button
                label={isLoop ? "Looping: On" : "Looping: Off"}
                small
                variant={isLoop ? "primary" : "ghost"}
                onPress={() => setIsLoop((v) => !v)}
              />
              <Muted>Auto-replays the clip while viewing.</Muted>
            </Row>
          ) : null}
        </>
      )}

      {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}
      <Row>
        <Button
          label={mode === "create" ? "Add slide" : "Save"}
          onPress={submit}
          loading={busy}
        />
        {onCancel ? (
          <Button label="Cancel" variant="ghost" onPress={onCancel} />
        ) : null}
      </Row>
    </Card>
  );
}
