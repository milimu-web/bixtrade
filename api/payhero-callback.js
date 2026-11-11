// POST /api/payhero-callback?k=WEBHOOK_KEY   (PayHero calls this when the payment finishes)
// This is the ONLY place a balance is credited.
import { db, FieldValue, PAYHERO, basicAuth } from "../lib/server.js";

export default async function handler(req, res) {
  if (req.query.k !== process.env.PAYHERO_WEBHOOK_KEY) return res.status(401).end();

  // Some PayHero callbacks nest the details in body.response
  const body = req.body || {};
  const p = body.response || body;
  const ext = p.ExternalReference || p.external_reference || body.external_reference;
  if (!ext) return res.status(200).end();

  const depRef = db.collection("deposits").doc(String(ext));
  const snap = await depRef.get();
  if (!snap.exists) return res.status(200).end();
  const d = snap.data();
  if (d.status !== "pending") return res.status(200).end(); // already handled

  // Do NOT trust the callback alone. Ask PayHero directly.
  let verified = false;
  if (d.payheroRef) {
    try {
      const v = await fetch(`${PAYHERO}/transaction-status?reference=${encodeURIComponent(d.payheroRef)}`, {
        headers: { Authorization: basicAuth() },
      }).then((r) => r.json());
      verified = v.status === "SUCCESS";
    } catch (e) { /* treated as not verified */ }
  }

  if (verified) {
    // If the callback includes an amount, it must match what we asked for
    const cbAmount = p.Amount ?? p.amount;
    if (cbAmount !== undefined && Number(cbAmount) !== d.kes) return res.status(200).end();

    await db.runTransaction(async (t) => {
      const dep = await t.get(depRef);
      if (dep.data().status !== "pending") return; // someone else got there first
      const userRef = db.collection("users").doc(d.uid);
      const u = (await t.get(userRef)).data() || {};

      t.set(userRef, { balance: FieldValue.increment(d.usd) }, { merge: true });
      t.update(depRef, { status: "success", paidAt: FieldValue.serverTimestamp() });

      // Referral bonus (moved here from the browser)
      if (u.referredBy && !u.referralRewarded) {
        const refUser = db.collection("users").doc(u.referredBy);
        t.set(refUser, { balance: FieldValue.increment(5) }, { merge: true });
        t.set(userRef, { referralRewarded: true }, { merge: true });
        t.set(refUser.collection("referrals").doc(d.uid), { bonusAwarded: true, bonusDate: new Date() }, { merge: true });
      }
    });
  } else {
    // Not a verified success. If the callback says failed/cancelled, mark it failed.
    const code = p.ResultCode ?? p.result_code;
    const st = String(p.Status || p.status || "").toLowerCase();
    if ((code !== undefined && Number(code) !== 0) || st === "failed" || st === "cancelled") {
      await depRef.update({ status: "failed", reason: p.ResultDesc || null });
    }
  }

  return res.status(200).end();
}