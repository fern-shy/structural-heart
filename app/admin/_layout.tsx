import {
  AdminScreen,
  Button,
  Card,
  COLORS,
  Field,
  Muted,
  PageTitle,
  Row,
} from "@/components/admin/ui";
import { HeaderBackButton } from "@/components/HeaderBackButton";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(
        e instanceof Error ? friendlyAuthError(e.message) : "Sign-in failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminScreen>
      <PageTitle
        title="Content Editor"
        subtitle="Sign in to manage procedures and slides."
      />
      {!isFirebaseConfigured ? (
        <Card>
          <Text style={{ color: COLORS.danger }}>
            Firebase is not configured. Add your EXPO_PUBLIC_FIREBASE_* values to
            .env and restart.
          </Text>
        </Card>
      ) : (
        <Card>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            onSubmitEditing={submit}
          />
          {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}
          <Button label="Sign in" onPress={submit} loading={busy} />
        </Card>
      )}
    </AdminScreen>
  );
}

function friendlyAuthError(message: string): string {
  if (message.includes("invalid-credential") || message.includes("wrong-password"))
    return "Incorrect email or password.";
  if (message.includes("user-not-found"))
    return "No account with that email. Create one in the Firebase console.";
  if (message.includes("too-many-requests"))
    return "Too many attempts. Try again later.";
  return "Sign-in failed. Check your email and password.";
}

function NotAuthorized() {
  const { user, signOut } = useAuth();
  return (
    <AdminScreen>
      <PageTitle title="Not authorized" />
      <Card>
        <Text style={{ color: COLORS.text }}>
          You are signed in as {user?.email}, but this account does not have edit
          access.
        </Text>
        <Muted>
          Ask an administrator to grant access by running:
          {"\n"}
          npm run set-admin -- {user?.email}
        </Muted>
        <Row>
          <Button label="Sign out" variant="secondary" onPress={signOut} />
        </Row>
      </Card>
    </AdminScreen>
  );
}

function AdminGate() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) return <LoginForm />;
  if (!isAdmin) return <NotAuthorized />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        contentStyle: { backgroundColor: COLORS.bg },
        // Web-only: replace the missing native-stack back PNG with a vector icon.
        ...(Platform.OS === "web"
          ? { headerLeft: () => <HeaderBackButton tint={COLORS.text} /> }
          : {}),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Content Editor" }} />
      <Stack.Screen name="category" options={{ title: "Category" }} />
      <Stack.Screen name="subtopic" options={{ title: "Procedure" }} />
    </Stack>
  );
}

export default function AdminLayout() {
  return (
    <AuthProvider>
      <AdminGate />
    </AuthProvider>
  );
}
