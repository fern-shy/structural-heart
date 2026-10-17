import type { MediaKind } from "@/lib/content/mediaUpload";

/**
 * Native fallback. File uploads use the browser's drag-and-drop and file picker,
 * so they only exist in the web editor; on native the slide form falls back to
 * pasting a link.
 */
export const UPLOADS_SUPPORTED = false;

export function MediaDropzone(_props: {
  kind: MediaKind;
  categoryId: string;
  subtopicId: string;
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  return null;
}
