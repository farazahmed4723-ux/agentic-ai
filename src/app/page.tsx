'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  Flame,
  Percent,
  Send,
  MessageSquare,
  Bot,
  Workflow,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCw,
} from 'lucide-react';
import { Lead } from '@/types';

export default function OverviewDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalLeads = leads.length;
  const verifiedLeads = leads.filter((l) => l.businessVerificationStatus === 'Verified Business').length;
  const hotLeads = leads.filter((l) => l.leadOpportunityScore >= 80);
  const qualRate = totalLeads > 0 ? Math.round(((hotLeads.length + leads.filter(l => l.leadOpportunityScore >= 60 && l.leadOpportunityScore < 80).length) / totalLeads) * 100) : 0;
  const sentEmails = leads.filter((l) => l.outreachStatus === 'Sent' || l.outreachStatus === 'Replied').length;
  const clientReplies = leads.filter((l) => l.outreachStatus === 'Replied' || !!l.replyReceived).length;

  const handleQuickRun = async () => {
    setPipelineRunning(true);
    try {
      await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: 'Dashboard Quick Run',
          niche: 'Limousine & Executive Transport',
          city: 'Toronto',
          country: 'Canada',
          targetCount: 5,
        }),
      });
      await fetchLeads();
    } finally {
      setPipelineRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d161f] via-[#101c27] to-[#0d161f] border border-white/10 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2a5]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#00f2a5]/20 text-[#00f2a5] border border-[#00f2a5]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2a5] animate-ping" />
                SYSTEM LIVE & OPERATIONAL
              </span>
              <span className="text-xs font-mono text-slate-400">America/Toronto (09:00 AM Cron)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-2">
              AI by Faraz — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2a5] via-purple-300 to-[#f59e0b]">Agentic Lead Engine</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Autonomous multi-agent intelligence that discovers verified B2B prospects, audits digital infrastructure, formulates revenue opportunities, and drafts personalized outreach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/control-room"
              className="px-4 py-2 rounded-xl bg-[#111c26] hover:bg-[#162533] border border-[#8b5cf6]/40 text-xs font-mono font-medium text-purple-300 flex items-center gap-2 transition"
            >
              <Workflow className="w-4 h-4 text-[#8b5cf6]" />
              <span>Canvas Room</span>
            </Link>
            <button
              onClick={handleQuickRun}
              disabled={pipelineRunning}
              className="px-4 py-2 rounded-xl bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] text-xs font-mono font-bold flex items-center gap-2 glow-mint transition disabled:opacity-50"
            >
              {pipelineRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{pipelineRunning ? 'ORCHESTRATING...' : 'TEST ORCHESTRATOR'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Animated Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Discovered */}
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10 hover:border-white/20 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Leads</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalLeads}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Multi-source verified</div>
        </div>

        {/* Verified Businesses */}
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10 hover:border-[#00f2a5]/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Verified Legitimate</span>
            <CheckCircle className="w-4 h-4 text-[#00f2a5]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#00f2a5]">{verifiedLeads}</div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-1">Confidence &gt; 70%</div>
        </div>

        {/* Hot Leads */}
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10 hover:border-orange-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Hot Leads 🔥</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">{hotLeads.length}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Opportunity 80-100</div>
        </div>

        {/* Qualification Rate */}
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10 hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Qualified Rate</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">{qualRate}%</div>
          <div className="text-[10px] text-purple-400/80 font-mono mt-1">High conversion fit</div>
        </div>

        {/* Emails Dispatched */}
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Outreach Sent</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{sentEmails}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Gmail OAuth pipeline</div>
        </div>

        {/* Client Replies */}
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Direct Replies</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{clientReplies}</div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-1">
            {sentEmails > 0 ? `${Math.round((clientReplies / sentEmails) * 100)}% reply rate` : 'Tracking'}
          </div>
        </div>
      </div>

      {/* 8 Autonomous Agents Status Strip */}
      <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#00f2a5]" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              Autonomous Multi-Agent Fleet Status
            </h3>
          </div>
          <Link
            href="/control-room"
            className="text-xs font-mono text-[#00f2a5] hover:underline flex items-center gap-1"
          >
            <span>Open React Flow Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { id: '01', name: 'Scheduler & Trigger', color: 'border-[#00f2a5]/50 text-[#00f2a5]', tag: '9:00 AM' },
            { id: '02', name: 'Global Discovery', color: 'border-blue-500/50 text-blue-400', tag: 'Places / Web' },
            { id: '03', name: 'Verification & Class.', color: 'border-emerald-500/50 text-emerald-400', tag: 'Confidence' },
            { id: '04', name: 'Data Enrichment', color: 'border-cyan-500/50 text-cyan-400', tag: '27 Fields' },
            { id: '05', name: 'BI & Website Audit', color: 'border-[#8b5cf6]/50 text-purple-300', tag: 'Opportunity' },
            { id: '06', name: 'Email Copywriter', color: 'border-[#f59e0b]/50 text-amber-400', tag: 'Personalized' },
            { id: '07', name: 'Gmail Outreach', color: 'border-[#f97316]/50 text-orange-400', tag: 'Human In Loop' },
            { id: '08', name: 'Reporting & Analytics', color: 'border-pink-500/50 text-pink-400', tag: 'Discord/Sheets' },
          ].map((agent) => (
            <div
              key={agent.id}
              className={`p-2.5 rounded-lg bg-[#111921] border ${agent.color} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold opacity-80">A-{agent.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2a5] animate-pulse" />
              </div>
              <div className="text-xs font-semibold text-white mt-1 leading-snug line-clamp-1">
                {agent.name}
              </div>
              <div className="text-[9px] font-mono opacity-70 mt-1">{agent.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Leads Showcase & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Leads Spotlight (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0d1318] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Priority Hot Leads Spotlight (Score 80–100)
                </h3>
              </div>
              <Link
                href="/leads/hot"
                className="text-xs font-mono text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({hotLeads.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {hotLeads.slice(0, 3).map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 rounded-xl bg-[#111921] border border-white/5 hover:border-orange-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{lead.companyName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
                        Score: {lead.leadOpportunityScore}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {lead.city}, {lead.country}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {lead.auditReport?.identifiedProblems?.[0] || lead.notes}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {lead.auditReport?.recommendedServices?.slice(0, 2).map((srv) => (
                        <span
                          key={srv}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16222d] text-slate-300 border border-white/5"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/emails/composer?leadId=${lead.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#a78bfa] border border-[#8b5cf6]/40 text-xs font-mono font-medium transition"
                    >
                      AI Draft
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Deterministic verification + AI business analysis</span>
            <Link href="/leads" className="text-[#00f2a5] hover:underline">
              Explore 27 DB Fields &rarr;
            </Link>
          </div>
        </div>

        {/* AI Command Center Teaser Card (1 Col) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121424] via-[#0d1318] to-[#121424] border border-[#8b5cf6]/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-[#a78bfa] mb-3">
              <Bot className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white tracking-tight">AI Command Center</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Command the entire multi-agent engine using natural language prompts. Powered by OpenRouter AI.
            </p>

            <div className="mt-4 space-y-2">
              {[
                'Find 50 movers in Vancouver',
                'Find limousine companies in Toronto with outdated websites',
                'Sync today’s leads to Google Sheets',
              ].map((cmd) => (
                <Link
                  key={cmd}
                  href={`/command-center?prompt=${encodeURIComponent(cmd)}`}
                  className="block p-2 rounded-lg bg-[#070b0e] border border-white/5 hover:border-[#8b5cf6]/50 text-[11px] font-mono text-purple-200 transition"
                >
                  &ldquo;{cmd}&rdquo;
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/command-center"
            className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#00f2a5] text-[#070b0e] font-mono font-bold text-xs flex items-center justify-center gap-2 glow-violet transition"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Launch Command Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
