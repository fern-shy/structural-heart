import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category, Content, Subtopic } from "@/types/content";
import type { Slide } from "@/types/media";
import {
  COLLECTIONS,
  type CategoryDoc,
  type SlideDoc,
  type SubtopicDoc,
} from "./schema";

type RawSubtopic = SubtopicDoc & { id: string };

export function docToSlide(id: string, d: SlideDoc): Slide | null {
  switch (d.type) {
    case "text":
      if (!d.title && !d.content) return null;
      return { id, type: "text", title: d.title ?? "", content: d.content ?? "" };
    case "image":
      if (!d.uri) return null;
      return { id, type: "image", uri: d.uri, caption: d.caption };
    case "video":
      if (!d.uri) return null;
      return { id, type: "video", uri: d.uri, caption: d.caption, isLoop: d.isLoop };
    default:
      return null;
  }
}

async function fetchSlides(subtopicPath: string): Promise<Slide[]> {
  const snap = await getDocs(
    query(collection(db, `${subtopicPath}/${COLLECTIONS.slides}`), orderBy("order")),
  );
  return snap.docs
    .map((d) => docToSlide(d.id, d.data() as SlideDoc))
    .filter((s): s is Slide => s !== null);
}

function buildSubtopic(
  raw: RawSubtopic,
  childrenByParent: Map<string, RawSubtopic[]>,
  slidesById: Map<string, Slide[]>,
): Subtopic {
  const node: Subtopic = { id: raw.id, title: raw.title };
  if (raw.description) node.description = raw.description;
  if (raw.longText) node.longText = raw.longText;

  const slides = slidesById.get(raw.id);
  if (slides?.length) node.slides = slides;

  const kids = childrenByParent.get(raw.id);
  if (kids?.length) {
    node.children = kids
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((k) => buildSubtopic(k, childrenByParent, slidesById));
  }
  return node;
}

async function fetchCategorySubtopics(categoryId: string): Promise<Subtopic[]> {
  const categoryPath = `${COLLECTIONS.categories}/${categoryId}`;
  const snap = await getDocs(
    query(
      collection(db, `${categoryPath}/${COLLECTIONS.subtopics}`),
      orderBy("order"),
    ),
  );

  const raws: RawSubtopic[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as SubtopicDoc),
  }));

  // Load slides for every subtopic (including nested children) in parallel.
  const slidesById = new Map<string, Slide[]>();
  await Promise.all(
    raws.map(async (r) => {
      const slides = await fetchSlides(
        `${categoryPath}/${COLLECTIONS.subtopics}/${r.id}`,
      );
      if (slides.length) slidesById.set(r.id, slides);
    }),
  );

  // Group by parentId; reconstruct the nested tree.
  const childrenByParent = new Map<string, RawSubtopic[]>();
  const topLevel: RawSubtopic[] = [];
  for (const r of raws) {
    if (r.parentId) {
      const list = childrenByParent.get(r.parentId) ?? [];
      list.push(r);
      childrenByParent.set(r.parentId, list);
    } else {
      topLevel.push(r);
    }
  }

  return topLevel
    .sort((a, b) => a.order - b.order)
    .map((r) => buildSubtopic(r, childrenByParent, slidesById));
}

/** Fetches all content from Firestore and assembles the nested Content tree. */
export async function fetchContent(): Promise<Content> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.categories), orderBy("order")),
  );

  const categories: Category[] = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data() as CategoryDoc;
      const subtopics = await fetchCategorySubtopics(d.id);
      const category: Category = { id: d.id, title: data.title, subtopics };
      if (data.subtitle) category.subtitle = data.subtitle;
      return category;
    }),
  );

  return { categories };
}
