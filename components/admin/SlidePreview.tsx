import {
  ImageSlide,
  MEDIA_HEIGHT,
  TextSlide,
  VideoSlide,
} from "@/components/MediaCarousel";
import { Colors } from "@/constants/Colors";
import type { Slide } from "@/types/media";
import { VideoPlayerCache } from "@/utils/videoPlayerCache";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, Text, View } from "react-native";
import { Button, COLORS, Row } from "./ui";

/** Typical phone width; with MEDIA_HEIGHT this matches the app's media area. */
const SCREEN_WIDTH = 390;
const BEZEL = 6;
export const PHONE_FRAME_WIDTH = SCREEN_WIDTH + BEZEL * 2;

function usePlayerCache(): VideoPlayerCache {
  const ref = useRef<VideoPlayerCache | null>(null);
  if (!ref.current) ref.current = new VideoPlayerCache();
  useEffect(() => {
    const cache = ref.current;
    return () => cache?.releaseAll();
  }, []);
  return ref.current;
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        width: PHONE_FRAME_WIDTH,
        maxWidth: "100%",
        alignSelf: "center",
        backgroundColor: Colors.dark.background,
        borderColor: "#000",
        borderWidth: BEZEL,
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

/** One slide as the procedure screen shows it: the media area with its caption beneath. */
export function PhoneSlide({ slide }: { slide: Slide }) {
  const playerCache = usePlayerCache();
  const caption = slide.type !== "text" ? slide.caption : undefined;
  return (
    <PhoneFrame>
      <View style={{ height: MEDIA_HEIGHT, backgroundColor: "black" }}>
        {slide.type === "text" ? (
          <TextSlide
            title={slide.title}
            content={slide.content}
            height={MEDIA_HEIGHT}
          />
        ) : slide.type === "image" ? (
          <ImageSlide key={slide.uri} uri={slide.uri} />
        ) : (
          <VideoSlide
            key={slide.uri}
            uri={slide.uri}
            isLoop={slide.isLoop ?? true}
            fullscreen={false}
            isActive
            playerCache={playerCache}
          />
        )}
      </View>
      {caption ? (
        <Text
          style={{
            color: Colors.dark.text,
            fontSize: 18,
            lineHeight: 26,
            padding: 16,
          }}
        >
          {caption}
        </Text>
      ) : null}
    </PhoneFrame>
  );
}

export function PhoneSlidePlaceholder({ message }: { message: string }) {
  return (
    <PhoneFrame>
      <View
        style={{
          height: MEDIA_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: COLORS.subtext, textAlign: "center" }}>
          {message}
        </Text>
      </View>
    </PhoneFrame>
  );
}

/** Steps through a procedure's slides in a phone-sized frame. */
export function SlidesPreviewModal({
  slides,
  startIndex,
  onClose,
}: {
  slides: Slide[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const slide = slides[index];

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.85)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 16,
        }}
      >
        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "700" }}>
          Preview: slide {index + 1} of {slides.length}
        </Text>
        {slide ? <PhoneSlide key={slide.id} slide={slide} /> : null}
        <Row gap={12}>
          <Button
            label="‹ Previous"
            variant="secondary"
            disabled={index === 0}
            onPress={() => setIndex((i) => i - 1)}
          />
          <Button
            label="Next ›"
            variant="secondary"
            disabled={index >= slides.length - 1}
            onPress={() => setIndex((i) => i + 1)}
          />
          <Button label="Close" variant="ghost" onPress={onClose} />
        </Row>
      </View>
    </Modal>
  );
}
