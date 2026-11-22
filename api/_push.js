/* Shared helper. The underscore keeps Vercel from exposing it as a public URL.
   Needs env var FIREBASE_SERVICE_ACCOUNT (the service-account JSON as one line).
   If your other api files already set up firebase-admin under another env name, change it below. */
const admin = require('firebase-admin');

function getAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return admin;
}

/* sendPush(uid, 'Title', 'Message', '/profile.html') -> number of devices reached */
async function sendPush(uid, title, body, url) {
  const a = getAdmin();
  const db = a.firestore();
  const snap = await db.collection('users').doc(uid).collection('fcmTokens').get();
  const tokens = snap.docs.map(function (d) { return d.id; });
  if (!tokens.length) return 0;

  const res = await a.messaging().sendEachForMulticast({
    tokens: tokens,
    data: { title: String(title), body: String(body), url: url || '/trade.html' },
    webpush: { headers: { Urgency: 'high', TTL: '86400' } }
  });

  /* remove devices that are no longer valid */
  const dead = [];
  res.responses.forEach(function (r, i) {
    const code = (r.error && r.error.code) || '';
    if (!r.success && /not-registered|invalid-registration|invalid-argument/.test(code)) dead.push(tokens[i]);
  });
  await Promise.all(dead.map(function (t) {
    return db.collection('users').doc(uid).collection('fcmTokens').doc(t).delete();
  }));
  return res.successCount;
}

module.exports = { getAdmin, sendPush };