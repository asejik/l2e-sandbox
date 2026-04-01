import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const goProxyPlugin = (apiKey: string) => ({
  name: 'go-proxy-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api/compile', (req: any, res: any) => {
      let body = '';
      req.on('data', (chunk: string) => body += chunk);
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          const params = new URLSearchParams();
          params.append('version', '2');
          params.append('body', parsed.code);
          
          const response = await fetch('https://play.golang.org/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
          });
          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Proxy error internally.' }));
        }
      });
    });

    server.middlewares.use('/api/review', (req: any, res: any) => {
      let body = '';
      req.on('data', (chunk: string) => body += chunk);
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          
          if (!apiKey) {
             res.statusCode = 400;
             res.end(JSON.stringify({ error: 'Groq API Key missing in environment.' }));
             return;
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
                  content: `Task: ${parsed.title}\nDescription: ${parsed.description}\n\nTheir Code:\n${parsed.code}`
                }
              ],
              temperature: 0.7,
              max_tokens: 300
            })
          });
          const data = await response.text();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Groq proxy error internally.' }));
        }
      });
    });

    server.middlewares.use('/api/validate', (req: any, res: any) => {
      let body = '';
      req.on('data', (chunk: string) => body += chunk);
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);

          if (!apiKey) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Groq API Key missing in environment.' }));
            return;
          }

          const systemPrompt = `You are a friendly and encouraging Go programming mentor reviewing a student's written explanation.\n\nYour goal is to check whether the student has made a genuine attempt to explain the concept. Be generous and supportive.\n\nRules:\n- Reply ONLY with a valid JSON object in this exact shape: { "valid": true, "feedback": "..." } or { "valid": false, "feedback": "..." }\n- Set "valid" to TRUE if the student has made any reasonable attempt to explain the concept — even if incomplete or imperfect. Partial understanding is fine.\n- Set "valid" to FALSE ONLY if the answer is completely blank, total nonsense/gibberish, or entirely off-topic with zero relevance to the question.\n- The "feedback" field must always be warm and encouraging (1-2 sentences). If valid, celebrate what they got right. If invalid, gently hint at what direction to take.\n- Do NOT penalise imperfect phrasing, typos, or incomplete sentences. Reward effort.\n- Do NOT include any text outside the JSON object. No markdown, no code blocks.`;

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Question Title: ${parsed.title}\nQuestion Description: ${parsed.description}\n\nStudent's Answer (written as code comments):\n${parsed.answer}` }
              ],
              temperature: 0.2,
              max_tokens: 200,
            })
          });

          const data = await response.json() as any;
          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: data.error?.message || 'Groq API error' }));
            return;
          }

          const content = data.choices?.[0]?.message?.content || '';
          const result = JSON.parse(content.trim());
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Validate proxy error: ' + e.message }));
        }
      });
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      goProxyPlugin(env.VITE_GROQ_API_KEY)
    ]
  };
});
