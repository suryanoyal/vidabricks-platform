'use client';

import { Agent, AnalyticsEvent, AnalyticsEventType, BrokerageSettings, LeadInquiry, AdminUser } from './types';
import { INITIAL_AGENTS, DEFAULT_BROKERAGE_SETTINGS, INITIAL_LEADS } from './seedData';
import { createAnalyticsEvent } from './analytics';
import { supabaseApi, isSupabaseConfigured } from './supabase';

const AGENTS_STORAGE_KEY = 'vidabricks_agents_v1';
const SETTINGS_STORAGE_KEY = 'vidabricks_settings_v1';
const ANALYTICS_STORAGE_KEY = 'vidabricks_analytics_v1';
const LEADS_STORAGE_KEY = 'vidabricks_leads_v1';
const AUTH_STORAGE_KEY = 'vidabricks_admin_auth_v1';

// In-memory fallback and singleton cache
let memoryAgents: Agent[] = [...INITIAL_AGENTS];
let memorySettings: BrokerageSettings = { ...DEFAULT_BROKERAGE_SETTINGS };
let memoryAnalytics: AnalyticsEvent[] = [];
let memoryLeads: LeadInquiry[] = [...INITIAL_LEADS];
let memoryAdmin: AdminUser | null = null;
let isCloudSynced = false;

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Helper to safely access localStorage
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch (e) {
    console.error('Storage read error:', e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Initialize seed historical analytics if empty
function initializeSeedAnalytics(agents: Agent[]): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  const now = new Date();
  
  agents.forEach((agent) => {
    for (let day = 0; day < 30; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      const viewsCount = Math.floor(Math.random() * 15) + (agent.isFeatured ? 10 : 3);
      for (let v = 0; v < viewsCount; v++) {
        events.push({
          id: `seed_v_${agent.id}_${day}_${v}`,
          agentId: agent.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          eventType: 'profile_view',
          timestamp: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
          deviceType: Math.random() > 0.3 ? 'mobile' : 'desktop',
          referrer: 'https://agents.vidabricks.com',
        });
      }
    }
  });

  return events;
}

// Background sync from Supabase if configured
async function syncFromCloud() {
  if (!isSupabaseConfigured || typeof window === 'undefined' || isCloudSynced) return;
  isCloudSynced = true;

  try {
    const cloudAgents = await supabaseApi.fetchAgents();
    if (cloudAgents && cloudAgents.length > 0) {
      memoryAgents = cloudAgents;
      setLocalItem(AGENTS_STORAGE_KEY, cloudAgents);
      notifyListeners();
    }

    const cloudSettings = await supabaseApi.fetchSettings();
    if (cloudSettings) {
      memorySettings = { ...DEFAULT_BROKERAGE_SETTINGS, ...cloudSettings };
      setLocalItem(SETTINGS_STORAGE_KEY, memorySettings);
      notifyListeners();
    }

    const cloudLeads = await supabaseApi.fetchLeads();
    if (cloudLeads && cloudLeads.length > 0) {
      memoryLeads = cloudLeads;
      setLocalItem(LEADS_STORAGE_KEY, cloudLeads);
      notifyListeners();
    }
  } catch (e) {
    console.warn('Cloud sync background error:', e);
  }
}

// Trigger initial cloud sync when in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncFromCloud();
  }, 100);
}

