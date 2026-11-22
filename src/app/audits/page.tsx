'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  ExternalLink,
  Smartphone,
  Gauge,
  Bot,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Lead } from '@/types';
import Link from 'next/link';

export default function WebsiteAuditsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => d.leads && setLeads(d.leads.filter((l: Lead) => !!l.auditReport)));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            AGENT 05
          </span>
          <span className="text-xs font-mono text-slate-400">AI Business Intelligence & Website Audit Agent</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
          <span>Digital Infrastructure Audits ({leads.length})</span>
          <FileSearch className="w-5 h-5 text-purple-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Grounded diagnostic audits evaluating website presence, speed, mobile responsiveness, booking capabilities, and AI automation opportunities.
        </p>
      </div>

      <div className="space-y-5">
        {leads.map((lead) => {
          const audit = lead.auditReport!;

          return (
            <div
              key={lead.id}
              className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 hover:border-purple-500/40 transition space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{lead.companyName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      Opportunity Score: {lead.leadOpportunityScore}/100
                    </span>
                  </div>
                  {lead.businessWebsite ? (
                    <a
                      href={lead.businessWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{lead.businessWebsite}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-rose-400 mt-0.5 block">No Website Found</span>
                  )}
                </div>

                <Link
                  href={`/emails/composer?leadId=${lead.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[#00f2a5] text-[#070b0e] text-xs font-mono font-bold glow-mint transition self-start md:self-auto"
                >
                  Generate Pitch Email
                </Link>
              </div>

              {/* Digital Health Checklist Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    Mobile Ready
                  </span>
                  {audit.mobileResponsive ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00f2a5]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Online Booking
                  </span>
                  {audit.hasOnlineBooking ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00f2a5]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    AI Chatbot
                  </span>
                  {audit.hasChatbot ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00f2a5]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    Page Speed
                  </span>
                  <span className="font-bold text-white">{audit.pageSpeedScore}/100</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">SEO Rating</span>
                  <span
                    className={`font-bold ${
                      audit.seoRating === 'Good'
                        ? 'text-[#00f2a5]'
                        : audit.seoRating === 'Fair'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {audit.seoRating}
                  </span>
                </div>
              </div>

              {/* Identified Problems & Recommended Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3 rounded-xl bg-[#090e13] border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Identified Problems:
                  </div>
                  {audit.identifiedProblems.map((prob, i) => (
                    <div key={i} className="text-xs text-slate-300 font-mono flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{prob}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#090e13] border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono text-[#00f2a5] uppercase font-semibold">
                    Recommended High-Value Services:
                  </div>
                  {audit.recommendedServices.map((srv, i) => (
                    <div key={i} className="text-xs text-slate-200 font-mono flex items-center gap-1.5">
                      <span className="text-[#00f2a5]">✓</span>
                      <span>{srv}</span>
                    </div>
                  ))}
                  <div className="mt-2 text-[11px] text-slate-400 italic">
                    Sales Angle: {audit.suggestedSalesApproach}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
