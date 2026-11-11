// POST /api/deposit  { usd, phone }   Header: Authorization: Bearer <firebase id token>
// Sends the M-Pesa STK push through PayHero.
import { db, auth, FieldValue, PAYHERO, basicAuth, normalizePhone } from "../lib/server.js";

const USD_TO_KES = Number(process.env.USD_TO_KES || 130); // keep the same as your website's rate
const MIN_USD = 1;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // 1. Who is this? (verified server-side, can't be faked)
  let user;
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    user = await auth.verifyIdToken(token);
  } catch (e) {
    return res.status(401).json({ error: "Please log in again." });
  }
  const uid = user.uid;

  // 2. Validate input
  const usd = Number(req.body?.usd);
  const phone = normalizePhone(req.body?.phone);
  if (!(usd >= MIN_USD)) return res.status(400).json({ error: `Minimum deposit is $${MIN_USD}` });
  if (!phone) return res.status(400).json({ error: "Invalid Kenyan phone number" });

  const kes = Math.round(usd * USD_TO_KES); // calculated here, never trusted from the browser
  const reference = "dep_" + uid.slice(0, 6) + "_" + Date.now();
  const depRef = db.collection("deposits").doc(reference);

  await depRef.set({ uid, usd, kes, phone, reference, status: "pending", createdAt: FieldValue.serverTimestamp() });

  // 3. Send the STK push
  try {
    const host = process.env.SITE_URL || `https://${req.headers.host}`;
    const resp = await fetch(`${PAYHERO}/payments`, {
      method: "POST",
      headers: { Authorization: basicAuth(), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: kes,
        phone_number: phone,
        channel_id: Number(process.env.PAYHERO_CHANNEL_ID),
        provider: "m-pesa",
        external_reference: reference,
        customer_name: user.name || "Customer",
        callback_url: `${host}/api/payhero-callback?k=${encodeURIComponent(process.env.PAYHERO_WEBHOOK_KEY)}`,
      }),
    });
    const json = await resp.json();
    if (!resp.ok || !json.success) throw new Error(json.error_message || json.message || "PayHero rejected the request");

    // Keep PayHero's own reference so we can double-check the payment later
    await depRef.update({ payheroRef: json.reference || null, checkoutRequestId: json.CheckoutRequestID || null });
    return res.status(200).json({ reference, message: "Check your phone and enter your M-Pesa PIN." });
  } catch (e) {
    await depRef.update({ status: "failed", error: String(e.message || e) });
    return res.status(502).json({ error: "Could not send M-Pesa prompt. Try again." });
  }
}