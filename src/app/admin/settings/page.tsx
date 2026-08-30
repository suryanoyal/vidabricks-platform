'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Shield, Building, Phone, Mail, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { platformStore, subscribeToStore } from '@/lib/store';
import { BrokerageSettings } from '@/lib/types';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BrokerageSettings>(platformStore.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setSettings(platformStore.getSettings());
    const unsubscribe = subscribeToStore(() => {
      setSettings(platformStore.getSettings());
    });
    return () => unsubscribe();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    platformStore.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetSystem = () => {
    platformStore.resetToDefaults();
    setSettings(platformStore.getSettings());
    setShowResetConfirm(false);
    alert('Platform data successfully reset to initial Dubai seed brokers.');
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Brokerage & Platform Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Corporate credentials, RERA license records, and default contact configurations
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold animate-fade-in">
          ✓ Brokerage settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-6">
        {/* Corporate Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-vb-gold-champagne flex items-center gap-2 pb-2 border-b border-vb-border">
            <Building className="w-4 h-4 text-vb-gold-light" />
            <span>Corporate Identity & Regulatory Licensing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Brokerage Display Name
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Legal Entity Name (UAE Registered)
              </label>
              <input
                type="text"
                required
                value={settings.legalName}
                onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                RERA ORN (Office Registration Number)
              </label>
              <input
                type="text"
                required
                value={settings.reraOrn}
                onChange={(e) => setSettings({ ...settings, reraOrn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Brokerage Phone
              </label>
              <input
                type="tel"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Headquarters Office Address (Dubai)
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none"
            />
          </div>
        </div>

        {/* Brand Assets & Official Logos */}
        <div className="space-y-4 pt-4 border-t border-vb-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-vb-gold-champagne flex items-center gap-2 pb-2 border-b border-vb-border">
            <Building className="w-4 h-4 text-vb-gold-light" />
            <span>Official Vidabricks Brand Assets & Logos</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gold Logo Asset */}
            <div className="p-4 rounded-2xl bg-vb-dark border border-vb-gold/40 flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-[#0a0f1d] rounded-xl border border-vb-border w-full flex items-center justify-center min-h-[90px]">
                <img
                  src="/logos/vidabricks-gold.png"
                  alt="Vidabricks 3D Gold Logo"
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow"
                />
              </div>
              <div className="w-full text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Primary 3D Gold Emblem</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Active Web</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Used across digital cards, dark mode headers, NFC preview, and social collateral.
                </p>
              </div>
              <a
                href="/logos/vidabricks-gold.png"
                download="Vidabricks-Gold-Logo.png"
                className="w-full py-2 px-3 rounded-lg bg-vb-navy hover:bg-vb-card border border-vb-border text-vb-gold-light text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                Download Gold Asset (PNG)
              </a>
            </div>

            {/* Black Logo Asset */}
            <div className="p-4 rounded-2xl bg-vb-dark border border-vb-border flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-white rounded-xl border border-vb-border w-full flex items-center justify-center min-h-[90px]">
                <img
                  src="/logos/vidabricks-black-transparent.png"
                  alt="Vidabricks Black Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <div className="w-full text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Monochrome Black Mark</span>
                  <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded font-mono">Print Ready</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Used for light backgrounds, high-contrast printing, and stationery contracts.
                </p>
              </div>
              <a
                href="/logos/vidabricks-black-transparent.png"
                download="Vidabricks-Black-Logo.png"
                className="w-full py-2 px-3 rounded-lg bg-vb-navy hover:bg-vb-card border border-vb-border text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                Download Black Asset (PNG)
              </a>
            </div>
          </div>
        </div>

        {/* WhatsApp Template Defaults */}
        <div className="space-y-4 pt-4 border-t border-vb-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-vb-gold-champagne flex items-center gap-2 pb-2 border-b border-vb-border">
            <Phone className="w-4 h-4 text-vb-gold-light" />
            <span>Default WhatsApp Conversation Template</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Standard Greeting Template
            </label>
            <textarea
              rows={2}
              value={settings.defaultWhatsappTemplate}
              onChange={(e) =>
                setSettings({ ...settings, defaultWhatsappTemplate: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-vb-dark border border-vb-border text-white text-xs focus:border-vb-gold outline-none resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Use <code className="text-vb-gold-light">{'{agentName}'}</code> to dynamically insert the agent’s name.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-vb-border flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-vb-gold to-vb-gold-light hover:brightness-110 text-vb-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-gold-subtle"
          >
            <Save className="w-4 h-4" />
            <span>Save Brokerage Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset System */}
      <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-3">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>System Reset & Demo Data Restoration</span>
        </div>
        <p className="text-xs text-slate-400">
          Restore all original Dubai luxury agents (John Doe, Sarah Al Mansoori, Mikhail Romanov, Elena Vance, Rashid Khan) and seed analytics.
        </p>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Default Seed Data</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Entire Platform?"
        message="This will reset all brokers, custom edits, and analytics to the initial seed configuration. Are you sure?"
        confirmLabel="Reset Platform"
        isDestructive={true}
        onConfirm={handleResetSystem}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
