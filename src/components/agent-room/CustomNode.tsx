'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Play, Search, Database, Send, Bell } from 'lucide-react';

export default function CustomAgentNode({ data, selected }: { data: any; selected?: boolean }) {
  const nodeData = data || {};

  const getColors = () => {
    switch (nodeData.colorScheme) {
      case 'mint':
        return {
          border: 'border-[#00f2a5]',
          bgHeader: 'bg-[#00f2a5]/10',
          badgeText: 'text-[#00f2a5]',
          badgeBg: 'bg-[#00f2a5]/20',
          dot: 'bg-[#00f2a5]',
          glow: 'shadow-[0_0_20px_rgba(0,242,165,0.25)]',
          icon: <Play className="w-3.5 h-3.5 text-[#00f2a5]" />,
        };
      case 'violet':
        return {
          border: 'border-[#8b5cf6]',
          bgHeader: 'bg-[#8b5cf6]/10',
          badgeText: 'text-[#a78bfa]',
          badgeBg: 'bg-[#8b5cf6]/25',
          dot: 'bg-[#8b5cf6]',
          glow: 'shadow-[0_0_25px_rgba(139,92,246,0.3)]',
          icon: <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />,
        };
      case 'amber':
        return {
          border: 'border-[#f59e0b]',
          bgHeader: 'bg-[#f59e0b]/10',
          badgeText: 'text-[#f59e0b]',
          badgeBg: 'bg-[#f59e0b]/20',
          dot: 'bg-[#f59e0b]',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          icon: nodeData.label?.includes('Postgres') ? (
            <Database className="w-3.5 h-3.5 text-[#f59e0b]" />
          ) : (
            <Search className="w-3.5 h-3.5 text-[#f59e0b]" />
          ),
        };
      case 'coral':
      default:
        return {
          border: 'border-[#f97316]',
          bgHeader: 'bg-[#f97316]/10',
          badgeText: 'text-[#f97316]',
          badgeBg: 'bg-[#f97316]/20',
          dot: 'bg-[#f97316]',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]',
          icon: nodeData.label?.includes('Slack') ? (
            <Bell className="w-3.5 h-3.5 text-[#f97316]" />
          ) : (
            <Send className="w-3.5 h-3.5 text-[#f97316]" />
          ),
        };
    }
  };

  const scheme = getColors();

  return (
    <div
      className={`relative min-w-[220px] max-w-[260px] rounded-xl bg-[#0d1318] border transition-all duration-200 ${
        scheme.border
      } ${selected ? `${scheme.glow} ring-2 ring-white/20` : 'border-opacity-60'} ${
        nodeData.lastRunStatus === 'running' ? 'agent-running-pulse' : ''
      }`}
    >
      {/* Target input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#0d1318] !border-2 !border-slate-400 !w-3 !h-3 hover:!bg-[#00f2a5]"
      />

      {/* Header Badge */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b border-white/5 rounded-t-xl ${scheme.bgHeader}`}>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${scheme.badgeText}`}>
            {nodeData.category} {nodeData.nodeNumber}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {scheme.icon}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <h4 className="text-sm font-semibold text-white tracking-tight">{nodeData.label}</h4>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{nodeData.subtitle}</p>

        {nodeData.enabledTools && nodeData.enabledTools.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {nodeData.enabledTools.map((tool: string) => (
              <span
                key={tool}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#16212b] text-slate-300 border border-white/5"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Status footer pill */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                nodeData.lastRunStatus === 'success'
                  ? 'bg-[#00f2a5]'
                  : nodeData.lastRunStatus === 'running'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            {nodeData.lastRunStatus || 'idle'}
          </span>
          {nodeData.lastRunDuration && <span className="font-mono text-slate-500">{nodeData.lastRunDuration}</span>}
        </div>
      </div>

      {/* Source output handles at bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#0d1318] !border-2 !border-slate-400 !w-3 !h-3 hover:!bg-[#00f2a5]"
      />
    </div>
  );
}
