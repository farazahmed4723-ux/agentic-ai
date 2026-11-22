'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Workflow,
  Search,
  Users,
  CheckCircle,
  Flame,
  AlertTriangle,
  FileSearch,
  Megaphone,
  Mail,
  Send,
  Inbox,
  FileSpreadsheet,
  Bell,
  Clock,
  BarChart3,
  ScrollText,
  Boxes,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  stats?: {
    hotCount: number;
    pendingApprovalCount: number;
    suspiciousCount: number;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  isHighlight?: boolean;
  isCanvas?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ stats }: SidebarProps) {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      title: 'ORCHESTRATION',
      items: [
        { label: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
        { label: 'AI Command Center', href: '/command-center', icon: Bot, isHighlight: true },
        { label: 'Agent Control Room', href: '/control-room', icon: Workflow, isCanvas: true },
        { label: 'Automation Scheduler', href: '/scheduler', icon: Clock },
        { label: 'Activity Logs', href: '/logs', icon: ScrollText },
      ],
    },
    {
      title: 'LEAD INTELLIGENCE',
      items: [
        { label: 'Lead Finder', href: '/lead-finder', icon: Search },
        { label: 'All Leads', href: '/leads', icon: Users },
        { label: 'Verified Leads', href: '/leads/verified', icon: CheckCircle },
        {
          label: 'Hot Leads',
          href: '/leads/hot',
          icon: Flame,
          badge: stats?.hotCount ? `${stats.hotCount}` : undefined,
          badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        },
        {
          label: 'Suspicious Leads',
          href: '/leads/suspicious',
          icon: AlertTriangle,
          badge: stats?.suspiciousCount ? `${stats.suspiciousCount}` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        },
        { label: 'Website Audits', href: '/audits', icon: FileSearch },
        { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
      ],
    },
    {
      title: 'OUTREACH & INBOX',
      items: [
        { label: 'Email Composer', href: '/emails/composer', icon: Mail },
        {
          label: 'Email Approval Queue',
          href: '/emails/queue',
          icon: Send,
          badge: stats?.pendingApprovalCount ? `${stats.pendingApprovalCount}` : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        { label: 'Outreach Inbox', href: '/inbox', icon: Inbox },
      ],
    },
    {
      title: 'CHANNELS & ADMIN',
      items: [
        { label: 'Google Sheets', href: '/sheets', icon: FileSpreadsheet },
        { label: 'Discord Notifications', href: '/discord', icon: Bell },
        { label: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
        { label: 'Integrations', href: '/integrations', icon: Boxes },
        { label: 'Settings', href: '/settings', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0f14] border-r border-white/10 flex flex-col h-screen select-none shrink-0 overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f2a5] via-[#8b5cf6] to-[#f59e0b] p-0.5 flex items-center justify-center shadow-lg shadow-[#00f2a5]/20">
            <div className="w-full h-full bg-[#0a0f14] rounded-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00f2a5]" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>AI by Faraz</span>
              <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-[#00f2a5]/20 text-[#00f2a5]">
                v2.4
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Agentic Lead Engine</div>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#121c24] text-white border border-[#00f2a5]/40 glow-mint'
                        : 'text-slate-400 hover:text-white hover:bg-[#10171e]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-[#00f2a5]'
                            : item.isHighlight
                            ? 'text-[#8b5cf6]'
                            : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.isCanvas && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/40">
                        CANVAS
                      </span>
                    )}

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Agent Engine Status Footer */}
      <div className="p-3 border-t border-white/10 bg-[#070b0e]">
        <div className="p-2.5 rounded-lg bg-[#10171e] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f2a5] animate-pulse" />
            <div>
              <div className="text-xs font-semibold text-white">8 Agents Active</div>
              <div className="text-[10px] text-slate-400 font-mono">Toronto 9:00 AM Daily</div>
            </div>
          </div>
          <Link
            href="/control-room"
            className="text-[10px] font-mono px-2 py-1 rounded bg-[#00f2a5]/10 text-[#00f2a5] hover:bg-[#00f2a5]/20 border border-[#00f2a5]/30 transition"
          >
            CANVAS
          </Link>
        </div>
      </div>
    </aside>
  );
}
