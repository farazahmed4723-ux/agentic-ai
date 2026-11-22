'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import { Lead } from '@/types';

export default function VerifiedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch('/api/leads?status=verified')
      .then((r) => r.json())
      .then((d) => d.leads && setLeads(d.leads));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2a5]/20 text-[#00f2a5]">
            AGENT 03
          </span>
          <span className="text-xs font-mono text-slate-400">Lead Verification & Classification Agent</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Verified Legitimate Businesses ({leads.length})
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Businesses with verified corporate registries, active domains, validated phone numbers, and confidence score &gt; 70%.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-5 rounded-2xl bg-[#0d1318] border border-[#00f2a5]/20 hover:border-[#00f2a5]/50 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{lead.companyName}</span>
                <span className="text-xs font-mono font-bold text-[#00f2a5] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lead.verificationConfidenceScore}%
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono mt-1">
                {lead.industry} • {lead.city}, {lead.country}
              </div>

              {lead.businessWebsite && (
                <a
                  href={lead.businessWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono mt-2"
                >
                  <span>{lead.businessWebsite}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {lead.verificationEvidence && (
                <div className="mt-3 p-2.5 rounded-lg bg-[#080d11] border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    Verification Evidence:
                  </div>
                  {lead.verificationEvidence.slice(0, 3).map((ev, i) => (
                    <div key={i} className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                      <span className="text-[#00f2a5]">✓</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-orange-400 font-bold">
                Opp Score: {lead.leadOpportunityScore}/100
              </span>
              <Link
                href={`/emails/composer?leadId=${lead.id}`}
                className="px-3 py-1.5 rounded-lg bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#a78bfa] border border-[#8b5cf6]/40 text-xs font-mono flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Craft Email</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
