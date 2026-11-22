error: failed to push some refs to 'https://github.com/farazahmed4723-ux/agentic-ai.git'# AI by Faraz — Agentic Lead Engine
> **Autonomous Multi-Agent AI Lead Generation, Business Intelligence, CRM & Personalized Email Outreach Platform**

Built with Next.js 15, TypeScript, Tailwind CSS, React Flow, and OpenRouter AI. Featuring the **Agent Control Room** designed after the **Foundry Agent Canvas** case study (`chatgpt_image.png`).

---

## 🌟 Visual Theme & Design Signatures
The platform incorporates the ultra-sleek **Foundry Agent Canvas** aesthetic:
- **Obsidian Dark Palette**: `#070b0e` / `#0a0f13` with subtle glassmorphism and fine hairline borders.
- **The 4 Accent Colors**:
  - 🟢 **Mint (`#00F2A5`)**: Triggers, success pills, deploy buttons, verified status.
  - 🟣 **Violet (`#8B5CF6`)**: AI models, orchestration nodes, prompt editors, intelligence cards.
  - 🟡 **Amber (`#F59E0B`)**: Tool calls, web discovery, PostgreSQL dedup queries, warm leads.
  - 🔴 **Coral (`#F97316`)**: Actions, CRM persistence, Slack/Discord dispatch, priority hot leads.
- **React Flow Interactive Canvas**: Custom nodes with live execution status pulses, tool badges, and inspector panels for prompt editing, temperature sliders, token accounting, and cost tracking.

---

## 🤖 The 8 Specialized Autonomous Agents

1. **Master AI Orchestrator**: Understands user goals, formulates dependency plans, routes tasks, and maintains persistent campaign memory.
2. **Agent 01 — Scheduler & Trigger Agent**: Daily 9:00 AM America/Toronto autonomous trigger, DST handling, pause/resume, and duplicate protection.
3. **Agent 02 — Global Lead Discovery Agent**: Multi-source research (Google Places, public business registries, and AI research synthesis) matching natural language commands.
4. **Agent 03 — Lead Verification & Classification Agent**: Evaluates domains, corporate registries, and phone consistency, scoring confidence 0–100 and quarantining suspicious leads.
5. **Agent 04 — Business Data Enrichment Agent**: Normalizes phone, emails, addresses, social profiles, and enforces all 27 standard database fields with zero hallucinated data.
6. **Agent 05 — AI Business Intelligence & Website Audit Agent**: Audits digital presence (page speed, mobile responsiveness, missing online booking, missing 24/7 AI chatbots), computing an Opportunity Score (Hot 80–100, Warm 60–79, Cold <60).
7. **Agent 06 — Personalized Email Copywriting Agent**: Drafts high-converting, non-spammy cold emails with personalized hooks, evidence observations, solutions, CTAs, and automated 3-day and 7-day follow-up sequences.
8. **Agent 07 — Gmail Outreach & Follow-up Agent**: Human-in-the-loop approval queue, CASL/CAN-SPAM compliance guards, daily send quotas, reply detection, and emergency stop.
9. **Agent 08 — Reporting & Analytics Agent**: Synthesizes pipeline qualification rates, cost per lead, top-performing niches, and dispatches executive Discord summaries.

---

## 🧭 Navigation & 20 Complete Dashboard Pages

1. **Overview Dashboard** (`/`): Real-time KPI counters, 8-agent fleet status strip, hot leads spotlight.
2. **AI Command Center** (`/command-center`): ChatGPT-style natural language interface that executes real pipeline actions.
3. **Agent Control Room** (`/control-room`): The Foundry interactive React Flow canvas with node inspector and test run triggers.
4. **Lead Finder** (`/lead-finder`): Natural language prompt research and structured geographic filtering.
5. **All Leads** (`/leads`): 27-field CRM table with search, filters, slide-over drawer, and CSV export.
6. **Verified Leads** (`/leads/verified`): Prospects with verification confidence &gt; 70% and proof evidence.
7. **Hot Leads** (`/leads/hot`): High-opportunity targets (Score 80–100) with instant email triggers.
8. **Suspicious Leads** (`/leads/suspicious`): Quarantined leads with flags, approve-as-genuine, and delete actions.
9. **Website Audits** (`/audits`): Detailed digital health scorecard and identified friction points.
10. **Campaigns** (`/campaigns`): Multi-agent campaign pipeline manager.
11. **Email Composer** (`/emails/composer`): AI email studio with initial email, follow-up 1, and follow-up 2.
12. **Email Approval Queue** (`/emails/queue`): Human-in-the-loop review interface before Gmail dispatch.
13. **Outreach Inbox** (`/inbox`): Two-way conversation tracking, replies, and sentiment analysis.
14. **Google Sheets** (`/sheets`): 12-tab continuous sync and CSV/Excel downloads.
15. **Discord Notifications** (`/discord`): Real-time team webhook pings and daily summaries.
16. **Automation Scheduler** (`/scheduler`): Server-side cron configuration for 9:00 AM America/Toronto.
17. **Analytics & Reports** (`/analytics`): Interactive conversion funnels and AI strategic scaling recommendations.
18. **Activity Logs** (`/logs`): Structured JSON audit trail of all agent actions.
19. **Integrations** (`/integrations`): OpenRouter AI gateway, Google Places, Sheets, and Gmail OAuth.
20. **Settings** (`/settings`): Sender brand voice ("AI by Faraz"), anti-spam guards, and master emergency stop.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` (pre-configured with OpenRouter API key):
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
APP_TIMEZONE="America/Toronto"
DEFAULT_DAILY_LEAD_TARGET=50
```

### 3. Run Automated Tests
```bash
node tests/e2e-test.mjs
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the complete application.

---

## 🔒 Security & Anti-Spam Compliance
- **Emergency Stop Master Switch**: Instantly halts all outgoing emails and background queues from the UI.
- **CASL & CAN-SPAM Compliance**: Mandatory physical address headers, one-click unsubscribe links, and automatic sequence cancellation upon reply.
- **Zero Hallucination Guarantee**: Strict fallback heuristics ensure no fake personal names or deceptive contact data is generated.
- **Encrypted Credentials**: API keys and OAuth secrets remain strictly on the server.
