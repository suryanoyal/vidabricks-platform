export type AgentStatus = 'active' | 'inactive';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  website?: string;
}

export interface FocusProperty {
  id: string;
  title: string;
  developer: string;
  location: string;
  startingPrice: string;
  type: string;
  imageUrl: string;
  tag?: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  photo: string;
  jobTitle: string;
  reraNumber: string;
  phone: string;
  whatsapp: string;
  email: string;
  bio: string;
  languages: string[];
  nationality?: string;
  experienceYears?: number;
  location: string;
  specialisations: string[];
  areas: string[];
  social: SocialLinks;
  focusProperties?: FocusProperty[];
  customWhatsappMessage?: string;
  status: AgentStatus;
  isFeatured?: boolean;
  profileViews: number;
  whatsappClicks: number;
  callClicks: number;
  emailClicks: number;
  vcardDownloads: number;
  shares: number;
  inquiriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AnalyticsEventType =
  | 'profile_view'
  | 'whatsapp_click'
  | 'call_click'
  | 'email_click'
  | 'contact_download'
  | 'profile_share'
  | 'social_click'
  | 'qr_scan'
  | 'inquiry_submit';

export interface AnalyticsEvent {
  id: string;
  agentId: string;
  agentName: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  referrer?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  platform?: string;
  details?: Record<string, any>;
}

export interface LeadInquiry {
  id: string;
  agentId: string;
  agentName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  propertyInterest?: string;
  budgetRange?: string;
  message?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'broker_admin';
  avatar?: string;
  lastLogin?: string;
}

export interface BrokerageSettings {
  name: string;
  legalName: string;
  reraOrn: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  officeLocation: string;
  defaultWhatsappTemplate: string;
  enablePublicDirectory: boolean;
  brandTagline: string;
  logoUrl?: string;
  darkLogoUrl?: string;
}
