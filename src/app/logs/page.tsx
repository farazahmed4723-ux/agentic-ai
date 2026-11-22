'use client';

import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Terminal,
} from 'lucide-react';
import { ActivityLog } from '@/types';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const d = await res.json();
      if (d.logs) setLogs(d.logs);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.agentName.toLowerCase().includes(search.toLowerCase());

    const matchesAgent = filterAgent === 'all' || log.agentName.includes(filterAgent);

    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              AUDIT TRAIL
            </span>
            <span className="text-xs font-mono text-slate-400">Structured JSON Event Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Agent Fleet Activity Logs ({filteredLogs.length})</span>
            <ScrollText className="w-5 h-5 text-slate-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable operational event stream recording agent coordination, verification stages, API calls, and errors.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 rounded-xl bg-[#0d1318] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or log details..."
            className="w-full bg-[#080d11] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2a5]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Filter Agent:</span>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-[#080d11] border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none"
          >
            <option value="all">All Agents</option>
            <option value="Orchestrator">Master Orchestrator</option>
            <option value="Scheduler">Agent 01 (Scheduler)</option>
            <option value="Discovery">Agent 02 (Discovery)</option>
            <option value="Verification">Agent 03 (Verification)</option>
            <option value="Enrichment">Agent 04 (Enrichment)</option>
            <option value="Audit">Agent 05 (Website Audit)</option>
            <option value="Copywriter">Agent 06 (Copywriter)</option>
            <option value="Outreach">Agent 07 (Gmail Outreach)</option>
            <option value="Reporting">Agent 08 (Reporting)</option>
            <option value="Discord">Discord Integration</option>
            <option value="Sheets">Sheets Integration</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="rounded-2xl bg-[#0d1318] border border-white/10 p-4 space-y-2 font-mono text-xs max-h-[600px] overflow-y-auto">
        {filteredLogs.map((log) => {
          const isSuccess = log.status === 'success';
          const isError = log.status === 'error';
          const isWarning = log.status === 'warning';

          return (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#080d11] border border-white/5 hover:border-white/15 transition flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSuccess
                        ? 'bg-[#00f2a5]'
                        : isError
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <span className="font-bold text-white">{log.agentName}</span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-slate-300 font-semibold">{log.action}</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans pl-4">{log.details}</p>
              </div>

              <div className="text-[10px] text-slate-500 shrink-0 font-mono pl-4 md:pl-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
