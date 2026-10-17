import {
  MAX_UPLOAD_BYTES,
  mediaPath,
  startMediaUpload,
  uploadErrorMessage,
  type MediaKind,
} from "@/lib/content/mediaUpload";
import type { UploadTask } from "firebase/storage";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Text, View } from "react-native";
import { Button, COLORS, Row } from "./ui";

/**
 * Web editor dropzone. Native builds resolve MediaDropzone.native.tsx instead.
 */
export const UPLOADS_SUPPORTED = true;

function hasFiles(e: { dataTransfer: DataTransfer | null }): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}

function formatMb(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export function MediaDropzone({
  kind,
  categoryId,
  subtopicId,
  onUploaded,
  onBusyChange,
}: {
  kind: MediaKind;
  categoryId: string;
  subtopicId: string;
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<UploadTask | null>(null);
  const dragDepth = useRef(0);
  const [hovering, setHovering] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A file dropped just outside the box would otherwise make the browser open it
  // and navigate away from the editor, losing unsaved work.
  useEffect(() => {
    const block = (e: globalThis.DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  useEffect(
    () => () => {
      taskRef.current?.cancel();
    },
    [],
  );

  const upload = async (file: File) => {
    setError(null);
    setUploadedName(null);
    if (!file.type.startsWith(`${kind}/`)) {
      setError(`"${file.name}" isn't ${kind === "image" ? "an image" : "a video"} file.`);
      return;
    }
    if (file.size >= MAX_UPLOAD_BYTES[kind]) {
      setError(
        `"${file.name}" is ${formatMb(file.size)}; the limit for ${kind}s is ${formatMb(MAX_UPLOAD_BYTES[kind])}.` +
          (kind === "video" ? " Try exporting a shorter or compressed MP4." : ""),
      );
      return;
    }

    setFileName(file.name);
    setProgress(0);
    onBusyChange(true);
    const { task, done } = startMediaUpload(
      file,
      mediaPath(categoryId, subtopicId, file.name),
      setProgress,
    );
    taskRef.current = task;
    try {
      onUploaded(await done);
      setUploadedName(file.name);
    } catch (e) {
      setError(uploadErrorMessage(e));
    } finally {
      taskRef.current = null;
      setProgress(null);
      onBusyChange(false);
    }
  };

  const uploading = progress !== null;

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e) || uploading) return;
    e.preventDefault();
    dragDepth.current += 1;
    setHovering(true);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(e) || uploading) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setHovering(false);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setHovering(false);
    const file = e.dataTransfer.files[0];
    if (file && !uploading) void upload(file);
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires onChange.
    e.target.value = "";
    if (file) void upload(file);
  };

  const article = kind === "image" ? "an image" : "a video";

  return (
    <View style={{ gap: 6 }}>
      <div
        role="button"
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => {
          if (!uploading) inputRef.current?.click();
        }}
        style={{
          border: `2px dashed ${hovering ? COLORS.primary : COLORS.cardBorder}`,
          borderRadius: 10,
          padding: 20,
          cursor: uploading ? "default" : "pointer",
          background: hovering ? "rgba(11, 77, 255, 0.12)" : COLORS.inputBg,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={`${kind}/*`}
          onChange={onPick}
          style={{ display: "none" }}
        />
        {uploading ? (
          <View style={{ gap: 10 }}>
            <Text style={{ color: COLORS.text, fontWeight: "600" }}>
              Uploading {fileName}… {Math.round(progress * 100)}%
            </Text>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: COLORS.cardBorder,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${progress * 100}%` as const,
                  backgroundColor: COLORS.primary,
                }}
              />
            </View>
            <Row>
              <Button
                label="Cancel upload"
                small
                variant="ghost"
                onPress={() => taskRef.current?.cancel()}
              />
            </Row>
          </View>
        ) : (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ color: COLORS.text, fontWeight: "600", fontSize: 15 }}>
              Drag {article} here from your computer
            </Text>
            <Text style={{ color: COLORS.subtext, fontSize: 13 }}>
              or click to choose a file (up to {formatMb(MAX_UPLOAD_BYTES[kind])}
              {kind === "video" ? ", MP4 recommended" : ""})
            </Text>
          </View>
        )}
      </div>
      {uploadedName ? (
        <Text style={{ color: COLORS.subtext, fontSize: 13 }}>
          ✓ Uploaded {uploadedName}. Remember to save the slide.
        </Text>
      ) : null}
      {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}
    </View>
  );
}
