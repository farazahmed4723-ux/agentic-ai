'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  RotateCw,
  Mail,
  ShieldCheck,
  Eye,
  Clock,
} from 'lucide-react';
import { Lead } from '@/types';

export default function EmailApprovalQueuePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        // Pending approval leads
        setLeads(data.leads.filter((l: Lead) => l.outreachStatus === 'Pending Approval' || l.outreachStatus === 'Draft Generated'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndSend = async (lead: Lead) => {
    setSendingId(lead.id);
    try {
      // Mark approved
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          outreachStatus: 'Approved',
          emailDraft: { ...lead.emailDraft, approved: true },
        }),
      });

      // Dispatch outreach
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const d = await res.json();
      setStatusMsg(d.message || 'Email sent successfully via Gmail pipeline!');
      setTimeout(() => setStatusMsg(null), 4000);
      fetchQueue();
    } finally {
      setSendingId(null);
    }
  };

  const handleReject = async (id: string) => {
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        outreachStatus: 'Rejected',
      }),
    });
    fetchQueue();
  };

  const handleSendAllApproved = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/outreach/send', { method: 'POST' });
      const d = await res.json();
      setStatusMsg(d.message || 'Batch outreach dispatched!');
      setTimeout(() => setStatusMsg(null), 4000);
      fetchQueue();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AGENT 07
            </span>
            <span className="text-xs font-mono text-slate-400">Human-In-The-Loop Approval Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Email Outreach Approval Queue ({leads.length})</span>
            <Send className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manual review mode enabled by default. Verify subject line, evidence observation, and proposed services before delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSendAllApproved}
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00f2a5] text-[#070b0e] text-xs font-mono font-bold glow-mint transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send Approved Batch</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-[#111f18] border border-[#00f2a5]/40 text-xs font-mono text-[#00f2a5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1318] border border-white/10">
          <CheckCircle2 className="w-10 h-10 text-[#00f2a5] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Emails Pending Approval</h3>
          <p className="text-xs text-slate-400 mt-1">All generated drafts have been approved or dispatched.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const draft = lead.emailDraft;

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 hover:border-emerald-500/30 transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{lead.companyName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold">
                        Score: {lead.leadOpportunityScore}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        To: {lead.publicBusinessEmail || 'Not Found'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#00f2a5] mt-1 font-semibold">
                      Subject: {draft?.subject || 'Personalized AI Outreach'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/emails/composer?leadId=${lead.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300"
                    >
                      Edit Draft
                    </Link>
                    <button
                      onClick={() => handleReject(lead.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveAndSend(lead)}
                      disabled={sendingId === lead.id}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] text-xs font-mono font-bold glow-mint transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {sendingId === lead.id ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{sendingId === lead.id ? 'Sending...' : 'Approve & Send'}</span>
                    </button>
                  </div>
                </div>

                {/* Email Content Preview */}
                <div className="p-3.5 rounded-xl bg-[#080d11] border border-white/5 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {draft?.fullBody || 'Draft body not generated'}
                </div>

                {/* Footer notes */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Anti-Spam Safeguard: CASL & CAN-SPAM compliant unsubscribe header appended</span>
                  <span>Follow-up 1 (+3d) and Follow-up 2 (+7d) staged</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
