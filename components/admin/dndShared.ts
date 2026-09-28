import type { ReactNode } from "react";

/** Vertical space between cards; doubles as the "drop between" target. */
export const DROP_GAP_HEIGHT = 14;

export type DragHandleProps = {
  onDragStart: () => void;
  onDragEnd: () => void;
};

export type NestDropTargetProps = {
  /** Whether the dragged item may be dropped here (false for itself/its descendants). */
  enabled: boolean;
  /** Fades the card that is currently being dragged. */
  dimmed: boolean;
  /** Hint shown while hovering, e.g. `Put inside "TMVR"`. */
  label: string;
  onDrop: () => void;
  children: ReactNode;
};

export type DropGapProps = {
  dragging: boolean;
  enabled: boolean;
  onDrop: () => void;
};
