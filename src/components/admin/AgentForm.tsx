'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Award,
  Globe,
  Share2,
  Settings,
  Plus,
  X,
  Upload,
  Check,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';
import { Agent } from '@/lib/types';
import { platformStore } from '@/lib/store';
import { slugify } from '@/lib/utils';
import { LiveMobileMockup } from './LiveMobileMockup';

interface AgentFormProps {
  initialData?: Agent;
  isEditing?: boolean;
}

const LUXURY_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85&auto=format&fit=crop',
];

const PREDEFINED_SPECIALISATIONS = [
  'Off-Plan',
  'Residential Sales',
  'Luxury Properties',
  'Rentals',
  'Commercial',
  'Investment Properties',
  'Waterfront Villas',
  'Branded Residences',
  'Golden Visa Advisory',
  'Palm Jumeirah',
  'Downtown Dubai',
  'Dubai Hills',
  'Palm Jebel Ali',
  'Business Bay',
  'Dubai Marina',
  'JVC',
  'Arabian Ranches',
  'DIFC',
];

const PREDEFINED_LANGUAGES = [
  'English',
  'Arabic',
  'Russian',
  'French',
  'German',
  'Hindi',
  'Urdu',
  'Spanish',
  'Italian',
  'Mandarin',
];

export const AgentForm: React.FC<AgentFormProps> = ({ initialData, isEditing = false }) => {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<Agent>>({
    firstName: '',
    lastName: '',
    slug: '',
    photo: LUXURY_AVATAR_PRESETS[0],
    jobTitle: 'Senior Property Consultant',
    reraNumber: '',
    phone: '+971',
    whatsapp: '+971',
    email: '',
    bio: '',
    languages: ['English', 'Arabic'],
    nationality: '',
    experienceYears: 5,
    location: 'Dubai, UAE',
    specialisations: ['Off-Plan', 'Luxury Properties', 'Palm Jumeirah'],
    areas: ['Palm Jumeirah', 'Downtown Dubai'],
    social: {
      linkedin: '',
      instagram: '',
      x: '',
      tiktok: '',
      youtube: '',
      website: '',
    },
    customWhatsappMessage: '',
    status: 'active',
    isFeatured: true,
    ...initialData,
  });

  // Sync initialData when loaded asynchronously from Supabase
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        slug: initialData.slug || '',
        photo: initialData.photo || LUXURY_AVATAR_PRESETS[0],
        jobTitle: initialData.jobTitle || 'Senior Property Consultant',
        reraNumber: initialData.reraNumber || '',
        phone: initialData.phone || '+971',
        whatsapp: initialData.whatsapp || initialData.phone || '+971',
        email: initialData.email || '',
        bio: initialData.bio || '',
        languages: initialData.languages || ['English', 'Arabic'],
        nationality: initialData.nationality || '',
        experienceYears: initialData.experienceYears ?? 5,
        location: initialData.location || 'Dubai, UAE',
        specialisations: initialData.specialisations || ['Off-Plan', 'Luxury Properties'],
        areas: initialData.areas || ['Palm Jumeirah', 'Downtown Dubai'],
        social: {
          linkedin: '',
          instagram: '',
          x: '',
          tiktok: '',
          youtube: '',
          website: '',
          ...(initialData.social || {}),
        },
        customWhatsappMessage: initialData.customWhatsappMessage || '',
        status: initialData.status || 'active',
        isFeatured: initialData.isFeatured ?? true,
        focusProperties: initialData.focusProperties || [],
      });
      setSlugManuallyEdited(Boolean(initialData.slug));
    }
  }, [initialData]);

  const [customSpec, setCustomSpec] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [customLang, setCustomLang] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [slugError, setSlugError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'professional' | 'social' | 'settings'>('personal');

  // Auto-generate slug from name if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && formData.firstName && formData.lastName) {
      const generated = slugify(`${formData.firstName} ${formData.lastName}`);
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.firstName, formData.lastName, slugManuallyEdited]);

  // Validate slug uniqueness
  const validateSlug = (slugToTest: string): boolean => {
    if (!slugToTest) {
      setSlugError('Slug cannot be empty');
      return false;
    }
    const cleanTest = slugToTest.toLowerCase();
    const existing = platformStore.getAgentBySlug(cleanTest);
    
    // If editing and the slug belongs to this agent, it's valid!
    if (existing && isEditing) {
      if (
        existing.id === initialData?.id ||
        existing.slug.toLowerCase() === (initialData?.slug || '').toLowerCase()
      ) {
        setSlugError('');
        return true;
      }
      setSlugError('This URL slug is already taken by another agent.');
      return false;
    }

    if (existing && !isEditing) {
      setSlugError('This URL slug is already taken by another agent.');
      return false;
    }

    setSlugError('');
    return true;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSpecialisation = (spec: string) => {
    setFormData((prev) => {
      const current = prev.specialisations || [];
      const updated = current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec];
      return { ...prev, specialisations: updated };
    });
  };

  const addCustomSpec = () => {
    if (customSpec.trim()) {
      const trimmed = customSpec.trim();
      if (!formData.specialisations?.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          specialisations: [...(prev.specialisations || []), trimmed],
        }));
      }
      setCustomSpec('');
    }
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => {
      const current = prev.languages || [];
      const updated = current.includes(lang)
        ? current.filter((l) => l !== lang)
        : [...current, lang];
      return { ...prev, languages: updated };
    });
  };

  const addCustomLang = () => {
    if (customLang.trim()) {
      const trimmed = customLang.trim();
      if (!formData.languages?.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          languages: [...(prev.languages || []), trimmed],
        }));
      }
      setCustomLang('');
    }
  };

  const addArea = () => {
    if (customArea.trim()) {
      const trimmed = customArea.trim();
      if (!formData.areas?.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          areas: [...(prev.areas || []), trimmed],
        }));
      }
      setCustomArea('');
    }
  };

  const removeArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      areas: (prev.areas || []).filter((a) => a !== area),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      alert('Please fill in all required fields (Name, Phone, Email).');
      return;
    }

    if (!validateSlug(formData.slug || '')) {
      setActiveTab('settings');
      alert(slugError || 'This URL slug is already taken by another agent.');
      return;
    }

    setIsSaving(true);

    try {
      const saved = await platformStore.saveAgentAsync({
        id: initialData?.id,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        slug: (formData.slug || slugify(`${formData.firstName} ${formData.lastName}`)).toLowerCase(),
        photo: formData.photo || LUXURY_AVATAR_PRESETS[0],
        jobTitle: formData.jobTitle || 'Property Consultant',
        reraNumber: formData.reraNumber || '',
        phone: formData.phone!,
        whatsapp: formData.whatsapp || formData.phone!,
        email: formData.email!,
        bio: formData.bio || '',
        languages: formData.languages || ['English'],
        nationality: formData.nationality,
        experienceYears: Number(formData.experienceYears) || 0,
        location: formData.location || 'Dubai, UAE',
        specialisations: formData.specialisations || [],
        areas: formData.areas || [],
        social: formData.social || {},
        customWhatsappMessage: formData.customWhatsappMessage,
        status: formData.status || 'active',
        isFeatured: Boolean(formData.isFeatured),
        focusProperties: initialData?.focusProperties || [],
      });

      setIsSaving(false);
      setSaveSuccess(true);

      // Brief delay so user sees success indicator then redirect
      setTimeout(() => {
        if (!isEditing) {
          window.location.href = `/admin/agents/${saved.id}/qr/`;
        } else {
          window.location.href = '/admin/agents/';
        }
      }, 700);
    } catch (err) {
      console.error('Error saving agent:', err);
      setIsSaving(false);
      alert('Failed to save agent changes. Please check your internet connection.');
    }
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left: Comprehensive Add/Edit Form */}
      <div className="xl:col-span-8 space-y-6">
        {/* Sticky Quick Action Save Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-vb-card via-vb-navy to-vb-card border border-vb-gold/50 shadow-xl flex items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-vb-gold/40 shrink-0">
              <img src={formData.photo} alt="Current photo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display">
                {formData.firstName || formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`
                  : 'New Broker Profile'}
              </h4>
              <p className="text-[11px] text-vb-gold-light font-mono">
                /agents/{(formData.slug || 'slug').toLowerCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess ? (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-fade-in shadow-lg">
                <Check className="w-4 h-4" />
                <span>Saved & Synced Live!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 active:scale-95 text-vb-black font-extrabold text-xs uppercase tracking-wider shadow-gold-glow flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-vb-black border-t-transparent animate-spin" />
                    <span>Saving to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Save Changes' : 'Save & Generate QR'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-vb-card border border-vb-border overflow-x-auto">
          {[
            { key: 'personal', label: '1. Personal & Photo', icon: User },
            { key: 'contact', label: '2. Contact & WhatsApp', icon: Phone },
            { key: 'professional', label: '3. Specialisations & Bio', icon: Award },
            { key: 'social', label: '4. Social Links', icon: Share2 },
            { key: 'settings', label: '5. URL & Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-vb-gold text-vb-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-vb-navy'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: PERSONAL & PHOTO */}
          {activeTab === 'personal' && (
            <div className="p-6 rounded-3xl bg-vb-card border border-vb-border space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-vb-border">
                <h3 className="text-base font-bold text-white font-display">Personal Details & Photo</h3>
                <span className="text-xs text-vb-gold-light font-medium">Step 1 of 5</span>
              </div>

              {/* Photo Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-vb-gold-champagne">
                  Agent Profile Photograph
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-vb-gold to-vb-gold-light overflow-hidden shrink-0 shadow-lg">
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-xs font-semibold cursor-pointer transition-all shadow-sm">
                      <Upload className="w-4 h-4 text-vb-gold-light" />
                      <span>Upload Custom HD Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WebP. High resolution portrait recommended.
                    </p>
                  </div>
                </div>

                {/* Preset Avatars Selector */}
                <div className="pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Or Select Premium Dubai Agent Preset:
                  </span>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {LUXURY_AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photo: preset }))}
                        className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                          formData.photo === preset
                            ? 'border-vb-gold scale-110 shadow-gold-subtle'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Names & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Job Title / Position *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Property Consultant"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    RERA BRN (Broker Registration Number)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 54912"
                    value={formData.reraNumber}
                    onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nationality (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. British, Emirati, French..."
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 8"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-vb-border">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-extrabold text-xs uppercase tracking-wider shadow-gold-subtle flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Save & Generate QR'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="px-5 py-2.5 rounded-xl bg-vb-navy hover:bg-vb-border text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Continue to Contact</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & WHATSAPP */}
          {activeTab === 'contact' && (
            <div className="p-6 rounded-3xl bg-vb-card border border-vb-border space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-vb-border">
                <h3 className="text-base font-bold text-white font-display">Contact Numbers & WhatsApp</h3>
                <span className="text-xs text-vb-gold-light font-medium">Step 2 of 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Pre-filled WhatsApp Message Template (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Hi John, I found your profile on Vidabricks and would like to know more about Dubai properties."
                  value={formData.customWhatsappMessage}
                  onChange={(e) => setFormData({ ...formData, customWhatsappMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  When a client clicks WhatsApp on this agent’s card, this message is automatically typed for them.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-vb-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className="px-4 py-2 rounded-xl bg-vb-navy text-slate-300 text-xs font-semibold"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-extrabold text-xs uppercase tracking-wider shadow-gold-subtle flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Save Changes' : 'Save & Generate QR'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('professional')}
                    className="px-5 py-2.5 rounded-xl bg-vb-navy hover:bg-vb-border text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Continue to Specialisations</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFESSIONAL & SPECIALISATIONS */}
          {activeTab === 'professional' && (
            <div className="p-6 rounded-3xl bg-vb-card border border-vb-border space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-vb-border">
                <h3 className="text-base font-bold text-white font-display">Specialisations & Professional Bio</h3>
                <span className="text-xs text-vb-gold-light font-medium">Step 3 of 5</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Professional Bio / Value Proposition
                </label>
                <textarea
                  rows={3}
                  placeholder="Helping investors and homeowners make confident property decisions across Dubai..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-sm focus:border-vb-gold outline-none resize-none"
                />
              </div>

              {/* Specialisations Tags */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-vb-gold-champagne">
                  Select Specialisations & Property Focus
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SPECIALISATIONS.map((spec) => {
                    const isSelected = formData.specialisations?.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialisation(spec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-vb-gold text-vb-black shadow-md'
                            : 'bg-vb-dark border border-vb-border text-slate-300 hover:text-white'
                        }`}
                      >
                        {spec} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Tag */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom specialisation (e.g. Sobha Hartland, Penthouses)..."
                    value={customSpec}
                    onChange={(e) => setCustomSpec(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpec())}
                    className="flex-1 px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs outline-none focus:border-vb-gold"
                  />
                  <button
                    type="button"
                    onClick={addCustomSpec}
                    className="px-3.5 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-xs font-semibold"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Prime Areas */}
              <div className="space-y-3 pt-4 border-t border-vb-border">
                <label className="block text-xs font-bold uppercase tracking-wider text-vb-gold-champagne">
                  Prime Dubai Areas
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.areas?.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-vb-navy border border-vb-border text-slate-200 text-xs"
                    >
                      <span>{area}</span>
                      <button
                        type="button"
                        onClick={() => removeArea(area)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add area (e.g. Palm Jumeirah, Downtown, Dubai Hills)..."
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                    className="flex-1 px-3 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs outline-none focus:border-vb-gold"
                  />
                  <button
                    type="button"
                    onClick={addArea}
                    className="px-3.5 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-white text-xs font-semibold"
                  >
                    + Add Area
                  </button>
                </div>
              </div>

              {/* Languages Spoken */}
              <div className="space-y-3 pt-4 border-t border-vb-border">
                <label className="block text-xs font-bold uppercase tracking-wider text-vb-gold-champagne">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_LANGUAGES.map((lang) => {
                    const isSelected = formData.languages?.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-vb-gold-champagne text-vb-black font-bold'
                            : 'bg-vb-dark border border-vb-border text-slate-300 hover:text-white'
                        }`}
                      >
                        {lang} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-vb-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="px-4 py-2 rounded-xl bg-vb-navy text-slate-300 text-xs font-semibold"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-extrabold text-xs uppercase tracking-wider shadow-gold-subtle flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Save Changes' : 'Save & Generate QR'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('social')}
                    className="px-5 py-2.5 rounded-xl bg-vb-navy hover:bg-vb-border text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Continue to Social</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL LINKS */}
          {activeTab === 'social' && (
            <div className="p-6 rounded-3xl bg-vb-card border border-vb-border space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-vb-border">
                <h3 className="text-base font-bold text-white font-display">Optional Social Profiles</h3>
                <span className="text-xs text-vb-gold-light font-medium">Step 4 of 5</span>
              </div>
              <p className="text-xs text-slate-400">
                Only the platforms with links provided will appear on the public agent profile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.social?.linkedin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, linkedin: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formData.social?.instagram || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, instagram: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    TikTok Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@..."
                    value={formData.social?.tiktok || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, tiktok: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@..."
                    value={formData.social?.youtube || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, youtube: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    X (Twitter) Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/..."
                    value={formData.social?.x || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, x: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Personal / Agent Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.social?.website || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social: { ...formData.social, website: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-vb-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('professional')}
                  className="px-4 py-2 rounded-xl bg-vb-navy text-slate-300 text-xs font-semibold"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-extrabold text-xs uppercase tracking-wider shadow-gold-subtle flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Save Changes' : 'Save & Generate QR'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="px-5 py-2.5 rounded-xl bg-vb-navy hover:bg-vb-border text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Continue to Settings</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE SETTINGS & SLUG */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-3xl bg-vb-card border border-vb-border space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-vb-border">
                <h3 className="text-base font-bold text-white font-display">Profile Settings & Public URL</h3>
                <span className="text-xs text-vb-gold-light font-medium">Step 5 of 5</span>
              </div>

              {/* Custom URL Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Public Profile URL Slug *
                </label>
                <div className="flex items-center rounded-xl bg-vb-dark border border-vb-border overflow-hidden focus-within:border-vb-gold">
                  <span className="px-3.5 py-2.5 text-xs text-slate-400 bg-vb-navy border-r border-vb-border font-mono select-none">
                    agents.vidabricks.com/agents/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                      validateSlug(slugify(e.target.value));
                    }}
                    className="flex-1 px-3 py-2.5 bg-transparent text-white text-xs font-mono outline-none"
                  />
                </div>
                {slugError ? (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">{slugError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Auto-generated from agent name. Must be unique across all agents.
                  </p>
                )}
              </div>

              {/* Status Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-vb-dark border border-vb-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Profile Visibility</span>
                    <span className="text-[11px] text-slate-400">
                      {formData.status === 'active'
                        ? 'Active • Public card accessible'
                        : 'Inactive • Profile hidden'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        status: prev.status === 'active' ? 'inactive' : 'active',
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.status === 'active'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-700 text-slate-300'
                    }`}
                  >
                    {formData.status?.toUpperCase()}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-vb-dark border border-vb-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Featured Agent</span>
                    <span className="text-[11px] text-slate-400">Highlighted on brokerage home</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: !prev.isFeatured,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.isFeatured
                        ? 'bg-vb-gold text-vb-black'
                        : 'bg-neutral-700 text-slate-300'
                    }`}
                  >
                    {formData.isFeatured ? 'YES' : 'NO'}
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-vb-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('social')}
                  className="px-4 py-2 rounded-xl bg-vb-navy text-slate-300 text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-vb-gold via-vb-gold-light to-vb-gold-champagne hover:brightness-110 text-vb-black font-extrabold text-sm uppercase tracking-wider shadow-gold-glow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditing ? 'Save Profile Changes' : 'Create Agent & Generate QR'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Right: Live Split-Screen Phone Mockup Preview on Desktop */}
      <div className="hidden xl:block xl:col-span-4">
        <LiveMobileMockup agent={formData} />
      </div>
    </div>
  );
};