export const platformStore = {
  isCloudConnected(): boolean {
    return isSupabaseConfigured;
  },

  async refreshFromCloud(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const cloudAgents = await supabaseApi.fetchAgents();
      if (cloudAgents && cloudAgents.length > 0) {
        memoryAgents = cloudAgents;
        setLocalItem(AGENTS_STORAGE_KEY, cloudAgents);
      }
      const cloudSettings = await supabaseApi.fetchSettings();
      if (cloudSettings) {
        memorySettings = { ...DEFAULT_BROKERAGE_SETTINGS, ...cloudSettings };
        setLocalItem(SETTINGS_STORAGE_KEY, memorySettings);
      }
      const cloudLeads = await supabaseApi.fetchLeads();
      if (cloudLeads) {
        memoryLeads = cloudLeads;
        setLocalItem(LEADS_STORAGE_KEY, cloudLeads);
      }
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- AGENTS ---
  getAgents(): Agent[] {
    if (typeof window === 'undefined') return memoryAgents;
    const stored = getLocalItem<Agent[]>(AGENTS_STORAGE_KEY, INITIAL_AGENTS);
    memoryAgents = stored;
    return stored;
  },

  getAgentBySlug(slug: string): Agent | undefined {
    const agents = this.getAgents();
    return agents.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
  },

  getAgentById(id: string): Agent | undefined {
    const agents = this.getAgents();
    return agents.find((a) => a.id === id);
  },

  saveAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'profileViews' | 'whatsappClicks' | 'callClicks' | 'emailClicks' | 'vcardDownloads' | 'shares' | 'inquiriesCount'> & { id?: string }): Agent {
    const agents = this.getAgents();
    const now = new Date().toISOString();

    let targetAgent: Agent;

    if (agentData.id) {
      // Update existing
      const index = agents.findIndex((a) => a.id === agentData.id);
      if (index !== -1) {
        targetAgent = {
          ...agents[index],
          ...agentData,
          updatedAt: now,
        };
        agents[index] = targetAgent;
      } else {
        targetAgent = {
          ...agentData,
          id: agentData.id,
          profileViews: 0,
          whatsappClicks: 0,
          callClicks: 0,
          emailClicks: 0,
          vcardDownloads: 0,
          shares: 0,
          inquiriesCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        agents.unshift(targetAgent);
      }
    } else {
      // Create new
      targetAgent = {
        ...agentData,
        id: 'agent_' + Math.random().toString(36).substring(2, 9) + Date.now(),
        profileViews: 0,
        whatsappClicks: 0,
        callClicks: 0,
        emailClicks: 0,
        vcardDownloads: 0,
        shares: 0,
        inquiriesCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      agents.unshift(targetAgent);
    }

    setLocalItem(AGENTS_STORAGE_KEY, agents);
    memoryAgents = agents;
    notifyListeners();

    // Async save to Supabase Cloud
    if (isSupabaseConfigured) {
      supabaseApi.saveAgent(targetAgent);
    }

    return targetAgent;
  },

  async saveAgentAsync(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'profileViews' | 'whatsappClicks' | 'callClicks' | 'emailClicks' | 'vcardDownloads' | 'shares' | 'inquiriesCount'> & { id?: string }): Promise<Agent> {
    const saved = this.saveAgent(agentData);
    if (isSupabaseConfigured) {
      await supabaseApi.saveAgent(saved);
    }
    return saved;
  },

  deleteAgent(id: string): boolean {
    const agents = this.getAgents();
    const filtered = agents.filter((a) => a.id !== id);
    if (filtered.length !== agents.length) {
      setLocalItem(AGENTS_STORAGE_KEY, filtered);
      memoryAgents = filtered;
      notifyListeners();

      if (isSupabaseConfigured) {
        supabaseApi.deleteAgent(id);
      }
      return true;
    }
    return false;
  },

  async deleteAgentAsync(id: string): Promise<boolean> {
    const deleted = this.deleteAgent(id);
    if (deleted && isSupabaseConfigured) {
      await supabaseApi.deleteAgent(id);
    }
    return deleted;
  },

  toggleAgentStatus(id: string): Agent | undefined {
    const agents = this.getAgents();
    const agent = agents.find((a) => a.id === id);
    if (agent) {
      agent.status = agent.status === 'active' ? 'inactive' : 'active';
      agent.updatedAt = new Date().toISOString();
      setLocalItem(AGENTS_STORAGE_KEY, agents);
      memoryAgents = agents;
      notifyListeners();

      if (isSupabaseConfigured) {
        supabaseApi.saveAgent(agent);
      }
      return agent;
    }
    return undefined;
  },

  // --- ANALYTICS ---
  trackEvent(agentId: string, eventType: AnalyticsEventType, details?: Record<string, any>): void {
    const agent = this.getAgentById(agentId);
    if (!agent) return;

    if (eventType === 'profile_view') agent.profileViews++;
    if (eventType === 'whatsapp_click') agent.whatsappClicks++;
    if (eventType === 'call_click') agent.callClicks++;
    if (eventType === 'email_click') agent.emailClicks++;
    if (eventType === 'contact_download') agent.vcardDownloads++;
    if (eventType === 'profile_share') agent.shares++;
    if (eventType === 'inquiry_submit') agent.inquiriesCount++;

    const agents = this.getAgents();
    const index = agents.findIndex((a) => a.id === agentId);
    if (index !== -1) {
      agents[index] = agent;
      setLocalItem(AGENTS_STORAGE_KEY, agents);
      memoryAgents = agents;
    }

    const event = createAnalyticsEvent(
      agentId,
      `${agent.firstName} ${agent.lastName}`,
      eventType,
      details
    );
    const analytics = this.getAnalytics();
    analytics.unshift(event);
    setLocalItem(ANALYTICS_STORAGE_KEY, analytics);
    memoryAnalytics = analytics;

    notifyListeners();

    // Async cloud tracking
    if (isSupabaseConfigured) {
      supabaseApi.trackEvent(agentId, eventType, details);
    }
  },

  getAnalytics(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return memoryAnalytics;
    let stored = getLocalItem<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY, []);
    if (stored.length === 0) {
      stored = initializeSeedAnalytics(this.getAgents());
      setLocalItem(ANALYTICS_STORAGE_KEY, stored);
    }
    memoryAnalytics = stored;
    return stored;
  },

  getAnalyticsEvents(): AnalyticsEvent[] {
    return this.getAnalytics();
  },

  getAgentAnalytics(agentId: string): AnalyticsEvent[] {
    const all = this.getAnalytics();
    return all.filter((e) => e.agentId === agentId);
  },

  // --- LEADS ---
  getLeads(): LeadInquiry[] {
    if (typeof window === 'undefined') return memoryLeads;
    const stored = getLocalItem<LeadInquiry[]>(LEADS_STORAGE_KEY, INITIAL_LEADS);
    memoryLeads = stored;
    return stored;
  },

  submitLead(leadData: Omit<LeadInquiry, 'id' | 'createdAt' | 'status'>): LeadInquiry {
    const leads = this.getLeads();
    const newLead: LeadInquiry = {
      ...leadData,
      id: 'lead_' + Math.random().toString(36).substring(2, 9) + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    leads.unshift(newLead);
    setLocalItem(LEADS_STORAGE_KEY, leads);
    memoryLeads = leads;

    this.trackEvent(leadData.agentId, 'inquiry_submit', {
      propertyInterest: leadData.propertyInterest,
      budgetRange: leadData.budgetRange,
    });

    notifyListeners();

    // Async cloud save
    if (isSupabaseConfigured) {
      supabaseApi.saveLead(newLead);
    }

    return newLead;
  },

  addLead(leadData: Omit<LeadInquiry, 'id' | 'createdAt' | 'status'>): LeadInquiry {
    return this.submitLead(leadData);
  },

  updateLeadStatus(leadId: string, status: LeadInquiry['status']): LeadInquiry | undefined {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index !== -1) {
      leads[index].status = status;
      setLocalItem(LEADS_STORAGE_KEY, leads);
      memoryLeads = leads;
      notifyListeners();

      if (isSupabaseConfigured) {
        supabaseApi.saveLead(leads[index]);
      }
      return leads[index];
    }
    return undefined;
  },

  deleteLead(leadId: string): boolean {
    const leads = this.getLeads();
    const filtered = leads.filter((l) => l.id !== leadId);
    if (filtered.length !== leads.length) {
      setLocalItem(LEADS_STORAGE_KEY, filtered);
      memoryLeads = filtered;
      notifyListeners();
      return true;
    }
    return false;
  },

  // --- SETTINGS ---
  getSettings(): BrokerageSettings {
    if (typeof window === 'undefined') return memorySettings;
    const stored = getLocalItem<BrokerageSettings>(SETTINGS_STORAGE_KEY, DEFAULT_BROKERAGE_SETTINGS);
    const merged = { ...DEFAULT_BROKERAGE_SETTINGS, ...stored };
    memorySettings = merged;
    return merged;
  },

  saveSettings(newSettings: Partial<BrokerageSettings>): BrokerageSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    setLocalItem(SETTINGS_STORAGE_KEY, updated);
    memorySettings = updated;
    notifyListeners();

    if (isSupabaseConfigured) {
      supabaseApi.saveSettings(updated);
    }
    return updated;
  },

  updateSettings(newSettings: Partial<BrokerageSettings>): BrokerageSettings {
    return this.saveSettings(newSettings);
  },

  // --- AUTHENTICATION ---
  getAdminUser(): AdminUser | null {
    if (typeof window === 'undefined') return memoryAdmin;
    const stored = getLocalItem<AdminUser | null>(AUTH_STORAGE_KEY, null);
    memoryAdmin = stored;
    return stored;
  },

  login(email: string, pass: string): { success: boolean; user?: AdminUser; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (cleanEmail === 'admin@vidabricks.com' && cleanPass === 'VidaDubai2026!') {
      const user: AdminUser = {
        id: 'admin-super-1',
        name: 'Vidabricks Super Admin',
        email: 'admin@vidabricks.com',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        lastLogin: new Date().toISOString(),
      };
      setLocalItem(AUTH_STORAGE_KEY, user);
      memoryAdmin = user;
      notifyListeners();
      return { success: true, user };
    }

    return { success: false, error: 'Invalid email address or password. Please try again.' };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    memoryAdmin = null;
    notifyListeners();
  },

  // --- RESET TO DEFAULTS ---
  resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AGENTS_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
      localStorage.removeItem(LEADS_STORAGE_KEY);
    }
    memoryAgents = [...INITIAL_AGENTS];
    memorySettings = { ...DEFAULT_BROKERAGE_SETTINGS };
    memoryAnalytics = [];
    memoryLeads = [...INITIAL_LEADS];
    notifyListeners();
  },
};
