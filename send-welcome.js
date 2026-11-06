export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'No email' });
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'BrixTrade', email: 'info@brixtrade.co.ke' },
      to: [{ email: email, name: name || 'Trader' }],
      subject: 'Congratulations! Welcome to BrixTrade 🎉',
      htmlContent: `
        <div style="font-family:Arial;padding:20px;text-align:center">
          <h1 style="color:#6366f1">Congratulations, ${name || 'Trader'}! 🎉</h1>
          <p>Welcome to <b>BrixTrade</b>. Your account is now ACTIVE.</p>
          <p>Demo Balance: <b>$1,000.00</b></p>
          <p>Build. Trade. Grow.</p>
          <a href="https://brixtrade.co.ke/trade.html" style="background:#6366f1;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;display:inline-block;margin-top:10px">Enter Trading Room →</a>
          <p style="font-size:12px;color:#888;margin-top:20px">Need help? support@brixtrade.co.ke | +254-102-252-424</p>
        </div>
      `
    })
  });
  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: err });
  }
  return res.status(200).json({ success: true });
}