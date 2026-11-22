import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'AI by Faraz — Agentic Lead Engine',
  description:
    'Autonomous Multi-Agent AI Lead Generation, Business Intelligence, CRM & Personalized Outreach Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const leads = db.getLeads();
  const hotCount = leads.filter((l) => l.leadOpportunityScore >= 80).length;
  const pendingApprovalCount = leads.filter((l) => l.outreachStatus === 'Pending Approval').length;
  const suspiciousCount = leads.filter((l) => l.businessVerificationStatus === 'Suspicious Business').length;

  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b0e] text-slate-100 antialiased min-h-screen flex overflow-hidden">
        {/* Global Sidebar */}
        <Sidebar
          stats={{
            hotCount,
            pendingApprovalCount,
            suspiciousCount,
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-[#070b0e]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
