import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../services/firebase";

type AdminReplyProps = {
  review: any | null; // <-- REQUIRED
  onClose: () => void; // <-- REQUIRED
  onSuccess: () => Promise<void>; // <-- REQUIRED
};

export default function AdminReviewReplyModal({
  review,
  onClose,
  onSuccess,
}: AdminReplyProps) {
  const [text, setText] = useState("");

  if (!review) return null;

  async function sendReply() {
    if (text.trim().length < 2) {
      alert("Reply must be at least 2 characters.");
      return;
    }

    try {
      const replyFn = httpsCallable(functions, "replyToReview");
      await replyFn({
        reviewId: review.id,
        replyText: text,
      });

      setText("");
      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Reply error:", err);
      alert("Failed to send reply.");
    }
  }

  return (
    <Modal transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Reply to {review.userName}</Text>

          <TextInput
            placeholder="Write your reply..."
            style={styles.input}
            value={text}
            multiline
            onChangeText={setText}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.send} onPress={sendReply}>
              <Text style={styles.sendTxt}>Send Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* --------------------- STYLES --------------------- */
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f2f2f2",
    minHeight: 80,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
  cancelTxt: { fontWeight: "600" },
  send: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  sendTxt: { color: "#fff", fontWeight: "700" },
});
