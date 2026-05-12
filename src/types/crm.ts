export type LeadSource = 'landing-page' | 'inbound-call' | 'manual';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

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
}
