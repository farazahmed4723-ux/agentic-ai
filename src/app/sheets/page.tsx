'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RotateCw,
  CheckCircle2,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function GoogleSheetsPage() {
  const [data, setData] = useState<any>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    const res = await fetch('/api/integrations/sheets');
    const d = await res.json();
    setData(d);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMsg('Synchronizing all 12 tabs...');
    try {
      const res = await fetch('/api/integrations/sheets', { method: 'POST' });
      const d = await res.json();
      setSyncMsg(d.message);
      fetchInfo();
      setTimeout(() => setSyncMsg(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  const tabs = data?.tabs || [
    'All Leads',
    'Verified Leads',
    'Hot Leads',
    'Warm Leads',
    'Cold Leads',
    'Unverified Leads',
    'Suspicious Leads',
    'Email Drafts',
    'Emails Sent',
    'Client Replies',
    'Follow-ups',
    'Daily Reports',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              INTEGRATION
            </span>
            <span className="text-xs font-mono text-slate-400">Two-way Google Sheets Synchronization</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Google Sheets 12-Tab Synchronizer</span>
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronize all discovered business records, opportunity classifications, audit scores, and draft copies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/integrations/sheets?format=csv"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2a5]" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] font-mono font-bold text-xs glow-mint transition disabled:opacity-50"
          >
            {syncing ? <RotateCw className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
            <span>{syncing ? 'SYNCING TABS...' : 'SYNC SHEETS NOW'}</span>
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="p-3.5 rounded-xl bg-[#111f18] border border-[#00f2a5]/40 text-xs font-mono text-[#00f2a5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncMsg}</span>
        </div>
      )}

      {/* Sync Status Banner */}
      <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00f2a5]" />
            <span className="text-white font-semibold">Active Sync Channel</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Last Sync: {data?.lastSyncedAt ? new Date(data.lastSyncedAt).toLocaleString() : 'Just now'}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            Connected Sheet: <span className="text-emerald-400 font-bold">AI by Faraz — Master Enterprise Leads Sheet</span>
          </div>
        </div>

        {data?.sheetUrl && (
          <a
            href={data.sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-[#00f2a5] flex items-center gap-1.5 transition self-start md:self-auto"
          >
            <span>Open in Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* 12 Tabs Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>12 Dedicated Synchronized Tabs</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tabs.map((tab: string, idx: number) => (
            <div
              key={tab}
              className="p-3 rounded-xl bg-[#0d1318] border border-white/5 hover:border-emerald-500/30 transition flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">TAB {String(idx + 1).padStart(2, '0')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2a5]" />
              </div>
              <div className="text-xs font-semibold text-white font-mono">{tab}</div>
              <div className="text-[10px] text-slate-500 font-mono">Deduplicated by Lead ID</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
