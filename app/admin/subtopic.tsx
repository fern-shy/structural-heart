import { useDeleteConfirmation } from "@/components/admin/ConfirmDelete";
import {
  MediaDropzone,
  UPLOADS_SUPPORTED,
} from "@/components/admin/MediaDropzone";
import {
  PHONE_FRAME_WIDTH,
  PhoneSlide,
  PhoneSlidePlaceholder,
  SlidesPreviewModal,
} from "@/components/admin/SlidePreview";
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
import { docToSlide } from "@/lib/content/fetchContent";
import { isUploadedMedia } from "@/lib/content/mediaUpload";
import type { SlideDoc } from "@/lib/content/schema";
import type { Slide } from "@/types/media";
import { driveImageUrl, getDriveFileId } from "@/utils/drive";
import { Image } from "expo-image";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { requestDelete, deleteDialog } = useDeleteConfirmation();

  const load = useCallback(async () => {
    if (!categoryId || !subtopicId) return;
    setItems(await listSlides(categoryId, subtopicId));
    setLoading(false);
  }, [categoryId, subtopicId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const previewSlides = useMemo(
    () =>
      items
        .map((s) => docToSlide(s.id, s))
        .filter((s): s is Slide => s !== null),
    [items],
  );

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await persistSlideOrder(categoryId!, subtopicId!, next.map((s) => s.id));
  };

  const remove = (s: WithId<SlideDoc>) => {
    requestDelete({
      title: `Delete this ${s.type} slide?`,
      message: `"${slideSummary(s)}" will be permanently removed from this procedure. This cannot be undone.`,
      action: async () => {
        await deleteSlide(categoryId!, subtopicId!, s.id);
        await load();
      },
    });
  };

  return (
    <AdminScreen>
      {deleteDialog}
      {previewIndex !== null ? (
        <SlidesPreviewModal
          slides={previewSlides}
          startIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      ) : null}
      <Stack.Screen options={{ title: "Slides" }} />
      <Row gap={12}>
        <View style={{ flex: 1 }}>
          <PageTitle
            title="Slides"
            subtitle="Text, images, and videos shown in the carousel, in order."
          />
        </View>
        <Button
          label="Preview all slides"
          small
          variant="secondary"
          disabled={previewSlides.length === 0}
          onPress={() => setPreviewIndex(0)}
        />
      </Row>

      <SlideForm
        key="create"
        mode="create"
        categoryId={categoryId!}
        subtopicId={subtopicId!}
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
        items.map((s, i) => {
          if (editingId === s.id) {
            return (
              <SlideForm
                key={s.id}
                mode="edit"
                initial={s}
                categoryId={categoryId!}
                subtopicId={subtopicId!}
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  await updateSlide(categoryId!, subtopicId!, s.id, input, s.order);
                  setEditingId(null);
                  await load();
                }}
              />
            );
          }
          const previewAt = previewSlides.findIndex((p) => p.id === s.id);
          return (
            <Card key={s.id}>
              <Row gap={12}>
                <SlideThumb slide={s} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Row gap={8}>
                    <TypeBadge type={s.type} />
                    <Text
                      style={{ color: COLORS.text, fontWeight: "600", flex: 1 }}
                      numberOfLines={1}
                    >
                      {slideSummary(s)}
                    </Text>
                  </Row>
                  {s.type !== "text" ? (
                    <Muted>{mediaSourceLabel(s.uri)}</Muted>
                  ) : null}
                </View>
              </Row>
              <Row gap={8}>
                <Button
                  label="Preview"
                  small
                  disabled={previewAt === -1}
                  onPress={() => setPreviewIndex(previewAt)}
                />
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
          );
        })
      )}
    </AdminScreen>
  );
}

function slideSummary(s: SlideDoc): string {
  if (s.type === "text") return s.title || "(untitled text)";
  return s.caption || "(no caption)";
}

function mediaSourceLabel(uri: string): string {
  if (isUploadedMedia(uri)) return "Uploaded file";
  if (getDriveFileId(uri)) return "Google Drive link";
  return "Web link";
}

