import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import ReviewStars from "./ReviewStars";
import { likeReview } from "../../services/reviews/reviewLikeService";

export default function ReviewItem({ review }: any) {
  const [likes, setLikes] = useState(review.likes ?? 0);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    try {
      const result = await likeReview(review.id);

      if (result.alreadyLiked) {
        setLiked(true);
        return;
      }

      setLikes((prev: number) => prev + 1);
      setLiked(true);
    } catch (err) {
      console.log("Like error:", err);
    }
  }

  return (
    <View style={styles.card}>
      {/* top row */}
      <View style={styles.row}>
        <ReviewStars rating={review.rating} size={18} />
        <Text style={styles.author}>{review.userName}</Text>
      </View>

      {/* comment */}
      <Text style={styles.comment}>{review.comment}</Text>

      {/* images */}
      {review.images?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {review.images.map((img: string, i: number) => (
            <Image key={i} source={{ uri: img }} style={styles.img} />
          ))}
        </ScrollView>
      )}

      {/* like button */}
      <TouchableOpacity
        style={styles.likeButton}
        disabled={liked}
        onPress={handleLike}
      >
        <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>♥</Text>
        <Text style={styles.likeCount}>{likes}</Text>
      </TouchableOpacity>

      {/* seller reply */}
      {review.sellerReply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Seller reply:</Text>
          <Text style={styles.replyText}>{review.sellerReply.text}</Text>

          {review.sellerReply.createdAt?.toMillis && (
            <Text style={styles.replyDate}>
              {new Date(review.sellerReply.createdAt.toMillis()).toDateString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#333",
  },
  comment: {
    marginTop: 8,
    fontSize: 14,
    color: "#444",
  },
  img: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  /* like button */
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  likeIcon: {
    fontSize: 20,
    color: "#bbb",
    marginRight: 6,
  },
  likeIconActive: {
    color: "red",
  },
  likeCount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },

  /* seller reply box */
  replyBox: {
    marginTop: 10,
    backgroundColor: "#f9f0d9",
    padding: 10,
    borderRadius: 8,
  },
  replyLabel: {
    fontWeight: "700",
    marginBottom: 4,
  },
  replyText: {
    color: "#555",
  },
  replyDate: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
  },
});
