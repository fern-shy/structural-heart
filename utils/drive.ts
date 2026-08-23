import { Platform } from 'react-native';

/**
 * Extracts the Drive file id from common share-link formats.
 * Returns null for non-Drive URLs (e.g. Firebase Storage), which should be used
 * as-is.
 */
export function getDriveFileId(input: string): string | null {
  if (!input) return null;
  if (!/drive\.google\.com|docs\.google\.com/.test(input)) return null;
  const idMatch =
    input.match(/(?:id=|file\/d\/)([a-zA-Z0-9_-]{10,})(?:[/?]|$)/) ||
    input.match(/(?:open\?id=|uc\?id=)([a-zA-Z0-9_-]{10,})/);
  return idMatch?.[1] ?? null;
}

/**
 * Convert common Google Drive share links to direct file URLs.
 * Used for video on native, where `uc?export=download` streams fine.
 * Non-Drive URLs pass through unchanged.
 */
export function driveToDirectUrl(input: string, opts?: { asDownload?: boolean }): string {
  if (!input) return input;
  const asDownload = opts?.asDownload ?? true;
  const fileId = getDriveFileId(input);
  if (!fileId) return input;
  if (asDownload) return `https://drive.google.com/uc?export=download&id=${fileId}`;
  return `https://drive.google.com/uc?id=${fileId}`;
}

/**
 * Web-safe image URL for a Drive file.
 *
 * Browsers get a 403 when loading `uc?export=download` cross-origin from an
 * <img> tag, so on web we use Google's image CDN (lh3.googleusercontent.com),
 * which serves Drive images with permissive CORS. Native keeps the direct
 * download URL, which works there. Non-Drive URLs pass through unchanged.
 */
export function driveImageUrl(input: string, opts?: { width?: number }): string {
  const fileId = getDriveFileId(input);
  if (!fileId) return input;
  if (Platform.OS === 'web') {
    const width = opts?.width ?? 1920;
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
  }
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Embeddable preview URL for a Drive video, for use in a web <iframe>.
 * Returns null for non-Drive URLs. Google Drive videos cannot be played in a
 * cross-origin HTML5 <video> element, so the web build uses Drive's own player.
 */
export function drivePreviewUrl(input: string): string | null {
  const fileId = getDriveFileId(input);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}
