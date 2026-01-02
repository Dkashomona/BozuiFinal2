import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import OpenAI from "openai";

if (!admin.apps.length) {
  admin.initializeApp();
}

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const generateProductDescription = onCall(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
  },
  async (request) => {
    try {
      /* AUTH */
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Admin login required");
      }

      /* ROLE CHECK */
      const userSnap = await admin
        .firestore()
        .collection("users")
        .doc(request.auth.uid)
        .get();

      if (userSnap.data()?.role !== "admin") {
        throw new HttpsError("permission-denied", "Admins only");
      }

      /* OPENAI */
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });

      const name = String(request.data?.name || "").trim();
      const category = String(request.data?.category || "General").trim();
      const features = String(request.data?.features || "N/A").trim();
      const tone = String(
        request.data?.tone || "professional, modern, persuasive"
      ).trim();

      if (!name) {
        throw new HttpsError("invalid-argument", "Product name required");
      }

      const prompt = `
Write a premium e-commerce product description.

Product name: ${name}
Category: ${category}
Key features: ${features}
Tone: ${tone}

Requirements:
- 2 short paragraphs
- Clear customer benefits
- Luxury e-commerce tone
- No emojis
- No markdown
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 220,
      });

      const description =
        completion.choices?.[0]?.message?.content?.trim();

      if (!description) {
        throw new HttpsError(
          "internal",
          "OpenAI returned empty content"
        );
      }

      return { description };

    } catch (err: any) {
      console.error("AI FUNCTION ERROR:", err);

      // ✅ Convert ALL errors to HttpsError
      if (err instanceof HttpsError) {
        throw err;
      }

      throw new HttpsError(
        "internal",
        err?.message || "AI generation failed"
      );
    }
  }
);
