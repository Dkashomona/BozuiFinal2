import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../services/firebase";

type Props = {
  review: any;
  onReply: () => void;
  onReload: () => void;
};

export default function AdminReviewCard({ review, onReply, onReload }: Props) {
  async function deleteReview() {
    await deleteDoc(doc(db, "reviews", review.id));
    onReload();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{review.userName}</Text>
      <Text style={styles.rating}>Rating: {review.rating}⭐</Text>

      <Text style={styles.comment}>{review.comment}</Text>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <ScrollView horizontal>
          {review.images.map((img: string, i: number) => (
            <Image key={i} source={{ uri: img }} style={styles.img} />
          ))}
        </ScrollView>
      )}

      <Text style={styles.meta}>
        Verified: {review.verified ? "Yes" : "No"}
      </Text>

      {/* Seller Reply */}
      {review.sellerReply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Seller Reply:</Text>
          <Text style={styles.replyText}>{review.sellerReply.text}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.replyBtn} onPress={onReply}>
          <Text style={styles.replyBtnTxt}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={deleteReview}>
          <Text style={styles.deleteBtnTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: { fontSize: 16, fontWeight: "700" },
  rating: { marginTop: 4, fontWeight: "600" },
  comment: { marginTop: 6, fontSize: 14 },

  img: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 8,
  },

  meta: {
    color: "#555",
    fontSize: 12,
    marginTop: 6,
  },

  replyBox: {
    backgroundColor: "#f7f7f7",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  replyLabel: { fontWeight: "700" },
  replyText: { marginTop: 4 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  replyBtn: {
    backgroundColor: "#2c3e50",
    padding: 10,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  replyBtnTxt: { color: "white", fontWeight: "700" },

  deleteBtn: {
    backgroundColor: "#c0392b",
    padding: 10,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  deleteBtnTxt: { color: "white", fontWeight: "700" },
});
