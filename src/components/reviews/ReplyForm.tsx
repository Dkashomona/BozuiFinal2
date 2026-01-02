import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function ReplyForm({ onSubmit }: any) {
  const [text, setText] = useState("");

  return (
    <View style={styles.box}>
      <TextInput
        placeholder="Write a reply..."
        value={text}
        onChangeText={setText}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          if (text.trim()) {
            onSubmit(text);
            setText("");
          }
        }}
      >
        <Text style={styles.btnTxt}>Reply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  btn: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 6,
  },
  btnTxt: {
    color: "white",
    textAlign: "center",
  },
});
