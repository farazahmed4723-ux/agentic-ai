# Production Deployment & Background Worker Guide
## AI by Faraz — Agentic Lead Engine

---

## 1. Deploying to Vercel (Frontend & Serverless API)

The application is built on Next.js 15+ App Router and is fully optimized for one-click deployment to Vercel.

### Step-by-Step Deployment:
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Configure Environment Variables in the Vercel Project Settings:
   - `OPENROUTER_API_KEY`: Your OpenRouter API Key
   - `OPENROUTER_DEFAULT_MODEL`: `anthropic/claude-3.5-sonnet`
   - `APP_TIMEZONE`: `America/Toronto`
   - `DEFAULT_DAILY_LEAD_TARGET`: `50`
   - `DISCORD_WEBHOOK_URL`: (Optional) Discord Webhook for alerts
   - `GOOGLE_SHEETS_ID`: (Optional) Master Google Sheet ID
4. Click **Deploy**.

---

## 2. Server-Side Autonomous Cron Scheduler

To trigger the complete multi-agent workflow every day at **9:00 AM America/Toronto** even when browser tabs are closed:

### Method A: Vercel Cron Jobs (Recommended for Vercel)
Add a `vercel.json` file in the root directory:
```json
{
  "crons": [
    {
      "path": "/api/scheduler",
      "schedule": "0 13 * * *"
    }
  ]
}
```
*(Note: 13:00 UTC corresponds to 9:00 AM EDT / America/Toronto).*

### Method B: Persistent Background Worker (Node.js / Docker)
For dedicated servers (Render, Railway, Fly.io, or VPS), run the dedicated scheduler runner:
```bash
node -e "setInterval(() => fetch('http://localhost:3000/api/scheduler', {method:'POST', body: JSON.stringify({action:'RUN_NOW'})}), 86400000)"
```

---

## 3. Persistent Database Configuration
- The project defaults to the zero-dependency atomic JSON/SQLite database in `./data/db.json` with ACID-style rename safety.
- For multi-instance horizontal scaling, connect Supabase or PostgreSQL by providing `DATABASE_URL` and running Prisma migrations.
