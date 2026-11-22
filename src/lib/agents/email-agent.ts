import { Lead, EmailDraft } from '@/types';
import { callOpenRouter } from '../openrouter';
import { db } from '../db';

export async function generatePersonalizedEmailDraft(lead: Lead): Promise<EmailDraft> {
  const settings = db.getSettings();
  const brand = settings.senderBrand || 'AI by Faraz';
  const senderEmail = settings.senderEmail || 'faraz@aibyfaraz.com';

  const auditProblems = lead.auditReport?.identifiedProblems?.join('; ') || lead.notes || 'Website optimization opportunities';
  const recommendedServices = lead.auditReport?.recommendedServices?.join(', ') || 'Website Modernization & AI Automation';

  const prompt = `You are Agent 06 — Personalized Email Copywriting Agent for "${brand}".
Write a concise, high-converting, strictly personalized B2B cold outreach email and two follow-up emails for this verified business.

TARGET COMPANY INFORMATION:
- Company Name: ${lead.companyName}
- Industry / Category: ${lead.industry} - ${lead.businessCategory}
- Location: ${lead.city}, ${lead.country}
- Website: ${lead.businessWebsite}
- Contact Role: ${lead.publicBusinessContactRole}
- Digital Audit Findings: ${auditProblems}
- Recommended Services: ${recommendedServices}
- Sender Brand: ${brand} (${senderEmail})

RULES & TONE:
1. NO generic spam language (e.g. "I hope this email finds you well", "We are a leading agency").
2. Opener must directly reference something specific about their local market, reviews, or fleet/operations.
3. Observation must point to an actual evidence-backed friction point (e.g. lack of instant online booking, outdated mobile experience, after-hours lost leads).
4. Value prop must state a realistic business benefit (e.g. "capturing 30% more direct bookings without extra phone staff").
5. Low-friction Call To Action (e.g. "Would you like me to send a 2-minute video mockup?").
6. Also write Follow-Up 1 (sent 3 days later, referencing a free mockup/video) and Follow-Up 2 (sent 7 days later, friendly breakup email).

OUTPUT STRICTLY VALID JSON:
{
  "subject": "string",
  "opener": "string",
  "evidenceObservation": "string",
  "proposedSolution": "string",
  "valueProposition": "string",
  "callToAction": "string",
  "signature": "string",
  "fullBody": "string",
  "followUp1": {
    "subject": "string",
    "body": "string",
    "delayDays": 3
  },
  "followUp2": {
    "subject": "string",
    "body": "string",
    "delayDays": 7
  }
}`;

  const aiRes = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are an award-winning executive B2B copywriter. Output strictly valid JSON matching the schema.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    {
      temperature: 0.3,
      maxTokens: 2500,
      responseFormat: 'json_object',
    }
  );

  if (aiRes.success && aiRes.data?.subject) {
    const d = aiRes.data;
    const signature = d.signature || `Best regards,\nFaraz\n${brand}\n${senderEmail}`;
    const fullBody =
      d.fullBody ||
      `${d.opener}\n\n${d.evidenceObservation}\n\n${d.proposedSolution}\n\n${d.valueProposition}\n\n${d.callToAction}\n\n${signature}`;

    return {
      subject: d.subject,
      opener: d.opener || 'Hi team,',
      evidenceObservation: d.evidenceObservation || '',
      proposedSolution: d.proposedSolution || '',
      valueProposition: d.valueProposition || '',
      callToAction: d.callToAction || 'Open to seeing a quick 2-minute visual mockup?',
      signature,
      fullBody,
      followUp1: {
        subject: d.followUp1?.subject || `Quick question regarding ${lead.companyName}`,
        body: d.followUp1?.body || `Hi team, following up on my previous note. Did you have a moment to review?`,
        delayDays: d.followUp1?.delayDays || 3,
      },
      followUp2: {
        subject: d.followUp2?.subject || `Final follow-up for ${lead.companyName}`,
        body: d.followUp2?.body || `Hi team, closing the loop. Feel free to reach out anytime!`,
        delayDays: d.followUp2?.delayDays || 7,
      },
      generatedAt: new Date().toISOString(),
      approved: false,
    };
  }

  // High quality deterministic fallback
  const subject = `Instant booking & AI automation for ${lead.companyName}`;
  const opener = `Hi ${lead.companyName} Team, saw your excellent services in ${lead.city}.`;
  const obs = `When testing your web flow, prospective clients currently cannot book or get an instant quote without waiting for manual follow-up.`;
  const sol = `At ${brand}, we build intelligent 24/7 AI booking assistants and modern websites designed to convert visitors instantly.`;
  const val = `Our clients typically experience a 35% increase in captured direct business within the first month.`;
  const cta = `Would you be open to a 2-minute interactive mockup tailored for ${lead.companyName}?`;
  const sig = `Best regards,\nFaraz\n${brand}\n${senderEmail}`;

  return {
    subject,
    opener,
    evidenceObservation: obs,
    proposedSolution: sol,
    valueProposition: val,
    callToAction: cta,
    signature: sig,
    fullBody: `${opener}\n\n${obs}\n\n${sol}\n\n${val}\n\n${cta}\n\n${sig}`,
    followUp1: {
      subject: `Interactive mockup for ${lead.companyName}`,
      body: `Hi team, following up to see if you had 2 minutes to check out the digital intake prototype we prepared for you?`,
      delayDays: 3,
    },
    followUp2: {
      subject: `Final note on website automation for ${lead.companyName}`,
      body: `Hi team, wishing you continued success in ${lead.city}. Feel free to keep our details on hand whenever you're ready to modernize your booking flow!`,
      delayDays: 7,
    },
    generatedAt: new Date().toISOString(),
    approved: false,
  };
}
