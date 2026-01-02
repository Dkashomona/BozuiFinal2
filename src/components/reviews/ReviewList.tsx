import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ReviewItem from "./ReviewItem";
import CreateReview from "./CreateReview";

type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  verified?: boolean;
  createdAt?: any;
  likes?: number;
  likedBy?: string[];
  sellerReply?: {
    text: string;
    createdAt?: any;
  } | null;
};

type Props = {
  productId: string;
  user: any;
  reviews: Review[];
  reloadReviews: () => Promise<void>;
};

export default function ReviewList({
  productId,
  user,
  reviews,
  reloadReviews,
}: Props) {
  return (
    <View style={styles.container}>
      {/* WRITE REVIEW SECTION */}
      {user && (
        <CreateReview productId={productId} onSubmitted={reloadReviews} />
      )}

      {/* TITLE */}
      <Text style={styles.title}>Customer Reviews</Text>

      {/* REVIEWS LIST */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewItem
            review={item}
            currentUser={user}
            onUpdated={reloadReviews}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No reviews yet. Be the first!</Text>
        }
        scrollEnabled={false}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

/* ---------------------------- STYLES ---------------------------- */
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 20,
    color: "#777",
  },
});
