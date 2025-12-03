import { Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../src/store/authStore";

export default function RootLayout() {
  const { init } = useAuth();

  useEffect(() => {
    init(); // initialize auth listener
  }, [init]);

  return <Slot />;
}
