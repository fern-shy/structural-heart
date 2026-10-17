import { useEffect, useRef, useState, type DragEvent } from "react";
import { Text, View } from "react-native";
import {
  DROP_GAP_HEIGHT,
  type DragHandleProps,
  type DropGapProps,
  type NestDropTargetProps,
} from "./dndShared";
import { COLORS } from "./ui";

/**
 * Web editor drag-and-drop. Native builds resolve dnd.native.tsx instead.
 */
export const DRAG_AND_DROP_SUPPORTED = true;

/**
 * Tracks whether an internal drag is hovering an element. dragenter/dragleave
 * fire for every child element crossed, so a depth counter avoids flicker.
 */
function useDropHover(enabled: boolean, onDrop: () => void) {
  const depth = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!enabled) {
      depth.current = 0;
      setHovered(false);
    }
  }, [enabled]);

  const handlers = {
    onDragEnter: (e: DragEvent<HTMLDivElement>) => {
      if (!enabled) return;
      e.preventDefault();
      depth.current += 1;
      setHovered(true);
    },
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      if (!enabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragLeave: () => {
      if (!enabled) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setHovered(false);
    },
    onDrop: (e: DragEvent<HTMLDivElement>) => {
      if (!enabled) return;
      e.preventDefault();
      depth.current = 0;
      setHovered(false);
      onDrop();
    },
  };

  return { hovered: enabled && hovered, handlers };
}

export function DragHandle({ onDragStart, onDragEnd }: DragHandleProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move";
    // Firefox won't start a drag without some data attached.
    e.dataTransfer.setData("text/plain", "");
    const card = e.currentTarget.closest("[data-dnd-card]");
    if (card instanceof HTMLElement) {
      const rect = card.getBoundingClientRect();
      e.dataTransfer.setDragImage(card, e.clientX - rect.left, e.clientY - rect.top);
    }
    // Re-rendering synchronously inside dragstart cancels the drag in Chrome.
    setTimeout(onDragStart, 0);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      title="Drag to move"
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        padding: 8,
        cursor: "grab",
        display: "grid",
        gridTemplateColumns: "repeat(2, 4px)",
        gap: 3,
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            background: COLORS.subtext,
          }}
        />
      ))}
    </div>
  );
}

export function NestDropTarget({
  enabled,
  dimmed,
  label,
  onDrop,
  children,
}: NestDropTargetProps) {
  const { hovered, handlers } = useDropHover(enabled, onDrop);
  return (
    <div
      data-dnd-card
      {...handlers}
      style={{
        position: "relative",
        borderRadius: 14,
        outline: `2px solid ${hovered ? COLORS.primary : "transparent"}`,
        outlineOffset: 2,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      {children}
      {hovered ? (
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 12,
            bottom: -12,
            backgroundColor: COLORS.primary,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            {label}
          </Text>
        </View>
      ) : null}
    </div>
  );
}

export function DropGap({ dragging, enabled, onDrop }: DropGapProps) {
  const active = dragging && enabled;
  const { hovered, handlers } = useDropHover(active, onDrop);
  return (
    <div
      style={{
        position: "relative",
        height: DROP_GAP_HEIGHT,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: hovered ? 4 : 2,
          borderRadius: 2,
          background: hovered
            ? COLORS.primary
            : active
              ? COLORS.cardBorder
              : "transparent",
        }}
      />
      {active ? (
        // Taller invisible hit area that reaches into the card edges, so dropping
        // near a card's top/bottom places it beside that card rather than inside.
        <div
          {...handlers}
          style={{ position: "absolute", left: 0, right: 0, top: -10, bottom: -10, zIndex: 2 }}
        />
      ) : null}
    </div>
  );
}
