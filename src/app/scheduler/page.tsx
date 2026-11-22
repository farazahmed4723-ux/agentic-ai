'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Globe,
} from 'lucide-react';
import { SchedulerConfig } from '@/types';

export default function AutomationSchedulerPage() {
  const [scheduler, setScheduler] = useState<SchedulerConfig | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduler();
  }, []);

  const fetchScheduler = async () => {
    const res = await fetch('/api/scheduler');
    const d = await res.json();
    if (d.scheduler) setScheduler(d.scheduler);
  };

  const handleTogglePause = async () => {
    const res = await fetch('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_PAUSE' }),
    });
    const d = await res.json();
    if (d.scheduler) setScheduler(d.scheduler);
  };

  const handleRunNow = async () => {
    setRunning(true);
    setStatusMsg('Executing autonomous scheduled run across all 8 agents...');
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_NOW' }),
      });
      const d = await res.json();
      setStatusMsg(d.message || 'Scheduled workflow completed!');
      fetchScheduler();
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setRunning(false);
    }
  };

  const handleUpdateConfig = async (updates: Partial<SchedulerConfig>) => {
    const res = await fetch('/api/scheduler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_CONFIG', updates }),
    });
    const d = await res.json();
    if (d.scheduler) setScheduler(d.scheduler);
  };

  if (!scheduler) return <div className="p-8 font-mono text-xs text-slate-400">Loading scheduler...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-[#00f2a5] border border-[#00f2a5]/30">
              AGENT 01
            </span>
            <span className="text-xs font-mono text-slate-400">Scheduler & Trigger Agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Autonomous Automation Scheduler</span>
            <Clock className="w-5 h-5 text-[#00f2a5]" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-side scheduled cron worker executing daily autonomous lead discovery and outreach pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold border transition ${
              scheduler.paused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
            }`}
          >
            {scheduler.paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{scheduler.paused ? 'Resume Scheduler' : 'Pause Scheduler'}</span>
          </button>

          <button
            onClick={handleRunNow}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] text-xs font-mono font-bold glow-mint transition disabled:opacity-50"
          >
            {running ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{running ? 'TRIGGERING...' : 'RUN SCHEDULE NOW'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-[#111f18] border border-[#00f2a5]/40 text-xs font-mono text-[#00f2a5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Cron Cadence</div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span>{scheduler.dailyRunTime} AM</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              {scheduler.cronExpression}
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">Daily automated intake</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Timezone & DST</div>
          <div className="text-base font-bold text-[#00f2a5] flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            <span>{scheduler.timezone}</span>
          </div>
          <div className="text-slate-400 text-[11px]">Automatic DST adjustments active</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Daily Discovery Target</div>
          <div className="text-xl font-bold text-purple-300">
            {scheduler.targetLeadsPerDay} leads / day
          </div>
          <div className="text-slate-400 text-[11px]">Enforced daily discovery quota</div>
        </div>
      </div>

      {/* Configuration & Safeguards */}
      <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00f2a5]" />
          <span>Execution Reliability & Safeguards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Missed Execution Recovery */}
          <div className="p-4 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Missed Execution Recovery</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Catch up automatically if host system rebooted during scheduled hour.
              </div>
            </div>
            <button
              onClick={() => handleUpdateConfig({ missedExecutionRecovery: !scheduler.missedExecutionRecovery })}
              className={`px-3 py-1 rounded font-bold text-[10px] border ${
                scheduler.missedExecutionRecovery
                  ? 'bg-[#00f2a5]/20 text-[#00f2a5] border-[#00f2a5]/40'
                  : 'bg-slate-800 text-slate-400 border-white/10'
              }`}
            >
              {scheduler.missedExecutionRecovery ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Duplicate Execution Protection */}
          <div className="p-4 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Duplicate Protection</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Block multiple runs within the same 60-minute window.
              </div>
            </div>
            <button
              onClick={() => handleUpdateConfig({ duplicateProtection: !scheduler.duplicateProtection })}
              className={`px-3 py-1 rounded font-bold text-[10px] border ${
                scheduler.duplicateProtection
                  ? 'bg-[#00f2a5]/20 text-[#00f2a5] border-[#00f2a5]/40'
                  : 'bg-slate-800 text-slate-400 border-white/10'
              }`}
            >
              {scheduler.duplicateProtection ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Execution Timestamps */}
        <div className="pt-2 text-xs font-mono text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-2 border-t border-white/5">
          <div>
            Last Executed: <span className="text-white">{scheduler.lastExecutionAt ? new Date(scheduler.lastExecutionAt).toLocaleString() : 'Never'}</span>
          </div>
          <div>
            Next Scheduled Run: <span className="text-[#00f2a5]">{scheduler.nextExecutionAt ? new Date(scheduler.nextExecutionAt).toLocaleString() : 'Tomorrow 09:00 AM EDT'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
