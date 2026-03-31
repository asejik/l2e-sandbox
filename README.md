# Learn2Earn Sandbox 🚀

An interactive, AI-powered Go programming sandbox designed to teach and validate standard Go practices through a curriculum-driven, game-like learning experience.

Built for internal use by **Sogo Ayenigba**.

---

## Features

### 🎓 Curriculum-Driven Learning
- Structured challenges: **Go Fundamentals**, **Go-Reloaded**, and **ASCII-Art**
- Exercises are unlocked sequentially — complete one to unlock the next
- Progress is automatically saved to browser storage between sessions

### 🖥️ Professional IDE Experience
- **3-column layout**: Sidebar → Monaco Code Editor → Question Panel + Terminal
- Monaco Editor with Go syntax highlighting
- Draggable, resizable split panes for a personalised workspace
- Real-time code compilation via the Go Playground API

### 🤖 AI Mentor (Groq / Llama 3)
- Every successful submission triggers an **AI code review**
- The AI mentor provides personalised, encouraging feedback
- Suggests alternative Go patterns and best practices
- Powered by Groq's ultra-fast `llama-3.1-8b-instant` inference

### ✅ Static Code Analysis
- Enforces curriculum requirements (e.g. required variable names, loop patterns)
- Detects forbidden implementation patterns
- Automatically strips boilerplate comments before analysis to prevent false positives

### 🔄 Progress Management
- **Reset All** — wipe all progress across every curriculum
- **Reset per-curriculum** — reset only "Go-Reloaded" without touching "Go Fundamentals"
- Available both on the Dashboard cards and inside the active challenge sidebar
- Custom-designed, animated confirmation dialogs (no native browser popups)

### 🎨 Glassmorphism Design
- Deep dark theme with ambient emerald + indigo glow orbs
- Subtle grid texture overlay for depth
- Glassmorphism cards with `backdrop-filter: blur` throughout
- Smooth Framer Motion animations for all state transitions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (Vite) |
| Styling | Tailwind CSS v4 |
| State | Zustand (with `persist` middleware) |
| Animations | Framer Motion |
| Editor | Monaco Editor (via `@monaco-editor/react`) |
| Data Fetching | TanStack React Query |
| AI Feedback | Groq API (`llama-3.1-8b-instant`) |
| Deployment | Vercel (Serverless Functions for API) |

---

## Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone git@github.com:asejik/l2e-sandbox.git
cd l2e-sandbox
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project:

```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```

> Get a free API key at [console.groq.com](https://console.groq.com)

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deploying to Vercel

1. Push to GitHub (this repo).
2. Import the project into [Vercel](https://vercel.com).
3. In **Project Settings → Environment Variables**, add:
   ```
   VITE_GROQ_API_KEY = gsk_your_groq_api_key_here
   ```
4. Deploy. Vercel auto-detects Vite and the `/api` serverless functions.

> **Note:** The `/api/compile.js` and `/api/review.js` files act as secure backend proxies on Vercel, preventing API key leakage to the browser.

---

## Project Structure

```
├── api/
│   ├── compile.js        # Vercel serverless: proxies to Go Playground
│   └── review.js         # Vercel serverless: proxies to Groq API
├── public/
│   └── favicon.svg       # Custom SVG favicon
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx    # Reusable custom confirmation dialog
│   │   ├── Dashboard.tsx       # Challenge selection + global progress
│   │   ├── EditorPane.tsx      # Monaco code editor wrapper
│   │   ├── FeedbackModal.tsx   # AI mentor overlay (post-submission)
│   │   ├── QuestionPanel.tsx   # Exercise instructions panel
│   │   ├── Sidebar.tsx         # Challenge navigation + per-curriculum reset
│   │   └── TerminalPane.tsx    # Code runner + static analysis + submit logic
│   ├── data/
│   │   └── questions.json      # Curriculum data (challenges + exercises)
│   ├── layout/
│   │   └── SplitPaneLayout.tsx # Draggable 3-pane IDE layout
│   ├── store/
│   │   └── useAssessmentStore.ts  # Zustand global state
│   └── index.css               # Global styles + glassmorphism ambient effects
├── vercel.json                 # SPA routing fallback config
└── vite.config.ts              # Vite config + local dev proxy middleware
```

---

## Curriculum

### Go Fundamentals
Introductory exercises covering Go syntax, data types, and basic control flow.

### Go-Reloaded
8 intermediate exercises covering string manipulation, parsing, loops, and standard library usage. Exercises enforce specific code patterns using static analysis.

### ASCII-Art *(coming soon)*
Advanced challenges focused on grid rendering and character manipulation.

---

## License

Internal use only — Zone01 Kisumu.
