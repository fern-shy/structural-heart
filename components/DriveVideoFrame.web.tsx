import { View } from "react-native";

/**
 * Web-only: renders a Google Drive video via its preview player in an <iframe>.
 * Drive videos can't be played in a cross-origin HTML5 <video> element, so this
 * is the reliable way to show them on the web build.
 */
export default function DriveVideoFrame({ url }: { url: string }) {
  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
      <iframe
        src={url}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </View>
  );
}
