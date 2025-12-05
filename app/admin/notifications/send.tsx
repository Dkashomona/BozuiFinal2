import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { router, type Href } from "expo-router";
import { db, functions } from "../../../src/services/firebase";
import {
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function SendNotification() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [targetUser, setTargetUser] = useState("ALL");

  useEffect(() => {
    async function loadUsers() {
      const snap = await getDocs(collection(db, "users"));
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setUsers(list);
    }
    loadUsers();
  }, []);

  const sendNotificationFn = httpsCallable(functions, "sendPushNotification");

  const send = async () => {
    if (!title || !body) {
      alert("Please fill out title & body");
      return;
    }

    let recipients: any[] = [];

    if (targetUser === "ALL") {
      recipients = users.filter((u) => u.pushToken);
    } else {
      recipients = users.filter((u) => u.id === targetUser && u.pushToken);
    }

    if (recipients.length === 0) {
      alert("No valid push tokens found");
      return;
    }

    for (let user of recipients) {
      await sendNotificationFn({
        token: user.pushToken,
        title,
        body,
      });
    }

    await addDoc(collection(db, "notifications"), {
      title,
      body,
      target: targetUser,
      createdAt: serverTimestamp(),
    });

    alert("Notification sent!");
    router.back();
  };

  return (
    <ScrollView style={styles.page}>
      {/* 🔙 FIXED BACK BUTTON (valid typed route) */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={
          () => router.push("/admin/notifications/index" as Href) // ✔ FIXED
        }
      >
        <Text style={styles.backBtnText}>← Back to Notifications</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Send Notification</Text>

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Message"
        style={[styles.input, { height: 100 }]}
        value={body}
        multiline
        onChangeText={setBody}
      />

      <Text style={styles.label}>Send To:</Text>

      <TouchableOpacity
        style={[styles.selector, targetUser === "ALL" && styles.selectorActive]}
        onPress={() => setTargetUser("ALL")}
      >
        <Text style={styles.selectorText}>ALL USERS</Text>
      </TouchableOpacity>

      {users.map((u) => (
        <TouchableOpacity
          key={u.id}
          style={[
            styles.selector,
            targetUser === u.id && styles.selectorActive,
          ]}
          onPress={() => setTargetUser(u.id)}
        >
          <Text style={styles.selectorText}>{u.email}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={send}>
        <Text style={styles.buttonText}>Send Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#fff" },

  backBtn: { paddingVertical: 10, marginBottom: 10 },
  backBtnText: { color: "#e67e22", fontSize: 16, fontWeight: "600" },

  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  label: { marginTop: 20, fontWeight: "700", fontSize: 16 },

  selector: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 6,
  },
  selectorActive: {
    borderColor: "#e67e22",
    backgroundColor: "#fdf2e9",
  },
  selectorText: { fontSize: 14 },

  button: {
    marginTop: 30,
    backgroundColor: "#e67e22",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
});
