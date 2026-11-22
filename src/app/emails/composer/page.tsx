'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  Sparkles,
  Send,
  RotateCw,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Copy,
} from 'lucide-react';
import { Lead } from '@/types';

function EmailComposerContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [followUp1Body, setFollowUp1Body] = useState<string>('');
  const [followUp2Body, setFollowUp2Body] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'initial' | 'followup1' | 'followup2'>('initial');

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => {
        if (d.leads) {
          setLeads(d.leads);
          const target = leadId ? d.leads.find((l: Lead) => l.id === leadId) : d.leads[0];
          if (target) selectLead(target);
        }
      });
  }, [leadId]);

  const selectLead = (lead: Lead) => {
    setSelectedLead(lead);
    if (lead.emailDraft) {
      setSubject(lead.emailDraft.subject);
      setBody(lead.emailDraft.fullBody);
      setFollowUp1Body(lead.emailDraft.followUp1?.body || '');
      setFollowUp2Body(lead.emailDraft.followUp2?.body || '');
    } else {
      setSubject(`Instant booking & AI automation for ${lead.companyName}`);
      setBody(`Hi ${lead.companyName} Team,\n\nSaw your services in ${lead.city}.\n\nWhen reviewing your online flow, clients cannot currently get an instant quote or book without waiting for manual reply.\n\nAt AI by Faraz, we build intelligent 24/7 AI booking assistants that capture and confirm clients automatically.\n\nWould you be open to a 2-minute visual mockup tailored for ${lead.companyName}?\n\nBest regards,\nFaraz\nAI by Faraz\nfaraz@aibyfaraz.com`);
      setFollowUp1Body(`Hi team, following up on my previous note. Did you have a moment to check the mockup?`);
      setFollowUp2Body(`Hi team, closing the loop. All the best with your business!`);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedLead) return;
    setLoading(true);
    try {
      const res = await fetch('/api/command-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a fresh, highly personalized B2B outreach email for ${selectedLead.companyName} in ${selectedLead.city}. Offer: AI Automation and Website Modernization.`,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setBody(data.reply);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndApprove = async () => {
    if (!selectedLead) return;
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedLead.id,
        outreachStatus: 'Approved',
        emailDraft: {
          ...selectedLead.emailDraft,
          subject,
          fullBody: body,
          approved: true,
          approvedAt: new Date().toISOString(),
          followUp1: {
            subject: `Re: ${subject}`,
            body: followUp1Body,
            delayDays: 3,
          },
          followUp2: {
            subject: `Final note: ${subject}`,
            body: followUp2Body,
            delayDays: 7,
          },
        },
      }),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            AGENT 06
          </span>
          <span className="text-xs font-mono text-slate-400">Personalized Email Copywriting Agent</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
          <span>AI Email Studio & Sequence Generator</span>
          <Mail className="w-5 h-5 text-amber-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Grounded, non-spammy outreach tailored to verified prospect pain points, plus automated 3-day and 7-day follow-ups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Selector & Context */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0d1318] border border-white/10">
            <label className="text-xs font-mono text-slate-400 block mb-2 font-bold uppercase">
              Target Lead Selection
            </label>
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => {
                const target = leads.find((l) => l.id === e.target.value);
                if (target) selectLead(target);
              }}
              className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f2a5]"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.companyName} ({l.city}) - Score: {l.leadOpportunityScore}
                </option>
              ))}
            </select>
          </div>

          {selectedLead && (
            <div className="p-4 rounded-2xl bg-[#0d1318] border border-white/10 space-y-3 text-xs font-mono">
              <div className="text-xs font-bold text-white border-b border-white/5 pb-2">
                Prospect Context Card
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Recipient Email</span>
                <span className="text-[#00f2a5] font-semibold">
                  {selectedLead.publicBusinessEmail || 'Not Found'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Website Status</span>
                <span className="text-slate-300">{selectedLead.websiteStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Identified Pain Point</span>
                <span className="text-orange-400">
                  {selectedLead.auditReport?.identifiedProblems?.[0] || 'Legacy booking workflow'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Sender Brand</span>
                <span className="text-slate-300">AI by Faraz (faraz@aibyfaraz.com)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Email Sequence Editor (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0d1318] border border-white/10 space-y-4">
          {/* Tabs: Initial Email | Follow-up 1 | Follow-up 2 */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('initial')}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition ${
                  activeTab === 'initial'
                    ? 'bg-[#00f2a5]/20 text-[#00f2a5] border-[#00f2a5]/50'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Initial Email
              </button>
              <button
                onClick={() => setActiveTab('followup1')}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition flex items-center gap-1 ${
                  activeTab === 'followup1'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Follow-up 1 (+3 Days)</span>
              </button>
              <button
                onClick={() => setActiveTab('followup2')}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition flex items-center gap-1 ${
                  activeTab === 'followup2'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Follow-up 2 (+7 Days)</span>
              </button>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300 transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate with AI</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'initial' && (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#080d11] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00f2a5]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Body</label>
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-[#080d11] border border-white/10 rounded-lg p-3 text-white leading-relaxed focus:outline-none focus:border-[#00f2a5] resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'followup1' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-[11px] text-purple-300 font-semibold">
                Scheduled to trigger automatically 72 hours after initial delivery if no client reply is detected.
              </div>
              <textarea
                rows={10}
                value={followUp1Body}
                onChange={(e) => setFollowUp1Body(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-3 text-white leading-relaxed focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>
          )}

          {activeTab === 'followup2' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-[11px] text-amber-300 font-semibold">
                Friendly break-up email sent 7 days later with zero pressure and link to portfolio.
              </div>
              <textarea
                rows={10}
                value={followUp2Body}
                onChange={(e) => setFollowUp2Body(e.target.value)}
                className="w-full bg-[#080d11] border border-white/10 rounded-lg p-3 text-white leading-relaxed focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between">
            {savedSuccess && (
              <span className="text-xs font-mono text-[#00f2a5] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Draft approved & queued for outreach!</span>
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleSaveAndApprove}
                className="px-4 py-2 rounded-xl bg-[#00f2a5] text-[#070b0e] font-mono font-bold text-xs glow-mint transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Save Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailComposerPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono text-xs text-slate-400">Loading AI Email Composer...</div>}>
      <EmailComposerContent />
    </Suspense>
  );
}
