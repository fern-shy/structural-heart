/**
 * Firestore document shapes for the content model.
 *
 * Structure (collections / subcollections), designed so every editable unit is
 * a single document with simple scalar fields that are pleasant to manage in the
 * Firebase console:
 *
 *   categories/{categoryId}
 *     -> subtopics/{subtopicId}
 *          -> slides/{slideId}
 *
 * Nesting of subtopics (e.g. "TMVR" -> "Mitral Valve-in-Valve") is expressed via
 * a `parentId` field that points at another subtopic document in the same
 * category, rather than deeply nested arrays. The app reconstructs the tree.
 *
 * `order` is a number used to sort siblings; reordering is just editing a number.
 */

export const COLLECTIONS = {
  categories: "categories",
  subtopics: "subtopics",
  slides: "slides",
} as const;

export type CategoryDoc = {
  title: string;
  subtitle?: string;
  order: number;
};

export type SubtopicDoc = {
  title: string;
  description?: string;
  longText?: string;
  /** id of a sibling subtopic doc this one nests under; omit for top-level. */
  parentId?: string;
  order: number;
};

export type SlideDoc =
  | { type: "image"; order: number; uri: string; caption?: string }
  | {
      type: "video";
      order: number;
      uri: string;
      caption?: string;
      isLoop?: boolean;
    }
  | { type: "text"; order: number; title: string; content: string };
