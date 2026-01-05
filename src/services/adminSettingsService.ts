import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/services/firebase";

/* ---------------------------------------------
   GET ADMIN WHATSAPP NUMBER
--------------------------------------------- */
export async function getAdminWhatsAppNumber(): Promise<string | null> {
  try {
    const ref = doc(db, "adminSettings", "contact");
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();
    return data?.whatsappNumber || null;
  } catch (err) {
    console.error("Failed to load WhatsApp number", err);
    return null;
  }
}
