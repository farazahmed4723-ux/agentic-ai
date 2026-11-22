'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { Lead } from '@/types';

export default function SuspiciousLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const res = await fetch('/api/leads?status=suspicious');
    const d = await res.json();
    if (d.leads) setLeads(d.leads);
  };

  const handleApprove = async (lead: Lead) => {
    await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lead.id,
        businessVerificationStatus: 'Likely Genuine Business',
        outreachEligibility: 'Eligible',
        outreachStatus: 'Pending Approval',
        notes: `${lead.notes || ''}; Manually approved by admin from quarantine queue.`,
      }),
    });
    setActionMsg(`Approved ${lead.companyName} as genuine.`);
    setTimeout(() => setActionMsg(null), 3000);
    fetchLeads();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    setActionMsg(`Deleted suspicious lead.`);
    setTimeout(() => setActionMsg(null), 3000);
    fetchLeads();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
            QUARANTINE QUEUE
          </span>
          <span className="text-xs font-mono text-slate-400">Agent 03 Guardrail</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
          <span>Suspicious Leads Quarantine ({leads.length})</span>
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Leads flagged with inconsistent contact data, unresolvable domains, or PO Box addresses quarantined before outreach.
        </p>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-[#111f18] border border-[#00f2a5]/40 text-xs font-mono text-[#00f2a5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1318] border border-white/10">
          <CheckCircle2 className="w-10 h-10 text-[#00f2a5] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Quarantine Queue Empty</h3>
          <p className="text-xs text-slate-400 mt-1">No suspicious leads detected. All active leads passed verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-5 rounded-2xl bg-[#0d1318] border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{lead.companyName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                    Confidence: {lead.verificationConfidenceScore}%
                  </span>
                  <span className="text-xs font-mono text-slate-400">{lead.city}, {lead.country}</span>
                </div>

                <div className="text-xs text-slate-300 font-mono">
                  Email: {lead.publicBusinessEmail || 'None'} • Phone: {lead.publicBusinessPhone || 'None'}
                </div>

                {lead.verificationEvidence && (
                  <div className="p-2.5 rounded-lg bg-[#140c0f] border border-rose-500/20 text-xs font-mono text-rose-300/90 space-y-1">
                    <div className="text-[10px] text-rose-400 uppercase font-semibold">Flags Raised:</div>
                    {lead.verificationEvidence.map((ev, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(lead)}
                  className="px-3.5 py-2 rounded-xl bg-[#00f2a5]/20 hover:bg-[#00f2a5]/30 text-[#00f2a5] border border-[#00f2a5]/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve As Genuine</span>
                </button>
                <button
                  onClick={() => handleDelete(lead.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
