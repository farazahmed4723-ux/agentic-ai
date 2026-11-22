'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Mail, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { Lead } from '@/types';

export default function HotLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch('/api/leads?opportunity=hot')
      .then((r) => r.json())
      .then((d) => d.leads && setLeads(d.leads));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              PRIORITY PIPELINE
            </span>
            <span className="text-xs font-mono text-slate-400">Opportunity Score 80–100</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Hot Inbound Sales Opportunities ({leads.length})</span>
            <Flame className="w-5 h-5 text-orange-400 fill-current" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified businesses with acute digital friction points (outdated websites, missing AI chatbots, no online booking) and high revenue upside.
          </p>
        </div>

        <Link
          href="/emails/queue"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00f2a5] text-[#070b0e] font-mono font-bold text-xs glow-mint transition"
        >
          <Send className="w-4 h-4" />
          <span>Go to Email Approval Queue</span>
        </Link>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-5 rounded-2xl bg-[#0d1318] border border-orange-500/30 hover:border-orange-500/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-white">{lead.companyName}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Opportunity: {lead.leadOpportunityScore}/100
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {lead.city}, {lead.country}
                </span>
              </div>

              {/* Identified Friction & Problems */}
              <div className="p-3 rounded-xl bg-[#080d11] border border-white/5 space-y-1.5">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                  Key Identified Bottlenecks:
                </div>
                {lead.auditReport?.identifiedProblems.map((prob, i) => (
                  <div key={i} className="text-xs font-mono text-slate-300 flex items-start gap-1.5">
                    <span className="text-orange-400">•</span>
                    <span>{prob}</span>
                  </div>
                ))}
              </div>

              {/* Recommended Services & Sales Approach */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Recommended:</span>
                {lead.auditReport?.recommendedServices.map((srv) => (
                  <span
                    key={srv}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#162432] text-[#00f2a5] border border-[#00f2a5]/30"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Action */}
            <div className="flex flex-col gap-2 shrink-0 lg:w-48">
              <Link
                href={`/emails/composer?leadId=${lead.id}`}
                className="w-full py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 glow-violet transition"
              >
                <Mail className="w-4 h-4" />
                <span>Review AI Email</span>
              </Link>
              <div className="text-[10px] font-mono text-slate-500 text-center">
                Outreach: {lead.outreachStatus}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
