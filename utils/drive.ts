/**
 * Convert common Google Drive share links to direct file URLs usable by <Image> or <Video>.
 * Supports open?id=, file/d/<id>/view, uc?id=, and direct uc?export=download&id= patterns.
 * For videos, prefer export=download to get a streamable file.
 */
export function driveToDirectUrl(input: string, opts?: { asDownload?: boolean }): string {
  if (!input) return input;
  const asDownload = opts?.asDownload ?? true;

  // Extract file id from various formats
  const idMatch =
    input.match(/(?:id=|file\/d\/)([a-zA-Z0-9_-]{10,})(?:[/?]|$)/) ||
    input.match(/(?:open\?id=|uc\?id=)([a-zA-Z0-9_-]{10,})/);

  const fileId = idMatch?.[1];
  if (!fileId) return input;

  // Use export=download for binary streams
  if (asDownload) return `https://drive.google.com/uc?export=download&id=${fileId}`;
  // Or direct view URL
  return `https://drive.google.com/uc?id=${fileId}`;
}


