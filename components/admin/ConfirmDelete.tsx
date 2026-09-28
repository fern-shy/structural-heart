import { useCallback, useState, type ReactNode } from "react";
import { Modal, Text, View } from "react-native";
import { Button, COLORS, Field, Row } from "./ui";

const CONFIRM_WORD = "yes";

export type DeleteRequest = {
  title: string;
  message: string;
  /** Runs only after the user types "Yes"; the dialog stays open until it settles. */
  action: () => Promise<void>;
};

/**
 * Two-step delete: pressing Delete opens a dialog, and nothing is removed until
 * the user types "Yes" and confirms. Render `deleteDialog` somewhere in the screen.
 */
export function useDeleteConfirmation(): {
  requestDelete: (request: DeleteRequest) => void;
  deleteDialog: ReactNode;
} {
  const [request, setRequest] = useState<DeleteRequest | null>(null);
  const requestDelete = useCallback((r: DeleteRequest) => setRequest(r), []);
  const deleteDialog = request ? (
    <ConfirmDeleteDialog request={request} onClose={() => setRequest(null)} />
  ) : null;
  return { requestDelete, deleteDialog };
}

function ConfirmDeleteDialog({
  request,
  onClose,
}: {
  request: DeleteRequest;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = typed.trim().toLowerCase() === CONFIRM_WORD;

  const submit = async () => {
    if (!confirmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await request.action();
      onClose();
    } catch {
      setError("Delete failed. Check your connection and try again.");
      setBusy(false);
    }
  };

  const cancel = () => {
    if (!busy) onClose();
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={cancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.65)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            backgroundColor: COLORS.card,
            borderColor: COLORS.danger,
            borderWidth: 1,
            borderRadius: 12,
            padding: 20,
            gap: 14,
          }}
        >
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}>
            {request.title}
          </Text>
          <Text style={{ color: COLORS.subtext, fontSize: 14, lineHeight: 20 }}>
            {request.message}
          </Text>
          <Field
            label='Type "Yes" to confirm'
            value={typed}
            onChangeText={setTyped}
            autoFocus
            autoCorrect={false}
            editable={!busy}
            onSubmitEditing={submit}
            placeholder="Yes"
          />
          {error ? <Text style={{ color: COLORS.danger }}>{error}</Text> : null}
          <Row>
            <View style={{ flex: 1 }} />
            <Button label="Cancel" variant="ghost" onPress={cancel} disabled={busy} />
            <Button
              label={busy ? "Deleting…" : "Delete permanently"}
              variant="danger"
              onPress={submit}
              disabled={!confirmed}
              loading={busy}
            />
          </Row>
        </View>
      </View>
    </Modal>
  );
}
