import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export const COLORS = {
  bg: "#0f1220",
  card: "#1a1f36",
  cardBorder: "#2b3252",
  text: "#f5f7ff",
  subtext: "#aab2d5",
  primary: "#0B4DFF",
  danger: "#e5484d",
  inputBg: "#12162a",
};

/** Centered, max-width, scrollable page shell that reads well in a browser. */
export function AdminScreen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{
        padding: 24,
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%", maxWidth: 1100, gap: 16 }}>{children}</View>
    </ScrollView>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "700" }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: COLORS.subtext, fontSize: 14 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderColor: COLORS.cardBorder,
        borderWidth: 1,
        borderRadius: 12,
        position: "relative",
        padding: 16,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}

export function Field({
  label,
  hint,
  ...inputProps
}: { label: string; hint?: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: "600" }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={COLORS.subtext}
        style={{
          backgroundColor: COLORS.inputBg,
          borderColor: COLORS.cardBorder,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: COLORS.text,
          fontSize: 15,
          minHeight: inputProps.multiline ? 120 : undefined,
          textAlignVertical: inputProps.multiline ? "top" : "center",
        }}
        {...inputProps}
      />
      {hint ? (
        <Text style={{ color: COLORS.subtext, fontSize: 12 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  small,
}: ButtonProps) {
  const bg =
    variant === "primary"
      ? COLORS.primary
      : variant === "danger"
        ? COLORS.danger
        : variant === "secondary"
          ? COLORS.cardBorder
          : "transparent";
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={{
        backgroundColor: bg,
        borderRadius: 8,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: COLORS.cardBorder,
        paddingHorizontal: small ? 12 : 16,
        paddingVertical: small ? 8 : 12,
        opacity: isDisabled ? 0.5 : 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
      }}
    >
      {loading ? <ActivityIndicator size="small" color={COLORS.text} /> : null}
      <Text
        style={{
          color: COLORS.text,
          fontWeight: "600",
          fontSize: small ? 13 : 15,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Row({
  children,
  gap = 8,
}: {
  children: ReactNode;
  gap?: number;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap }}>
      {children}
    </View>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={{ color: COLORS.subtext, fontSize: 13 }}>{children}</Text>;
}
