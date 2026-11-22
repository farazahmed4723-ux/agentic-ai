import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { runOrchestratorPipeline } from '@/lib/agents/orchestrator';
import { syncGoogleSheets } from '@/lib/integrations/sheets';
import { dispatchDailyDiscordSummary } from '@/lib/agents/reporting-agent';
import { processOutreachQueue } from '@/lib/agents/outreach-agent';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ success: false, reply: 'Please enter a command.' });
    }

    const systemPrompt = `You are the AI Command Center Controller for "AI by Faraz — Agentic Lead Engine".
You control the entire multi-agent lead generation and automation platform via natural language.

CURRENT SYSTEM CONTEXT:
- Total Leads in DB: ${db.getLeads().length}
- Verified Leads: ${db.getLeads().filter((l) => l.businessVerificationStatus === 'Verified Business').length}
- Hot Leads (Score 80+): ${db.getLeads().filter((l) => l.leadOpportunityScore >= 80).length}
- Active Campaigns: ${db.getCampaigns().length}
- Scheduler Status: ${db.getScheduler().paused ? 'Paused' : 'Active (09:00 AM America/Toronto)'}

CAPABILITIES & ACTIONS:
1. "DISCOVER_LEADS": When user asks to find/discover leads (e.g. "Find 50 movers in Vancouver", "Find limousine companies in Toronto").
   Extract: niche, city, country, count.
2. "SYNC_SHEETS": When user asks to sync leads/reports with Google Sheets.
3. "SEND_DISCORD_REPORT": When user asks to send summary or report to Discord.
4. "SEND_OUTREACH": When user asks to send approved outreach emails or run outreach queue.
5. "PAUSE_CAMPAIGNS": When user asks to pause campaigns or scheduler.
6. "RESUME_CAMPAIGNS": When user asks to resume campaigns or scheduler.
7. "GENERAL_QUERY": Answering questions, summarizing leads, strategy recommendations.

INSTRUCTIONS:
Classify the intent and respond in valid JSON with:
{
  "action": "DISCOVER_LEADS" | "SYNC_SHEETS" | "SEND_DISCORD_REPORT" | "SEND_OUTREACH" | "PAUSE_CAMPAIGNS" | "RESUME_CAMPAIGNS" | "GENERAL_QUERY",
  "actionParams": {
    "niche": "string",
    "city": "string",
    "country": "string",
    "count": number
  },
  "explanation": "Clear, friendly, conversational reply describing what you are executing or answering."
}`;

    const aiRes = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        ...(history || []).slice(-4),
        { role: 'user', content: message },
      ],
      { temperature: 0.2, maxTokens: 1000, responseFormat: 'json_object' }
    );

    let reply = 'I have received your command and evaluated the system state.';
    let actionResult: any = null;

    if (aiRes.success && aiRes.data) {
      const data = aiRes.data;
      reply = data.explanation || reply;

      // Execute matched action
      switch (data.action) {
        case 'DISCOVER_LEADS': {
          const niche = data.actionParams?.niche || 'Limousine Services';
          const city = data.actionParams?.city || 'Toronto';
          const country = data.actionParams?.country || 'Canada';
          const count = Math.min(data.actionParams?.count || 10, 25); // safe limit for real-time prompt

          actionResult = await runOrchestratorPipeline({
            campaignName: `${city} ${niche} Command Run`,
            niche,
            city,
            country,
            targetCount: count,
          });
          reply = `🎯 Orchestrator executed lead discovery for **${count} ${niche}** in **${city}, ${country}**! Discovered and enriched ${actionResult.leadsCount} leads, identified ${actionResult.hotLeadsCount} hot opportunities, and prepared personalized outreach drafts.`;
          break;
        }

        case 'SYNC_SHEETS': {
          const syncRes = await syncGoogleSheets();
          reply = `📊 Google Sheets synchronized! All 12 tabs updated with ${syncRes.totalRecordsSynced} records.`;
          actionResult = syncRes;
          break;
        }

        case 'SEND_DISCORD_REPORT': {
          const discordRes = await dispatchDailyDiscordSummary();
          reply = `📢 Dispatched daily executive performance report to Discord webhook!`;
          actionResult = discordRes;
          break;
        }

        case 'SEND_OUTREACH': {
          const sendRes = await processOutreachQueue();
          reply = `📧 Outreach batch executed! Sent ${sendRes.sentCount} approved personalized emails.`;
          actionResult = sendRes;
          break;
        }

        case 'PAUSE_CAMPAIGNS': {
          db.updateScheduler({ paused: true });
          reply = `⏸️ All automated campaign schedules and background queues have been paused.`;
          break;
        }

        case 'RESUME_CAMPAIGNS': {
          db.updateScheduler({ paused: false });
          reply = `▶️ Automated campaign schedules resumed! Daily trigger set for 9:00 AM America/Toronto.`;
          break;
        }

        default:
          // Keep conversational reply from AI
          break;
      }
    } else {
      // Deterministic fallback regex
      const lower = message.toLowerCase();
      if (lower.includes('sync') && lower.includes('sheet')) {
        await syncGoogleSheets();
        reply = 'Synchronized all 12 tabs to Google Sheets.';
      } else if (lower.includes('discord')) {
        await dispatchDailyDiscordSummary();
        reply = 'Dispatched executive performance summary to Discord.';
      } else {
        reply = `Understood: "${message}". You can ask me to find leads (e.g. "Find 20 movers in Vancouver"), sync to Google Sheets, send Discord reports, or adjust campaign schedules.`;
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      actionResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, reply: `Error executing command: ${error.message}` }, { status: 500 });
  }
}
