export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { body } = req;
    const { code } = body;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // Go playground requires a form url-encoded body with:
    // "version=2&body=code"
    const params = new URLSearchParams();
    params.append('version', '2');
    params.append('body', code);

    const response = await fetch('https://play.golang.org/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error compiling:', error);
    res.status(500).json({ error: 'Internal server error while speaking to Go Sandbox' });
  }
}
