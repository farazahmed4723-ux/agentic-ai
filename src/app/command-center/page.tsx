'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bot,
  User,
  Send,
  Sparkles,
  RotateCw,
  FileSpreadsheet,
  Bell,
  Users,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionResult?: any;
  timestamp: string;
}

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [input, setInput] = useState<string>(initialPrompt);
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content:
        '👋 Welcome to the **AI Command Center**. I am the central intelligence controller for AI by Faraz. You can speak to me in plain English to discover leads in any city, trigger multi-agent verification, sync Google Sheets, or send Discord reports.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (commandToSend?: string) => {
    const text = commandToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/command-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Command processed.',
        actionResult: data.actionResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Failed to execute command: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleCommands = [
    'Find 50 movers in Vancouver',
    'Find limousine companies in Toronto with outdated websites',
    'Sync today’s leads to Google Sheets',
    'Send today’s performance report to Discord',
    'Pause all campaigns',
    'Resume all campaigns',
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col bg-[#0a0f14] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="h-14 bg-[#0d1318] border-b border-white/10 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#00f2a5] flex items-center justify-center text-white">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>AI Command Center</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00f2a5]/20 text-[#00f2a5] border border-[#00f2a5]/30">
                Connected
              </span>
            </h2>
            <div className="text-[10px] text-slate-400 font-mono">
              OpenRouter Claude 3.5 Sonnet • Structured Action Dispatcher
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-1',
                role: 'assistant',
                content: 'Chat cleared. How can I assist you with your campaigns?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-[#10171e] border border-white/5"
        >
          Clear History
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-3xl ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-br from-[#8b5cf6] to-[#00f2a5] text-[#070b0e]'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#070b0e]" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-xs leading-relaxed border ${
                m.role === 'user'
                  ? 'bg-[#121e29] border-blue-500/30 text-white'
                  : 'bg-[#0d141b] border-white/10 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Action Result Card if returned */}
              {m.actionResult && (
                <div className="mt-3 p-3 rounded-lg bg-[#080d11] border border-white/10 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-[#00f2a5] font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Action Completed</span>
                  </div>
                  <pre className="overflow-x-auto text-slate-400 text-[10px] bg-[#05080a] p-2 rounded">
                    {JSON.stringify(m.actionResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="text-[10px] text-slate-500 font-mono mt-1 text-right">{m.timestamp}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] flex items-center justify-center">
              <RotateCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#0d141b] border border-white/10 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f2a5] animate-ping" />
              <span>Orchestrating agents and formulating structured action...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Command Pills */}
      <div className="px-5 py-2 bg-[#090d11] border-t border-white/5 flex flex-wrap gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-mono text-slate-500 self-center mr-1">SUGGESTIONS:</span>
        {sampleCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleSend(cmd)}
            className="text-[10px] font-mono px-2 py-1 rounded bg-[#10171e] text-slate-300 hover:text-white hover:border-[#8b5cf6] border border-white/5 transition"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-[#0d1318] border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type any command: 'Find 50 dental clinics in London', 'Sync to Google Sheets'..."
          className="flex-1 bg-[#080d11] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2a5] font-mono"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] font-mono font-bold text-xs flex items-center gap-1.5 glow-mint transition disabled:opacity-40"
        >
          {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-slate-400">Loading Command Center...</div>}>
      <CommandCenterContent />
    </Suspense>
  );
}
