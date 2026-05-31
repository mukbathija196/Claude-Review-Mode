# Claude Review Mode

A research prototype that adds a structured **Review Panel** to AI chat responses — helping users critically evaluate claims, surface hidden assumptions, and identify what was left unsaid before acting on AI advice.

Built as part of an NL graduate project exploring how AI systems can support more informed, reflective decision-making.

---

## What it does

When you receive an AI response, a **"Review this response"** affordance appears below it. Clicking it opens a panel with three sections:

| Section | What it shows |
|---|---|
| **Claim Inspector** | Key claims extracted from the response, each with a confidence band (○ well established · ◐ with interpretation · ◔ best guess), the reasoning behind the confidence level, and what new information would change the view |
| **Assumption Map** | What the response assumed about your situation without asking — with context on why each assumption was made, what changes if it's wrong, and how to verify it |
| **What's Missing** | Items the response deferred, overlooked, or where reasonable people disagree — each with a one-click follow-up action |

A **Human Judgment Prompt** at the bottom of the panel surfaces one concrete thing to verify before acting.

### Active Correction Loop

Mark any assumption wrong (✗), describe what's actually true, and the AI regenerates the response with your correction applied. Corrections persist across the conversation and are visible as chips in the chat header.

### Stakes Detection

A keyword heuristic detects high-stakes prompts (medical, legal, financial, career) before extraction runs. A session-level "Treat as high-stakes" toggle lets you override this manually.

---

## Tech stack

| Concern | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| LLM (chat) | Groq API — `llama-3.3-70b-versatile` |
| LLM (extraction) | Groq API — `llama-3.1-8b-instant` |
| State | React `useState` + `localStorage` |

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/mukbathija196/Claude-Review-Mode.git
cd Claude-Review-Mode
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Groq API key

Create a `.env.local` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at [console.groq.com](https://console.groq.com). The free tier is sufficient for demo use (~30 requests/min, 1M tokens/day).

> **Never commit `.env.local`** — it is listed in `.gitignore`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project structure

```
src/
  types.ts                    # All TypeScript types
  App.tsx                     # Root component — all state lives here
  lib/
    groq.ts                   # Groq API client (with 15s timeout)
    extractor.ts              # Extraction pipeline
    prompts.ts                # System prompts (chat + extraction)
    stakes.ts                 # Keyword heuristic + affordance logic
    useLocalStorage.ts        # Persistent Set hook
  components/
    Sidebar.tsx
    ChatView.tsx
    MessageItem.tsx
    ReviewAffordance.tsx
    ReviewPanel.tsx
    ClaimInspector.tsx
    AssumptionMap.tsx
    WhatsMissing.tsx
    HumanJudgmentPrompt.tsx
    CorrectionChip.tsx
    InputBox.tsx
    WelcomeScreen.tsx
diagrams-simple.html          # Plain-English data flow + state diagrams
```

---

## Prototype disclaimers

- **Groq used in place of Claude API** — response quality and reasoning depth will be stronger in a production Claude implementation.
- **No source citation** — this prototype does not verify claims against external sources.
- **Confidence bands are illustrative, not calibrated against ground truth** — generated via prompting rather than validated calibration.
- **High-stakes detection uses a keyword heuristic, not a trained classifier** — a production implementation would use a fine-tuned model with validated precision/recall.

---

## Edge cases handled

- **Conflicting corrections** — surfaces a warning when 4+ assumptions are flagged wrong simultaneously
- **No load-bearing claims** — Claim Inspector shows an honest empty state rather than fabricating content
- **Trivial response suppression** — Review affordance is hidden for short replies, greetings, and clarifying questions
- **Extraction timeout** — 15-second AbortController timeout with one-click retry; chat is never blocked
