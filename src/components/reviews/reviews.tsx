import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../../src/services/firebase";

/* ----------------------------------------------------------
   TYPES
---------------------------------------------------------- */
type Review = {
  id: string;
  productId: string;
  userName: string;
  userId: string;
  comment: string;
  rating: number;
  images?: string[];
  createdAt?: any;
  sellerReply?: string | null;
  approved?: boolean;
  hidden?: boolean;
};

/* ----------------------------------------------------------
   DASHBOARD COMPONENT
---------------------------------------------------------- */
export default function AdminReviewDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterNoReply, setFilterNoReply] = useState(false);
  const [filterHidden, setFilterHidden] = useState(false);

  // Reply modal inline
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  /* ----------------------------------------------------------
     LOAD REVIEWS
  ---------------------------------------------------------- */
  async function loadReviews() {
    setLoading(true);

    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const list: Review[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Review[];

    setReviews(list);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  /* ----------------------------------------------------------
     FILTERED LIST
  ---------------------------------------------------------- */
  const filtered = reviews.filter((rev) => {
    if (search && !rev.comment.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (filterRating && rev.rating !== filterRating) return false;

    if (filterNoReply && rev.sellerReply) return false;

    if (filterHidden && !rev.hidden) return false;

    return true;
  });

  /* ----------------------------------------------------------
     ACTIONS: DELETE, HIDE, APPROVE, REPLY
  ---------------------------------------------------------- */

  async function deleteReview(id: string) {
    Alert.alert("Confirm", "Delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "reviews", id));
          loadReviews();
        },
      },
    ]);
  }

  async function toggleHidden(id: string, value: boolean) {
    await updateDoc(doc(db, "reviews", id), { hidden: value });
    loadReviews();
  }

  async function approveReview(id: string) {
    await updateDoc(doc(db, "reviews", id), { approved: true });
    loadReviews();
  }

  async function sendReply() {
    if (!selectedReview) return;

    const fn = httpsCallable(functions, "replyToReview");

    await fn({
      reviewId: selectedReview.id,
      replyText,
    });

    setReplyText("");
    setSelectedReview(null);
    loadReviews();
  }

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>Review Moderation</Text>

      {/* Search */}
      <TextInput
        placeholder="Search reviews..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* FILTERS */}
      <View style={styles.filterRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.filterBtn,
              filterRating === n && styles.filterBtnActive,
            ]}
            onPress={() => setFilterRating(n === filterRating ? null : n)}
          >
            <Text
              style={[
                styles.filterBtnTxt,
                filterRating === n && styles.filterBtnTxtActive,
              ]}
            >
              {n}★
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.filterBtn, filterNoReply && styles.filterBtnActive]}
          onPress={() => setFilterNoReply(!filterNoReply)}
        >
          <Text
            style={[
              styles.filterBtnTxt,
              filterNoReply && styles.filterBtnTxtActive,
            ]}
          >
            No Reply
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterHidden && styles.filterBtnActive]}
          onPress={() => setFilterHidden(!filterHidden)}
        >
          <Text
            style={[
              styles.filterBtnTxt,
              filterHidden && styles.filterBtnTxtActive,
            ]}
          >
            Hidden
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 20 }}
        />
      )}

      {/* REVIEWS LIST */}
      {filtered.map((rev) => (
        <View key={rev.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.user}>{rev.userName}</Text>
            <Text style={styles.rating}>⭐ {rev.rating}</Text>
          </View>

          <Text style={styles.comment}>{rev.comment}</Text>

          {/* IMAGES */}
          {rev.images?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {rev.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.img} />
              ))}
            </ScrollView>
          ) : null}

          {/* EXISTING ADMIN REPLY */}
          {rev.sellerReply ? (
            <View style={styles.replyBox}>
              <Text style={styles.replyLabel}>Admin Reply:</Text>
              <Text style={styles.replyText}>{rev.sellerReply}</Text>
            </View>
          ) : null}

          {/* ACTION BUTTONS */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => approveReview(rev.id)}
            >
              <Text style={styles.actionTxt}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toggleHidden(rev.id, !rev.hidden)}
            >
              <Text style={styles.actionTxt}>
                {rev.hidden ? "Unhide" : "Hide"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setSelectedReview(rev);
                setReplyText(rev.sellerReply ?? "");
              }}
            >
              <Text style={styles.actionTxt}>Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ff4d4d" }]}
              onPress={() => deleteReview(rev.id)}
            >
              <Text style={styles.actionTxt}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* INLINE REPLY EDITOR */}
      {selectedReview && (
        <View style={styles.replyEditor}>
          <Text style={styles.replyEditorTitle}>
            Reply to {selectedReview.userName}
          </Text>

          <TextInput
            placeholder="Write your reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
            style={styles.replyInput}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendReply}>
            <Text style={styles.sendTxt}>Send Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setSelectedReview(null)}
          >
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ----------------------------------------------------------
   STYLES
---------------------------------------------------------- */
const styles = StyleSheet.create({
  page: { backgroundColor: "#f6f6f6" },
  header: { fontSize: 26, fontWeight: "700", marginBottom: 16 },
  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#ddd",
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  filterBtnActive: { backgroundColor: "#222" },
  filterBtnTxt: { color: "#333" },
  filterBtnTxtActive: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  user: { fontWeight: "600" },
  rating: { fontWeight: "700", color: "#f39c12" },
  comment: { marginTop: 6, marginBottom: 12, color: "#444" },
  img: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  replyBox: {
    backgroundColor: "#fdf5d2",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  replyLabel: { fontWeight: "700" },
  replyText: { marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  actionBtn: {
    backgroundColor: "#222",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  actionTxt: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
  },
  replyEditor: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 50,
  },
  replyEditorTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  replyInput: {
    minHeight: 80,
    backgroundColor: "#eee",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  sendBtn: {
    backgroundColor: "#27ae60",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  sendTxt: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
  },
  cancelTxt: {
    textAlign: "center",
    fontWeight: "700",
  },
});
