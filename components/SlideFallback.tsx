import { contactEmail } from "@/constants/references";
import Constants from "expo-constants";
import { Component, type ReactNode } from "react";
import {
  Alert,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** How long media may load before the slide shows the fallback instead. */
export const SLIDE_LOAD_TIMEOUT_MS = 20_000;

/** Where a slide sits, so a report says exactly which one failed. */
export type SlideReportInfo = {
  procedure: string;
  /** Route to the procedure, e.g. /procedures/4-tricuspid-valve/t-teer */
  path: string;
  slideNumber: number;
  slideCount: number;
  slideType: string;
  uri?: string;
};

function reportEmailUrl(info: SlideReportInfo, problem: string) {
  const subject = `Slide problem: ${info.procedure}, slide ${info.slideNumber}`;
  const link =
    Platform.OS === "web" && typeof window !== "undefined"
      ? `${window.location.origin}${info.path}?slide=${info.slideNumber - 1}`
      : `${info.path}?slide=${info.slideNumber - 1}`;
  const body = [
    "Describe anything else you noticed (optional):",
    "",
    "",
    "--- Details for the developer ---",
    `Procedure: ${info.procedure}`,
    `Slide: ${info.slideNumber} of ${info.slideCount} (${info.slideType})`,
    `Problem: ${problem}`,
    `Link: ${link}`,
    info.uri ? `Media: ${info.uri}` : null,
    `App: ${Constants.expoConfig?.version ?? "unknown"} on ${Platform.OS}`,
    Platform.OS === "web" && typeof navigator !== "undefined"
      ? `Browser: ${navigator.userAgent}`
      : `OS version: ${Platform.Version}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function openReport(info: SlideReportInfo, problem: string) {
  try {
    await Linking.openURL(reportEmailUrl(info, problem));
  } catch {
    // No mail app set up. Give them the address instead.
    Alert.alert(
      "Couldn't open email",
      `Please email ${contactEmail} and mention ${info.procedure}, slide ${info.slideNumber}.`,
    );
  }
}

const buttonStyle = {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 8,
  backgroundColor: "rgba(255,255,255,0.2)",
};

/**
 * Shown in place of a slide that failed to load: an apology, Retry (when the
 * slide can try again) and Report problem (when we know which slide it is).
 * Always white on black, like the media area it replaces.
 */
export function SlideFallback({
  problem,
  onRetry,
  report,
}: {
  /** Technical description, included in the report email. */
  problem: string;
  onRetry?: () => void;
  report?: SlideReportInfo;
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        // Clears the web carousel's prev/next arrows.
        paddingHorizontal: 56,
        gap: 12,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 17,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        Sorry, this slide couldn&apos;t be loaded.
      </Text>
      <Text
        style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: 15,
          lineHeight: 21,
          textAlign: "center",
        }}
      >
        {onRetry
          ? "Check your connection and try again. If it keeps happening, let us know."
          : "Let us know and we'll fix it."}
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {onRetry ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onRetry}
            style={buttonStyle}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Retry
            </Text>
          </TouchableOpacity>
        ) : null}
        {report ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => void openReport(report, problem)}
            style={buttonStyle}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Report problem
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

/** Catches a slide that crashes while rendering so the rest of the carousel keeps working. */
export class SlideErrorBoundary extends Component<
  { children: ReactNode; report?: SlideReportInfo },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
          <SlideFallback
            problem={`Slide crashed: ${this.state.error.message}`}
            onRetry={() => this.setState({ error: null })}
            report={this.props.report}
          />
        </View>
      );
    }
    return this.props.children;
  }
}
