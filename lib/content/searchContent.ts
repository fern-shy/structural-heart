import type { Category, Content, Subtopic } from "@/types/content";
import type { Slide } from "@/types/media";

export type SearchHit = {
  id: string;
  title: string;
  breadcrumb: string;
  kind: string;
  snippet: string;
  /** Index of the match inside `snippet`, for highlighting. */
  matchStart: number;
  matchLength: number;
  categoryId: string;
  subtopicId?: string;
  /** Zero-based slide to open. Omit to open the procedure itself. */
  slideIndex?: number;
};

type IndexedField = {
  id: string;
  title: string;
  breadcrumb: string;
  kind: string;
  text: string;
  rank: number;
  categoryId: string;
  subtopicId?: string;
  slideIndex?: number;
};

function clampSnippet(
  text: string,
  query: string,
): { snippet: string; matchStart: number; matchLength: number } {
  const collapsed = text.replace(/\s+/g, " ").trim();
  const hay = collapsed.toLowerCase();
  const phrase = query.trim().toLowerCase();
  const words = phrase.split(/\s+/).filter(Boolean);
  let at = phrase ? hay.indexOf(phrase) : -1;
  let length = phrase.length;
  if (at < 0) {
    for (const word of words) {
      const found = hay.indexOf(word);
      if (found >= 0) {
        at = found;
        length = word.length;
        break;
      }
    }
  }
  if (at < 0) {
    return { snippet: collapsed.slice(0, 160), matchStart: 0, matchLength: 0 };
  }
  const radius = 72;
  const from = Math.max(0, at - radius);
  const to = Math.min(collapsed.length, at + length + radius);
  const prefix = from > 0 ? "…" : "";
  const suffix = to < collapsed.length ? "…" : "";
  return {
    snippet: prefix + collapsed.slice(from, to) + suffix,
    matchStart: prefix.length + (at - from),
    matchLength: length,
  };
}

function slideFields(slide: Slide, slideNumber: number): { kind: string; text: string; rank: number }[] {
  const label = `Slide ${slideNumber}`;
  if (slide.type === "text") {
    return [
      { kind: label, text: slide.title, rank: 1 },
      { kind: label, text: slide.content, rank: 2 },
    ];
  }
  if (!slide.caption?.trim()) return [];
  return [{ kind: `${label} caption`, text: slide.caption, rank: 1 }];
}

function indexSubtopics(
  category: Category,
  nodes: Subtopic[],
  ancestors: string[],
  into: IndexedField[],
) {
  for (const node of nodes) {
    const breadcrumb = [category.title, ...ancestors].filter(Boolean).join(" · ");
    const procedureFields: { kind: string; text: string | undefined; rank: number }[] = [
      { kind: "Procedure", text: node.title, rank: 0 },
      { kind: "Description", text: node.description, rank: 2 },
      { kind: "Notes", text: node.longText, rank: 3 },
    ];
    for (const field of procedureFields) {
      const text = field.text?.trim();
      if (!text) continue;
      into.push({
        id: `${category.id}:${node.id}:procedure`,
        title: node.title,
        breadcrumb,
        kind: field.kind,
        text,
        rank: field.rank,
        categoryId: category.id,
        subtopicId: node.id,
      });
    }
    (node.slides ?? []).forEach((slide, slideIndex) => {
      for (const field of slideFields(slide, slideIndex + 1)) {
        const text = field.text.trim();
        if (!text) continue;
        into.push({
          id: `${category.id}:${node.id}:slide:${slideIndex}`,
          title: node.title,
          breadcrumb,
          kind: field.kind,
          text,
          rank: field.rank,
          categoryId: category.id,
          subtopicId: node.id,
          slideIndex,
        });
      }
    });
    if (node.children?.length) {
      indexSubtopics(category, node.children, [...ancestors, node.title], into);
    }
  }
}

function indexContent(content: Content): IndexedField[] {
  const fields: IndexedField[] = [];
  for (const category of content.categories) {
    const title = category.title?.trim();
    if (title) {
      fields.push({
        id: `${category.id}:category`,
        title,
        breadcrumb: "Procedures",
        kind: "Category",
        text: [title, category.subtitle].filter(Boolean).join(" · "),
        rank: 0,
        categoryId: category.id,
      });
    }
    indexSubtopics(category, category.subtopics, [], fields);
  }
  return fields;
}

function matchesAll(text: string, words: string[]) {
  const hay = text.toLowerCase();
  return words.every((word) => hay.includes(word));
}

/**
 * Substring search over the loaded procedure library (Firestore, cache, or
 * the bundled snapshot). Each caption and text slide is its own result so a
 * match opens that slide.
 */
export function searchContent(content: Content | null | undefined, query: string): SearchHit[] {
  const phrase = query.trim().toLowerCase();
  const words = phrase.split(/\s+/).filter(Boolean);
  if (!content || words.length === 0) return [];

  const best = new Map<string, { field: IndexedField; at: number }>();
  for (const field of indexContent(content)) {
    if (!matchesAll(field.text, words)) continue;
    const at = field.text.toLowerCase().indexOf(words[0]);
    const current = best.get(field.id);
    if (!current || field.rank < current.field.rank || (field.rank === current.field.rank && at < current.at)) {
      best.set(field.id, { field, at: Math.max(0, at) });
    }
  }

  const ranked = [...best.values()].sort((a, b) => {
    if (a.field.rank !== b.field.rank) return a.field.rank - b.field.rank;
    if (a.at !== b.at) return a.at - b.at;
    return a.field.title.localeCompare(b.field.title);
  });

  return ranked.map(({ field }) => {
    const snippet = clampSnippet(field.text, phrase);
    return {
      id: field.id,
      title: field.title,
      breadcrumb: field.breadcrumb,
      kind: field.kind,
      snippet: snippet.snippet,
      matchStart: snippet.matchStart,
      matchLength: snippet.matchLength,
      categoryId: field.categoryId,
      subtopicId: field.subtopicId,
      slideIndex: field.slideIndex,
    };
  });
}
