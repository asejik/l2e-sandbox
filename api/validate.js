export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'Groq API key not configured.' });
  }

  const { title, description, answer } = req.body;

  const systemPrompt = `You are a friendly and encouraging Go programming mentor reviewing a student's written explanation.

Your goal is to check whether the student has made a genuine attempt to explain the concept. Be generous and supportive.

Rules:
- Reply ONLY with a valid JSON object in this exact shape: { "valid": true, "feedback": "..." } or { "valid": false, "feedback": "..." }
- Set "valid" to TRUE if the student has made any reasonable attempt to explain the concept — even if incomplete or imperfect. Partial understanding is fine.
- Set "valid" to FALSE ONLY if the answer is completely blank, total nonsense/gibberish, or entirely off-topic with zero relevance to the question.
- The "feedback" field must always be warm and encouraging (1-2 sentences). If valid, celebrate what they got right. If invalid, gently hint at what direction to take.
- Do NOT penalise imperfect phrasing, typos, or incomplete sentences. Reward effort.
- Do NOT include any text outside the JSON object. No markdown, no code blocks.`;

  const userPrompt = `Question Title: ${title}
Question Description: ${description}

Student's Answer (written as code comments):
${answer}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Groq API error' });
    }

    const content = data.choices?.[0]?.message?.content || '';

    // Parse the JSON the model returned
    const parsed = JSON.parse(content.trim());
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to validate answer: ' + err.message });
  }
}
