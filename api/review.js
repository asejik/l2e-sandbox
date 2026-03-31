export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, title, description } = req.body;
    const apiKey = process.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
       return res.status(400).json({ error: 'Server configuration error: Groq API Key missing.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a friendly, expert Go programming mentor. The user just passed a code test. Provide a short, encouraging 2-3 sentence review. Tell them what they did right, and suggest 1 alternative standard Go practice they could use in the future. Be concise, do not output markdown headers."
          },
          {
            role: "user",
            content: `Task: ${title}\nDescription: ${description}\n\nTheir Code:\n${code}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error reaching Groq API.' });
  }
}
