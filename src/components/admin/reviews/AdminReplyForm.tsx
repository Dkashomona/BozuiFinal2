import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../services/firebase";

export default function AdminReplyForm({
  reviewId,
  existingReply,
  onDone,
}: any) {
  const [text, setText] = useState(existingReply || "");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (text.trim().length < 2) return alert("Reply is too short.");

    setLoading(true);

    try {
      const fn = httpsCallable(functions, "replyToReview");
      await fn({ reviewId, replyText: text.trim() });

      alert("Reply posted!");
      onDone?.();
    } catch (err: any) {
      console.error(err);
      alert("Error sending reply: " + err.message);
    }

    setLoading(false);
  }

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Admin Reply</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write your reply..."
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnTxt}>
          {loading ? "Saving..." : "Post Reply"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  label: { fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "#f3f3f3",
    padding: 8,
    borderRadius: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
  },
  btnTxt: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
