export type VerificationStatus =
  | 'Verified Business'
  | 'Likely Genuine Business'
  | 'Unverified Business'
  | 'Suspicious Business'
  | 'Permanently Closed Business'
  | 'Duplicate Lead';

export type EmailVerificationStatus = 'Valid' | 'Risky' | 'Invalid' | 'Not Found';

export type OutreachEligibility = 'Eligible' | 'Ineligible' | 'Suppressed' | 'Unsubscribed';

export type OutreachStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Draft Generated'
  | 'Sent'
  | 'Replied'
  | 'Bounced'
  | 'Rejected'
  | 'Not Started';

export type FollowUpStatus =
  | 'None'
  | 'Follow-up 1 Scheduled'
  | 'Follow-up 1 Sent'
  | 'Follow-up 2 Scheduled'
  | 'Follow-up 2 Sent'
  | 'Stopped';

export interface AuditReport {
  identifiedProblems: string[];
  supportingEvidence: string[];
  recommendedServices: string[];
  suggestedSalesApproach: string;
  hasWebsite: boolean;
  mobileResponsive: boolean;
  hasOnlineBooking: boolean;
  hasChatbot: boolean;
  hasContactForm: boolean;
  seoRating: 'Good' | 'Fair' | 'Poor';
  pageSpeedScore: number;
  digitalHealthScore: number;
}

export interface EmailDraft {
  subject: string;
  opener: string;
  evidenceObservation: string;
  proposedSolution: string;
  valueProposition: string;
  callToAction: string;
  signature: string;
  fullBody: string;
  followUp1: {
    subject: string;
    body: string;
    delayDays: number;
  };
  followUp2: {
    subject: string;
    body: string;
    delayDays: number;
  };
  generatedAt: string;
  approved: boolean;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface Lead {
  id: string; // Unique Lead ID
  companyName: string;
  industry: string;
  businessCategory: string;
  businessDescription: string;
  businessWebsite: string;
  publicBusinessEmail: string;
  publicBusinessPhone: string;
  businessAddress: string;
  city: string;
  provinceOrState: string;
  country: string;
  postalCode: string;
  authorizedLocationData: {
    latitude?: number;
    longitude?: number;
    formattedAddress?: string;
    placeId?: string;
  };
  socialMediaProfiles: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  publicBusinessContactRole: string;
  websiteStatus: 'Active' | 'Outdated' | 'No Website' | 'Error';
  businessVerificationStatus: VerificationStatus;
  emailVerificationStatus: EmailVerificationStatus;
  verificationConfidenceScore: number; // 0 to 100
  leadOpportunityScore: number; // 0 to 100 (80-100: Hot, 60-79: Warm, 0-59: Cold)
  dataSourceUrls: string[];
  researchTimestamp: string;
  campaignName: string;
  outreachEligibility: OutreachEligibility;
  outreachStatus: OutreachStatus;
  followUpStatus: FollowUpStatus;
  notes: string;
  verificationEvidence?: string[];
  auditReport?: AuditReport;
  emailDraft?: EmailDraft;
  sentAt?: string;
  replyReceived?: {
    date: string;
    snippet: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Unsubscribe';
  };
}

export interface AgentNodeData {
  id: string;
  nodeNumber: string;
  category: 'TRIGGER' | 'AI' | 'TOOL' | 'ACTION';
  label: string;
  subtitle: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabledTools?: string[];
  lastRunStatus?: 'success' | 'running' | 'idle' | 'failed';
  lastRunTime?: string;
  lastRunDuration?: string;
  lastRunDetails?: string;
  runCostUsd?: number;
  tokensUsed?: number;
  activityDescription?: string;
  colorScheme: 'mint' | 'violet' | 'amber' | 'coral';
}

export interface Campaign {
  id: string;
  name: string;
  niche: string;
  subNiche?: string;
  country: string;
  provinceOrState?: string;
  city: string;
  radiusKm: number;
  targetCount: number;
  servicesOffered: string[];
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  createdAt: string;
  lastRunAt?: string;
  stats: {
    discovered: number;
    verified: number;
    hot: number;
    warm: number;
    cold: number;
    suspicious: number;
    emailsGenerated: number;
    emailsSent: number;
    replies: number;
  };
}

export interface SchedulerConfig {
  enabled: boolean;
  cronExpression: string; // "0 9 * * *"
  dailyRunTime: string; // "09:00"
  timezone: string; // "America/Toronto"
  targetLeadsPerDay: number; // 50
  lastExecutionAt?: string;
  nextExecutionAt?: string;
  paused: boolean;
  missedExecutionRecovery: boolean;
  duplicateProtection: boolean;
}

export interface SystemSettings {
  senderBrand: string; // "AI by Faraz"
  senderEmail: string;
  senderTitle: string;
  defaultServices: string[];
  openRouterApiKey: string;
  openRouterModel: string;
  dailyEmailLimit: number;
  approvalMode: 'manual' | 'auto';
  antiSpamComplianceMode: boolean;
  emergencyStop: boolean;
  googlePlacesApiKey?: string;
  googleSearchApiKey?: string;
  googleSearchEngineId?: string;
  discordWebhookUrl?: string;
  googleSheetId?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  agentName: string;
  agentRole: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  details: string;
  payload?: any;
}
