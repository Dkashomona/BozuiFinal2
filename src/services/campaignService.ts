import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { Campaign } from "../models/Campaign";
import { db } from "./firebase";

export async function getCampaigns(): Promise<Campaign[]> {
  const snap = await getDocs(collection(db, "campaigns"));

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Campaign[];
}

export async function createCampaign(id: string, data: any, bannerUrl: string) {
  await setDoc(doc(db, "campaigns", id), {
    ...data,
    bannerImage: bannerUrl,
    isActive: true,   // OPTIONAL if you want filtering
    createdAt: new Date(),
  });
}
