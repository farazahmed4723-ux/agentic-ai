import { NextResponse } from 'next/server';
import { processOutreachQueue } from '@/lib/agents/outreach-agent';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await processOutreachQueue({ forceLeadId: body.leadId });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
