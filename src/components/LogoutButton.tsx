import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { Button } from "react-native";
import { auth } from "../../src/services/firebase";

export default function LogoutButton() {
  async function logout() {
    await signOut(auth);
    router.replace("/login");
  }

  return <Button title="🚪 Logout" onPress={logout} />;
}
