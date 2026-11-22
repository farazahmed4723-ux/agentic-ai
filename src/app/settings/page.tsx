'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Save,
  CheckCircle2,
  Lock,
  Download,
  Flame,
  User,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { SystemSettings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => d.settings && setSettings(d.settings));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    setSaveMsg('All system settings updated successfully.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleToggleEmergencyStop = async () => {
    if (!settings) return;
    const newEmergency = !settings.emergencyStop;
    setSettings({ ...settings, emergencyStop: newEmergency });
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergencyStop: newEmergency }),
    });
  };

  if (!settings) return <div className="p-8 font-mono text-xs text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              PREFERENCES & GOVERNANCE
            </span>
            <span className="text-xs font-mono text-slate-400">System Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Platform Governance & Brand Settings</span>
            <SettingsIcon className="w-5 h-5 text-slate-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure default sender identity, service offers, sending rate limiters, anti-spam safeguards, and emergency controls.
          </p>
        </div>

        {/* Emergency Stop Switch */}
        <button
          onClick={handleToggleEmergencyStop}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition ${
            settings.emergencyStop
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{settings.emergencyStop ? 'EMERGENCY STOP ACTIVE (LOCKED)' : 'ENGAGE EMERGENCY STOP'}</span>
        </button>
      </div>

      {saveMsg && (
        <div className="p-3.5 rounded-xl bg-[#111f18] border border-[#00f2a5]/40 text-xs font-mono text-[#00f2a5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveMsg}</span>
        </div>
      )}

      {settings.emergencyStop && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/50 text-xs font-mono text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>EMERGENCY STOP IS ENGAGED: All automated email dispatch and background pipelines are halted.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Voice & Identity */}
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
            <User className="w-4 h-4 text-[#00f2a5]" />
            <span>SENDER BRAND & OUTREACH IDENTITY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Sender Brand Name</label>
              <input
                type="text"
                value={settings.senderBrand}
                onChange={(e) => setSettings({ ...settings, senderBrand: e.target.value })}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Sender Email Address</label>
              <input
                type="email"
                value={settings.senderEmail}
                onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Sender Title / Role</label>
              <input
                type="text"
                value={settings.senderTitle}
                onChange={(e) => setSettings({ ...settings, senderTitle: e.target.value })}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>
          </div>
        </div>

        {/* Sending Safeguards & Compliance */}
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>OUTREACH LIMITS & GOVERNANCE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Approval Mode</label>
              <select
                value={settings.approvalMode}
                onChange={(e) => setSettings({ ...settings, approvalMode: e.target.value as any })}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00f2a5]"
              >
                <option value="manual">Manual Approval Mode (Default & Safe)</option>
                <option value="auto">Automatic Sending Mode</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Manual approval prevents any email from dispatching without human review.
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Daily Email Sending Limit: <span className="text-[#00f2a5] font-bold">{settings.dailyEmailLimit} / day</span>
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={settings.dailyEmailLimit}
                onChange={(e) => setSettings({ ...settings, dailyEmailLimit: parseInt(e.target.value) })}
                className="w-full accent-[#00f2a5] mt-2"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-[#080d11] border border-white/5 text-xs font-mono">
            <div>
              <div className="font-semibold text-white">CASL, CAN-SPAM & GDPR Compliance Guard</div>
              <div className="text-[11px] text-slate-400">
                Automatically appends one-click unsubscribe links and physical business address headers.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, antiSpamComplianceMode: !settings.antiSpamComplianceMode })}
              className={`px-3 py-1 rounded text-[10px] font-bold border ${
                settings.antiSpamComplianceMode
                  ? 'bg-[#00f2a5]/20 text-[#00f2a5] border-[#00f2a5]/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.antiSpamComplianceMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          <a
            href="/api/integrations/sheets?format=csv"
            download
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
            <span>Download Complete CRM Database Backup (.CSV)</span>
          </a>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] font-mono font-bold text-xs glow-mint transition"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
