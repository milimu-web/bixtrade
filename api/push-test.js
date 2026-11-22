/* POST /api/push-test  (signed-in users only; sends a test push to their OWN devices) */
const { getAdmin, sendPush } = require('./_push');

module.exports = async function (req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const h = req.headers.authorization || '';
    const idt = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!idt) return res.status(401).json({ error: 'Not signed in' });
    const user = await getAdmin().auth().verifyIdToken(idt);
    const n = await sendPush(user.uid, 'Brixtrade alerts are on', 'You will get updates on deposits, withdrawals and verification.', '/trade.html');
    return res.status(200).json({ sent: n });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
