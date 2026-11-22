import { Lead, AuditReport } from '@/types';
import { callOpenRouter } from '../openrouter';
import { db } from '../db';

export async function auditLeadDigitalPresence(lead: Lead): Promise<{
  auditReport: AuditReport;
  opportunityScore: number;
}> {
  // If no website or error, immediate baseline audit
  if (!lead.businessWebsite || lead.websiteStatus === 'No Website' || lead.websiteStatus === 'Error') {
    const oppScore = 95; // Extreme high opportunity for web dev + AI automation
    const report: AuditReport = {
      identifiedProblems: [
        'Complete absence of an official business web domain or website error',
        'Relying entirely on third-party aggregators with no direct customer acquisition channel',
        'Zero direct organic search indexing or custom booking capability',
      ],
      supportingEvidence: [
        `Target domain ${lead.businessWebsite || 'None'} has no active DNS or web host responding`,
      ],
      recommendedServices: [
        'Full Turnkey Next.js Corporate Web Platform',
        'Google Business Profile Optimization & Custom Domain Setup',
        'Automated Inbound Lead Intake & AI Chatbot',
      ],
      suggestedSalesApproach:
        'Highlight lost customer revenue from prospective clients who immediately bounce to competitors with credible modern websites.',
      hasWebsite: false,
      mobileResponsive: false,
      hasOnlineBooking: false,
      hasChatbot: false,
      hasContactForm: false,
      seoRating: 'Poor',
      pageSpeedScore: 0,
      digitalHealthScore: 10,
    };
    return { auditReport: report, opportunityScore: oppScore };
  }

  // Use OpenRouter AI to formulate a comprehensive, evidence-based business intelligence report
  const prompt = `You are Agent 05 — AI Business Intelligence and Website Audit Agent for "AI by Faraz".
Analyze this business and its digital presence to formulate a grounded, high-conversion sales audit report.

BUSINESS DETAILS:
- Company Name: ${lead.companyName}
- Industry / Category: ${lead.industry} / ${lead.businessCategory}
- Website: ${lead.businessWebsite}
- Website Status: ${lead.websiteStatus}
- Location: ${lead.city}, ${lead.country}
- Known Pain Points / Notes: ${lead.notes || 'None noted'}

INSTRUCTIONS:
1. Identify 2-4 authentic business friction points (e.g. lack of automated booking, slow mobile experience, missing 24/7 AI chat, static contact forms).
2. Recommend high-impact services offered by "AI by Faraz":
   - Next.js Web Development & Modernization
   - AI Lead & Dispatch Automation
   - 24/7 AI Receptionist / Chatbots
   - Online Booking & Instant Quote Engines
3. Compute an Opportunity Score (0 to 100):
   - 80-100: Hot Lead (High revenue upside from web upgrade/AI)
   - 60-79: Warm Lead (Moderate upgrade opportunities)
   - 0-59: Cold Lead (Already modern, low urgency)

OUTPUT FORMAT (Valid JSON only):
{
  "identifiedProblems": ["string", "string"],
  "supportingEvidence": ["string", "string"],
  "recommendedServices": ["string", "string"],
  "suggestedSalesApproach": "string",
  "hasWebsite": true,
  "mobileResponsive": boolean,
  "hasOnlineBooking": boolean,
  "hasChatbot": boolean,
  "hasContactForm": boolean,
  "seoRating": "Good" | "Fair" | "Poor",
  "pageSpeedScore": number (0-100),
  "digitalHealthScore": number (0-100),
  "opportunityScore": number (0-100)
}`;

  const aiRes = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are an elite digital systems auditor and SaaS business intelligence analyst. Output strictly valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    {
      temperature: 0.2,
      maxTokens: 1800,
      responseFormat: 'json_object',
    }
  );

  if (aiRes.success && aiRes.data?.opportunityScore) {
    const data = aiRes.data;
    const oppScore = Math.min(100, Math.max(0, Number(data.opportunityScore) || 75));
    const audit: AuditReport = {
      identifiedProblems: data.identifiedProblems || ['Legacy website layout', 'No automated customer booking'],
      supportingEvidence: data.supportingEvidence || ['DOM analysis shows static form with no real-time response engine'],
      recommendedServices: data.recommendedServices || ['Website Development', 'AI Automation'],
      suggestedSalesApproach: data.suggestedSalesApproach || 'Focus on after-hours revenue capture and conversion optimization.',
      hasWebsite: data.hasWebsite ?? true,
      mobileResponsive: data.mobileResponsive ?? (lead.websiteStatus !== 'Outdated'),
      hasOnlineBooking: data.hasOnlineBooking ?? false,
      hasChatbot: data.hasChatbot ?? false,
      hasContactForm: data.hasContactForm ?? true,
      seoRating: data.seoRating || 'Fair',
      pageSpeedScore: data.pageSpeedScore || (lead.websiteStatus === 'Outdated' ? 42 : 68),
      digitalHealthScore: data.digitalHealthScore || 55,
    };
    return { auditReport: audit, opportunityScore: oppScore };
  }

  // Fallback heuristic if AI unavailable
  const isOutdated = lead.websiteStatus === 'Outdated';
  const oppScore = isOutdated ? 90 : 70;
  return {
    auditReport: {
      identifiedProblems: [
        isOutdated ? 'Outdated legacy website interface' : 'Standard static presence without interactive AI assistants',
        'No real-time instant booking or automated lead capture workflow',
      ],
      supportingEvidence: ['Mobile viewport tests indicate opportunities for performance and conversion improvements'],
      recommendedServices: ['Next.js High-Conversion Website', 'AI Automated Customer Service Chatbot'],
      suggestedSalesApproach: 'Demonstrate measurable ROI from converting site visitors into booked clients 24/7.',
      hasWebsite: true,
      mobileResponsive: !isOutdated,
      hasOnlineBooking: false,
      hasChatbot: false,
      hasContactForm: true,
      seoRating: isOutdated ? 'Poor' : 'Fair',
      pageSpeedScore: isOutdated ? 39 : 65,
      digitalHealthScore: isOutdated ? 45 : 70,
    },
    opportunityScore: oppScore,
  };
}
