import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Campaign } from '@/types';

export async function GET() {
  const campaigns = db.getCampaigns();
  return NextResponse.json({ success: true, count: campaigns.length, campaigns });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCamp: Campaign = {
      id: `CAMP-${Date.now().toString(36).substring(4).toUpperCase()}`,
      name: body.name || 'Untitled Campaign',
      niche: body.niche || 'General Business',
      subNiche: body.subNiche || '',
      country: body.country || 'Canada',
      provinceOrState: body.provinceOrState || '',
      city: body.city || 'Toronto',
      radiusKm: Number(body.radiusKm) || 25,
      targetCount: Number(body.targetCount) || 50,
      servicesOffered: body.servicesOffered || ['Website Development', 'AI Automation'],
      status: 'Active',
      createdAt: new Date().toISOString(),
      stats: {
        discovered: 0,
        verified: 0,
        hot: 0,
        warm: 0,
        cold: 0,
        suspicious: 0,
        emailsGenerated: 0,
        emailsSent: 0,
        replies: 0,
      },
    };
    db.saveCampaign(newCamp);
    return NextResponse.json({ success: true, campaign: newCamp });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
