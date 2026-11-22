'use client';

import React, { useState } from 'react';
import { Play, RotateCw, FileSpreadsheet, Bell, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Header() {
  const [running, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRunNow = async () => {
    setRunning(true);
    setStatusMessage('Triggering Master Orchestrator across 8 agents...');
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_NOW' }),
      });
      const data = await res.json();
      setStatusMessage(data.message || 'Pipeline execution completed!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e: any) {
      setStatusMessage('Trigger failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSyncSheets = async () => {
    setStatusMessage('Synchronizing 12 tabs to Google Sheets...');
    try {
      const res = await fetch('/api/integrations/sheets', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(data.message || 'Google Sheets synchronized!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      setStatusMessage('Sheets sync failed');
    }
  };

  const handleSendDiscord = async () => {
    setStatusMessage('Pushing summary report to Discord Webhook...');
    try {
      const res = await fetch('/api/integrations/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_DAILY_SUMMARY' }),
      });
      const data = await res.json();
      setStatusMessage(data.message || 'Discord summary dispatched!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      setStatusMessage('Discord push failed');
    }
  };

  return (
    <header className="h-14 bg-[#0a0f14]/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Engine Status indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10171e] border border-white/5 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#00f2a5] animate-pulse" />
          <span className="text-slate-300">OpenRouter AI Connected</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Claude 3.5 Sonnet</span>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#162430] border border-[#00f2a5]/40 text-xs font-mono text-[#00f2a5]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Sync Google Sheets */}
        <button
          onClick={handleSyncSheets}
          title="Synchronize all 12 tabs with Google Sheets"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300 transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sync Sheets</span>
        </button>

        {/* Dispatch Discord Report */}
        <button
          onClick={handleSendDiscord}
          title="Send Executive Performance Summary to Discord"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300 transition"
        >
          <Bell className="w-3.5 h-3.5 text-indigo-400" />
          <span>Discord Digest</span>
        </button>

        {/* Master Trigger Run Now */}
        <button
          onClick={handleRunNow}
          disabled={running}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] text-xs font-mono font-bold glow-mint transition disabled:opacity-50"
        >
          {running ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{running ? 'ORCHESTRATING...' : 'RUN PIPELINE NOW'}</span>
        </button>
      </div>
    </header>
  );
}
