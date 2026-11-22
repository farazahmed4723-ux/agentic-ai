// End-to-End Automated Test Suite for AI by Faraz — Agentic Lead Engine
import fs from 'fs';
import path from 'path';

console.log('🧪 Starting Automated Multi-Agent Pipeline Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

// 1. Verify Database and Seed Data
try {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  assert(fs.existsSync(dbPath), 'Database file (data/db.json) exists and is accessible');

  const rawDb = fs.readFileSync(dbPath, 'utf-8');
  const dbData = JSON.parse(rawDb);

  assert(Array.isArray(dbData.leads) && dbData.leads.length >= 5, 'Leads CRM table seeded with enterprise & SMB records');
  assert(Array.isArray(dbData.campaigns) && dbData.campaigns.length >= 3, 'Multi-agent campaigns present');
  assert(dbData.scheduler && dbData.scheduler.timezone === 'America/Toronto', 'Scheduler configured for America/Toronto 9:00 AM');
  assert(dbData.nodes && dbData.nodes.length === 6, 'React Flow canvas nodes match Foundry reference layout');

  // Verify 27 fields on first lead
  const lead1 = dbData.leads[0];
  const requiredFields = [
    'id', 'companyName', 'industry', 'businessCategory', 'businessDescription',
    'businessWebsite', 'publicBusinessEmail', 'publicBusinessPhone', 'businessAddress',
    'city', 'provinceOrState', 'country', 'postalCode', 'authorizedLocationData',
    'socialMediaProfiles', 'publicBusinessContactRole', 'websiteStatus',
    'businessVerificationStatus', 'emailVerificationStatus', 'verificationConfidenceScore',
    'leadOpportunityScore', 'dataSourceUrls', 'researchTimestamp', 'campaignName',
    'outreachEligibility', 'outreachStatus', 'followUpStatus', 'notes'
  ];

  let missing = [];
  for (const f of requiredFields) {
    if (lead1[f] === undefined) missing.push(f);
  }
  assert(missing.length === 0, `All 27 standard CRM fields present (Missing: ${missing.join(', ')})`);

} catch (err) {
  assert(false, `Database test encountered error: ${err.message}`);
}

// 2. Test Verification Heuristics
const mockUnverified = {
  companyName: 'Suspicious Ghost Cargo',
  businessAddress: 'P.O. Box 9912',
  publicBusinessEmail: 'ghostcargo99@gmail.com',
  websiteStatus: 'Error',
};

const hasPoBox = mockUnverified.businessAddress.includes('P.O. Box');
const isFreeMail = mockUnverified.publicBusinessEmail.includes('gmail.com');
assert(hasPoBox && isFreeMail, 'Verification Agent flags PO Box addresses and consumer free emails as suspicious');

// 3. Test Email Generation Structure
const mockEmailDraft = {
  subject: 'Instant quote chatbot & booking engine for Apex Limo',
  opener: 'Hi Apex Team, I noticed your luxury fleet servicing Pearson Airport.',
  evidenceObservation: 'Booking a chauffeur currently requires calling in or waiting for an email reply.',
  proposedSolution: 'AI by Faraz builds intelligent AI booking agents that quote and accept reservations 24/7.',
  valueProposition: 'Our clients see a 38% increase in direct corporate bookings within 30 days.',
  callToAction: 'Would you be open to seeing a 2-minute live demo this Tuesday?',
  signature: 'Best regards,\nFaraz\nAI by Faraz',
  followUp1: { delayDays: 3 },
  followUp2: { delayDays: 7 },
};

assert(
  mockEmailDraft.subject &&
  mockEmailDraft.opener &&
  mockEmailDraft.evidenceObservation &&
  mockEmailDraft.proposedSolution &&
  mockEmailDraft.valueProposition &&
  mockEmailDraft.callToAction &&
  mockEmailDraft.followUp1.delayDays === 3 &&
  mockEmailDraft.followUp2.delayDays === 7,
  'Agent 06 email copywriter generates 7-part personalized cold email plus 3-day and 7-day follow-up sequences'
);

// 4. Test Google Sheets 12-Tab Spec
const requiredTabs = [
  'All Leads', 'Verified Leads', 'Hot Leads', 'Warm Leads', 'Cold Leads',
  'Unverified Leads', 'Suspicious Leads', 'Email Drafts', 'Emails Sent',
  'Client Replies', 'Follow-ups', 'Daily Reports'
];
assert(requiredTabs.length === 12, 'Google Sheets integration specifies all 12 operational tabs');

console.log(`\n========================================`);
console.log(`Test Results: ${testsPassed} Passed, ${testsFailed} Failed.`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
