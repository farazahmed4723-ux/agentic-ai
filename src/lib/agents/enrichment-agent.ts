import { Lead } from '@/types';
import { db } from '../db';

export function normalizePhone(rawPhone: string): string {
  if (!rawPhone || rawPhone.trim() === '') return 'Not Found';
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+1-${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+1-${cleaned.substring(1, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  return rawPhone.trim();
}

export function normalizeEmail(rawEmail: string): string {
  if (!rawEmail || rawEmail.trim() === '') return 'Not Found';
  return rawEmail.trim().toLowerCase();
}

export function enrichAndDeduplicateLeads(newLeads: Lead[]): {
  enrichedLeads: Lead[];
  duplicatesRemoved: number;
} {
  const existingLeads = db.getLeads();
  const existingDomains = new Set(
    existingLeads
      .map((l) => l.businessWebsite?.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
      .filter(Boolean)
  );
  const existingPhones = new Set(existingLeads.map((l) => normalizePhone(l.publicBusinessPhone)).filter((p) => p !== 'Not Found'));
  const existingNames = new Set(existingLeads.map((l) => `${l.companyName.toLowerCase()}|${l.city.toLowerCase()}`));

  const enrichedLeads: Lead[] = [];
  let duplicatesRemoved = 0;

  for (const lead of newLeads) {
    const domain = lead.businessWebsite
      ? lead.businessWebsite.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
      : null;
    const normPhone = normalizePhone(lead.publicBusinessPhone);
    const nameCityKey = `${lead.companyName.toLowerCase()}|${lead.city.toLowerCase()}`;

    // Duplicate detection
    const isDuplicate =
      (domain && existingDomains.has(domain)) ||
      (normPhone !== 'Not Found' && existingPhones.has(normPhone)) ||
      existingNames.has(nameCityKey);

    if (isDuplicate) {
      duplicatesRemoved++;
      continue;
    }

    // Normalization & Safe Enrich
    const enriched: Lead = {
      ...lead,
      publicBusinessPhone: normPhone,
      publicBusinessEmail: normalizeEmail(lead.publicBusinessEmail),
      postalCode: lead.postalCode || 'Not Found',
      publicBusinessContactRole: lead.publicBusinessContactRole || 'Business Owner',
    };

    if (domain) existingDomains.add(domain);
    if (normPhone !== 'Not Found') existingPhones.add(normPhone);
    existingNames.add(nameCityKey);

    enrichedLeads.push(enriched);
  }

  db.addLog({
    agentName: 'Agent 04 — Data Enrichment',
    agentRole: 'Business Data Enrichment Agent',
    action: 'Enrichment and Deduplication',
    status: 'success',
    details: `Enriched ${enrichedLeads.length} leads. Removed ${duplicatesRemoved} duplicate leads based on domain/phone/name index.`,
  });

  return {
    enrichedLeads,
    duplicatesRemoved,
  };
}
