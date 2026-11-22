import { db } from '../db';

export interface DiscordNotificationPayload {
  title: string;
  description: string;
  color?: number; // Hex integer, e.g. 0x00F2A5 for mint, 0x8B5CF6 for violet
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

export async function sendDiscordNotification(
  payload: DiscordNotificationPayload,
  overrideWebhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  const settings = db.getSettings();
  const webhookUrl = overrideWebhookUrl || settings.discordWebhookUrl;

  if (!webhookUrl) {
    db.addLog({
      agentName: 'Discord Integration',
      agentRole: 'Notification Dispatcher',
      action: 'Notification Skipped',
      status: 'warning',
      details: 'Discord Webhook URL is not configured. Notification was not dispatched.',
    });
    return {
      success: false,
      message: 'Discord Webhook URL is not configured in Settings.',
    };
  }

  try {
    const discordBody = {
      username: 'AI by Faraz — Lead Engine',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
      embeds: [
        {
          title: payload.title,
          description: payload.description,
          color: payload.color ?? 0x00f2a5, // Default Mint #00F2A5
          fields: payload.fields || [],
          footer: payload.footer || { text: 'AI by Faraz • Autonomous Multi-Agent Engine' },
          timestamp: payload.timestamp || new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordBody),
    });

    if (response.ok || response.status === 204) {
      db.updateDiscordWebhookInfo({
        lastTestStatus: 'Success',
        lastTestTimestamp: new Date().toISOString(),
        webhookUrl,
      });

      db.addLog({
        agentName: 'Discord Integration',
        agentRole: 'Notification Dispatcher',
        action: 'Dispatched Webhook',
        status: 'success',
        details: `Successfully sent Discord notification: "${payload.title}"`,
      });

      return { success: true, message: 'Discord notification dispatched successfully.' };
    } else {
      const errText = await response.text();
      db.updateDiscordWebhookInfo({
        lastTestStatus: 'Failed',
        lastTestTimestamp: new Date().toISOString(),
      });

      db.addLog({
        agentName: 'Discord Integration',
        agentRole: 'Notification Dispatcher',
        action: 'Webhook Failed',
        status: 'error',
        details: `Discord webhook rejected with status ${response.status}: ${errText}`,
      });

      return { success: false, message: `Discord rejected notification (Status ${response.status})` };
    }
  } catch (error: any) {
    db.addLog({
      agentName: 'Discord Integration',
      agentRole: 'Notification Dispatcher',
      action: 'Network Exception',
      status: 'error',
      details: error.message || 'Failed to dispatch Discord webhook',
    });
    return { success: false, message: error.message || 'Network error connecting to Discord' };
  }
}
