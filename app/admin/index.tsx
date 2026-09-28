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
import { useDeleteConfirmation } from "@/components/admin/ConfirmDelete";
import { useAuth } from "@/context/AuthProvider";
import {
  createCategory,
  deleteCategory,
  listCategories,
  listSubtopics,
  persistCategoryOrder,
  slugify,
  updateCategory,
  type WithId,
} from "@/lib/content/adminApi";
import type { CategoryDoc } from "@/lib/content/schema";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AdminCategories() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<WithId<CategoryDoc>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { requestDelete, deleteDialog } = useDeleteConfirmation();

  const load = useCallback(async () => {
    setItems(await listCategories());
    setLoading(false);
  }, []);

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
    await persistCategoryOrder(next.map((c) => c.id));
  };

  const remove = async (c: WithId<CategoryDoc>) => {
    const count = (await listSubtopics(c.id)).length;
    requestDelete({
      title: `Delete "${c.title}"?`,
      message:
        count > 0
          ? `This permanently deletes the category, the ${count} procedure${count === 1 ? "" : "s"} inside it, and all of their slides. This cannot be undone.`
          : "This permanently deletes the category. It has no procedures. This cannot be undone.",
      action: async () => {
        await deleteCategory(c.id);
        await load();
      },
    });
  };

  return (
    <AdminScreen>
      {deleteDialog}
      <Row gap={12}>
        <View style={{ flex: 1 }}>
          <PageTitle
            title="Categories"
            subtitle="Top-level sections shown on the Procedures tab."
          />
        </View>
        <Button label="Sign out" variant="ghost" small onPress={signOut} />
      </Row>
      <Muted>Signed in as {user?.email}</Muted>

      <CreateCategoryCard onCreated={load} />

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : items.length === 0 ? (
        <Muted>No categories yet. Create your first one above.</Muted>
      ) : (
        items.map((c, i) =>
          editingId === c.id ? (
            <EditCategoryCard
              key={c.id}
              category={c}
              onDone={() => {
                setEditingId(null);
                void load();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <Card key={c.id}>
              <Text
                style={{ color: COLORS.text, fontSize: 17, fontWeight: "700" }}
              >
                {c.title}
              </Text>
              {c.subtitle ? <Muted>{c.subtitle}</Muted> : null}
              <Row gap={8}>
                <Button
                  label="Open"
                  small
                  onPress={() =>
                    router.push({
                      pathname: "/admin/category",
                      params: { categoryId: c.id },
                    })
                  }
                />
                <Button
                  label="Edit"
                  small
                  variant="secondary"
                  onPress={() => setEditingId(c.id)}
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
                  onPress={() => remove(c)}
                />
              </Row>
            </Card>
          ),
        )
      )}
    </AdminScreen>
  );
}

function CreateCategoryCard({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createCategory({
        id: slugify(title),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
      });
      setTitle("");
      setSubtitle("");
      onCreated();
    } catch {
      setError("Could not create. A category with that name may already exist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: 15 }}>
        Add a category
      </Text>
      <Field
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. 3. Mitral Valve"
      />
      <Field
        label="Subtitle (optional)"
        value={subtitle}
        onChangeText={setSubtitle}
        placeholder="e.g. TEER, TMVR, PVL, LAMPOON"
      />
      {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}
      <Row>
        <Button label="Add category" onPress={submit} loading={busy} />
      </Row>
    </Card>
  );
}

function EditCategoryCard({
  category,
  onDone,
  onCancel,
}: {
  category: WithId<CategoryDoc>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(category.title);
  const [subtitle, setSubtitle] = useState(category.subtitle ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await updateCategory(category.id, {
      title: title.trim(),
      subtitle: subtitle.trim(),
    });
    setBusy(false);
    onDone();
  };

  return (
    <Card>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field
        label="Subtitle (optional)"
        value={subtitle}
        onChangeText={setSubtitle}
      />
      <Row>
        <Button label="Save" onPress={save} loading={busy} />
        <Button label="Cancel" variant="ghost" onPress={onCancel} />
      </Row>
    </Card>
  );
}
