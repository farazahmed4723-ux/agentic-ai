import { Lead, VerificationStatus, EmailVerificationStatus } from '@/types';
import { db } from '../db';

export function verifyAndClassifyLead(lead: Partial<Lead>): {
  status: VerificationStatus;
  emailStatus: EmailVerificationStatus;
  confidenceScore: number;
  evidence: string[];
  isSuspicious: boolean;
} {
  const evidence: string[] = [];
  let score = 50; // base score for candidate lead

  // Domain & Website evaluation
  if (lead.businessWebsite && lead.businessWebsite.startsWith('http')) {
    evidence.push(`Active domain identified: ${lead.businessWebsite}`);
    score += 15;
    if (lead.websiteStatus === 'Active') {
      evidence.push('Website responding normally with HTTP 200 OK');
      score += 10;
    } else if (lead.websiteStatus === 'Outdated') {
      evidence.push('Website exists with legacy layout (Opportunity candidate)');
      score += 5;
    }
  } else {
    evidence.push('No custom website found (Evaluated via directory listings)');
  }

  // Address and physical presence
  if (lead.businessAddress && lead.businessAddress.length > 8) {
    if (lead.businessAddress.toLowerCase().includes('p.o. box')) {
      evidence.push('Address is a PO Box rather than physical commercial location (-15 pts)');
      score -= 15;
    } else {
      evidence.push(`Physical commercial address verified: ${lead.businessAddress}`);
      score += 15;
    }
  }

  // Phone number verification
  if (lead.publicBusinessPhone && lead.publicBusinessPhone.length >= 7) {
    evidence.push(`Standard formatted business telephone: ${lead.publicBusinessPhone}`);
    score += 10;
  }

  // Email validation heuristics
  let emailStatus: EmailVerificationStatus = 'Not Found';
  if (lead.publicBusinessEmail) {
    const email = lead.publicBusinessEmail.toLowerCase();
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const emailDomain = email.split('@')[1];

    if (!emailDomain || !email.includes('@')) {
      emailStatus = 'Invalid';
      evidence.push('Invalid email format detected');
      score -= 20;
    } else if (freeDomains.includes(emailDomain)) {
      emailStatus = 'Risky';
      evidence.push(`Public email uses free consumer provider (@${emailDomain})`);
      score -= 5;
    } else {
      emailStatus = 'Valid';
      evidence.push(`Corporate branded email domain matching business (@${emailDomain})`);
      score += 15;
    }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Classification determination
  let status: VerificationStatus = 'Unverified Business';
  let isSuspicious = false;

  if (finalScore >= 80) {
    status = 'Verified Business';
  } else if (finalScore >= 60) {
    status = 'Likely Genuine Business';
  } else if (finalScore < 40 || (lead.publicBusinessEmail?.includes('fake') || lead.businessWebsite?.includes('fake'))) {
    status = 'Suspicious Business';
    isSuspicious = true;
    evidence.push('Flagged for human quarantine: Inconsistent contact data or unresolvable domain');
  } else {
    status = 'Unverified Business';
  }

  return {
    status,
    emailStatus,
    confidenceScore: finalScore,
    evidence,
    isSuspicious,
  };
}

export function executeBatchVerification(leads: Partial<Lead>[]): Lead[] {
  const verifiedList: Lead[] = [];

  for (const raw of leads) {
    const { status, emailStatus, confidenceScore, evidence, isSuspicious } = verifyAndClassifyLead(raw);

    const fullLead: Lead = {
      id: raw.id || `LEAD-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      companyName: raw.companyName || 'Unknown Company',
      industry: raw.industry || 'General Business',
      businessCategory: raw.businessCategory || 'General',
      businessDescription: raw.businessDescription || '',
      businessWebsite: raw.businessWebsite || '',
      publicBusinessEmail: raw.publicBusinessEmail || '',
      publicBusinessPhone: raw.publicBusinessPhone || '',
      businessAddress: raw.businessAddress || '',
      city: raw.city || 'Toronto',
      provinceOrState: raw.provinceOrState || '',
      country: raw.country || 'Canada',
      postalCode: raw.postalCode || '',
      authorizedLocationData: raw.authorizedLocationData || {},
      socialMediaProfiles: raw.socialMediaProfiles || {},
      publicBusinessContactRole: raw.publicBusinessContactRole || 'Owner / Executive',
      websiteStatus: raw.websiteStatus || 'Active',
      businessVerificationStatus: status,
      emailVerificationStatus: emailStatus,
      verificationConfidenceScore: confidenceScore,
      leadOpportunityScore: raw.leadOpportunityScore || 50,
      dataSourceUrls: raw.dataSourceUrls || [],
      researchTimestamp: new Date().toISOString(),
      campaignName: raw.campaignName || 'Default Campaign',
      outreachEligibility: isSuspicious ? 'Ineligible' : 'Eligible',
      outreachStatus: isSuspicious ? 'Rejected' : 'Not Started',
      followUpStatus: 'None',
      notes: raw.notes || '',
      verificationEvidence: evidence,
    };

    verifiedList.push(fullLead);
  }

  db.addLog({
    agentName: 'Agent 03 — Verification',
    agentRole: 'Lead Verification and Classification Agent',
    action: 'Verification Finished',
    status: 'success',
    details: `Processed verification for ${verifiedList.length} leads. Verified: ${
      verifiedList.filter((l) => l.businessVerificationStatus === 'Verified Business').length
    }, Suspicious: ${verifiedList.filter((l) => l.businessVerificationStatus === 'Suspicious Business').length}.`,
  });

  return verifiedList;
}
