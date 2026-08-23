import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  COLLECTIONS,
  type CategoryDoc,
  type SlideDoc,
  type SubtopicDoc,
} from "./schema";

export type WithId<T> = T & { id: string };

// --- path helpers -----------------------------------------------------------

const categoriesCol = () => collection(db, COLLECTIONS.categories);
const subtopicsCol = (categoryId: string) =>
  collection(db, COLLECTIONS.categories, categoryId, COLLECTIONS.subtopics);
const slidesCol = (categoryId: string, subtopicId: string) =>
  collection(
    db,
    COLLECTIONS.categories,
    categoryId,
    COLLECTIONS.subtopics,
    subtopicId,
    COLLECTIONS.slides,
  );

/** Turns a title into a stable, url-safe document id. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function nextOrder(items: { order: number }[]): number {
  return items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;
}

// --- reads (live, straight from Firestore for the editor) -------------------

export async function listCategories(): Promise<WithId<CategoryDoc>[]> {
  const snap = await getDocs(query(categoriesCol(), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CategoryDoc) }));
}

export async function listSubtopics(
  categoryId: string,
): Promise<WithId<SubtopicDoc>[]> {
  const snap = await getDocs(query(subtopicsCol(categoryId), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SubtopicDoc) }));
}

export async function listSlides(
  categoryId: string,
  subtopicId: string,
): Promise<WithId<SlideDoc>[]> {
  const snap = await getDocs(
    query(slidesCol(categoryId, subtopicId), orderBy("order")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SlideDoc) }));
}

// --- categories -------------------------------------------------------------

export async function createCategory(input: {
  id: string;
  title: string;
  subtitle?: string;
}): Promise<void> {
  const existing = await listCategories();
  const data: CategoryDoc = {
    title: input.title,
    order: nextOrder(existing),
  };
  if (input.subtitle) data.subtitle = input.subtitle;
  await setDoc(doc(categoriesCol(), input.id), data);
}

export async function updateCategory(
  id: string,
  patch: { title?: string; subtitle?: string },
): Promise<void> {
  await updateDoc(doc(categoriesCol(), id), {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    // Empty string clears the optional subtitle.
    ...(patch.subtitle !== undefined ? { subtitle: patch.subtitle || null } : {}),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const subtopics = await listSubtopics(id);
  for (const s of subtopics) {
    await deleteSubtopicDeep(id, s.id);
  }
  await deleteDoc(doc(categoriesCol(), id));
}

// --- subtopics --------------------------------------------------------------

export async function createSubtopic(
  categoryId: string,
  input: {
    id: string;
    title: string;
    description?: string;
    longText?: string;
    parentId?: string;
  },
): Promise<void> {
  const siblings = (await listSubtopics(categoryId)).filter(
    (s) => (s.parentId ?? undefined) === (input.parentId ?? undefined),
  );
  const data: SubtopicDoc = {
    title: input.title,
    order: nextOrder(siblings),
  };
  if (input.description) data.description = input.description;
  if (input.longText) data.longText = input.longText;
  if (input.parentId) data.parentId = input.parentId;
  await setDoc(doc(subtopicsCol(categoryId), input.id), data);
}

export async function updateSubtopic(
  categoryId: string,
  id: string,
  patch: {
    title?: string;
    description?: string;
    longText?: string;
    parentId?: string | null;
  },
): Promise<void> {
  await updateDoc(doc(subtopicsCol(categoryId), id), {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description || null }
      : {}),
    ...(patch.longText !== undefined
      ? { longText: patch.longText || null }
      : {}),
    ...(patch.parentId !== undefined
      ? { parentId: patch.parentId || null }
      : {}),
  });
}

/** Deletes a subtopic, its slides, and any child subtopics (and their slides). */
async function deleteSubtopicDeep(
  categoryId: string,
  subtopicId: string,
): Promise<void> {
  const slides = await getDocs(slidesCol(categoryId, subtopicId));
  await Promise.all(slides.docs.map((d) => deleteDoc(d.ref)));

  const children = (await listSubtopics(categoryId)).filter(
    (s) => s.parentId === subtopicId,
  );
  for (const child of children) {
    await deleteSubtopicDeep(categoryId, child.id);
  }

  await deleteDoc(doc(subtopicsCol(categoryId), subtopicId));
}

export async function deleteSubtopic(
  categoryId: string,
  id: string,
): Promise<void> {
  await deleteSubtopicDeep(categoryId, id);
}

// --- slides -----------------------------------------------------------------

/** Slide payload without the auto-managed `order` (set by create/reorder). */
export type SlideInput =
  | { type: "image"; uri: string; caption?: string }
  | { type: "video"; uri: string; caption?: string; isLoop?: boolean }
  | { type: "text"; title: string; content: string };

function slideInputToDoc(input: SlideInput, order: number): SlideDoc {
  switch (input.type) {
    case "text":
      return { type: "text", order, title: input.title, content: input.content };
    case "image":
      return {
        type: "image",
        order,
        uri: input.uri,
        ...(input.caption ? { caption: input.caption } : {}),
      };
    case "video":
      return {
        type: "video",
        order,
        uri: input.uri,
        ...(input.caption ? { caption: input.caption } : {}),
        ...(input.isLoop !== undefined ? { isLoop: input.isLoop } : {}),
      };
  }
}

export async function createSlide(
  categoryId: string,
  subtopicId: string,
  input: SlideInput,
): Promise<void> {
  const existing = await listSlides(categoryId, subtopicId);
  await addDoc(
    slidesCol(categoryId, subtopicId),
    slideInputToDoc(input, nextOrder(existing)),
  );
}

export async function updateSlide(
  categoryId: string,
  subtopicId: string,
  slideId: string,
  input: SlideInput,
  order: number,
): Promise<void> {
  await setDoc(
    doc(slidesCol(categoryId, subtopicId), slideId),
    slideInputToDoc(input, order),
  );
}

export async function deleteSlide(
  categoryId: string,
  subtopicId: string,
  slideId: string,
): Promise<void> {
  await deleteDoc(doc(slidesCol(categoryId, subtopicId), slideId));
}

// --- reordering -------------------------------------------------------------

/**
 * Rewrites the `order` field of each doc to match its index in `orderedIds`.
 * Used by move-up / move-down controls in the editor.
 */
export async function persistCategoryOrder(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(categoriesCol(), id), { order: index });
  });
  await batch.commit();
}

export async function persistSubtopicOrder(
  categoryId: string,
  orderedIds: string[],
): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(subtopicsCol(categoryId), id), { order: index });
  });
  await batch.commit();
}

export async function persistSlideOrder(
  categoryId: string,
  subtopicId: string,
  orderedIds: string[],
): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(slidesCol(categoryId, subtopicId), id), { order: index });
  });
  await batch.commit();
}
