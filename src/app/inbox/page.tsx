'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Send,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Lead } from '@/types';

export default function OutreachInboxPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'replied' | 'bounced'>('all');

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => {
        if (d.leads) {
          setLeads(
            d.leads.filter(
              (l: Lead) => l.outreachStatus === 'Sent' || l.outreachStatus === 'Replied' || l.outreachStatus === 'Bounced'
            )
          );
        }
      });
  }, []);

  const filtered = leads.filter((l) => {
    if (filter === 'sent') return l.outreachStatus === 'Sent';
    if (filter === 'replied') return l.outreachStatus === 'Replied';
    if (filter === 'bounced') return l.outreachStatus === 'Bounced';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              GMAIL OUTREACH
            </span>
            <span className="text-xs font-mono text-slate-400">Two-way Conversation Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Outreach Threads & Inbox ({filtered.length})</span>
            <Inbox className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor dispatched emails, reply sentiment detection, automated sequence stopping, and delivery receipts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'sent', 'replied', 'bounced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border capitalize transition ${
                filter === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0d1318] border border-white/10">
            <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Threads in View</h3>
            <p className="text-xs text-slate-400 mt-1">Send an approved email draft to populate conversation tracking.</p>
          </div>
        ) : (
          filtered.map((lead) => (
            <div
              key={lead.id}
              className="p-5 rounded-2xl bg-[#0d1318] border border-white/10 hover:border-cyan-500/40 transition space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{lead.companyName}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        lead.outreachStatus === 'Replied'
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {lead.outreachStatus}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      To: {lead.publicBusinessEmail}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-1">
                    Subject: &ldquo;{lead.emailDraft?.subject}&rdquo;
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 text-right">
                  Sent: {lead.sentAt ? new Date(lead.sentAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>

              {/* Reply Snippet if present */}
              {lead.replyReceived && (
                <div className="p-3 rounded-xl bg-[#141d1a] border border-[#00f2a5]/30 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#00f2a5] font-bold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Client Reply Received ({lead.replyReceived.sentiment})
                    </span>
                    <span className="text-slate-400">{lead.replyReceived.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic font-sans">&ldquo;{lead.replyReceived.snippet}&rdquo;</p>
                </div>
              )}

              {/* Follow-up State */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Sequence: {lead.followUpStatus}
                </span>
                <span className="text-slate-500">
                  {lead.outreachStatus === 'Replied'
                    ? 'Automated sequences halted (Client Replied)'
                    : 'Active sequence'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
