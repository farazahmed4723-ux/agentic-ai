import { db } from '../db';
import { runOrchestratorPipeline } from './orchestrator';

export async function executeSchedulerTrigger(reason = 'Scheduled cron run'): Promise<{
  success: boolean;
  message: string;
  leadsDiscovered: number;
}> {
  const scheduler = db.getScheduler();
  const settings = db.getSettings();

  if (scheduler.paused) {
    db.addLog({
      agentName: 'Agent 01 — Scheduler',
      agentRole: 'Autonomous Trigger Agent',
      action: 'Execution Skipped',
      status: 'warning',
      details: 'Scheduler is currently paused by user. Automated trigger skipped.',
    });
    return { success: false, message: 'Scheduler is paused.', leadsDiscovered: 0 };
  }

  // Prevent duplicate execution within same hour unless forced
  if (scheduler.duplicateProtection && scheduler.lastExecutionAt && reason.includes('cron')) {
    const lastRunTime = new Date(scheduler.lastExecutionAt).getTime();
    const now = Date.now();
    const hoursSinceLast = (now - lastRunTime) / (1000 * 3600);
    if (hoursSinceLast < 1) {
      db.addLog({
        agentName: 'Agent 01 — Scheduler',
        agentRole: 'Autonomous Trigger Agent',
        action: 'Duplicate Protected',
        status: 'info',
        details: `Skipped trigger: Last run was ${hoursSinceLast.toFixed(1)}h ago (Duplicate protection active).`,
      });
      return { success: false, message: 'Duplicate run prevented within 1 hour.', leadsDiscovered: 0 };
    }
  }

  db.addLog({
    agentName: 'Agent 01 — Scheduler',
    agentRole: 'Autonomous Trigger Agent',
    action: 'Workflow Triggered',
    status: 'info',
    details: `Trigger fired: ${reason}. Timezone: ${scheduler.timezone}. Target: ${scheduler.targetLeadsPerDay} leads.`,
  });

  // Pick active campaign or default campaign
  const campaigns = db.getCampaigns();
  const targetCampaign = campaigns.find((c) => c.status === 'Active') || campaigns[0];

  const result = await runOrchestratorPipeline({
    campaignName: targetCampaign?.name || 'Daily Scheduled Discovery',
    niche: targetCampaign?.niche || 'Limousine and Chauffeur Services',
    city: targetCampaign?.city || 'Toronto',
    country: targetCampaign?.country || 'Canada',
    targetCount: Math.min(scheduler.targetLeadsPerDay || 50, settings.dailyEmailLimit || 50),
  });

  // Update Scheduler execution timestamps
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(9, 0, 0, 0);

  db.updateScheduler({
    lastExecutionAt: new Date().toISOString(),
    nextExecutionAt: nextRun.toISOString(),
  });

  return {
    success: result.success,
    message: result.message,
    leadsDiscovered: result.leadsCount,
  };
}
