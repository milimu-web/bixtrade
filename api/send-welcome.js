export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'BrixTrade', email: 'noreply@brixtrade.co.ke' },
        to: [{ email: email, name: name || 'Trader' }],
        subject: 'Welcome to BrixTrade! 🎉',
        htmlContent: `<h1>Welcome ${name || 'Trader'}!</h1><p>Thanks for joining BrixTrade. Your account is ready.</p>`
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Brevo failed' });
    }
    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}