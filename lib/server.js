// Shared helpers for the Vercel API routes (kept in /lib so Vercel doesn't expose it as an endpoint)
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;

export const PAYHERO = "https://backend.payhero.co.ke/api/v2";

export const basicAuth = () =>
  "Basic " + Buffer.from(`${process.env.PAYHERO_API_USERNAME}:${process.env.PAYHERO_API_PASSWORD}`).toString("base64");

export function normalizePhone(raw) {
  const m = String(raw || "").replace(/\s/g, "").match(/^(?:\+?254|0)(\d{9})$/);
  return m ? "0" + m[1] : null; // PayHero example format: 0712345678
}