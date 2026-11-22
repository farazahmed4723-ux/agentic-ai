import { db } from '../db';
import { executeLeadDiscovery, DiscoveryParams } from './discovery-agent';
import { executeBatchVerification } from './verification-agent';
import { enrichAndDeduplicateLeads } from './enrichment-agent';
import { auditLeadDigitalPresence } from './audit-agent';
import { generatePersonalizedEmailDraft } from './email-agent';
import { processOutreachQueue } from './outreach-agent';
import { sendDiscordNotification } from '../integrations/discord';
import { syncGoogleSheets } from '../integrations/sheets';
import { Lead } from '@/types';

export interface OrchestrationResult {
  success: boolean;
  message: string;
  leadsCount: number;
  verifiedCount: number;
  hotLeadsCount: number;
  draftsGeneratedCount: number;
  executionPlan: string[];
}

export async function runOrchestratorPipeline(params: {
  campaignName: string;
  niche: string;
  city: string;
  country: string;
  subNiche?: string;
  targetCount?: number;
  autoOutreach?: boolean;
}): Promise<OrchestrationResult> {
  const plan = [
    `Stage 1: Formulate execution plan for "${params.niche}" in ${params.city}, ${params.country}.`,
    `Stage 2: Delegate discovery to Agent 02 (Target: ${params.targetCount || 20} leads).`,
    `Stage 3: Delegate verification to Agent 03 (Classify confidence and flag suspicious leads).`,
    `Stage 4: Delegate normalization & deduplication to Agent 04.`,
    `Stage 5: Delegate digital presence audit & opportunity scoring to Agent 05.`,
    `Stage 6: Delegate personalized cold outreach drafting to Agent 06.`,
    `Stage 7: Synchronize records to Google Sheets and notify team via Discord.`,
  ];

  db.addLog({
    agentName: 'Master AI Orchestrator',
    agentRole: 'Central Coordination Engine',
    action: 'Execution Plan Created',
    status: 'info',
    details: `Initiated complete autonomous multi-agent pipeline for campaign: "${params.campaignName}". Target: ${params.targetCount || 20} leads.`,
  });

  // Stage 2: Lead Discovery
  const discoveryRes = await executeLeadDiscovery({
    niche: params.niche,
    subNiche: params.subNiche,
    city: params.city,
    country: params.country,
    targetCount: params.targetCount || 20,
    campaignName: params.campaignName,
  });

  if (!discoveryRes.success || discoveryRes.leads.length === 0) {
    db.addLog({
      agentName: 'Master AI Orchestrator',
      agentRole: 'Central Coordination Engine',
      action: 'Discovery Stalled',
      status: 'error',
      details: 'Agent 02 returned 0 leads. Pipeline aborted.',
    });
    return {
      success: false,
      message: 'Lead discovery failed to find candidate businesses.',
      leadsCount: 0,
      verifiedCount: 0,
      hotLeadsCount: 0,
      draftsGeneratedCount: 0,
      executionPlan: plan,
    };
  }

  // Stage 3: Verification & Classification
  const verifiedBatch = executeBatchVerification(discoveryRes.leads);

  // Stage 4: Enrichment & Deduplication
  const { enrichedLeads, duplicatesRemoved } = enrichAndDeduplicateLeads(verifiedBatch);

  // Stage 5 & 6: Audit & Email Drafting for qualified candidates
  let hotCount = 0;
  let draftsCount = 0;
  const processedLeads: Lead[] = [];

  for (const lead of enrichedLeads) {
    // If flagged suspicious, skip automated audit/draft and keep in review queue
    if (lead.businessVerificationStatus === 'Suspicious Business') {
      processedLeads.push(lead);
      continue;
    }

    try {
      // Agent 05 Audit
      const { auditReport, opportunityScore } = await auditLeadDigitalPresence(lead);
      lead.auditReport = auditReport;
      lead.leadOpportunityScore = opportunityScore;

      if (opportunityScore >= 80) {
        hotCount++;
      }

      // Agent 06 Email Copywriting
      if (lead.outreachEligibility === 'Eligible') {
        const draft = await generatePersonalizedEmailDraft(lead);
        lead.emailDraft = draft;
        lead.outreachStatus = 'Pending Approval';
        draftsCount++;
      }
    } catch (e) {
      console.error(`Error processing lead ${lead.companyName}:`, e);
    }

    processedLeads.push(lead);
  }

  // Persist all processed leads into database
  db.saveLeadsBatch(processedLeads);

  // Update or create campaign
  const existingCampaign = db.getCampaigns().find((c) => c.name === params.campaignName);
  if (existingCampaign) {
    existingCampaign.stats.discovered += processedLeads.length;
    existingCampaign.stats.verified += processedLeads.filter((l) => l.businessVerificationStatus === 'Verified Business').length;
    existingCampaign.stats.hot += hotCount;
    existingCampaign.stats.emailsGenerated += draftsCount;
    existingCampaign.lastRunAt = new Date().toISOString();
    db.saveCampaign(existingCampaign);
  }

  // Trigger Google Sheets sync
  await syncGoogleSheets();

  // Send Discord notification alert
  await sendDiscordNotification({
    title: `🚀 Campaign Pipeline Complete: ${params.campaignName}`,
    description: `Master AI Orchestrator completed execution plan across 8 autonomous agents.`,
    color: 0x00f2a5,
    fields: [
      { name: 'Discovered Leads', value: `${processedLeads.length}`, inline: true },
      { name: 'Hot Leads (Score 80+)', value: `${hotCount}`, inline: true },
      { name: 'Email Drafts Generated', value: `${draftsCount}`, inline: true },
      { name: 'Duplicates Filtered', value: `${duplicatesRemoved}`, inline: true },
      { name: 'Location', value: `${params.city}, ${params.country}`, inline: true },
    ],
  });

  db.addLog({
    agentName: 'Master AI Orchestrator',
    agentRole: 'Central Coordination Engine',
    action: 'Pipeline Complete',
    status: 'success',
    details: `Successfully completed workflow: ${processedLeads.length} leads saved, ${hotCount} hot leads identified, ${draftsCount} personalized email drafts created.`,
  });

  return {
    success: true,
    message: `Pipeline succeeded! Processed ${processedLeads.length} leads, identified ${hotCount} Hot Leads, and generated ${draftsCount} personalized email drafts.`,
    leadsCount: processedLeads.length,
    verifiedCount: processedLeads.filter((l) => l.businessVerificationStatus === 'Verified Business').length,
    hotLeadsCount: hotCount,
    draftsGeneratedCount: draftsCount,
    executionPlan: plan,
  };
}
