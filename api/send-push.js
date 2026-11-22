/* POST /api/send-push   (admins only: a user whose id exists in the "admins" collection)
   Body: { title, body, url?, uid? }   -> no uid = send to EVERYONE who turned on alerts */
const { getAdmin } = require('./_push');

const ALLOWED_ORIGINS = ['https://admin-gamma-rouge.vercel.app'];

function cors(req, res) {
  const o = req.headers.origin;
  if (ALLOWED_ORIGINS.indexOf(o) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
}

module.exports = async function (req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const a = getAdmin();
    const db = a.firestore();

    const h = req.headers.authorization || '';
    const idt = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!idt) return res.status(401).json({ error: 'Not signed in' });
    const caller = await a.auth().verifyIdToken(idt);
    const adm = await db.collection('admins').doc(caller.uid).get();
    if (!adm.exists) return res.status(403).json({ error: 'Admins only' });

    const b = req.body || {};
    const title = String(b.title || '').trim().slice(0, 80);
    const body = String(b.body || '').trim().slice(0, 300);
    const url = (typeof b.url === 'string' && b.url.charAt(0) === '/') ? b.url : '/trade.html';
    if (!title || !body) return res.status(400).json({ error: 'Title and message are required' });

    const snap = b.uid
      ? await db.collection('users').doc(String(b.uid)).collection('fcmTokens').get()
      : await db.collectionGroup('fcmTokens').get();

    const docs = snap.docs;
    let sent = 0;
    const dead = [];

    for (let i = 0; i < docs.length; i += 500) {
      const chunk = docs.slice(i, i + 500);
      const r = await a.messaging().sendEachForMulticast({
        tokens: chunk.map(function (d) { return d.id; }),
        data: { title: title, body: body, url: url },
        webpush: { headers: { Urgency: 'high', TTL: '86400' } }
      });
      sent += r.successCount;
      r.responses.forEach(function (x, j) {
        const code = (x.error && x.error.code) || '';
        if (!x.success && /not-registered|invalid-registration|invalid-argument/.test(code)) dead.push(chunk[j].ref);
      });
    }
    await Promise.all(dead.map(function (ref) { return ref.delete(); }));

    return res.status(200).json({ devices: docs.length, sent: sent });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};