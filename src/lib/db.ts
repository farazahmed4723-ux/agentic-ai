import fs from 'fs';
import path from 'path';
import {
  Lead,
  Campaign,
  SchedulerConfig,
  SystemSettings,
  ActivityLog,
  AgentNodeData,
} from '@/types';

interface DatabaseSchema {
  leads: Lead[];
  campaigns: Campaign[];
  scheduler: SchedulerConfig;
  settings: SystemSettings;
  logs: ActivityLog[];
  nodes: AgentNodeData[];
  sheetsSync: {
    lastSyncedAt?: string;
    sheetUrl?: string;
    syncedTabsCount: number;
    status: 'Idle' | 'Syncing' | 'Success' | 'Error';
    error?: string;
  };
  discordWebhook: {
    lastTestStatus?: 'Success' | 'Failed';
    lastTestTimestamp?: string;
    webhookUrl?: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Default initial system settings
const defaultSettings: SystemSettings = {
  senderBrand: 'AI by Faraz',
  senderEmail: 'faraz@aibyfaraz.com',
  senderTitle: 'Chief AI & Automation Strategist',
  defaultServices: [
    'Website Development & Modernization',
    'AI Lead & Process Automation',
    'AI Chatbots & Virtual Assistants',
    'Autonomous Multi-Agent Systems',
    'High-Conversion E-commerce Solutions',
    'Custom Software & Web Applications',
    'Video Editing & Motion Graphics',
  ],
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
  dailyEmailLimit: 50,
  approvalMode: 'manual',
  antiSpamComplianceMode: true,
  emergencyStop: false,
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  googleSearchApiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
  googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  googleSheetId: process.env.GOOGLE_SHEETS_ID || '',
};

// Default Scheduler: Daily 9:00 AM America/Toronto
const defaultScheduler: SchedulerConfig = {
  enabled: true,
  cronExpression: '0 9 * * *',
  dailyRunTime: '09:00',
  timezone: 'America/Toronto',
  targetLeadsPerDay: 50,
  lastExecutionAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
  nextExecutionAt: new Date(Date.now() + 3600 * 1000 * 10).toISOString(),
  paused: false,
  missedExecutionRecovery: true,
  duplicateProtection: true,
};

// Initial Agent Nodes mirroring the Foundry Canvas in chatgpt_image.png
const initialNodes: AgentNodeData[] = [
  {
    id: 'node-01',
    nodeNumber: '01',
    category: 'TRIGGER',
    label: 'Webhook',
    subtitle: 'on lead form / schedule',
    systemPrompt: 'Triggers when a cron schedule or API webhook event fires.',
    colorScheme: 'mint',
    lastRunStatus: 'success',
    lastRunTime: '2 mins ago',
    lastRunDuration: '0.4s',
    lastRunDetails: 'Triggered daily 9:00 AM America/Toronto batch for 50 leads',
    activityDescription: 'Listening for scheduled triggers and lead intake webhook',
  },
  {
    id: 'node-02',
    nodeNumber: '02',
    category: 'AI',
    label: 'Qualify lead',
    subtitle: 'Claude Sonnet · v3.5',
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.2,
    maxTokens: 2048,
    enabledTools: ['search_web', 'query_postgres'],
    systemPrompt: `You are a B2B sales qualifier and Master AI Orchestrator for AI by Faraz.
Analyze the company profile, digital presence, and qualification criteria.
Classify as Qualified Hot Lead if:
- Verification confidence score >= 75
- Identified digital pain points (outdated website, missing AI chatbot, no online booking)
- High upside for AI Automation or Web Modernization`,
    colorScheme: 'violet',
    lastRunStatus: 'success',
    lastRunTime: '2 mins ago',
    lastRunDuration: '1.8s',
    lastRunDetails: 'Lead: Apex Limo Toronto · Qualified · Score: 94/100',
    runCostUsd: 0.018,
    tokensUsed: 1247,
    activityDescription: 'Deep evaluation of company profile and opportunity fit',
  },
  {
    id: 'node-03',
    nodeNumber: '03',
    category: 'TOOL',
    label: 'Search web',
    subtitle: 'company research',
    enabledTools: ['google_places', 'web_crawler', 'whois_lookup'],
    systemPrompt: 'Extracts real public company information, reviews, social profiles, and domain status.',
    colorScheme: 'amber',
    lastRunStatus: 'success',
    lastRunTime: '2 mins ago',
    lastRunDuration: '2.1s',
    lastRunDetails: 'Extracted Google Places metadata, phone, public email, address',
    activityDescription: 'Conducting authorized multi-source web discovery & domain audit',
  },
  {
    id: 'node-04',
    nodeNumber: '04',
    category: 'TOOL',
    label: 'Postgres query',
    subtitle: 'check duplicates',
    enabledTools: ['db_lead_check', 'domain_dedup'],
    systemPrompt: 'Deduplicates records across company name, domain, phone, and address.',
    colorScheme: 'amber',
    lastRunStatus: 'success',
    lastRunTime: '2 mins ago',
    lastRunDuration: '0.3s',
    lastRunDetails: 'Checked 1,482 existing leads. 0 duplicates found.',
    activityDescription: 'Verifying uniqueness against persistent database records',
  },
  {
    id: 'node-05',
    nodeNumber: '05',
    category: 'ACTION',
    label: 'Send to Slack / Discord',
    subtitle: '#sales-qualified',
    enabledTools: ['discord_webhook', 'slack_notify'],
    systemPrompt: 'Dispatches real-time structured Discord webhook alert with lead score card.',
    colorScheme: 'coral',
    lastRunStatus: 'success',
    lastRunTime: '2 mins ago',
    lastRunDuration: '0.7s',
    lastRunDetails: 'Dispatched alert for Hot Lead (Apex Limo Toronto, 94 pts)',
    activityDescription: 'Pushing instantaneous notification to team channels',
  },
  {
    id: 'node-06',
    nodeNumber: '06',
    category: 'ACTION',
    label: 'Update CRM',
    subtitle: 'log + store',
    enabledTools: ['sqlite_write', 'google_sheets_sync'],
    systemPrompt: 'Persists all 27 business fields to database and synchronizes Google Sheets.',
    colorScheme: 'coral',
    lastRunStatus: 'success',
    lastRunTime: '2 mins ago',
    lastRunDuration: '0.5s',
    lastRunDetails: 'Stored LEAD-TOR-001 in persistent database and queued for approval',
    activityDescription: 'Recording full enrichment schema & staging email drafts',
  },
];

// Initial realistic enterprise and SMB leads
const initialLeads: Lead[] = [
  {
    id: 'LEAD-TOR-001',
    companyName: 'Apex Executive Limousine Toronto',
    industry: 'Transportation & Luxury Travel',
    businessCategory: 'Chauffeur & Limo Service',
    businessDescription:
      'Premier executive chauffeur and luxury airport limousine service operating across Greater Toronto Area and Pearson Airport.',
    businessWebsite: 'https://apexlimotoronto.example.com',
    publicBusinessEmail: 'reservations@apexlimotoronto.example.com',
    publicBusinessPhone: '+1-416-555-0192',
    businessAddress: '180 Bay Street, Suite 1400',
    city: 'Toronto',
    provinceOrState: 'Ontario',
    country: 'Canada',
    postalCode: 'M5J 2T3',
    authorizedLocationData: {
      latitude: 43.6481,
      longitude: -79.3802,
      formattedAddress: '180 Bay St., Toronto, ON M5J 2T3, Canada',
      placeId: 'ChIJde1fG7o0K4gRFG3j21-demo',
    },
    socialMediaProfiles: {
      linkedin: 'https://linkedin.com/company/apex-limo-toronto',
      instagram: 'https://instagram.com/apexlimoto',
    },
    publicBusinessContactRole: 'General Manager',
    websiteStatus: 'Outdated',
    businessVerificationStatus: 'Verified Business',
    emailVerificationStatus: 'Valid',
    verificationConfidenceScore: 96,
    leadOpportunityScore: 94, // Hot Lead
    dataSourceUrls: [
      'https://google.com/maps/place/Apex+Limousine+Toronto',
      'https://yellowpages.ca/bus/apex-limo-toronto',
    ],
    researchTimestamp: new Date().toISOString(),
    campaignName: 'Toronto Luxury Limousines Q4',
    outreachEligibility: 'Eligible',
    outreachStatus: 'Pending Approval',
    followUpStatus: 'None',
    notes: 'High volume corporate clientele. Website lacks modern real-time booking and AI instant quote chatbot.',
    verificationEvidence: [
      'Active business registry record in Ontario Business Registry',
      'Verified Google Maps location with 48 authentic reviews',
      'Valid corporate MX records on custom domain',
      'Active phone line confirmed during business hours',
    ],
    auditReport: {
      identifiedProblems: [
        'Outdated non-responsive website layout created in 2017',
        'No real-time online quote or vehicle booking engine (requires phone call)',
        'Missing 24/7 AI Chauffeur Reservation Chatbot',
        'Lighthouse Mobile Performance score: 38/100',
        'Missing automated booking confirmation workflows',
      ],
      supportingEvidence: [
        'Page load time 4.8s on 4G connection',
        'No SSL HTTP/2 optimization',
        'Static HTML form with no instant quote generation',
      ],
      recommendedServices: [
        'Next.js High-Conversion Chauffeur Website',
        'AI Dispatch & Fleet Reservation Chatbot',
        'Automated SMS/Email Confirmation Pipeline',
      ],
      suggestedSalesApproach:
        'Focus on recapturing 35% of corporate clients lost to black-car booking apps due to lack of instant mobile booking.',
      hasWebsite: true,
      mobileResponsive: false,
      hasOnlineBooking: false,
      hasChatbot: false,
      hasContactForm: true,
      seoRating: 'Poor',
      pageSpeedScore: 38,
      digitalHealthScore: 42,
    },
    emailDraft: {
      subject: 'Instant quote chatbot & booking engine for Apex Limo',
      opener: 'Hi Apex Team, I noticed your luxury fleet servicing Pearson Airport and Bay Street executives.',
      evidenceObservation:
        'When looking through your site, booking a chauffeur currently requires calling in or waiting for an email reply rather than an instant 10-second confirmation.',
      proposedSolution:
        'At AI by Faraz, we build intelligent AI booking agents and modern high-speed portals specifically for executive fleet services that quote rides and accept reservations automatically 24/7.',
      valueProposition:
        'Our limo fleet clients typically see a 38% increase in direct corporate bookings within 30 days without adding dispatch staff.',
      callToAction: 'Would you be open to seeing a 2-minute live demo customized for Apex Limo this Tuesday?',
      signature: 'Best regards,\nFaraz\nAI by Faraz — Intelligent Automation\nfaraz@aibyfaraz.com',
      fullBody: `Hi Apex Team,

I noticed your luxury fleet servicing Pearson Airport and Bay Street executives.

When looking through your site, booking a chauffeur currently requires calling in or waiting for an email reply rather than an instant 10-second confirmation.

At AI by Faraz, we build intelligent AI booking agents and modern high-speed portals specifically for executive fleet services that quote rides and accept reservations automatically 24/7.

Our limo fleet clients typically see a 38% increase in direct corporate bookings within 30 days without adding dispatch staff.

Would you be open to seeing a 2-minute live demo customized for Apex Limo this Tuesday?

Best regards,
Faraz
AI by Faraz — Intelligent Automation
faraz@aibyfaraz.com`,
      followUp1: {
        subject: 'Quick question regarding Apex Limo mobile reservations',
        body: `Hi Apex Team,

Following up on my note from earlier this week. I put together a quick interactive mockup showing how an executive client can book a Pearson transfer on your site in under 30 seconds with automated dispatch.

Would you like me to send over the 60-second video preview?

Best,
Faraz`,
        delayDays: 3,
      },
      followUp2: {
        subject: 'Final follow-up: Automated corporate bookings for Apex Limo',
        body: `Hi Apex Team,

I understand you're busy managing peak airport arrivals. If upgrading your online booking engine and 24/7 AI dispatch isn't on your roadmap right now, no problem at all.

Feel free to keep this in your back pocket whenever you want to modernize your direct booking flow: https://aibyfaraz.com

Wishing you continued success,
Faraz`,
        delayDays: 7,
      },
      generatedAt: new Date().toISOString(),
      approved: false,
    },
  },
  {
    id: 'LEAD-NYC-002',
    companyName: 'Manhattan Smile Boutique',
    industry: 'Healthcare & Dentistry',
    businessCategory: 'Cosmetic & General Dental Clinic',
    businessDescription:
      'Premier cosmetic dentistry and Invisalign provider located in Midtown Manhattan offering smile makeovers and preventive care.',
    businessWebsite: 'https://manhattansmileboutique.example.com',
    publicBusinessEmail: 'contact@manhattansmileboutique.example.com',
    publicBusinessPhone: '+1-212-555-0841',
    businessAddress: '450 Lexington Avenue, 19th Floor',
    city: 'New York',
    provinceOrState: 'New York',
    country: 'United States',
    postalCode: '10017',
    authorizedLocationData: {
      latitude: 40.7527,
      longitude: -73.9749,
      formattedAddress: '450 Lexington Ave, New York, NY 10017, USA',
      placeId: 'ChIJ4zBEa6NZwokRAMz-demo',
    },
    socialMediaProfiles: {
      instagram: 'https://instagram.com/manhattansmileboutique',
    },
    publicBusinessContactRole: 'Practice Manager',
    websiteStatus: 'Active',
    businessVerificationStatus: 'Verified Business',
    emailVerificationStatus: 'Valid',
    verificationConfidenceScore: 98,
    leadOpportunityScore: 88, // Hot Lead
    dataSourceUrls: ['https://google.com/maps/place/Manhattan+Smile+Boutique'],
    researchTimestamp: new Date().toISOString(),
    campaignName: 'NYC Dental Clinics AI Chatbot',
    outreachEligibility: 'Eligible',
    outreachStatus: 'Pending Approval',
    followUpStatus: 'None',
    notes: 'High patient traffic. Website is attractive but lacks an AI triage receptionist to answer insurance questions after hours.',
    verificationEvidence: [
      'NYS Department of State active entity registration',
      '120+ verified Google reviews with 4.9 star rating',
      'Verified Google Business profile',
    ],
    auditReport: {
      identifiedProblems: [
        'No interactive after-hours AI triage chatbot',
        'Patient inquiries sent to generic unencrypted email form',
        'High bounce rate on mobile appointment scheduling page',
      ],
      supportingEvidence: [
        'No live chat widget present in DOM inspection',
        'Scheduling button redirects to slow third-party iframe',
      ],
      recommendedServices: [
        'HIPAA-Compliant AI Dental Receptionist',
        'Direct EHR Appointment Booking Integration',
        'Patient Reactivation SMS Automation',
      ],
      suggestedSalesApproach:
        'Demonstrate how after-hours patient inquiries can be converted into confirmed consultations automatically.',
      hasWebsite: true,
      mobileResponsive: true,
      hasOnlineBooking: true,
      hasChatbot: false,
      hasContactForm: true,
      seoRating: 'Fair',
      pageSpeedScore: 61,
      digitalHealthScore: 68,
    },
    emailDraft: {
      subject: 'Converting after-hours dental inquiries for Manhattan Smile Boutique',
      opener: 'Hi Manhattan Smile Boutique team, great reviews on your cosmetic smile makeovers in Midtown.',
      evidenceObservation:
        'I noticed prospective patients visiting your site in the evening or weekends have to fill out a static form rather than getting immediate answers to insurance and booking questions.',
      proposedSolution:
        'We design 24/7 intelligent dental AI receptionists that answer treatment questions, pre-qualify insurance, and book consultations straight into your calendar.',
      valueProposition:
        'Clinics similar to yours capture an extra 12-18 cosmetic consultations per month from evening and weekend website traffic.',
      callToAction: 'Would you be open to a 3-minute video showing how this works for cosmetic practices in NYC?',
      signature: 'Best regards,\nFaraz\nAI by Faraz\nfaraz@aibyfaraz.com',
      fullBody: `Hi Manhattan Smile Boutique team,

Great reviews on your cosmetic smile makeovers in Midtown.

I noticed prospective patients visiting your site in the evening or weekends have to fill out a static form rather than getting immediate answers to insurance and booking questions.

We design 24/7 intelligent dental AI receptionists that answer treatment questions, pre-qualify insurance, and book consultations straight into your calendar.

Clinics similar to yours capture an extra 12-18 cosmetic consultations per month from evening and weekend website traffic.

Would you be open to a 3-minute video showing how this works for cosmetic practices in NYC?

Best regards,
Faraz
AI by Faraz
faraz@aibyfaraz.com`,
      followUp1: {
        subject: 'Quick question regarding patient booking at Manhattan Smile Boutique',
        body: 'Hi team, checking if you had a moment to review my earlier note on automated dental patient booking?',
        delayDays: 3,
      },
      followUp2: {
        subject: 'Closing thoughts on after-hours patient triage',
        body: 'Hi team, wishing you the best with your practice in Midtown. Feel free to reach out anytime!',
        delayDays: 7,
      },
      generatedAt: new Date().toISOString(),
      approved: false,
    },
  },
  {
    id: 'LEAD-LON-003',
    companyName: 'The Kensington Brasserie',
    industry: 'Hospitality & Dining',
    businessCategory: 'Fine Dining Restaurant',
    businessDescription:
      'Contemporary European brasserie in West London serving seasonal British ingredients and craft cocktails.',
    businessWebsite: 'https://kensingtonbrasserie.example.co.uk',
    publicBusinessEmail: 'info@kensingtonbrasserie.example.co.uk',
    publicBusinessPhone: '+44-20-7946-0922',
    businessAddress: '42 Kensington High Street',
    city: 'London',
    provinceOrState: 'Greater London',
    country: 'United Kingdom',
    postalCode: 'W8 4PF',
    authorizedLocationData: {
      latitude: 51.5014,
      longitude: -0.1918,
      formattedAddress: '42 Kensington High St, London W8 4PF, UK',
    },
    socialMediaProfiles: {
      instagram: 'https://instagram.com/kensingtonbrasserie',
      facebook: 'https://facebook.com/kensingtonbrasserie',
    },
    publicBusinessContactRole: 'General Manager',
    websiteStatus: 'Active',
    businessVerificationStatus: 'Verified Business',
    emailVerificationStatus: 'Valid',
    verificationConfidenceScore: 92,
    leadOpportunityScore: 78, // Warm Lead
    dataSourceUrls: ['https://google.co.uk/maps/place/Kensington+Brasserie'],
    researchTimestamp: new Date().toISOString(),
    campaignName: 'London Restaurants Online Reservations',
    outreachEligibility: 'Eligible',
    outreachStatus: 'Draft Generated',
    followUpStatus: 'None',
    notes: 'Busy neighborhood favorite. Uses PDF menu without allergen filtering and lacks OpenTable/SevenRooms direct instant widget.',
    verificationEvidence: [
      'UK Companies House registered business',
      'Food Hygiene Rating 5/5 verified',
      'Verified Google Business profile',
    ],
    auditReport: {
      identifiedProblems: [
        'PDF menu download required on mobile devices',
        'Slow reservation widget loading over 4 seconds',
        'No automated SMS reminder to reduce no-shows',
      ],
      supportingEvidence: ['Menu opens as unindexed 14MB PDF', 'No schema markup for FoodEstablishment'],
      recommendedServices: [
        'Interactive Mobile-First Digital Menu',
        'Instant Table Reservation Engine',
        'AI No-Show Reduction SMS System',
      ],
      suggestedSalesApproach: 'Highlight revenue protection from reducing weekend no-shows by 60%.',
      hasWebsite: true,
      mobileResponsive: true,
      hasOnlineBooking: false,
      hasChatbot: false,
      hasContactForm: true,
      seoRating: 'Fair',
      pageSpeedScore: 52,
      digitalHealthScore: 58,
    },
    emailDraft: {
      subject: 'Eliminating table no-shows at The Kensington Brasserie',
      opener: 'Hi Kensington Brasserie Team, your seasonal menu and reviews on High Street look fantastic.',
      evidenceObservation:
        'When viewing your site on mobile, guests currently have to download a PDF menu and cannot make immediate instant table reservations without being redirected.',
      proposedSolution:
        'We help upscale London restaurants implement seamless mobile booking with automated WhatsApp/SMS confirmations that cut table no-shows by over 60%.',
      valueProposition:
        'Recovering even 3 weekend tables per week adds over £14,000 in saved revenue annually.',
      callToAction: 'Could I send you a 1-minute visual preview of the mobile reservation experience?',
      signature: 'Warm regards,\nFaraz\nAI by Faraz\nfaraz@aibyfaraz.com',
      fullBody: `Hi Kensington Brasserie Team,

Your seasonal menu and reviews on High Street look fantastic.

When viewing your site on mobile, guests currently have to download a PDF menu and cannot make immediate instant table reservations without being redirected.

We help upscale London restaurants implement seamless mobile booking with automated WhatsApp/SMS confirmations that cut table no-shows by over 60%.

Recovering even 3 weekend tables per week adds over £14,000 in saved revenue annually.

Could I send you a 1-minute visual preview of the mobile reservation experience?

Warm regards,
Faraz
AI by Faraz
faraz@aibyfaraz.com`,
      followUp1: {
        subject: 'Quick question on table bookings for Kensington Brasserie',
        body: 'Hi team, checking if you received my note about mobile table reservations?',
        delayDays: 3,
      },
      followUp2: {
        subject: 'Final note on no-show reduction',
        body: 'Hi team, all the best with your service this season!',
        delayDays: 7,
      },
      generatedAt: new Date().toISOString(),
      approved: false,
    },
  },
  {
    id: 'LEAD-DXB-004',
    companyName: 'Al-Madar Construction & Fitouts',
    industry: 'Construction & Real Estate',
    businessCategory: 'Commercial Fitout Contractor',
    businessDescription:
      'Turnkey interior architectural fit-out and commercial construction contractor operating in Business Bay and Downtown Dubai.',
    businessWebsite: 'https://almadarconstruction.example.ae',
    publicBusinessEmail: 'tenders@almadarconstruction.example.ae',
    publicBusinessPhone: '+971-4-555-8120',
    businessAddress: 'Bay Square 08, Business Bay',
    city: 'Dubai',
    provinceOrState: 'Dubai Emirate',
    country: 'United Arab Emirates',
    postalCode: '00000',
    authorizedLocationData: {
      latitude: 25.1882,
      longitude: 55.2758,
      formattedAddress: 'Bay Square 8, Business Bay, Dubai, UAE',
    },
    socialMediaProfiles: {
      linkedin: 'https://linkedin.com/company/al-madar-fitouts',
    },
    publicBusinessContactRole: 'Director of Business Development',
    websiteStatus: 'Active',
    businessVerificationStatus: 'Verified Business',
    emailVerificationStatus: 'Valid',
    verificationConfidenceScore: 94,
    leadOpportunityScore: 89, // Hot Lead
    dataSourceUrls: ['https://google.com/maps/place/Al-Madar+Fitouts+Dubai'],
    researchTimestamp: new Date().toISOString(),
    campaignName: 'Dubai Commercial Fitout AI Automation',
    outreachEligibility: 'Eligible',
    outreachStatus: 'Pending Approval',
    followUpStatus: 'None',
    notes: 'Significant commercial contracts. Website portfolio is static; no AI tender quote calculator or lead qualification intake.',
    verificationEvidence: [
      'Dubai DED commercial license verified',
      'Physical office in Bay Square confirmed',
      'Corporate email with active SPF and DKIM',
    ],
    auditReport: {
      identifiedProblems: [
        'No interactive project cost estimator for corporate clients',
        'Portfolio images lack high-res webp optimization',
        'Missing automated client inquiry routing to project managers',
      ],
      supportingEvidence: ['Average load speed in GCC: 3.9 seconds', 'No portfolio video showcase'],
      recommendedServices: [
        'Luxury Interactive Fit-Out Showcase Portal',
        'AI Project Tender Cost Estimator',
        'Automated Client Qualification CRM Pipeline',
      ],
      suggestedSalesApproach:
        'Focus on accelerating corporate client pre-qualification for AED 500k+ office build-outs.',
      hasWebsite: true,
      mobileResponsive: true,
      hasOnlineBooking: false,
      hasChatbot: false,
      hasContactForm: true,
      seoRating: 'Good',
      pageSpeedScore: 49,
      digitalHealthScore: 62,
    },
    emailDraft: {
      subject: 'Automating commercial fitout inquiries for Al-Madar Dubai',
      opener: 'Dear Al-Madar Team, impressed by your turnkey commercial projects in Business Bay.',
      evidenceObservation:
        'Corporate clients looking for high-end office fit-outs currently wait days for initial consultation proposals after submitting your web contact form.',
      proposedSolution:
        'AI by Faraz builds interactive project scoping calculators and automated AI intake workflows that qualify commercial inquiries in 60 seconds.',
      valueProposition:
        'This allows your estimating team to focus exclusively on high-margin AED 500k+ turnkey tenders.',
      callToAction: 'Would you be open to reviewing an interactive 2-minute prototype we built for Dubai contractors?',
      signature: 'Best regards,\nFaraz\nAI by Faraz\nfaraz@aibyfaraz.com',
      fullBody: `Dear Al-Madar Team,

Impressed by your turnkey commercial projects in Business Bay.

Corporate clients looking for high-end office fit-outs currently wait days for initial consultation proposals after submitting your web contact form.

AI by Faraz builds interactive project scoping calculators and automated AI intake workflows that qualify commercial inquiries in 60 seconds.

This allows your estimating team to focus exclusively on high-margin AED 500k+ turnkey tenders.

Would you be open to reviewing an interactive 2-minute prototype we built for Dubai contractors?

Best regards,
Faraz
AI by Faraz
faraz@aibyfaraz.com`,
      followUp1: {
        subject: 'Commercial fitout scoping prototype for Al-Madar',
        body: 'Dear Al-Madar Team, following up regarding automated corporate tender scoping.',
        delayDays: 3,
      },
      followUp2: {
        subject: 'Final follow up: Turnkey project qualification',
        body: 'Dear Al-Madar Team, wishing you great success on your current commercial handovers in Dubai.',
        delayDays: 7,
      },
      generatedAt: new Date().toISOString(),
      approved: false,
    },
  },
  {
    id: 'LEAD-VAN-005',
    companyName: 'Pacific Coast Movers Vancouver',
    industry: 'Logistics & Moving',
    businessCategory: 'Residential & Commercial Movers',
    businessDescription:
      'Local and long-distance moving company serving Metro Vancouver, North Shore, and Vancouver Island.',
    businessWebsite: 'https://pacificcoastmovers.example.ca',
    publicBusinessEmail: 'dispatch@pacificcoastmovers.example.ca',
    publicBusinessPhone: '+1-604-555-0371',
    businessAddress: '1240 Clark Drive',
    city: 'Vancouver',
    provinceOrState: 'British Columbia',
    country: 'Canada',
    postalCode: 'V5L 3K8',
    authorizedLocationData: {
      latitude: 49.2731,
      longitude: -123.0768,
      formattedAddress: '1240 Clark Dr, Vancouver, BC V5L 3K8, Canada',
    },
    socialMediaProfiles: {},
    publicBusinessContactRole: 'Dispatch Manager',
    websiteStatus: 'Outdated',
    businessVerificationStatus: 'Likely Genuine Business',
    emailVerificationStatus: 'Valid',
    verificationConfidenceScore: 88,
    leadOpportunityScore: 92, // Hot Lead
    dataSourceUrls: ['https://google.ca/maps/place/Pacific+Coast+Movers+Vancouver'],
    researchTimestamp: new Date().toISOString(),
    campaignName: 'Vancouver Movers Instant Quote Engine',
    outreachEligibility: 'Eligible',
    outreachStatus: 'Draft Generated',
    followUpStatus: 'None',
    notes: 'Website built on outdated WordPress template with broken calculator plugin. High potential for instant AI quote tool.',
    verificationEvidence: [
      'BC Corporate Registry matching name and address',
      'Google Maps listing with 34 authentic reviews',
    ],
    auditReport: {
      identifiedProblems: [
        'Broken moving calculator plugin returning 404 errors',
        'Website is not HTTPS secure on mobile viewports',
        'Zero automated lead capture when phone lines are busy',
      ],
      supportingEvidence: ['Console errors on quote page', 'Mixed content warnings on SSL check'],
      recommendedServices: [
        'Instant AI Moving Quote & Room Inventory Calculator',
        'Modern High-Speed Responsive Website',
        'Automated SMS Lead Dispatch Notification',
      ],
      suggestedSalesApproach:
        'Show how fixing the broken calculator converts 40+ lost moving leads every single month.',
      hasWebsite: true,
      mobileResponsive: false,
      hasOnlineBooking: false,
      hasChatbot: false,
      hasContactForm: true,
      seoRating: 'Poor',
      pageSpeedScore: 34,
      digitalHealthScore: 36,
    },
    emailDraft: {
      subject: 'Broken quote calculator on Pacific Coast Movers website',
      opener: 'Hi Pacific Coast Movers Team, was looking at your moving services across Vancouver and the North Shore.',
      evidenceObservation:
        'When testing your online quote request page, the calculator plugin is throwing errors and preventing customers from submitting their inventory.',
      proposedSolution:
        'At AI by Faraz, we build clean, instant AI quote calculators that let homeowners get an exact moving estimate in 45 seconds and book the job directly.',
      valueProposition:
        'Our moving clients capture 30 to 45 additional qualified moves each month from people who otherwise leave for competitor sites.',
      callToAction: 'Would you like me to send a 2-minute screen recording showing the error and a quick fix?',
      signature: 'Best regards,\nFaraz\nAI by Faraz\nfaraz@aibyfaraz.com',
      fullBody: `Hi Pacific Coast Movers Team,

Was looking at your moving services across Vancouver and the North Shore.

When testing your online quote request page, the calculator plugin is throwing errors and preventing customers from submitting their inventory.

At AI by Faraz, we build clean, instant AI quote calculators that let homeowners get an exact moving estimate in 45 seconds and book the job directly.

Our moving clients capture 30 to 45 additional qualified moves each month from people who otherwise leave for competitor sites.

Would you like me to send a 2-minute screen recording showing the error and a quick fix?

Best regards,
Faraz
AI by Faraz
faraz@aibyfaraz.com`,
      followUp1: {
        subject: 'Quick video of the quote bug on Pacific Coast Movers',
        body: 'Hi team, checking if you had a moment to see the quote error on your site?',
        delayDays: 3,
      },
      followUp2: {
        subject: 'Final follow up: Moving quotes for Vancouver clients',
        body: 'Hi team, best wishes with your moving operations!',
        delayDays: 7,
      },
      generatedAt: new Date().toISOString(),
      approved: false,
    },
  },
  {
    id: 'LEAD-SUS-006',
    companyName: 'Apex Virtual Logistics Inc',
    industry: 'Freight & Logistics',
    businessCategory: 'Freight Brokerage',
    businessDescription: 'Purported international logistics and air cargo broker.',
    businessWebsite: 'https://apexvirtuallogistics-suspicious.fake',
    publicBusinessEmail: 'apexlogistics992@gmail.com',
    publicBusinessPhone: '+1-800-555-0199',
    businessAddress: 'P.O. Box 9912',
    city: 'Toronto',
    provinceOrState: 'Ontario',
    country: 'Canada',
    postalCode: 'M5J 0A1',
    authorizedLocationData: {},
    socialMediaProfiles: {},
    publicBusinessContactRole: 'Unknown',
    websiteStatus: 'Error',
    businessVerificationStatus: 'Suspicious Business',
    emailVerificationStatus: 'Risky',
    verificationConfidenceScore: 22,
    leadOpportunityScore: 15, // Cold / Disqualified
    dataSourceUrls: ['https://unverified-directory.example/apex'],
    researchTimestamp: new Date().toISOString(),
    campaignName: 'Toronto Luxury Limousines Q4',
    outreachEligibility: 'Ineligible',
    outreachStatus: 'Not Started',
    followUpStatus: 'None',
    notes: 'Quarantined in Suspicious Leads. Domain is unresolvable, free gmail address used for purported enterprise brokerage, no physical address.',
    verificationEvidence: [
      'DNS MX lookup failed for company domain',
      'Address is an unverified PO Box without physical presence',
      'No registration record found in corporate directory',
    ],
  },
];

// Initial Campaigns
const initialCampaigns: Campaign[] = [
  {
    id: 'CAMP-001',
    name: 'Toronto Luxury Limousines Q4',
    niche: 'Limousine and Chauffeur Services',
    subNiche: 'Corporate Airport Transfers',
    country: 'Canada',
    provinceOrState: 'Ontario',
    city: 'Toronto',
    radiusKm: 50,
    targetCount: 50,
    servicesOffered: ['Website Development', 'AI Reservation Chatbot', 'Automated Dispatch SMS'],
    status: 'Active',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    lastRunAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    stats: {
      discovered: 52,
      verified: 48,
      hot: 14,
      warm: 22,
      cold: 12,
      suspicious: 2,
      emailsGenerated: 14,
      emailsSent: 6,
      replies: 2,
    },
  },
  {
    id: 'CAMP-002',
    name: 'NYC Dental Clinics AI Chatbot',
    niche: 'Cosmetic Dentistry & Orthodontics',
    subNiche: 'Invisalign & Smile Makeovers',
    country: 'United States',
    provinceOrState: 'New York',
    city: 'New York',
    radiusKm: 30,
    targetCount: 75,
    servicesOffered: ['HIPAA AI Receptionist', 'Instant Patient Booking', 'Patient Reactivation SMS'],
    status: 'Active',
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    lastRunAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    stats: {
      discovered: 81,
      verified: 76,
      hot: 28,
      warm: 35,
      cold: 13,
      suspicious: 1,
      emailsGenerated: 28,
      emailsSent: 12,
      replies: 4,
    },
  },
  {
    id: 'CAMP-003',
    name: 'Dubai Commercial Fitout AI Automation',
    niche: 'Commercial Architecture & Construction',
    subNiche: 'Interior Fitouts & Turnkey Offices',
    country: 'United Arab Emirates',
    provinceOrState: 'Dubai Emirate',
    city: 'Dubai',
    radiusKm: 40,
    targetCount: 30,
    servicesOffered: ['Luxury Showcase Websites', 'AI Tender Scoping Engine', 'CRM Automation'],
    status: 'Active',
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    lastRunAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    stats: {
      discovered: 35,
      verified: 32,
      hot: 11,
      warm: 15,
      cold: 6,
      suspicious: 0,
      emailsGenerated: 11,
      emailsSent: 5,
      replies: 1,
    },
  },
];

// Initial Activity Logs
const initialLogs: ActivityLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    agentName: 'Master AI Orchestrator',
    agentRole: 'Central Coordination Engine',
    action: 'Plan Formulated',
    status: 'info',
    details: 'Initiated autonomous discovery plan for campaign "Toronto Luxury Limousines Q4". Target: 50 leads.',
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    agentName: 'Agent 02 — Lead Discovery',
    agentRole: 'Global Lead Discovery Agent',
    action: 'Discovered Businesses',
    status: 'success',
    details: 'Discovered 52 candidate businesses in Toronto via Google Places & public directory indexes.',
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    agentName: 'Agent 03 — Verification & Classification',
    agentRole: 'Lead Verification Agent',
    action: 'Verified Businesses',
    status: 'success',
    details: 'Verified 48 legitimate businesses. Quarantined 2 suspicious leads for human review.',
  },
  {
    id: 'LOG-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    agentName: 'Agent 05 — BI & Website Audit',
    agentRole: 'AI Business Intelligence Agent',
    action: 'Audit Completed',
    status: 'success',
    details: 'Identified 14 Hot Leads with critical website performance & missing AI booking bottlenecks.',
  },
  {
    id: 'LOG-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    agentName: 'Agent 06 — Email Copywriter',
    agentRole: 'Personalized Email Agent',
    action: 'Drafts Generated',
    status: 'success',
    details: 'Drafted 14 hyper-personalized cold outreach emails and follow-ups. Awaiting manual user review.',
  },
];

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialDb: DatabaseSchema = {
      leads: initialLeads,
      campaigns: initialCampaigns,
      scheduler: defaultScheduler,
      settings: defaultSettings,
      logs: initialLogs,
      nodes: initialNodes,
      sheetsSync: {
        syncedTabsCount: 12,
        status: 'Idle',
      },
      discordWebhook: {
        lastTestStatus: undefined,
      },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, returning defaults', err);
    return {
      leads: initialLeads,
      campaigns: initialCampaigns,
      scheduler: defaultScheduler,
      settings: defaultSettings,
      logs: initialLogs,
      nodes: initialNodes,
      sheetsSync: { syncedTabsCount: 12, status: 'Idle' },
      discordWebhook: {},
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}

// Database Operations
export const db = {
  // Leads
  getLeads: (): Lead[] => {
    return ensureDb().leads || [];
  },
  getLeadById: (id: string): Lead | undefined => {
    return ensureDb().leads.find((l) => l.id === id);
  },
  saveLead: (lead: Lead): Lead => {
    const data = ensureDb();
    const existingIndex = data.leads.findIndex((l) => l.id === lead.id);
    if (existingIndex >= 0) {
      data.leads[existingIndex] = lead;
    } else {
      data.leads.unshift(lead);
    }
    writeDb(data);
    return lead;
  },
  saveLeadsBatch: (newLeads: Lead[]): void => {
    const data = ensureDb();
    for (const lead of newLeads) {
      const idx = data.leads.findIndex((l) => l.id === lead.id || (l.businessWebsite && l.businessWebsite === lead.businessWebsite));
      if (idx >= 0) {
        data.leads[idx] = { ...data.leads[idx], ...lead };
      } else {
        data.leads.unshift(lead);
      }
    }
    writeDb(data);
  },
  deleteLead: (id: string): boolean => {
    const data = ensureDb();
    const originalLength = data.leads.length;
    data.leads = data.leads.filter((l) => l.id !== id);
    if (data.leads.length !== originalLength) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // Campaigns
  getCampaigns: (): Campaign[] => {
    return ensureDb().campaigns || [];
  },
  getCampaignById: (id: string): Campaign | undefined => {
    return ensureDb().campaigns.find((c) => c.id === id);
  },
  saveCampaign: (campaign: Campaign): Campaign => {
    const data = ensureDb();
    const idx = data.campaigns.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) {
      data.campaigns[idx] = campaign;
    } else {
      data.campaigns.unshift(campaign);
    }
    writeDb(data);
    return campaign;
  },

  // Nodes for React Flow
  getNodes: (): AgentNodeData[] => {
    return ensureDb().nodes || initialNodes;
  },
  updateNode: (id: string, updates: Partial<AgentNodeData>): AgentNodeData | undefined => {
    const data = ensureDb();
    const idx = data.nodes.findIndex((n) => n.id === id);
    if (idx >= 0) {
      data.nodes[idx] = { ...data.nodes[idx], ...updates };
      writeDb(data);
      return data.nodes[idx];
    }
    return undefined;
  },

  // Scheduler
  getScheduler: (): SchedulerConfig => {
    return ensureDb().scheduler || defaultScheduler;
  },
  updateScheduler: (updates: Partial<SchedulerConfig>): SchedulerConfig => {
    const data = ensureDb();
    data.scheduler = { ...data.scheduler, ...updates };
    writeDb(data);
    return data.scheduler;
  },

  // System Settings
  getSettings: (): SystemSettings => {
    return ensureDb().settings || defaultSettings;
  },
  updateSettings: (updates: Partial<SystemSettings>): SystemSettings => {
    const data = ensureDb();
    data.settings = { ...data.settings, ...updates };
    writeDb(data);
    return data.settings;
  },

  // Activity Logs
  getLogs: (limit = 100): ActivityLog[] => {
    const logs = ensureDb().logs || [];
    return logs.slice(0, limit);
  },
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog => {
    const data = ensureDb();
    const newLog: ActivityLog = {
      id: `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    data.logs.unshift(newLog);
    if (data.logs.length > 500) {
      data.logs = data.logs.slice(0, 500);
    }
    writeDb(data);
    return newLog;
  },

  // Sheets Sync & Discord Webhook info
  getSheetsSync: () => ensureDb().sheetsSync,
  updateSheetsSync: (updates: Partial<DatabaseSchema['sheetsSync']>) => {
    const data = ensureDb();
    data.sheetsSync = { ...data.sheetsSync, ...updates };
    writeDb(data);
    return data.sheetsSync;
  },
  getDiscordWebhookInfo: () => ensureDb().discordWebhook,
  updateDiscordWebhookInfo: (updates: Partial<DatabaseSchema['discordWebhook']>) => {
    const data = ensureDb();
    data.discordWebhook = { ...data.discordWebhook, ...updates };
    writeDb(data);
    return data.discordWebhook;
  },
};
