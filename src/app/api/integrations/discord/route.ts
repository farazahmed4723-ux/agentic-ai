import { NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/integrations/discord';
import { dispatchDailyDiscordSummary } from '@/lib/agents/reporting-agent';
import { db } from '@/lib/db';

export async function GET() {
  const info = db.getDiscordWebhookInfo();
  const settings = db.getSettings();
  return NextResponse.json({
    success: true,
    webhookConfigured: !!settings.discordWebhookUrl,
    info,
  });
}

export async function POST(request: Request) {
  try {
    const { action, webhookUrl } = await request.json();

    if (action === 'TEST_WEBHOOK') {
      const res = await sendDiscordNotification(
        {
          title: '⚡ Discord Webhook Test Connection',
          description: 'Connection test from **AI by Faraz — Agentic Lead Engine** was successful! Real-time alerts and daily digests are operational.',
          color: 0x00f2a5,
        },
        webhookUrl
      );
      return NextResponse.json(res);
    }

    if (action === 'SEND_DAILY_SUMMARY') {
      const res = await dispatchDailyDiscordSummary();
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
