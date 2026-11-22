import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const opportunity = searchParams.get('opportunity'); // hot, warm, cold
  const search = searchParams.get('search');
  const campaign = searchParams.get('campaign');

  let leads = db.getLeads();

  if (status) {
    leads = leads.filter((l) => l.businessVerificationStatus.toLowerCase() === status.toLowerCase());
  }

  if (opportunity === 'hot') {
    leads = leads.filter((l) => l.leadOpportunityScore >= 80);
  } else if (opportunity === 'warm') {
    leads = leads.filter((l) => l.leadOpportunityScore >= 60 && l.leadOpportunityScore < 80);
  } else if (opportunity === 'cold') {
    leads = leads.filter((l) => l.leadOpportunityScore < 60);
  }

  if (campaign) {
    leads = leads.filter((l) => l.campaignName.toLowerCase() === campaign.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.publicBusinessEmail.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ success: true, count: leads.length, leads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = db.saveLead(body);
    return NextResponse.json({ success: true, lead: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 });
    }
    const existing = db.getLeadById(body.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }
    const updated = db.saveLead({ ...existing, ...body });
    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const deleted = db.deleteLead(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
