import { createClient } from '@supabase/supabase-js';
import { Agent, BrokerageSettings, LeadInquiry } from './types';
import { INITIAL_AGENTS, DEFAULT_BROKERAGE_SETTINGS } from './seedData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database record interfaces for PostgreSQL mapping
export interface DbAgent {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  job_title: string;
  rera_number: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
  bio: string;
  photo: string;
  nationality?: string | null;
  experience_years: number;
  location: string;
  specialisations: string[];
  areas: string[];
  languages: string[];
  social: Record<string, string>;
  focus_properties: any[];
  custom_whatsapp_message?: string | null;
  is_featured?: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function mapDbAgentToAgent(db: DbAgent): Agent {
  return {
    id: db.id,
    slug: db.slug,
    firstName: db.first_name,
    lastName: db.last_name,
    jobTitle: db.job_title,
    reraNumber: db.rera_number || '',
    phone: db.phone,
    whatsapp: db.whatsapp || db.phone,
    email: db.email,
    bio: db.bio,
    photo: db.photo,
    nationality: db.nationality || undefined,
    experienceYears: db.experience_years || 0,
    location: db.location || 'Dubai, UAE',
    specialisations: db.specialisations || [],
    areas: db.areas || [],
    languages: db.languages || ['English'],
    social: db.social || {},
    focusProperties: db.focus_properties || [],
    customWhatsappMessage: db.custom_whatsapp_message || undefined,
    isFeatured: db.is_featured || false,
    status: db.status || 'active',
    profileViews: 0,
    whatsappClicks: 0,
    callClicks: 0,
    emailClicks: 0,
    vcardDownloads: 0,
    shares: 0,
    inquiriesCount: 0,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function mapAgentToDbAgent(agent: Agent): Partial<DbAgent> {
  return {
    id: agent.id,
    slug: agent.slug,
    first_name: agent.firstName,
    last_name: agent.lastName,
    job_title: agent.jobTitle,
    rera_number: agent.reraNumber || null,
    phone: agent.phone,
    whatsapp: agent.whatsapp || null,
    email: agent.email,
    bio: agent.bio,
    photo: agent.photo,
    nationality: agent.nationality || null,
    experience_years: agent.experienceYears || 0,
    location: agent.location || 'Dubai, UAE',
    specialisations: agent.specialisations || [],
    areas: agent.areas || [],
    languages: agent.languages || ['English'],
    social: agent.social as any || {},
    focus_properties: agent.focusProperties || [],
    custom_whatsapp_message: agent.customWhatsappMessage || null,
    is_featured: agent.isFeatured || false,
    status: agent.status || 'active',
    updated_at: new Date().toISOString(),
  };
}

// Cloud API Helpers
export const supabaseApi = {
  async fetchAgents(): Promise<Agent[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetchAgents error:', error.message);
        return null;
      }

      if (data && data.length > 0) {
        return data.map(mapDbAgentToAgent);
      }
      return [];
    } catch (e) {
      console.warn('Failed to fetch from Supabase:', e);
      return null;
    }
  },

  async saveAgent(agent: Agent): Promise<boolean> {
    if (!supabase) return false;
    try {
      const dbAgent = mapAgentToDbAgent(agent);
      const { error } = await supabase
        .from('agents')
        .upsert(dbAgent, { onConflict: 'id' });

      if (error) {
        console.error('Supabase saveAgent error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Failed to save to Supabase:', e);
      return false;
    }
  },

  async deleteAgent(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('agents').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async fetchSettings(): Promise<BrokerageSettings | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error || !data) return null;
      return data.payload as BrokerageSettings;
    } catch (e) {
      return null;
    }
  },

  async saveSettings(settings: BrokerageSettings): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'default', payload: settings, updated_at: new Date().toISOString() });
      return !error;
    } catch (e) {
      return false;
    }
  },

  async fetchLeads(): Promise<LeadInquiry[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map((d) => ({
        id: d.id,
        agentId: d.agent_id,
        agentName: d.agent_name || 'Vidabricks Agent',
        clientName: d.client_name || d.name || '',
        clientEmail: d.client_email || d.email || '',
        clientPhone: d.client_phone || d.phone || '',
        message: d.message,
        propertyInterest: d.property_interest,
        budgetRange: d.budget_range,
        status: d.status,
        createdAt: d.created_at,
      }));
    } catch (e) {
      return null;
    }
  },

  async saveLead(lead: LeadInquiry): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('leads').upsert({
        id: lead.id,
        agent_id: lead.agentId,
        agent_name: lead.agentName,
        client_name: lead.clientName,
        client_email: lead.clientEmail,
        client_phone: lead.clientPhone,
        message: lead.message,
        property_interest: lead.propertyInterest,
        budget_range: lead.budgetRange,
        status: lead.status,
        created_at: lead.createdAt,
      });
      return !error;
    } catch (e) {
      return false;
    }
  },

  async trackEvent(agentId: string, eventType: string, metadata?: Record<string, any>): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.from('analytics').insert({
        agent_id: agentId,
        event_type: eventType,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      // Non-blocking
    }
  },
};
