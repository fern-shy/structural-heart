import { useDeleteConfirmation } from "@/components/admin/ConfirmDelete";
import {
  DRAG_AND_DROP_SUPPORTED,
  DragHandle,
  DropGap,
  NestDropTarget,
} from "@/components/admin/dnd";
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
  moveSubtopic,
  persistSubtopicOrder,
  slugify,
  updateSubtopic,
  type WithId,
} from "@/lib/content/adminApi";
import type { SubtopicDoc } from "@/lib/content/schema";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Fragment, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Item = WithId<SubtopicDoc>;

export default function AdminCategory() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { requestDelete, deleteDialog } = useDeleteConfirmation();

  const load = useCallback(async () => {
    if (!categoryId) return;
    setItems(await listSubtopics(categoryId));
    setLoading(false);
  }, [categoryId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const byId = useMemo(() => new Map(items.map((s) => [s.id, s])), [items]);
  const childrenOf = useCallback(
    (parentId: string | null) =>
      items
        .filter((s) => (s.parentId ?? null) === parentId)
        .sort((a, b) => a.order - b.order),
    [items],
  );
  const topLevel = useMemo(() => childrenOf(null), [childrenOf]);

  /** True if `id` is `ancestorId` itself or nested anywhere beneath it. */
  const isWithin = useCallback(
    (id: string | null, ancestorId: string) => {
      const seen = new Set<string>();
      let current = id;
      while (current && !seen.has(current)) {
        if (current === ancestorId) return true;
        seen.add(current);
        current = byId.get(current)?.parentId ?? null;
      }
      return false;
    },
    [byId],
  );

  const canDropInto = (parentId: string | null) =>
    dragId !== null && !isWithin(parentId, dragId);

  /** Places the dragged procedure at `index` among the children of `parentId`. */
  const moveTo = async (parentId: string | null, index: number) => {
    const moving = dragId ? byId.get(dragId) : undefined;
    setDragId(null);
    if (!moving || isWithin(parentId, moving.id)) return;

    const group = childrenOf(parentId);
    const ordered = group.filter((s) => s.id !== moving.id);
    const insertAt = group
      .slice(0, index)
      .filter((s) => s.id !== moving.id).length;
    ordered.splice(insertAt, 0, moving);
    const orderedIds = ordered.map((s) => s.id);

    const unchanged =
      (moving.parentId ?? null) === parentId &&
      orderedIds.every((id, i) => group[i]?.id === id);
    if (unchanged) return;

    setError(null);
    setItems((prev) =>
      prev.map((s) => {
        const order = orderedIds.indexOf(s.id);
        if (order === -1) return s;
        return s.id === moving.id
          ? { ...s, order, parentId: parentId ?? undefined }
          : { ...s, order };
      }),
    );
    try {
      await moveSubtopic(categoryId!, moving.id, parentId, orderedIds);
    } catch {
      setError("Could not move that procedure. Please try again.");
    }
    await load();
  };

  const move = async (group: Item[], index: number, dir: -1 | 1) => {
    const next = [...group];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await persistSubtopicOrder(categoryId!, next.map((s) => s.id));
    await load();
  };

  const remove = (s: Item) => {
    const nested = items.filter(
      (other) => other.id !== s.id && isWithin(other.id, s.id),
    ).length;
    requestDelete({
      title: `Delete "${s.title}"?`,
      message:
        nested > 0
          ? `This permanently deletes the procedure, its slides, and the ${nested} procedure${nested === 1 ? "" : "s"} nested inside it (with their slides). This cannot be undone.`
          : "This permanently deletes the procedure and all of its slides. This cannot be undone.",
      action: async () => {
        await deleteSubtopic(categoryId!, s.id);
        await load();
      },
    });
  };

  const renderGroup = (parentId: string | null, group: Item[]) => (
    <View style={{ marginLeft: parentId ? 24 : 0 }}>
      <DropGap
        dragging={dragId !== null}
        enabled={canDropInto(parentId)}
        onDrop={() => moveTo(parentId, 0)}
      />
      {group.map((s, i) => (
        <Fragment key={s.id}>
          {renderNode(s, group, i)}
          <DropGap
            dragging={dragId !== null}
            enabled={canDropInto(parentId)}
            onDrop={() => moveTo(parentId, i + 1)}
          />
        </Fragment>
      ))}
    </View>
  );

  const renderNode = (s: Item, group: Item[], i: number) => {
    const kids = childrenOf(s.id);
    return (
      <View>
        {editingId === s.id ? (
          <EditSubtopicCard
            categoryId={categoryId!}
            subtopic={s}
            onDone={() => {
              setEditingId(null);
              void load();
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <NestDropTarget
            enabled={canDropInto(s.id)}
            dimmed={dragId === s.id}
            label={`Put inside "${s.title}"`}
            onDrop={() => moveTo(s.id, kids.length)}
          >
            <Card>
              <DragHandle
                onDragStart={() => setDragId(s.id)}
                onDragEnd={() => setDragId(null)}
              />
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 16,
                  fontWeight: "700",
                  paddingRight: DRAG_AND_DROP_SUPPORTED ? 32 : 0,
                }}
              >
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
          </NestDropTarget>
        )}
        {kids.length > 0 ? renderGroup(s.id, kids) : null}
      </View>
    );
  };

  return (
    <AdminScreen>
      {deleteDialog}
      <Stack.Screen options={{ title: "Procedures" }} />
      <PageTitle
        title="Procedures"
        subtitle={
          DRAG_AND_DROP_SUPPORTED
            ? "Each procedure holds its own slides. Drag the dotted handle in a card's top-right corner to move it: drop it on a line to place it there, or onto another procedure to nest it inside."
            : "Each procedure holds its own slides. Nest one under another to group them."
        }
      />

      <CreateSubtopicCard
        categoryId={categoryId!}
        parents={topLevel}
        onCreated={load}
      />

      {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : topLevel.length === 0 ? (
        <Muted>No procedures yet. Add one above.</Muted>
      ) : (
        renderGroup(null, topLevel)
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
