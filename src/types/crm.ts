export type LeadSource = 'landing-page' | 'inbound-call' | 'manual';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface UserProfile {
  id: string;
  email: string;
  role: 'landlord' | 'renter';
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl?: string;
  logoUrl?: string;
  service: string;
  defaultLandingPage: string;
  heroEffect?: 'slideshow' | 'parallax';
  ownerId: string;
  currentRenterId: string | null;
  isPubliclyListed: boolean;
  monthlyRentPrice: number;
  stripePriceId?: string;
  bookingLink?: string; // Cal.com booking link
  monthlyLeadCap?: number;
  leadForwardingEmail?: string;
  leadForwardingPhone?: string;
  leadForwardingEnabled?: boolean;
  niche?: string;
}

export interface CallLog {
  callSid: string;
  agentId: string;
  callerNumber: string;
  duration: number;
  transcript: string;
  summary: string;
  outcome: 'answered' | 'voicemail' | 'missed';
  leadCaptured: boolean;
  leadId: string | null;
  startedAt: string;
  recordingUrl?: string;
  assignedRenterId?: string | null;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  agentSummary: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  assignedRenterId?: string | null;
}

