'use client';

import { Agent, AnalyticsEvent, AnalyticsEventType, BrokerageSettings, LeadInquiry, AdminUser } from './types';
import { INITIAL_AGENTS, DEFAULT_BROKERAGE_SETTINGS, INITIAL_LEADS } from './seedData';
import { createAnalyticsEvent } from './analytics';

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
    // Generate realistic simulated events over the past 30 days
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
          deviceType: Math.random() > 0.25 ? 'mobile' : 'desktop',
          referrer: Math.random() > 0.4 ? 'whatsapp' : 'qr_code',
        });
      }

      const waCount = Math.floor(viewsCount * 0.22);
      for (let w = 0; w < waCount; w++) {
        events.push({
          id: `seed_wa_${agent.id}_${day}_${w}`,
          agentId: agent.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          eventType: 'whatsapp_click',
          timestamp: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
          deviceType: 'mobile',
        });
      }

      const callCount = Math.floor(viewsCount * 0.08);
      for (let c = 0; c < callCount; c++) {
        events.push({
          id: `seed_call_${agent.id}_${day}_${c}`,
          agentId: agent.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          eventType: 'call_click',
          timestamp: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
          deviceType: 'mobile',
        });
      }
    }
  });

  return events;
}

export const platformStore = {
  // --- AGENTS ---
  getAgents(): Agent[] {
    if (typeof window === 'undefined') return memoryAgents;
    const stored = getLocalItem<Agent[]>(AGENTS_STORAGE_KEY, []);
    if (!stored || stored.length === 0) {
      setLocalItem(AGENTS_STORAGE_KEY, INITIAL_AGENTS);
      memoryAgents = [...INITIAL_AGENTS];
      return memoryAgents;
    }
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

    if (agentData.id) {
      // Update existing
      const index = agents.findIndex((a) => a.id === agentData.id);
      if (index !== -1) {
        const updated: Agent = {
          ...agents[index],
          ...agentData,
          updatedAt: now,
        };
        agents[index] = updated;
        setLocalItem(AGENTS_STORAGE_KEY, agents);
        memoryAgents = agents;
        notifyListeners();
        return updated;
      }
    }

    // Create new
    const newAgent: Agent = {
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

    agents.unshift(newAgent);
    setLocalItem(AGENTS_STORAGE_KEY, agents);
    memoryAgents = agents;
    notifyListeners();
    return newAgent;
  },

  deleteAgent(id: string): boolean {
    const agents = this.getAgents();
    const filtered = agents.filter((a) => a.id !== id);
    if (filtered.length !== agents.length) {
      setLocalItem(AGENTS_STORAGE_KEY, filtered);
      memoryAgents = filtered;
      notifyListeners();
      return true;
    }
    return false;
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
      return agent;
    }
    return undefined;
  },

  // --- ANALYTICS ---
  trackEvent(agentId: string, eventType: AnalyticsEventType, details?: Record<string, any>): void {
    const agent = this.getAgentById(agentId);
    if (!agent) return;

    // 1. Update agent metric counter
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
    }

    // 2. Append event log
    const event = createAnalyticsEvent(agent.id, `${agent.firstName} ${agent.lastName}`, eventType, details);
    const events = this.getAnalyticsEvents();
    events.unshift(event);
    // Keep max 2000 events
    const trimmed = events.slice(0, 2000);
    setLocalItem(ANALYTICS_STORAGE_KEY, trimmed);
    memoryAnalytics = trimmed;
    notifyListeners();
  },

  getAnalyticsEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return memoryAnalytics;
    let stored = getLocalItem<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY, []);
    if (!stored || stored.length === 0) {
      stored = initializeSeedAnalytics(this.getAgents());
      setLocalItem(ANALYTICS_STORAGE_KEY, stored);
    }
    memoryAnalytics = stored;
    return stored;
  },

  // --- LEADS ---
  getLeads(): LeadInquiry[] {
    if (typeof window === 'undefined') return memoryLeads;
    let stored = getLocalItem<LeadInquiry[]>(LEADS_STORAGE_KEY, []);
    if (!stored || stored.length === 0) {
      setLocalItem(LEADS_STORAGE_KEY, INITIAL_LEADS);
      stored = INITIAL_LEADS;
    }
    memoryLeads = stored;
    return stored;
  },

  addLead(lead: Omit<LeadInquiry, 'id' | 'createdAt' | 'status'>): LeadInquiry {
    const leads = this.getLeads();
    const newLead: LeadInquiry = {
      ...lead,
      id: 'lead_' + Math.random().toString(36).substring(2, 9) + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    leads.unshift(newLead);
    setLocalItem(LEADS_STORAGE_KEY, leads);
    memoryLeads = leads;

    // Track analytics event
    this.trackEvent(lead.agentId, 'inquiry_submit', {
      clientName: lead.clientName,
      property: lead.propertyInterest,
    });

    notifyListeners();
    return newLead;
  },

  updateLeadStatus(leadId: string, status: 'new' | 'contacted' | 'closed'): void {
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      lead.status = status;
      setLocalItem(LEADS_STORAGE_KEY, leads);
      memoryLeads = leads;
      notifyListeners();
    }
  },

  // --- BROKERAGE SETTINGS ---
  getSettings(): BrokerageSettings {
    if (typeof window === 'undefined') return memorySettings;
    const stored = getLocalItem<BrokerageSettings>(SETTINGS_STORAGE_KEY, DEFAULT_BROKERAGE_SETTINGS);
    const merged = { ...DEFAULT_BROKERAGE_SETTINGS, ...stored };
    memorySettings = merged;
    return merged;
  },

  updateSettings(settings: Partial<BrokerageSettings>): BrokerageSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setLocalItem(SETTINGS_STORAGE_KEY, updated);
    memorySettings = updated;
    notifyListeners();
    return updated;
  },

  // --- ADMIN AUTH ---
  getAdminUser(): AdminUser | null {
    if (typeof window === 'undefined') return memoryAdmin;
    const stored = getLocalItem<AdminUser | null>(AUTH_STORAGE_KEY, null);
    memoryAdmin = stored;
    return stored;
  },

  login(email: string, pass: string): { success: boolean; user?: AdminUser; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // Verify Super Admin credentials
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
    memoryLeads = [...INITIAL_LEADS];
    memoryAnalytics = [];
    notifyListeners();
  },
};
