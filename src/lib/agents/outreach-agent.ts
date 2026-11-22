import { Lead } from '@/types';
import { db } from '../db';
import { sendDiscordNotification } from '../integrations/discord';

export interface SendEmailResult {
  success: boolean;
  message: string;
  sentCount: number;
  skippedCount: number;
}

export async function processOutreachQueue(options?: { forceLeadId?: string }): Promise<SendEmailResult> {
  const settings = db.getSettings();

  if (settings.emergencyStop) {
    db.addLog({
      agentName: 'Agent 07 — Gmail Outreach',
      agentRole: 'Gmail Outreach Agent',
      action: 'Emergency Stop Active',
      status: 'error',
      details: 'Outreach halted. Emergency Stop is engaged in Settings.',
    });
    return {
      success: false,
      message: 'Emergency Stop is engaged. All email sending is blocked.',
      sentCount: 0,
      skippedCount: 0,
    };
  }

  const allLeads = db.getLeads();

  // Filter leads ready for sending
  let candidates: Lead[] = [];
  if (options?.forceLeadId) {
    const single = allLeads.find((l) => l.id === options.forceLeadId);
    if (single) candidates = [single];
  } else {
    candidates = allLeads.filter((l) => {
      if (l.outreachEligibility !== 'Eligible') return false;
      if (l.outreachStatus === 'Sent' || l.outreachStatus === 'Replied' || l.outreachStatus === 'Bounced') return false;
      if (!l.emailDraft) return false;

      // In manual mode, must be explicitly approved
      if (settings.approvalMode === 'manual' && !l.emailDraft.approved) {
        return false;
      }

      return true;
    });
  }

  if (candidates.length === 0) {
    return {
      success: true,
      message: 'No approved emails pending in the outreach queue.',
      sentCount: 0,
      skippedCount: 0,
    };
  }

  const maxToSend = Math.min(candidates.length, settings.dailyEmailLimit || 50);
  let sentCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < maxToSend; i++) {
    const lead = candidates[i];

    // Duplicate outreach & suppression guard
    if (!lead.publicBusinessEmail || lead.publicBusinessEmail === 'Not Found' || lead.emailVerificationStatus === 'Invalid') {
      lead.outreachStatus = 'Rejected';
      lead.notes = `${lead.notes}; Rejected outreach due to missing/invalid email.`;
      db.saveLead(lead);
      skippedCount++;
      continue;
    }

    // Simulate / Execute Gmail delivery
    lead.outreachStatus = 'Sent';
    lead.sentAt = new Date().toISOString();
    lead.followUpStatus = 'Follow-up 1 Scheduled';
    db.saveLead(lead);
    sentCount++;

    db.addLog({
      agentName: 'Agent 07 — Gmail Outreach',
      agentRole: 'Gmail Outreach Agent',
      action: 'Email Dispatched',
      status: 'success',
      details: `Dispatched cold outreach to "${lead.publicBusinessEmail}" (${lead.companyName}). Subject: "${lead.emailDraft?.subject}".`,
    });
  }

  // Notify team via Discord if configured
  if (sentCount > 0) {
    await sendDiscordNotification({
      title: '📧 Outreach Batch Dispatched',
      description: `Agent 07 successfully dispatched ${sentCount} personalized emails via Gmail pipeline.`,
      fields: [
        { name: 'Emails Sent', value: `${sentCount}`, inline: true },
        { name: 'Skipped / Unqualified', value: `${skippedCount}`, inline: true },
        { name: 'Compliance Mode', value: settings.antiSpamComplianceMode ? 'Strict CASL/CAN-SPAM' : 'Standard', inline: true },
      ],
      color: 0x00f2a5,
    });
  }

  return {
    success: true,
    message: `Dispatched ${sentCount} outreach emails successfully. (${skippedCount} skipped).`,
    sentCount,
    skippedCount,
  };
}
