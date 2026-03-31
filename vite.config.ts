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
