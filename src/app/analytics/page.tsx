'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  RotateCw,
  Send,
  MessageSquare,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { PerformanceReport } from '@/lib/agents/reporting-agent';

export default function AnalyticsPage() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const d = await res.json();
      if (d.report) setReport(d.report);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !report) {
    return <div className="p-8 font-mono text-xs text-slate-400">Loading performance telemetry...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
              AGENT 08
            </span>
            <span className="text-xs font-mono text-slate-400">Reporting & Analytics Agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Campaign Performance Intelligence</span>
            <BarChart3 className="w-5 h-5 text-pink-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time qualification analytics, conversion funnel, cost per lead metrics, and AI strategic recommendations.
          </p>
        </div>

        <button
          onClick={fetchReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* AI Executive Summary Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#12162a] via-[#0d141e] to-[#12162a] border border-[#8b5cf6]/40 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
          <span>EXECUTIVE INTELLIGENCE SYNTHESIS</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">{report.executiveSummary}</p>
      </div>

      {/* 4 Financial & Conversion Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10">
          <span className="text-slate-500 block text-[10px]">Total API Cost</span>
          <div className="text-2xl font-bold text-[#00f2a5] mt-1">${report.estimatedCostUsd} USD</div>
          <div className="text-[10px] text-slate-400 mt-1">OpenRouter blended tokens</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10">
          <span className="text-slate-500 block text-[10px]">Cost Per Qualified Lead</span>
          <div className="text-2xl font-bold text-purple-300 mt-1">${report.costPerQualifiedLeadUsd}</div>
          <div className="text-[10px] text-slate-400 mt-1">Hot + Warm prospects</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10">
          <span className="text-slate-500 block text-[10px]">Qualification Rate</span>
          <div className="text-2xl font-bold text-orange-400 mt-1">{report.qualificationRatePct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Verified legitimate fit</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1318] border border-white/10">
          <span className="text-slate-500 block text-[10px]">Direct Reply Rate</span>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{report.replyRatePct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{report.repliesReceived} positive replies</div>
        </div>
      </div>

      {/* Funnel Breakdown & Top Niches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipeline Conversion Funnel */}
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Pipeline Conversion Funnel
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>1. Discovered Prospects</span>
                <span className="font-bold text-white">{report.totalLeads}</span>
              </div>
              <div className="h-2 rounded-full bg-[#10171e] overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>2. Verified Legitimate</span>
                <span className="font-bold text-[#00f2a5]">{report.verifiedLeads}</span>
              </div>
              <div className="h-2 rounded-full bg-[#10171e] overflow-hidden">
                <div
                  className="h-full bg-[#00f2a5] rounded-full"
                  style={{ width: `${(report.verifiedLeads / (report.totalLeads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>3. High Opportunity (Hot 🔥)</span>
                <span className="font-bold text-orange-400">{report.hotLeads}</span>
              </div>
              <div className="h-2 rounded-full bg-[#10171e] overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(report.hotLeads / (report.totalLeads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>4. Outreach Sent</span>
                <span className="font-bold text-cyan-400">{report.emailsSent}</span>
              </div>
              <div className="h-2 rounded-full bg-[#10171e] overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(report.emailsSent / (report.totalLeads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>5. Client Replies</span>
                <span className="font-bold text-amber-400">{report.repliesReceived}</span>
              </div>
              <div className="h-2 rounded-full bg-[#10171e] overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${Math.max(5, (report.repliesReceived / (report.emailsSent || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strategic AI Recommendations */}
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#00f2a5]">
            Strategic Scaling Recommendations
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {report.strategicRecommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#080d11] border border-white/5 space-y-1">
                <div className="text-[#00f2a5] font-bold text-[11px]">Recommendation #{i + 1}</div>
                <p className="text-slate-300 leading-relaxed font-sans">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
