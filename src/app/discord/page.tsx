'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function DiscordNotificationsPage() {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [sendingSummary, setSendingSummary] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.discordWebhookUrl) {
          setWebhookUrl(d.settings.discordWebhookUrl);
        }
      });
  }, []);

  const handleSaveUrl = async () => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordWebhookUrl: webhookUrl }),
    });
    setTestResult({ success: true, message: 'Discord Webhook URL saved securely.' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/integrations/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST_WEBHOOK', webhookUrl }),
      });
      const d = await res.json();
      setTestResult(d);
    } finally {
      setTesting(false);
    }
  };

  const handleSendDailyReport = async () => {
    setSendingSummary(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/integrations/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_DAILY_SUMMARY' }),
      });
      const d = await res.json();
      setTestResult(d);
    } finally {
      setSendingSummary(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            INTEGRATION
          </span>
          <span className="text-xs font-mono text-slate-400">Real-time Team Alerts</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
          <span>Discord Webhook Real-time Notifications</span>
          <Bell className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Push real-time alerts on discovered hot leads, email approval queues, client replies, and executive daily performance digests.
        </p>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
            testResult.success
              ? 'bg-[#111f18] border-[#00f2a5]/40 text-[#00f2a5]'
              : 'bg-[#1f1114] border-rose-500/40 text-rose-300'
          }`}
        >
          {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Webhook Configuration Card */}
      <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00f2a5]" />
            <span>Encrypted Webhook Endpoint</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Credentials kept strictly server-side</span>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5">Discord Channel Webhook URL</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="flex-1 bg-[#080d11] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f2a5]"
            />
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2.5 rounded-xl bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-200 transition"
            >
              Save URL
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleTestWebhook}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111c26] hover:bg-[#162533] border border-[#00f2a5]/40 text-[#00f2a5] text-xs font-mono font-medium transition disabled:opacity-50"
          >
            {testing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Test Webhook Ping</span>
          </button>

          <button
            onClick={handleSendDailyReport}
            disabled={sendingSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#00f2a5] text-[#070b0e] text-xs font-mono font-bold glow-violet transition disabled:opacity-50"
          >
            {sendingSummary ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            <span>Dispatch Daily Performance Summary</span>
          </button>
        </div>
      </div>

      {/* Notification Triggers Checklist */}
      <div className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Automated Event Triggers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {[
            'Scheduled workflow begins (Daily 9:00 AM America/Toronto)',
            'Candidate leads discovered by Agent 02',
            'Lead verification & classification completed',
            'Priority Hot Leads identified (Score 80+)',
            'Personalized cold email drafts await human review',
            'Outreach emails dispatched via Gmail OAuth',
            'Prospective client replies detected & logged',
            'Agent failure or API rate limit alert',
          ].map((trigger, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[#080d11] border border-white/5 flex items-center justify-between text-slate-300"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f2a5]" />
                <span>{trigger}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
