'use client';

import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  Globe,
  Sliders,
  RotateCw,
  CheckCircle2,
  Users,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Lead } from '@/types';
import Link from 'next/link';

export default function LeadFinderPage() {
  const [naturalCommand, setNaturalCommand] = useState<string>(
    'Find 20 limousine companies in Toronto that have outdated websites and need AI booking.'
  );
  const [niche, setNiche] = useState<string>('Limousine & Luxury Fleet Services');
  const [subNiche, setSubNiche] = useState<string>('Corporate Airport Chauffeurs');
  const [city, setCity] = useState<string>('Toronto');
  const [provinceOrState, setProvinceOrState] = useState<string>('Ontario');
  const [country, setCountry] = useState<string>('Canada');
  const [radiusKm, setRadiusKm] = useState<number>(35);
  const [targetCount, setTargetCount] = useState<number>(10);
  const [servicesOffered, setServicesOffered] = useState<string[]>([
    'Website Development',
    'AI Reservation Chatbot',
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [discoveredLeads, setDiscoveredLeads] = useState<Lead[]>([]);

  const toggleService = (srv: string) => {
    setServicesOffered((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleRunDiscovery = async () => {
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: `${city} ${niche} Autonomous Run`,
          niche,
          subNiche,
          city,
          country,
          targetCount,
          servicesOffered,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultMessage(data.message);
        // Refresh leads
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();
        if (leadsData.leads) {
          setDiscoveredLeads(leadsData.leads.slice(0, targetCount));
        }
      } else {
        setResultMessage(`Error: ${data.message}`);
      }
    } catch (e: any) {
      setResultMessage(`Discovery error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickPresets = [
    {
      title: 'Toronto Limousines',
      niche: 'Limousine & Luxury Fleet Services',
      city: 'Toronto',
      country: 'Canada',
      cmd: 'Find 20 limousine companies in Toronto that have outdated websites.',
    },
    {
      title: 'London Restaurants',
      niche: 'Fine Dining Restaurants',
      city: 'London',
      country: 'United Kingdom',
      cmd: 'Find 25 restaurants in London that do not have an online reservation system.',
    },
    {
      title: 'Dubai Construction',
      niche: 'Commercial Fitouts & Architecture',
      city: 'Dubai',
      country: 'United Arab Emirates',
      cmd: 'Find 20 construction companies in Dubai that could benefit from website development and AI automation.',
    },
    {
      title: 'NYC Dental Clinics',
      niche: 'Cosmetic Dentistry & Orthodontics',
      city: 'New York',
      country: 'United States',
      cmd: 'Find dental clinics in New York that do not have an AI chatbot.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              AGENT 02
            </span>
            <span className="text-xs font-mono text-slate-400">Global Lead Discovery Agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Global Lead Discovery & Research Wizard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Target businesses in any country and niche with natural language or granular geographical criteria.
          </p>
        </div>

        {/* Preset Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {quickPresets.map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setNiche(p.niche);
                setCity(p.city);
                setCountry(p.country);
                setNaturalCommand(p.cmd);
              }}
              className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-[#111921] border border-white/10 hover:border-[#00f2a5] text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Card: Natural Language + Granular Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Natural Language Input (1 Col) */}
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#00f2a5] mb-2 font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>NATURAL LANGUAGE QUERY</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Our orchestrator parses intent, location, constraints, and niche criteria automatically.
            </p>
            <textarea
              rows={4}
              value={naturalCommand}
              onChange={(e) => setNaturalCommand(e.target.value)}
              className="w-full bg-[#080d11] border border-white/10 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#00f2a5] leading-relaxed resize-none"
              placeholder="e.g. Find 30 construction companies in Dubai that could benefit from website development..."
            />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#111921] border border-white/5 space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
              Authorized Sources:
            </div>
            <div className="text-[11px] text-slate-300 font-mono space-y-1">
              <div>✓ Google Places & Business Metadata</div>
              <div>✓ Public Business Registries</div>
              <div>✓ Live Website Architecture Analysis</div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Parameters Form (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>STRUCTURED DISCOVERY CRITERIA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Target Niche</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Sub-Niche / Specialty</label>
              <input
                type="text"
                value={subNiche}
                onChange={(e) => setSubNiche(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Province / State</label>
              <input
                type="text"
                value={provinceOrState}
                onChange={(e) => setProvinceOrState(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00f2a5]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Leads Target: <span className="text-[#00f2a5] font-bold">{targetCount} leads</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value))}
                className="w-full accent-[#00f2a5] cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Services Offered Badges */}
          <div>
            <label className="text-slate-400 block text-xs font-mono mb-2">Services Being Offered:</label>
            <div className="flex flex-wrap gap-2">
              {[
                'Website Development',
                'AI Reservation Chatbot',
                'AI Automation & Workflows',
                'High-Conversion E-commerce',
                'Custom Software Development',
                'Video Editing & Motion Graphics',
              ].map((srv) => {
                const selected = servicesOffered.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition ${
                      selected
                        ? 'bg-[#00f2a5]/20 text-[#00f2a5] border-[#00f2a5]'
                        : 'bg-[#10171e] text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {srv}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Run Discovery CTA */}
          <div className="pt-2">
            <button
              onClick={handleRunDiscovery}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 glow-mint transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>ORCHESTRATING MULTI-AGENT DISCOVERY...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>EXECUTE GLOBAL LEAD DISCOVERY ({targetCount} PROSPECTS)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Results Notification */}
      {resultMessage && (
        <div className="p-4 rounded-xl bg-[#111f18] border border-[#00f2a5]/40 flex items-center gap-3 text-xs font-mono text-[#00f2a5]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{resultMessage}</span>
        </div>
      )}

      {/* Discovered Leads Preview */}
      {discoveredLeads.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00f2a5]" />
              <span>Newly Discovered & Enriched Leads</span>
            </h3>
            <Link href="/leads" className="text-xs font-mono text-[#00f2a5] hover:underline flex items-center gap-1">
              <span>View Full CRM Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {discoveredLeads.map((l) => (
              <div key={l.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{l.companyName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                      {l.businessVerificationStatus}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{l.city}, {l.country}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{l.publicBusinessEmail} • {l.publicBusinessPhone}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-orange-400 font-bold">
                    Score: {l.leadOpportunityScore}/100
                  </span>
                  <Link
                    href={`/emails/composer?leadId=${l.id}`}
                    className="px-2.5 py-1 rounded bg-[#8b5cf6]/20 text-[#a78bfa] text-xs font-mono hover:bg-[#8b5cf6]/30 border border-[#8b5cf6]/40"
                  >
                    Draft Email
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
