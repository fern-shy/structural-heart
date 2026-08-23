/**
 * Native fallback. The web build resolves to DriveVideoFrame.web.tsx instead;
 * on native, Drive videos play through the normal expo-video path, so this is
 * never rendered.
 */
export default function DriveVideoFrame(_props: { url: string }) {
  return null;
}
