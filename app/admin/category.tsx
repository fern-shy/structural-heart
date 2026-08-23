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
  createSubtopic,
  deleteSubtopic,
  listSubtopics,
  persistSubtopicOrder,
  slugify,
  updateSubtopic,
  type WithId,
} from "@/lib/content/adminApi";
import type { SubtopicDoc } from "@/lib/content/schema";
import { confirmAsync } from "@/lib/confirm";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AdminCategory() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const [items, setItems] = useState<WithId<SubtopicDoc>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    setItems(await listSubtopics(categoryId));
    setLoading(false);
  }, [categoryId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const topLevel = useMemo(
    () => items.filter((s) => !s.parentId).sort((a, b) => a.order - b.order),
    [items],
  );
  const childrenOf = useCallback(
    (id: string) =>
      items.filter((s) => s.parentId === id).sort((a, b) => a.order - b.order),
    [items],
  );

  const move = async (group: WithId<SubtopicDoc>[], index: number, dir: -1 | 1) => {
    const next = [...group];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await persistSubtopicOrder(categoryId!, next.map((s) => s.id));
    await load();
  };

  const remove = async (s: WithId<SubtopicDoc>) => {
    const ok = await confirmAsync(
      `Delete "${s.title}"?`,
      "This permanently deletes the procedure, its slides, and any nested sub-procedures.",
    );
    if (!ok) return;
    await deleteSubtopic(categoryId!, s.id);
    await load();
  };

  const renderNode = (s: WithId<SubtopicDoc>, group: WithId<SubtopicDoc>[], i: number, nested: boolean) => {
    if (editingId === s.id) {
      return (
        <View key={s.id} style={{ marginLeft: nested ? 24 : 0 }}>
          <EditSubtopicCard
            categoryId={categoryId!}
            subtopic={s}
            onDone={() => {
              setEditingId(null);
              void load();
            }}
            onCancel={() => setEditingId(null)}
          />
        </View>
      );
    }
    const kids = childrenOf(s.id);
    return (
      <View key={s.id} style={{ marginLeft: nested ? 24 : 0, gap: 12 }}>
        <Card>
          <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}>
            {s.title}
          </Text>
          {s.description ? <Muted>{s.description}</Muted> : null}
          <Row gap={8}>
            <Button
              label="Edit slides"
              small
              onPress={() =>
                router.push({
                  pathname: "/admin/subtopic",
                  params: { categoryId: categoryId!, subtopicId: s.id },
                })
              }
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
              onPress={() => move(group, i, -1)}
            />
            <Button
              label="↓"
              small
              variant="secondary"
              disabled={i === group.length - 1}
              onPress={() => move(group, i, 1)}
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
        {kids.map((k, ki) => renderNode(k, kids, ki, true))}
      </View>
    );
  };

  return (
    <AdminScreen>
      <Stack.Screen options={{ title: "Procedures" }} />
      <PageTitle
        title="Procedures"
        subtitle="Each procedure holds its own slides. Nest one under another to group them."
      />

      <CreateSubtopicCard
        categoryId={categoryId!}
        parents={topLevel}
        onCreated={load}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : topLevel.length === 0 ? (
        <Muted>No procedures yet. Add one above.</Muted>
      ) : (
        topLevel.map((s, i) => renderNode(s, topLevel, i, false))
      )}
    </AdminScreen>
  );
}

function ParentPicker({
  parents,
  value,
  onChange,
}: {
  parents: WithId<SubtopicDoc>[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  if (parents.length === 0) return null;
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}>
        Nest under (optional)
      </Text>
      <Row gap={8}>
        <Button
          label="None (top level)"
          small
          variant={value === null ? "primary" : "ghost"}
          onPress={() => onChange(null)}
        />
        {parents.map((p) => (
          <Button
            key={p.id}
            label={p.title}
            small
            variant={value === p.id ? "primary" : "ghost"}
            onPress={() => onChange(p.id)}
          />
        ))}
      </Row>
    </View>
  );
}

function CreateSubtopicCard({
  categoryId,
  parents,
  onCreated,
}: {
  categoryId: string;
  parents: WithId<SubtopicDoc>[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longText, setLongText] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createSubtopic(categoryId, {
        id: slugify(title),
        title: title.trim(),
        description: description.trim() || undefined,
        longText: longText.trim() || undefined,
        parentId: parentId ?? undefined,
      });
      setTitle("");
      setDescription("");
      setLongText("");
      setParentId(null);
      onCreated();
    } catch {
      setError("Could not create. A procedure with that name may already exist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: 15 }}>
        Add a procedure
      </Text>
      <Field
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. TMVR"
      />
      <Field
        label="Short description (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Shown under the title in lists"
      />
      <Field
        label="Long text (optional)"
        value={longText}
        onChangeText={setLongText}
        multiline
        placeholder="Longer text shown beneath the media on the detail screen"
      />
      <ParentPicker parents={parents} value={parentId} onChange={setParentId} />
      {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}
      <Row>
        <Button label="Add procedure" onPress={submit} loading={busy} />
      </Row>
    </Card>
  );
}

function EditSubtopicCard({
  categoryId,
  subtopic,
  onDone,
  onCancel,
}: {
  categoryId: string;
  subtopic: WithId<SubtopicDoc>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(subtopic.title);
  const [description, setDescription] = useState(subtopic.description ?? "");
  const [longText, setLongText] = useState(subtopic.longText ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await updateSubtopic(categoryId, subtopic.id, {
      title: title.trim(),
      description: description.trim(),
      longText: longText.trim(),
    });
    setBusy(false);
    onDone();
  };

  return (
    <Card>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field
        label="Short description (optional)"
        value={description}
        onChangeText={setDescription}
      />
      <Field
        label="Long text (optional)"
        value={longText}
        onChangeText={setLongText}
        multiline
      />
      <Row>
        <Button label="Save" onPress={save} loading={busy} />
        <Button label="Cancel" variant="ghost" onPress={onCancel} />
      </Row>
    </Card>
  );
}
