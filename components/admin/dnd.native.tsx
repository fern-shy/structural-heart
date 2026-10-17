import { View } from "react-native";
import {
  DROP_GAP_HEIGHT,
  type DragHandleProps,
  type DropGapProps,
  type NestDropTargetProps,
} from "./dndShared";

/**
 * Native fallback. Drag-and-drop uses HTML5 drag events, so it only exists in
 * the web editor; on native the cards render without handles and the ↑/↓
 * buttons remain for reordering.
 */
export const DRAG_AND_DROP_SUPPORTED = false;

export function DragHandle(_props: DragHandleProps) {
  return null;
}

export function NestDropTarget({ children }: NestDropTargetProps) {
  return <>{children}</>;
}

export function DropGap(_props: DropGapProps) {
  return <View style={{ height: DROP_GAP_HEIGHT }} />;
}
