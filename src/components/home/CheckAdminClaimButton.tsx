import React, { useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { auth } from "../../../src/services/firebase"; // ✅ YOUR REAL FILE

export default function CheckAdminClaimButton() {
  const [claims, setClaims] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkClaims() {
    try {
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setError("❌ No logged-in user");
        return;
      }

      const token = await user.getIdTokenResult(true);
      console.log("TOKEN CLAIMS:", token.claims);

      setClaims(token.claims);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <View style={{ marginTop: 20 }}>
      <Button title="Check Admin Claim" onPress={checkClaims} />

      {error && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}

      {claims && (
        <ScrollView
          style={{
            marginTop: 15,
            padding: 10,
            backgroundColor: "#eee",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Token Claims:</Text>
          <Text>{JSON.stringify(claims, null, 2)}</Text>
        </ScrollView>
      )}
    </View>
  );
}
