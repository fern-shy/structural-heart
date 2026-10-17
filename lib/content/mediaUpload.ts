import { storage } from "@/lib/firebase";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from "firebase/storage";

export type MediaKind = "image" | "video";

/** Must match the limits in storage.rules. */
export const MAX_UPLOAD_BYTES: Record<MediaKind, number> = {
  image: 25 * 1024 * 1024,
  video: 300 * 1024 * 1024,
};

/** Unique per upload, so objects never change and can be cached forever. */
export function mediaPath(
  categoryId: string,
  subtopicId: string,
  fileName: string,
): string {
  const safeName =
    fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file";
  return `content/${categoryId}/${subtopicId}/${Date.now()}-${safeName}`;
}

/** Starts an upload; `done` resolves with the public download URL. */
export function startMediaUpload(
  file: Blob,
  path: string,
  onProgress: (fraction: number) => void,
): { task: UploadTask; done: Promise<string> } {
  const task = uploadBytesResumable(ref(storage, path), file, {
    contentType: file.type,
    cacheControl: "public, max-age=31536000, immutable",
  });
  const done = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => onProgress(snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0),
      reject,
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve, reject);
      },
    );
  });
  return { task, done };
}

export function uploadErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "storage/canceled":
      return "Upload cancelled.";
    case "storage/unauthorized":
      return "The upload was refused. Make sure you are signed in with an editor account and the Storage rules have been deployed.";
    case "storage/quota-exceeded":
      return "Storage quota exceeded. Check billing in the Firebase console.";
    case "storage/retry-limit-exceeded":
      return "The connection dropped during the upload. Please try again.";
    default:
      return "Upload failed. Make sure Firebase Storage is enabled for this project, then try again.";
  }
}

export function isUploadedMedia(uri: string): boolean {
  return uri.includes("firebasestorage.googleapis.com");
}
