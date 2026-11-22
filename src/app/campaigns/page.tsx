'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Play,
  RotateCw,
  Users,
  Flame,
  Send,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Campaign } from '@/types';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  // New Campaign Form
  const [name, setName] = useState<string>('');
  const [niche, setNiche] = useState<string>('');
  const [city, setCity] = useState<string>('Toronto');
  const [country, setCountry] = useState<string>('Canada');
  const [targetCount, setTargetCount] = useState<number>(50);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const res = await fetch('/api/campaigns');
    const d = await res.json();
    if (d.campaigns) setCampaigns(d.campaigns);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        niche,
        city,
        country,
        targetCount,
      }),
    });
    setShowModal(false);
    fetchCampaigns();
  };

  const handleRunCampaign = async (c: Campaign) => {
    setRunningId(c.id);
    try {
      await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: c.name,
          niche: c.niche,
          city: c.city,
          country: c.country,
          targetCount: 10,
        }),
      });
      fetchCampaigns();
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              ORCHESTRATOR
            </span>
            <span className="text-xs font-mono text-slate-400">Multi-Agent Campaign Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Automated Lead Campaigns ({campaigns.length})</span>
            <Megaphone className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure niche targeting, schedules, quotas, and automated outreach parameters per campaign.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00f2a5] text-[#070b0e] font-mono font-bold text-xs glow-mint transition"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Campaign</span>
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 hover:border-white/20 transition space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{camp.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2a5]/20 text-[#00f2a5] border border-[#00f2a5]/30">
                    {camp.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {camp.niche} • {camp.city}, {camp.country} • Target: {camp.targetCount} leads
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunCampaign(camp)}
                  disabled={runningId === camp.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111c26] hover:bg-[#162533] border border-[#00f2a5]/40 text-[#00f2a5] text-xs font-mono font-medium transition disabled:opacity-50"
                >
                  {runningId === camp.id ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{runningId === camp.id ? 'Running Fleet...' : 'Run Pipeline'}</span>
                </button>
              </div>
            </div>

            {/* Campaign Progress Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5">
                <span className="text-slate-500 block text-[10px]">Discovered</span>
                <span className="text-white font-bold">{camp.stats.discovered}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5">
                <span className="text-slate-500 block text-[10px]">Verified Legitimate</span>
                <span className="text-[#00f2a5] font-bold">{camp.stats.verified}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5">
                <span className="text-slate-500 block text-[10px]">Hot Leads 🔥</span>
                <span className="text-orange-400 font-bold">{camp.stats.hot}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5">
                <span className="text-slate-500 block text-[10px]">Emails Sent</span>
                <span className="text-cyan-400 font-bold">{camp.stats.emailsSent}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5">
                <span className="text-slate-500 block text-[10px]">Client Replies</span>
                <span className="text-amber-400 font-bold">{camp.stats.replies}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-[#0d1318] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-base font-bold text-white">Create New Lead Campaign</h2>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vancouver Tech & Agency Outreach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Niche</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Movers"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Discovery Volume ({targetCount} leads)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value))}
                  className="w-full accent-[#00f2a5]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-[#111921] text-slate-400 hover:text-white font-mono text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00f2a5] text-[#070b0e] font-mono font-bold text-xs glow-mint"
              >
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
