export interface Lead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  telegramUsername?: string;
  telegramId?: string;
  company?: string;
  position?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'telegram' | 'website' | 'referral' | 'social_media' | 'other';
  createdAt: string;
  updatedAt: string;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadSource {
  TELEGRAM = 'telegram',
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  OTHER = 'other',
}