function SlideThumb({ slide }: { slide: SlideDoc }) {
  const box = {
    width: 112,
    height: 64,
    borderRadius: 6,
    overflow: "hidden" as const,
    backgroundColor: "black",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
  if (slide.type === "image") {
    return (
      <View style={box}>
        <Image
          source={{ uri: driveImageUrl(slide.uri, { width: 400 }) }}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    );
  }
  if (slide.type === "video") {
    return (
      <View style={box}>
        <Text style={{ color: "#fff", fontSize: 22 }}>▶</Text>
      </View>
    );
  }
  return (
    <View style={[box, { backgroundColor: "#1a1a2e", padding: 6 }]}>
      <Text style={{ color: "#fff", fontSize: 10 }} numberOfLines={3}>
        {slide.title || slide.content}
      </Text>
    </View>
  );
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
            maxWidth: "100%",
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
  categoryId,
  subtopicId,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: WithId<SlideDoc>;
  categoryId: string;
  subtopicId: string;
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
  const [uploading, setUploading] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const trimmedUri = uri.trim();
  let draft: Slide | null = null;
  if (type === "text") {
    if (title.trim() || content.trim()) {
      draft = { id: "draft", type: "text", title, content };
    }
  } else if (/^https?:\/\/\S+$/.test(trimmedUri)) {
    const draftCaption = caption.trim() || undefined;
    draft =
      type === "image"
        ? { id: "draft", type: "image", uri: trimmedUri, caption: draftCaption }
        : { id: "draft", type: "video", uri: trimmedUri, caption: draftCaption, isLoop };
  }

  const submit = async () => {
    setError(null);
    let input: SlideInput;
    if (type === "text") {
      if (!title.trim() && !content.trim()) {
        setError("Add a title or some text.");
        return;
      }
      input = { type: "text", title: title.trim(), content: content.trim() };
    } else {
      if (!trimmedUri) {
        const noun = type === "image" ? "an image" : "a video";
        setError(
          UPLOADS_SUPPORTED
            ? `Upload ${noun} or paste a link.`
            : `Paste ${noun} link.`,
        );
        return;
      }
      input =
        type === "image"
          ? { type: "image", uri: trimmedUri, caption: caption.trim() || undefined }
          : {
              type: "video",
              uri: trimmedUri,
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
        setResetCount((n) => n + 1);
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

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, maxWidth: "100%", flexBasis: 280, gap: 12 }}>
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
              <MediaDropzone
                key={resetCount}
                kind={type}
                categoryId={categoryId}
                subtopicId={subtopicId}
                onUploaded={setUri}
                onBusyChange={setUploading}
              />
              <Field
                label={
                  UPLOADS_SUPPORTED
                    ? "Or paste a link"
                    : type === "image"
                      ? "Image link"
                      : "Video link"
                }
                value={uri}
                onChangeText={setUri}
                autoCapitalize="none"
                placeholder="Paste a Google Drive share link or a direct URL"
                hint={
                  UPLOADS_SUPPORTED
                    ? "Uploading fills this in for you. Google Drive share links still work too."
                    : "Google Drive links and Firebase Storage URLs both work."
                }
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
              label={
                uploading
                  ? "Waiting for upload…"
                  : mode === "create"
                    ? "Add slide"
                    : "Save"
              }
              onPress={submit}
              loading={busy}
              disabled={uploading}
            />
            {onCancel ? (
              <Button label="Cancel" variant="ghost" onPress={onCancel} />
            ) : null}
          </Row>
        </View>

        <View style={{ width: PHONE_FRAME_WIDTH, maxWidth: "100%", gap: 6 }}>
          <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}>
            Preview
          </Text>
          {draft ? (
            <PhoneSlide slide={draft} />
          ) : (
            <PhoneSlidePlaceholder
              message={
                type === "text"
                  ? "Start typing a title or text to see how the slide will look."
                  : UPLOADS_SUPPORTED
                    ? "Upload a file or paste a link to see how the slide will look."
                    : "Paste a link to see how the slide will look."
              }
            />
          )}
        </View>
      </View>
    </Card>
  );
}
