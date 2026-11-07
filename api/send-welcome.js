const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const v = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken: token })
      }
    );
    const vd = await v.json();
    const user = vd.users && vd.users[0];
    if (!v.ok || !user || !user.email) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const rawName = (req.body && req.body.name) || user.displayName || 'Trader';
    const safeName = esc(String(rawName).slice(0, 60));

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'BrixTrade', email: 'noreply@brixtrade.co.ke' },
        to: [{ email: user.email, name: safeName }],
        subject: 'Welcome to BrixTrade! 🎉',
        htmlContent: `
          <img src="https://www.brixtrade.co.ke/logo.png" alt="BrixTrade" width="160" style="display:block;margin-bottom:16px">
          <h1>Welcome ${safeName}!</h1>
          <p>Thanks for joining BrixTrade. Your account is ready.</p>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Brevo failed' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}