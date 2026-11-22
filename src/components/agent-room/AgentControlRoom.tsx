'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import CustomAgentNode from './CustomNode';
import { AgentNodeData } from '@/types';
import {
  Play,
  RotateCw,
  Search,
  CheckCircle2,
  Sparkles,
  Sliders,
  DollarSign,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AgentControlRoomProps {
  initialNodesData: AgentNodeData[];
  onTriggerRun?: () => Promise<void>;
}

export default function AgentControlRoom({ initialNodesData, onTriggerRun }: AgentControlRoomProps) {
  // Define initial node layout matching chatgpt_image.png exactly
  const initialNodes: any[] = useMemo(() => [
    {
      id: 'node-01',
      type: 'customAgent',
      position: { x: 80, y: 30 },
      data: initialNodesData.find((n) => n.id === 'node-01') || initialNodesData[0],
    },
    {
      id: 'node-02',
      type: 'customAgent',
      position: { x: 340, y: 150 },
      data: initialNodesData.find((n) => n.id === 'node-02') || initialNodesData[1],
    },
    {
      id: 'node-03',
      type: 'customAgent',
      position: { x: 620, y: 320 },
      data: initialNodesData.find((n) => n.id === 'node-03') || initialNodesData[2],
    },
    {
      id: 'node-04',
      type: 'customAgent',
      position: { x: 200, y: 380 },
      data: initialNodesData.find((n) => n.id === 'node-04') || initialNodesData[3],
    },
    {
      id: 'node-05',
      type: 'customAgent',
      position: { x: 620, y: 520 },
      data: initialNodesData.find((n) => n.id === 'node-05') || initialNodesData[4],
    },
    {
      id: 'node-06',
      type: 'customAgent',
      position: { x: 200, y: 540 },
      data: initialNodesData.find((n) => n.id === 'node-06') || initialNodesData[5],
    },
  ], [initialNodesData]);

  // Edges matching chatgpt_image.png
  const initialEdges: Edge[] = useMemo(() => [
    {
      id: 'e1-2',
      source: 'node-01',
      target: 'node-02',
      animated: true,
      style: { stroke: '#00f2a5', strokeWidth: 2 },
    },
    {
      id: 'e2-3',
      source: 'node-02',
      target: 'node-03',
      label: 'qualified',
      labelStyle: { fill: '#00f2a5', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0d1318', fillOpacity: 0.85 },
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    },
    {
      id: 'e2-4',
      source: 'node-02',
      target: 'node-04',
      label: 'qualified',
      labelStyle: { fill: '#00f2a5', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0d1318', fillOpacity: 0.85 },
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    },
    {
      id: 'e3-5',
      source: 'node-03',
      target: 'node-05',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
    },
    {
      id: 'e4-6',
      source: 'node-04',
      target: 'node-06',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-02');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inspector state
  const selectedNodeData = useMemo(() => {
    const targetNode = nodes.find((n) => n.id === selectedNodeId);
    return (targetNode?.data as any) || initialNodesData[1];
  }, [nodes, selectedNodeId, initialNodesData]);

  const [inspectorPrompt, setInspectorPrompt] = useState<string>(selectedNodeData.systemPrompt || '');
  const [temperature, setTemperature] = useState<number>(selectedNodeData.temperature ?? 0.2);
  const [maxTokens, setMaxTokens] = useState<number>(selectedNodeData.maxTokens ?? 2048);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Update inspector when selected node changes
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
    const d = node.data as any;
    setInspectorPrompt(d.systemPrompt || '');
    setTemperature(d.temperature ?? 0.2);
    setMaxTokens(d.maxTokens ?? 2048);
    setSaveSuccess(false);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const nodeTypes: any = useMemo(() => ({ customAgent: CustomAgentNode }), []);

  const handleSaveNode = async () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              systemPrompt: inspectorPrompt,
              temperature,
              maxTokens,
            },
          };
        }
        return n;
      })
    );

    try {
      await fetch('/api/agents/nodes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedNodeId,
          updates: {
            systemPrompt: inspectorPrompt,
            temperature,
            maxTokens,
          },
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save node', e);
    }
  };

  const handleTestRun = async () => {
    setIsRunning(true);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          lastRunStatus: 'running',
        },
      }))
    );

    try {
      if (onTriggerRun) {
        await onTriggerRun();
      } else {
        await fetch('/api/scheduler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'RUN_NOW' }),
        });
      }
    } finally {
      setIsRunning(false);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            lastRunStatus: 'success',
            lastRunTime: 'Just now',
          },
        }))
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070b0e] text-slate-100 font-sans select-none overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      {/* Top OS Window Chrome */}
      <div className="h-10 bg-[#0a0f13] border-b border-white/10 px-4 flex items-center justify-between">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50" />
        </div>

        {/* Address bar matching reference */}
        <div className="flex items-center gap-2 bg-[#10171e] px-4 py-1 rounded-md border border-white/5 text-xs text-slate-400 font-mono">
          <span className="text-[#00f2a5]">#</span>
          <span>foundry.dev/workspace/lead-qualifier:canvas</span>
        </div>

        {/* Actions matching reference: TEST RUN & DEPLOY */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium text-[#00f2a5] border border-[#00f2a5]/40 hover:bg-[#00f2a5]/10 transition disabled:opacity-50"
          >
            {isRunning ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            {isRunning ? 'RUNNING...' : '▶ TEST RUN'}
          </button>
          <button
            onClick={() => alert('Deployed agent pipeline live to persistent background queue!')}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold bg-[#00f2a5] text-[#070b0e] hover:bg-[#00f2a5]/90 glow-mint transition"
          >
            DEPLOY
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Left Palette | Canvas | Right Inspector */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PALETTE */}
        <div className="w-64 bg-[#0a0f13] border-r border-white/10 flex flex-col p-3 z-10">
          {/* Project selector */}
          <div className="p-2.5 rounded-lg bg-[#111921] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#00f2a5]/20 flex items-center justify-center text-[#00f2a5] font-bold text-xs">
                F
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Lead qualifier</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2a5]" />
                  v2.4 - Running
                </div>
              </div>
            </div>
          </div>

          {/* Search nodes */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search 80+ nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e141a] border border-white/10 rounded-md pl-8 pr-2 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-[#00f2a5]"
            />
          </div>

          {/* Node Categories */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
            {/* TRIGGERS (Mint) */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2a5]" />
                TRIGGERS
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-[#00f2a5]/30 text-xs font-mono text-slate-200 flex items-center justify-between hover:border-[#00f2a5] cursor-grab">
                  <span>Webhook</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono text-slate-300 flex items-center justify-between hover:border-[#00f2a5] cursor-grab">
                  <span>Schedule</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
              </div>
            </div>

            {/* AI MODELS (Violet) */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                AI MODELS
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-[#8b5cf6]/50 text-xs font-mono text-purple-200 flex items-center justify-between hover:border-[#8b5cf6] cursor-grab">
                  <span>Claude Sonnet</span>
                  <span className="text-[10px] text-purple-400">::</span>
                </div>
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono text-slate-300 flex items-center justify-between hover:border-[#8b5cf6] cursor-grab">
                  <span>GPT-5 / Gemini</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
              </div>
            </div>

            {/* TOOLS (Amber) */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                TOOLS
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono text-slate-300 flex items-center justify-between hover:border-[#f59e0b] cursor-grab">
                  <span>Search web</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono text-slate-300 flex items-center justify-between hover:border-[#f59e0b] cursor-grab">
                  <span>Postgres query</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
              </div>
            </div>

            {/* ACTIONS (Coral) */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                ACTIONS
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono text-slate-300 flex items-center justify-between hover:border-[#f97316] cursor-grab">
                  <span>Send Slack / Discord</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
                <div className="px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono text-slate-300 flex items-center justify-between hover:border-[#f97316] cursor-grab">
                  <span>Update CRM</span>
                  <span className="text-[10px] text-slate-500">::</span>
                </div>
              </div>
            </div>

            {/* Hint */}
            <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <span>+ Drag to canvas / Connect with arrows</span>
            </div>
          </div>

          {/* User profile footer */}
          <div className="pt-3 border-t border-white/5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#00f2a5]/20 text-[#00f2a5] flex items-center justify-center font-bold text-xs">
              AF
            </div>
            <div>
              <div className="text-xs font-semibold text-white">AI by Faraz</div>
              <div className="text-[10px] text-slate-400">Chief AI Architect</div>
            </div>
          </div>
        </div>

        {/* CENTER REACT FLOW CANVAS */}
        <div className="flex-1 relative h-full">
          {/* Canvas header label matching photo */}
          <div className="absolute top-3 left-4 z-10 pointer-events-none">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              CANVAS
            </span>
            <h3 className="text-xs font-mono text-slate-200">lead-qualifier-v2.4</h3>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            className="bg-[#080d11]"
          >
            <Background gap={24} size={1} color="#16222d" />
            <Controls className="!bg-[#0e161e] !border-white/10 !text-slate-300 !rounded-lg overflow-hidden shadow-xl" />
          </ReactFlow>

          {/* Canvas bottom indicator matching photo */}
          <div className="absolute bottom-3 right-4 z-10 bg-[#0d1318]/90 border border-white/10 px-3 py-1 rounded-md text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span>Last run · 2.4s</span>
            <span className="w-2 h-2 rounded-full bg-[#00f2a5] animate-pulse" />
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL matching photo exactly */}
        <div className="w-80 bg-[#0a0f13] border-l border-white/10 flex flex-col p-4 overflow-y-auto z-10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            INSPECTOR · NODE {selectedNodeData.nodeNumber || '02'}
          </div>

          {/* Selected Node Header */}
          <div className="mt-2 p-2.5 rounded-lg bg-[#111921] border border-[#8b5cf6]/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#8b5cf6]/20 flex items-center justify-center text-[#a78bfa]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{selectedNodeData.label}</div>
              <div className="text-[10px] font-mono text-[#a78bfa]">{selectedNodeData.model || 'Claude Sonnet · v3.5'}</div>
            </div>
          </div>

          {/* SYSTEM PROMPT SECTION */}
          <div className="mt-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
              <span>SYSTEM PROMPT</span>
              <Terminal className="w-3 h-3 text-slate-500" />
            </div>
            <textarea
              rows={6}
              value={inspectorPrompt}
              onChange={(e) => setInspectorPrompt(e.target.value)}
              className="w-full bg-[#070b0e] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#8b5cf6] leading-relaxed resize-none"
            />
          </div>

          {/* MODEL SETTINGS */}
          <div className="mt-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
              <span>MODEL SETTINGS</span>
              <Sliders className="w-3 h-3 text-slate-500" />
            </div>

            {/* Temperature Slider */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400 font-mono text-[11px]">Temperature</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-20 accent-[#8b5cf6] cursor-pointer"
                />
                <span className="font-mono text-white text-[11px] w-6 text-right">{temperature}</span>
              </div>
            </div>

            {/* Max tokens input */}
            <div className="flex items-center justify-between text-xs py-1 mt-1">
              <span className="text-slate-400 font-mono text-[11px]">Max tokens</span>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                className="w-20 bg-[#070b0e] border border-white/10 rounded px-1.5 py-0.5 text-right font-mono text-white text-[11px]"
              />
            </div>
          </div>

          {/* TOOLS ENABLED */}
          <div className="mt-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              TOOLS ENABLED · {selectedNodeData.enabledTools?.length || 2}
            </div>
            <div className="space-y-1.5">
              {(selectedNodeData.enabledTools || ['search_web', 'query_postgres']).map((tool: string) => (
                <div
                  key={tool}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#10171e] border border-white/5 text-xs font-mono"
                >
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {tool}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00f2a5]/20 text-[#00f2a5] border border-[#00f2a5]/30">
                    ENABLED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LAST RUN SUMMARY */}
          <div className="mt-4 p-2.5 rounded-lg bg-[#0e161e] border border-white/5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              LAST RUN · {selectedNodeData.lastRunTime || '2 MIN AGO'}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[#00f2a5] font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Success · qualified
              </span>
              <span className="font-mono text-slate-500 text-[11px]">{selectedNodeData.lastRunDuration || '1.8s'}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 font-mono leading-relaxed">
              {selectedNodeData.lastRunDetails || 'Lead: Acme Co · 24 staff / Budget: $12k · Timeline: 60d / -> routed to #sales-qualified'}
            </p>
          </div>

          {/* RUN COST */}
          <div className="mt-4 p-2.5 rounded-lg bg-[#0e161e] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                RUN COST
              </div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">
                ${selectedNodeData.runCostUsd || 0.018} · {selectedNodeData.tokensUsed || 1247} tokens
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500">TODAY</div>
              <div className="text-xs font-mono text-[#00f2a5]">$0.42</div>
            </div>
          </div>

          {/* SAVE NODE BUTTON matching photo */}
          <button
            onClick={handleSaveNode}
            className={`mt-5 w-full py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#00f2a5] text-[#070b0e] hover:bg-[#00f2a5]/90 glow-mint'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> NODE SAVED
              </>
            ) : (
              'SAVE NODE ↵'
            )}
          </button>
        </div>
      </div>

      {/* Case Study Footer Bar matching reference image */}
      <div className="h-8 bg-[#0a0f13] border-t border-white/10 px-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold tracking-wider">STACK:</span>
          <span>Next.js 15 · React Flow · Drizzle/SQLite · Anthropic/OpenRouter · Inngest · Vercel</span>
        </div>

        {/* 4 Brand Colors matching reference image */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00f2a5]" title="mint" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6]" title="violet" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" title="amber" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" title="coral" />
          </div>
          <span className="text-slate-500">mint · violet · amber · coral</span>
          <span className="text-slate-300 font-medium ml-2">AI by Faraz</span>
        </div>
      </div>
    </div>
  );
}
