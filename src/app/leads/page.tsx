'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Flame,
  ExternalLink,
  ChevronRight,
  X,
  Mail,
  Send,
  Eye,
  Trash2,
} from 'lucide-react';
import { Lead } from '@/types';
import Link from 'next/link';

export default function AllLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [opportunityFilter, setOpportunityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.industry.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.publicBusinessEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || l.businessVerificationStatus.toLowerCase().includes(statusFilter.toLowerCase());

    const matchesOpp =
      opportunityFilter === 'all' ||
      (opportunityFilter === 'hot' && l.leadOpportunityScore >= 80) ||
      (opportunityFilter === 'warm' && l.leadOpportunityScore >= 60 && l.leadOpportunityScore < 80) ||
      (opportunityFilter === 'cold' && l.leadOpportunityScore < 60);

    return matchesSearch && matchesStatus && matchesOpp;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2a5]/20 text-[#00f2a5] border border-[#00f2a5]/30">
              CRM DATABASE
            </span>
            <span className="text-xs font-mono text-slate-400">27 Standardized Fields</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            All Business Prospects ({filteredLeads.length})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized, deduplicated, and verified B2B leads stored in persistent schema.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/integrations/sheets?format=csv"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111921] hover:bg-[#16212b] border border-white/10 text-xs font-mono text-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2a5]" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/lead-finder"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2a5] hover:bg-[#00f2a5]/90 text-[#070b0e] text-xs font-mono font-bold glow-mint transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Find New Leads</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-3 rounded-xl bg-[#0d1318] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, niche, email, city..."
            className="w-full bg-[#080d11] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2a5]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Verification:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#080d11] border border-white/10 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Business</option>
              <option value="likely">Likely Genuine</option>
              <option value="unverified">Unverified</option>
              <option value="suspicious">Suspicious</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Opportunity:</span>
            <select
              value={opportunityFilter}
              onChange={(e) => setOpportunityFilter(e.target.value)}
              className="bg-[#080d11] border border-white/10 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="all">All Opportunities</option>
              <option value="hot">Hot Leads (80+)</option>
              <option value="warm">Warm Leads (60-79)</option>
              <option value="cold">Cold Leads (&lt;60)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-[#0d1318] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0a0f13] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="p-3.5">Company Name & Niche</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Website & Contact</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5">Opp. Score</th>
                <th className="p-3.5">Outreach</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredLeads.map((lead) => {
                const isHot = lead.leadOpportunityScore >= 80;
                const isWarm = lead.leadOpportunityScore >= 60 && lead.leadOpportunityScore < 80;

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#111921] transition cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    {/* Name & ID */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{lead.companyName}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="text-[#00f2a5]">{lead.id}</span>
                        <span>•</span>
                        <span>{lead.industry}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                      <div>{lead.city}, {lead.provinceOrState}</div>
                      <div className="text-slate-500">{lead.country}</div>
                    </td>

                    {/* Website & Email */}
                    <td className="p-3.5 font-mono text-[11px]">
                      {lead.businessWebsite ? (
                        <a
                          href={lead.businessWebsite}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span className="truncate max-w-[150px]">{lead.businessWebsite.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Not Found</span>
                      )}
                      <div className="text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {lead.publicBusinessEmail || 'Not Found'}
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          lead.businessVerificationStatus === 'Verified Business'
                            ? 'bg-[#00f2a5]/20 text-[#00f2a5] border border-[#00f2a5]/30'
                            : lead.businessVerificationStatus === 'Suspicious Business'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {lead.businessVerificationStatus}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Conf: {lead.verificationConfidenceScore}%
                      </div>
                    </td>

                    {/* Opportunity Score */}
                    <td className="p-3.5 font-mono">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isHot
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : isWarm
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {lead.leadOpportunityScore} {isHot ? '🔥' : ''}
                      </span>
                    </td>

                    {/* Outreach Status */}
                    <td className="p-3.5 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          lead.outreachStatus === 'Sent'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : lead.outreachStatus === 'Pending Approval'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {lead.outreachStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right font-mono" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded hover:bg-[#1c2936] text-slate-400 hover:text-white"
                          title="View 27 Fields & Audit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/emails/composer?leadId=${lead.id}`}
                          className="p-1.5 rounded hover:bg-[#8b5cf6]/20 text-[#a78bfa]"
                          title="Open AI Email Composer"
                        >
                          <Mail className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for 27 Fields & Audit Report */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0a0f14] border-l border-white/10 h-full overflow-y-auto p-6 space-y-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2a5]/20 text-[#00f2a5]">
                      {selectedLead.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedLead.campaignName}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedLead.companyName}</h2>
                </div>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-lg bg-[#111921] hover:bg-[#16212b] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 27 Fields Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  27 Standardized Business Fields
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Industry</span>
                    <span className="text-slate-200">{selectedLead.industry}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Category</span>
                    <span className="text-slate-200">{selectedLead.businessCategory}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Public Email</span>
                    <span className="text-[#00f2a5]">{selectedLead.publicBusinessEmail || 'Not Found'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Public Phone</span>
                    <span className="text-slate-200">{selectedLead.publicBusinessPhone || 'Not Found'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Address</span>
                    <span className="text-slate-200">{selectedLead.businessAddress || 'Not Found'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">City & Country</span>
                    <span className="text-slate-200">{selectedLead.city}, {selectedLead.country}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Postal Code</span>
                    <span className="text-slate-200">{selectedLead.postalCode || 'Not Found'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Contact Role</span>
                    <span className="text-slate-200">{selectedLead.publicBusinessContactRole}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Website Status</span>
                    <span className="text-slate-200">{selectedLead.websiteStatus}</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Confidence Score</span>
                    <span className="text-[#00f2a5] font-bold">{selectedLead.verificationConfidenceScore}/100</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Opportunity Score</span>
                    <span className="text-orange-400 font-bold">{selectedLead.leadOpportunityScore}/100</span>
                  </div>
                  <div className="p-2 rounded bg-[#10171e] border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Outreach Eligibility</span>
                    <span className="text-slate-200">{selectedLead.outreachEligibility}</span>
                  </div>
                </div>
              </div>

              {/* Verification Evidence */}
              {selectedLead.verificationEvidence && selectedLead.verificationEvidence.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#0d1318] border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-300">Verification Evidence</div>
                  <ul className="text-xs font-mono text-slate-400 space-y-1">
                    {selectedLead.verificationEvidence.map((ev, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#00f2a5] shrink-0" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Audit Findings */}
              {selectedLead.auditReport && (
                <div className="p-3.5 rounded-xl bg-[#0d1318] border border-white/10 space-y-2">
                  <div className="text-xs font-mono font-bold text-[#a78bfa]">
                    Digital Audit & Business Opportunities
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {selectedLead.auditReport.identifiedProblems.map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-orange-400 shrink-0">•</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                href={`/emails/composer?leadId=${selectedLead.id}`}
                className="px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white font-mono text-xs font-bold transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Open Email Composer</span>
              </Link>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-[#111921] text-slate-300 hover:text-white font-mono text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
