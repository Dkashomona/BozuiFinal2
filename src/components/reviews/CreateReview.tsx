import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import * as ImagePicker from "expo-image-picker";

// Upload helper
import { uploadReviewImage } from "../../services/reviews/uploadImageService";

type Props = {
  productId: string;
  onSubmitted?: () => void;
};

export default function CreateReview({ productId, onSubmitted }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  /* ----------------------------------------------------------
     GET USER NAME FROM FIRESTORE
  ---------------------------------------------------------- */
  async function getUserName(uid: string): Promise<string> {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        return (
          data.fullname ||
          data.name ||
          data.username ||
          data.userName ||
          "Anonymous"
        );
      }
    } catch (err) {
      console.error("Failed to load user name:", err);
    }

    return "Anonymous";
  }

  /* ----------------------------------------------------------
     PICK IMAGES (max 5)
  ---------------------------------------------------------- */
  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const selected = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...selected].slice(0, 5));
    }
  }

  /* ----------------------------------------------------------
     SUBMIT REVIEW (With Duplicate Prevention)
  ---------------------------------------------------------- */
  async function submit() {
    const user = auth.currentUser;
    if (!user) return alert("Please sign in to review.");

    if (rating === 0) return alert("Select a rating.");
    if (text.trim().length < 5) return alert("Write a longer review.");

    setUploading(true);

    // 1. Prevent duplicate reviews using deterministic ID
    const reviewId = `${user.uid}_${productId}`;
    const reviewRef = doc(db, "reviews", reviewId);
    const existing = await getDoc(reviewRef);

    if (existing.exists()) {
      setUploading(false);
      return alert("You already reviewed this product.");
    }

    // 2. Load Firestore name
    const userName = await getUserName(user.uid);

    // 3. Upload review images
    const uploadedUrls: string[] = [];
    for (const uri of images) {
      const url = await uploadReviewImage(uri, user.uid);
      uploadedUrls.push(url);
    }

    // 4. Save review
    await setDoc(reviewRef, {
      id: reviewId,
      productId,
      userId: user.uid,
      userName,
      rating,
      comment: text,
      images: uploadedUrls,
      createdAt: Timestamp.now(),
      verified: false,
      sellerReply: null,
      likes: 0,
      likedBy: [],
    });

    // 5. Reset UI
    setRating(0);
    setText("");
    setImages([]);
    setUploading(false);

    alert("Review posted!");
    onSubmitted?.();
  }

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Write a Review</Text>

      {/* RATING */}
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)}>
            <Text style={[styles.star, rating >= n && styles.starActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* COMMENT */}
      <TextInput
        placeholder="Share your experience..."
        multiline
        value={text}
        onChangeText={setText}
        style={styles.input}
      />

      {/* IMAGE PREVIEW */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.img} />
          ))}
        </ScrollView>
      )}

      {/* PICK IMAGES */}
      <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
        <Text style={styles.addImageTxt}>Add Images ({images.length}/5)</Text>
      </TouchableOpacity>

      {/* SUBMIT */}
      <TouchableOpacity
        disabled={uploading}
        style={[styles.submitBtn, uploading && { opacity: 0.6 }]}
        onPress={submit}
      >
        <Text style={styles.submitTxt}>
          {uploading ? "Uploading..." : "Submit Review"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----------------------------------------------------------
   STYLES
---------------------------------------------------------- */
const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  star: {
    fontSize: 32,
    color: "#ccc",
    marginRight: 6,
  },
  starActive: {
    color: "#f1c40f",
  },
  input: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 8,
    minHeight: 70,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  img: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
  },
  addImageBtn: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  addImageTxt: {
    textAlign: "center",
    fontWeight: "600",
    color: "#555",
  },
  submitBtn: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  submitTxt: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});
